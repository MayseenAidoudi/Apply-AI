import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { MyBackendStage } from './stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyBackendPipeline',
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.gitHub('MayseenAidoudi/Apply-AI', 'main'),
        commands: ['cd backend-infra','npm ci', 'npm run build', 'npx cdk synth'],
        primaryOutputDirectory: 'backend-infra/cdk.out'
      }),
    });
    const testingStage =  pipeline.addStage(new MyBackendStage(this, 'Test', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }));

    testingStage.addPost(new pipelines.ManualApprovalStep('manual approval before production'))


    pipeline.addStage(new MyBackendStage(this, 'Prod', {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    }));
  }
  
}