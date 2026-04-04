# CDK Basic Website Template - Deploying a website on AWS

There are many ways of hosting websites. If you want to host on AWS it's not as easy as it could be, but this example
will get you started.

## Introduction

Deploying a "static" website on AWS is surprisingly tricky - it requires managing S3, CloudFront, the security between them, Route 53, and more. This example project helps you get started using [**AWS CDK**](https://docs.aws.amazon.com/cdk/v2/guide/home.html) to deploy a website.

> If you want to do this with "vanilla" CloudFormation, see the (much!) older version of this project in the [CloudFormation branch](https://github.com/symphoniacloud/cdk-basic-website-template/tree/cloudformation-version).

This example is part of a collection of CDK examples - others are as follows:

* [CDK barebones template](https://github.com/symphoniacloud/cdk-barebones-template) - Base project for any TypeScript app using CDK for deployment to AWS. **Try this first if you are getting started with CDK.**
* [CDK serverless template](https://github.com/symphoniacloud/cdk-serverless-template) - Adds a Lambda Function resource; source code + build for the Lambda Function; unit + in-cloud integration tests
* [CDK full website template](https://github.com/symphoniacloud/cdk-full-website-template) - An extension of **this project** that is a real working demo of a production-ready website, including TLS certificates, DNS, Github Actions Workflows, multiple CDK environments (prod vs test vs dev). **Head straight to this project if you already familiar with CDK and deploying websites to AWS.** 

## How this example works

This example deploys an [**S3 Bucket**](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) to hold your website content, and a [**CloudFront Distribution**](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) to handle web requests.
CloudFront is actually a Content Delivery Network (CDN) and so also provides a location-oriented cache.

The example deploys these two resources as a CDK _App_, which in turn uses AWS CloudFormation under the covers, to provide an automated infrastructure-as-code process.

During the deployment process your site's content is also uploaded, courtesy of CDK's [`BucketDeployment` Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3_deployment.BucketDeployment.html).
If you want to use your own upload mechanism then remove the `BucketDeployment` from the code.

This example **does not** include setting up a custom hostname for the site - it uses the default
provided by cloudfront. To use a custom hostname see my [CDK full website template](https://github.com/symphoniacloud/coffee-store-web-full) project instead. 

Mostly this example uses the default configuration for S3 and CloudFront provided by CDK or the services themselves - including "good practice" security.
A few small tweaks related to CloudFront are:

* Redirect http requests to https (NB: this is good for web _sites_ but not always a great idea for web _APIs_ - see [this link for why](https://jviide.iki.fi/http-redirects))
* Enable http version 2 and version 3
* Set the default root object (for requests to `/`) as _index.html_

## Prerequistes

Please see the [prerequisites of the CDK barebones template](https://github.com/symphoniacloud/cdk-bare-bones#prerequisites) project - they are the same as for this one.

## Deployment

After cloning this project to your local machine, run the following, which uses the default CloudFormation stack name of `cdk-basic-website-template`:

```shell
$ npm install && npm run deploy
```

**CloudFront distributions take several minutes to provision** - so don't be surprised that the deployment requests takes a while.

If successful, the end result will look something like this:

```shell
cdk-basic-website-template: creating CloudFormation changeset...

 ✅  CdkBasicWebsiteTemplate (cdk-basic-website-template)

✨  Deployment time: 610.9s

Outputs:
CdkBasicWebsiteTemplate.CloudFrontUrl = dcurepuzhyubr.cloudfront.net
Stack ARN:
arn:aws:cloudformation:us-east-1:123456789012:stack/cdk-basic-website-template/d92ffbc0-18d3-11ed-b23b-12285e0da875

✨  Total time: 613s
```

Assuming deployment is successful then go to the `CdkBasicWebsiteTemplate.CloudFrontUrl` value (the one ending in `cloudfront.net`) from your version of the output in a browser - you should the see a message saying _"Hello CDK World!"_

> Once you've run npm install once in the directory you won't need to again


### Code quality checks

To run TypeScript type-checking, linting, and formatting checks together:

```shell
$ npm run local-checks
```
### Deploy with non-default stack name, and other parameters

If you need to deploy the same app multiple times with different names to the same AWS account you will
need to override the default stack name. This is common, for example, for development accounts.

To do this set the `STACK_NAME` environment variable:

```shell
$ STACK_NAME=my-app-stack npm run deploy
```

Or you can create a _.env_ file, and specify the stack name there (see the [example file](.env.example).)

Finally you can use a CDK context variable:

```shell
$ npm run deploy -- --context stackName=my-app-stack
```

You can specify other CDK parameters in the same way as the context variable, e.g. to use [hotswap deployment](https://docs.aws.amazon.com/cdk/v2/guide/cli.html#cli-deploy) you can run the following:

```shell
$ npm run deploy -- --hotswap
...
⚠️ The --hotswap flag deliberately introduces CloudFormation drift to speed up deployments
⚠️ It should only be used for development - never use it for your production Stacks!
CdkBarebonesTemplate (cdk-barebones-template): deploying...
```

### Teardown

To teardown the stack either (a) delete the stack from the CloudFormation console or (b) run the following.
**IMPORTANT** - if you haven't made any changes to the project this will delete the default stack (`cdk-basic-website-template`) in your Account + Region.

```shell
$ npm run cdk-destroy
...
Are you sure you want to delete: CdkBasicWebsiteTemplate (y/n)? y
CdkBasicWebsiteTemplate (cdk-basic-website-template): destroying...

 ✅  CdkBasicWebsiteTemplate (cdk-basic-website-template): destroyed
```

If you want to teardown a stack with name that's not the default you can use the same environment variable, .env file, or context flag configurtion that `deploy` uses.

Once teardown is completed you'll need to manually delete the contents of the S3 bucket and the bucket itself.

For other commands see the [_Usage_ section of the barebones project README](https://github.com/symphoniacloud/cdk-barebones-template#usage).

## Next steps

The most immediate thing you'll want to do next is deploy some actually interesting content. By default this project uploads everything from [_src/site_](src/site) to your site, so you can just change the contents of that directory.
Alternatively if your site has a build process you may want to run that first, and change the `sources` property under the `BucketDeployment` instance in [app.ts](src/cdk/app.ts) to point to your build output folder.

Other next steps including custom domain names, setting up multiple environments, using Github Actions, and more, can be found in the larger [CDK full website template](https://github.com/symphoniacloud/cdk-full-website-template) project.

## CDK Style

My style of using CDK is a little different from the default templates provided by AWS. For more details, and reasoning, see the [_Motivation_ section of the bare-bones project Readme](https://github.com/symphoniacloud/cdk-bare-bones#design-decisions--motivation).

## Scaling and Cost

All of the primary resources in this example are _serverless_ - in other words they automatically scale according to
actual load, and their costs are tied to this load. Your biggest cost will likely be CloudFront - see the CloudFront
[pricing page here](https://aws.amazon.com/cloudfront/pricing/).

Note that if you are deploying frequently - e.g. in a development environment - you'll likely want to turn off CloudFront cache invalidation for non-production environments.
See the comment for the `distribution` property in the `BucketDeployment` instance in [app.ts](src/cdk/app.ts)

## Questions / Feedback / etc.

If you have questions related to this example please add a Github issue, or drop me a line
at [mike@symphonia.io](mailto:mike@symphonia.io) . I'm also on Mastodon at http://hachyderm.io/@mikebroberts and BlueSky at https://bsky.app/profile/mikebroberts.com .

## Changelog

### 2026.1

* Rename to cdk-basic-website-template
* Standardize with updates from my other template projects
* Switch to Node 24 from 22
* Switch to ES Modules / ESM
* Add ESLint + Prettier with `local-checks`, `lint`, `lint-fix`, and `format` scripts
* Update `tsconfig.json` to `@tsconfig/node24`, add `module: preserve` / `moduleResolution: bundler`
* Support `STACK_NAME` environment variable (including from .env) as alternative to `--context stackName=`
* Add "multipleContexts" directory, use for .env-file-loading-code and default stack name
* Update dependencies

### 2025.1

* Switch to Node 22 from 16
* Update package-lock to use latest versions of specified dependencies
* Use TypeScript 5
* Inline `cdk-website` custom construct into project, and include following changes:
  * Change to Origin Access Control from Origin Identity Control for CloudFront to S3 access
  * Specify custom logger on `BucketDeployment` so that we can specify log retention
  * Remove specifying various S3 bucket properties which are now default
* Switched to tsx from ts-node in CDK configuration
  * And so run tsc manually during deploy to perform pre-deploy typechecking 
* Removed no-longer used "import 'source-map-support/register'" from CDK

### 2022.1

* Move _cdk.json_ to _src/cdk_ directory. This is for a couple of reasons:
    - One fewer file in project root, which I think is A Good Thing
    - Makes it easier to have repos with multiple, separate, CDK apps
* Modify _app.ts_ to point to new (relative) location of site content
* Move `output` and `requireApproval` CDK settings from _package.json_ to _cdk.json_
    - I hadn't read the docs enough to know they could be in _cdk.json_. Oops. This way is cleaner
* Add package-lock.json - these are specific dependency versions I've tested with