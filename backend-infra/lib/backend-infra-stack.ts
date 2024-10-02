import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

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
    // Step 1: Create an ECR repository for storing Docker images
    const ecrRepository = new ecr.Repository(this, 'JobScraperEcrRepo', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteImages: true, // In production, use RETAIN to avoid accidental deletion
    });

    ecrRepository.addLifecycleRule({
      maxImageCount: 1,  // Keep only the last 3 images
    });
    // Step 2: Build and push Docker image to ECR from local directory ('lambda-scraping')
    const dockerImageAsset = new ecrAssets.DockerImageAsset(this, 'ScrapingLambdaImage', {
      directory: 'lambdas/lambda-scraping',  // Directory containing the Dockerfile and app code
    });

    // Step 3: Lambda function using the image from ECR
    const scrapingLambda = new lambda.DockerImageFunction(this, 'ScrapingLambda', {
      code: lambda.DockerImageCode.fromEcr(ecrRepository, {
        tagOrDigest: dockerImageAsset.imageUri.split('@')[1] || dockerImageAsset.imageUri.split(':')[1],
      }),
      memorySize: 2048,
      timeout: cdk.Duration.seconds(60),
      environment: {
        STATUS_TABLE_NAME: statusTable.tableName,
      },
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
    statusTable.grantReadWriteData(scrapingLambda);
    statusTable.grantReadWriteData(aiProcessingLambda);
    statusTable.grantReadData(statusCheckingLambda);
    aiProcessingLambda.grantInvoke(scrapingLambda);

    // Grant Bedrock permissions to AI Processing Lambda
    aiProcessingLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'JobScraperApi', {
      restApiName: 'Job Scraper Service',
      description: 'This service scrapes job offers and provides AI-powered insights.',
    });

    const scrapeResource = api.root.addResource('scrapeJobOffer');
    scrapeResource.addMethod('POST', new apigateway.LambdaIntegration(scrapingLambda));

    const statusResource = api.root.addResource('status');
    statusResource.addMethod('GET', new apigateway.LambdaIntegration(statusCheckingLambda));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}