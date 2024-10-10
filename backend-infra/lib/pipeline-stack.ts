import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { MyBackendStage } from './stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Retrieve the GitHub token from the environment variable
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      throw new Error("GITHUB_TOKEN environment variable is not set");
    }

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyBackendPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('MayseenAidoudi/Apply-AI', 'main', {
          authentication: cdk.SecretValue.plainText(githubToken) // Use the token directly
        }),
        commands: ['cd backend-infra', 'npm ci', 'npm run build', 'npx cdk synth'],
        primaryOutputDirectory: 'backend-infra/cdk.out',
      }),
    });

    const testingStage = pipeline.addStage(new MyBackendStage(this, 'Test', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }));

    testingStage.addPost(new pipelines.ManualApprovalStep('manual approval before production'));

    pipeline.addStage(new MyBackendStage(this, 'Prod', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }));
  }
}
