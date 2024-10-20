import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import path = require('path');

export class MyBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for status tracking
    const statusTable = new dynamodb.Table(this, 'JobStatusTable', {
      partitionKey: { name: 'jobId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 2,
      writeCapacity: 2,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      timeToLiveAttribute: 'ttl',
    });

    const layer = new lambda.LayerVersion(this, 'JobScraperLayer', {
      code: lambda.Code.fromAsset('lambda-layer/layer.zip'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'Dependencies for job scraper Lambda',
    });

    const MainScrapingLambda = new lambda.Function(this, 'ScrapingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'api_scraping_lambda.handler',
      code: lambda.Code.fromAsset('lambdas/lambda_scraping'),
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
      environment: {
        STATUS_TABLE_NAME: statusTable.tableName,
        FIRECRAWL_API_KEY_PARAM: '/FIRECRAWL_API_KEY',
      },
      layers: [layer],
    });

    // AI Processing Lambda (regular Lambda)
    const aiProcessingLambda = new lambda.Function(this, 'AIProcessingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'ai_processing_lambda.lambda_handler',
      code: lambda.Code.fromAsset('lambdas/lambda-ai-processing'),
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
      environment: {
        STATUS_TABLE_NAME: statusTable.tableName,
        BEDROCK_MODEL_ID: 'meta.llama3-8b-instruct-v1:0',
      },
    });

    // Status Checking Lambda
    const statusCheckingLambda = new lambda.Function(this, 'StatusCheckingLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'status_check_lambda.lambda_handler',
      code: lambda.Code.fromAsset('lambdas/lambda-status-check'),
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        STATUS_TABLE_NAME: statusTable.tableName,
      },
    });

    // Grant permissions
    statusTable.grantReadWriteData(MainScrapingLambda);
    statusTable.grantReadWriteData(aiProcessingLambda);
    statusTable.grantReadData(statusCheckingLambda);
    MainScrapingLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/FIRECRAWL_API_KEY`],
    }));

    MainScrapingLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [aiProcessingLambda.functionArn],
    }));
    

    // Grant Bedrock permissions to AI Processing Lambda
    aiProcessingLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'JobScraperApi', {
      restApiName: 'Job Scraper Service',
      description: 'This service scrapes job offers and provides AI-powered insights.',
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
      },
    });

    const scrapeResource = api.root.addResource('scrapeAndGenerate');
    scrapeResource.addMethod('POST', new apigateway.LambdaIntegration(MainScrapingLambda));

    const statusResource = api.root.addResource('status');
    statusResource.addMethod('GET', new apigateway.LambdaIntegration(statusCheckingLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}