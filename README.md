# Welcome to Wild Rydes CDK

This is a Typescript CDK project to create a deployable solution presented in the AWS tutorial found [here](https://aws.amazon.com/getting-started/hands-on/build-serverless-web-app-lambda-apigateway-s3-dynamodb-cognito/?ref=gsrchandson)

# Elements

- Cognito
- REST API Gateway
- Lambda
- Dynamo DB

- The Frontend website is deployed seperately with Amplify

![image](https://github.com/paul7dxb/cdk-wild-rydes/assets/62883464/316872f8-3781-4c2e-821b-7cbbc01b68ea)


## Useful commands

|Command| Description|
| --- | --- |
|npm install -g aws-cdk-lib | Install the CDK CLI and libraries
|cdk synth | Synthesizes and prints the CloudFormation template
|cdk bootstrap | Deploys the CDK Toolkit staging Stack
|cdk deploy | Deploy the Stack(s)
|cdk diff | View differences of local CDK and deployed Stack
|cdk destroy | Destroy the Stack(s)
| cdk deploy --hotswap | Drift Cloudformation instead of redeploying (dev) |
| cdk deploy --outputs-file \<filename> | Output Stack outputs to a file |
