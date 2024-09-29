import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class MyBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    
    // Create a Lambda Layer with custom build for Selenium and its dependencies
    const seleniumLayer = new lambda.LayerVersion(this, 'SeleniumLayer', {
      code: lambda.Code.fromAsset('lambda-layer', {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash', '-c',
            'yum install -y unzip && ' +
            'curl -Lo "/tmp/chromedriver.zip" "https://chromedriver.storage.googleapis.com/91.0.4472.101/chromedriver_linux64.zip" && ' +
            'unzip /tmp/chromedriver.zip -d /asset-output && ' +
            'curl -Lo "/tmp/headless-chromium.zip" "https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-55/stable-headless-chromium-amazonlinux-2.zip" && ' +
            'unzip /tmp/headless-chromium.zip -d /asset-output && ' +
            'pip install -r requirements.txt -t /asset-output/python && ' +
            'cp -au . /asset-output'
          ],
        },
      }),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'Selenium and its dependencies for web scraping',
    });

 // Lambda function
 const apiScrapingLambda = new lambda.Function(this, 'ScrapingLambda', {
  runtime: lambda.Runtime.PYTHON_3_9,
  code: lambda.Code.fromAsset('lambda'),
  handler: 'scraping_handler.handler',
  timeout: cdk.Duration.seconds(60),  // Increased timeout for web scraping and Bedrock call
  memorySize: 2048,  // Increased memory for Selenium
  layers: [seleniumLayer],
  environment: {
    PYTHONPATH: '/opt/python',
    PATH: '/opt:' + process.env.PATH,
  },
});
    // Grant permissions to use Bedrock
    apiScrapingLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['*'], // You might want to restrict this to specific Bedrock model ARNs
    }));


    // API Gateway
    const api = new apigateway.LambdaRestApi(this, 'ApiScrapingApi', {
      handler: apiScrapingLambda,
      proxy: true,
      restApiName: 'API Scraping Service',
      description: 'This service scrapes URLs and processes the content using FastAPI.',
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}

