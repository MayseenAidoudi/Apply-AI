import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as MyBackend from '../lib/backend-infra-stack';

test('Stack Created', () => {
  const app = new cdk.App();
  const stack = new MyBackend.MyBackendStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'python3.9',
  });
});