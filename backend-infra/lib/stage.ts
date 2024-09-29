import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MyBackendStack } from './backend-infra-stack';

export class MyBackendStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new MyBackendStack(this, 'MyBackendStack');
  }
}