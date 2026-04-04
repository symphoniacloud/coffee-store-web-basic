#!/usr/bin/env node
import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createStackProps } from './initSupport.js'
import { DEFAULT_STACK_NAME, loadDotEnv } from '../multipleContexts/processEnvironment'
import { Bucket } from 'aws-cdk-lib/aws-s3'
import { Distribution, HttpVersion, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'

loadDotEnv('../../')

class CdkBasicWebsiteTemplate extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    // Uses S3 defaults, which as of Feb 2025 are:
    // * Contents are encrypted with S3 Managed Keys
    // * All public access is blocked
    // * All S3 objects are owned by the account that owns the bucket
    const bucket = new Bucket(this, 'SiteBucket')

    const cloudFront = new Distribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      httpVersion: HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    })

    // Remove this if you want to use your own content upload process
    new BucketDeployment(this, 'Deploy', {
      sources: [Source.asset('../site')],
      destinationBucket: bucket,
      // You probably don't want to do this on a real project **IN DEVELOPMENT** since
      // it causes CloudFront invalidation to be performed, which can start costing money
      // For a better production vs development setup, see how I do it
      // in the https://github.com/symphoniacloud/cdk-full-website-template project
      distribution: cloudFront,
      // As of Feb 2025 if this isn't specified then the underlying CDK-provided Lambda function
      // which performs this work creates a log group with unlimited retention
      logGroup: new LogGroup(this, 'bucketDeploymentLogs', { retention: RetentionDays.ONE_WEEK })
    })

    new CfnOutput(this, 'CloudFrontUrl', { value: cloudFront.distributionDomainName })
  }
}

const app = new App()
new CdkBasicWebsiteTemplate(app, 'CdkBasicWebsiteTemplate', createStackProps(app, DEFAULT_STACK_NAME))
