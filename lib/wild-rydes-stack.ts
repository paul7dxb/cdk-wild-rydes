import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class WildRydesStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Cognito
		const userPool = new cognito.UserPool(this, "WildRydes", {
			userPoolName: "WildRydesUserPool",
			selfSignUpEnabled: true,

			signInAliases: {
				username: true, // Enable username sign in
				email: false, // Disable email sign in
				phone: false, // Disable phone number sign in
			},
			autoVerify: { email: true },
			userVerification: {
				emailSubject: "Verify your email for our Wild Rydes!",
				emailBody:
					"Hello, Thanks for signing up to WildRydes! Your verification code is {####}",
				emailStyle: cognito.VerificationEmailStyle.CODE,
			},
			standardAttributes: {
				email: {
					required: true,
					mutable: true,
				},
			},
			passwordPolicy: {
				minLength: 8, // Minimum length of password
				requireUppercase: true, // Requires at least one uppercase letter
				requireLowercase: true, // Requires at least one lowercase letter
				requireDigits: true, // Requires at least one digit
				requireSymbols: false, // Requires at least one special character
			},
			mfa: cognito.Mfa.OFF,
			removalPolicy: cdk.RemovalPolicy.DESTROY
		});

		userPool.addClient("app-client", {
			userPoolClientName: "WildRydesWebApp",
			generateSecret: false,
			refreshTokenValidity: cdk.Duration.days(30), // Refresh token validity period
			accessTokenValidity: cdk.Duration.days(1), // Access token validity period
			idTokenValidity: cdk.Duration.days(1), // ID token validity period
		});

		// Dynamo DB
		const ridesTable = new dynamodb.Table(this, "WildRydesDB", {
			tableName: "Rides",
			partitionKey: {
				name: "RideId",
				type: dynamodb.AttributeType.STRING,
			},
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		//lambda
		const wildRydesLambda = new lambda.Function(this, "WildRydesLambda", {
			runtime: lambda.Runtime.NODEJS_16_X,
			handler: "index.handler",
			code: lambda.Code.fromAsset("./lambda/WildRydesLambda"),
			memorySize: 128,
			timeout: cdk.Duration.seconds(10),
		});

		ridesTable.grantWriteData(wildRydesLambda);

		// REST api
		const wildRydesApi = new apigateway.RestApi(this, "WildRydesApi", {
			defaultCorsPreflightOptions: {
				allowOrigins: apigateway.Cors.ALL_ORIGINS,
				allowMethods: apigateway.Cors.ALL_METHODS,
			},
		});

		// API Authorizer
		const userPoolAuthorizer = new apigateway.CfnAuthorizer(
			this,
			"WildRydesAuthorizer",
			{
				restApiId: wildRydesApi.restApiId,
				name: "WildRydesAuthorizer",
				type: "COGNITO_USER_POOLS",
				identitySource: "method.request.header.Authorization",
				providerArns: [userPool.userPoolArn],
			}
		);

		//API resource
		const wildRydesResourceRide = wildRydesApi.root.addResource("ride");

		// Connect lambda to API
		const wildRydeslambdaIntegration = new apigateway.LambdaIntegration(
			wildRydesLambda
		);

		wildRydesResourceRide.addMethod("POST", wildRydeslambdaIntegration, {
			authorizationType: apigateway.AuthorizationType.COGNITO,
			authorizer: { authorizerId: userPoolAuthorizer.ref },
		});
	}
}
