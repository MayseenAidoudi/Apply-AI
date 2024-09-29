import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class MyBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function using a container image
    const apiScrapingLambda = new lambda.DockerImageFunction(this, 'ScrapingLambda', {
      code: lambda.DockerImageCode.fromImageAsset('lambda'), // Path to your Dockerfile directory
      memorySize: 2048,
      timeout: cdk.Duration.seconds(60),
      environment: {
        PYTHONPATH: '/opt/python',
        PATH: '/opt:' + process.env.PATH,
      },
    });

    // Grant permissions to use Bedrock
    apiScrapingLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'], // Specify Bedrock model ARNs if needed
    }));

    // API Gateway
    const api = new apigateway.LambdaRestApi(this, 'ApiScrapingApi', {
      handler: apiScrapingLambda,
      proxy: true,
      restApiName: 'API Scraping Service',
      description: 'Service for scraping URLs and processing content.',
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
