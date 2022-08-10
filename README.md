# Coffee Store Web - Deploying a simple website on AWS

There are many ways of hosting websites. If you want to host on AWS it's not as easy as it could be, but this example
will get you started.

## Introduction

Deploying a "static" website on AWS is surprisingly tricky - it requires managing S3, CloudFront, the security between them, Route 53, and more. This example project helps you get started using [**AWS CDK**](https://docs.aws.amazon.com/cdk/v2/guide/home.html) to deploy a website.

> If you are looking to do this with "vanilla" CloudFormation, see the older version of this project in the [CloudFormation branch](https://github.com/symphoniacloud/coffee-store-web/tree/cloudformation-version).

This example is part of a collection of CDK examples - others are as follows:

* [CDK bare-bones app for TypeScript](https://github.com/symphoniacloud/cdk-bare-bones) - Base project for any TypeScript app using CDK for deployment to AWS. **Try this first if you are getting started with CDK.**
* [Coffee Store Web Full](https://github.com/symphoniacloud/coffee-store-web-demo) - An extension of **this project** that is a real working demo of a production-ready website, including TLS certificates, DNS, Github Actions Workflows, multiple CDK environments (prod vs test vs dev). **Head straight to this project if you already familiar with CDK and deploying websites to AWS.** 
* [Coffee Store V2](https://github.com/symphoniacloud/coffee-store-v2) - Includes a Lambda Function resource; source code + build for the Lambda Function; unit + in-cloud integration tests

## How this example works

This example deploys a CDK _App_ that uses S3 and CloudFront to host a website.

Most of the work is performed by a [custom CDK construct I have written - `cdk-website`](https://github.com/symphoniacloud/cdk-website) - and I encourage you to read the documentation in that project for more background.

## Prerequistes

Please see the [prerequisites of the cdk-bare-bones](https://github.com/symphoniacloud/cdk-bare-bones#prerequisites) project - they are the same as for this one.

## Deployment

After cloning this project to your local machine, run the following:

```shell
$ npm install && npm run deploy
```

If successful, the end result will look something like this:

```shell
coffee-store-web: creating CloudFormation changeset...

 ✅  CoffeeStoreWeb (coffee-store-web)

✨  Deployment time: 292.86s

Outputs:
CoffeeStoreWeb.CloudFrontUrl = d3p8vqr2dw4uqj.cloudfront.net
Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/coffee-store-web/d92ffbc0-18d3-11ed-b23b-12285e0da875

✨  Total time: 298.94s

```

Assuming deployment is successful then load the `CoffeeStoreWeb.CloudFrontUrl` value (the one ending in `cloudfront.net`) from your version of the output in a browser - you should the see a message saying _"Hello Coffee World!"_ 

> Once you've run npm install once in the directory you won't need to again

For other commands, **including how to teardown**, see the [_Usage_ section of the bare-bones project README](https://github.com/symphoniacloud/cdk-bare-bones#usage)

## Next steps

The most immediate thing you'll want to do next is deploy some actually interesting content. By default this project uploads everything from [_src/site_](src/site) to your site, so you can just change the contents of that directory. Alternatively if your site has a build process you may want to run that first, and change the `content` -> `path` property in [app.ts](src/cdk/app.ts) to point to your build output folder.

Other next steps including custom domain names, setting up mutliple environments, using Github Actions, and more, can be found in the larger [Coffee Store Web Full](https://github.com/symphoniacloud/coffee-store-web-demo) project.

## Scaling and Cost

All of the primary resources in this example are _serverless_ - in other words they automatically scale according to
actual load, and their costs are tied to this load. Your biggest cost will likely be CloudFront - see the CloudFront
[pricing page here](https://aws.amazon.com/cloudfront/pricing/).


## Questions / Feedback / etc.

If you have questions related to this example please add a Github issue, or drop me a line
at [mike@symphonia.io](mailto:mike@symphonia.io) . I'm also on Twitter
at [@mikebroberts](https://twitter.com/mikebroberts) .
