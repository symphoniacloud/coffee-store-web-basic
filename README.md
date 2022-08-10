# Coffee Store Web - Deploying an HTTPS website with a custom domain name on AWS

There are many ways of hosting websites. If you want to host on AWS it's not as easy as it could be, but this example
will get you started.

**TODO** - update for CDK
**TODO** - point to CloudFormation version on branch

## Introduction

In this modern age of the web, it's become standard to host websites using https / SSL / TLS. If all you need is plain
http, then just [S3 is sufficient](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html), however
you can't use S3's website hosting feature if you want a custom domain name with https. Instead, you'll need to use a
combination of S3 **and** CloudFront, and this is where it gets complicated.

CloudFront is AWS' CDN - content delivery network. CloudFront can scale out well for huge usages, but it's not as
user-friendly as something like Netlify. When setting up CloudFront you're responsible for several things:

* Setting up a certificate and providing it to CloudFront
* Managing DNS
* Figuring out how you want to wire up CloudFront to your "origin" (S3 in our case), with all the various options you're
  forced to specify
* ... and you still need to maintain the S3 bucket

## How this example works

This example deploys a _CloudFormation Stack_, containing the following resources:

* An S3 bucket to host your website content
* A _CloudFrontOriginAccessIdentity_ that allows CloudFront to access S3 directly (via a so-called _S3 Origin_) without
  going through S3's web hosting, along with a bucket policy allowing this identity access to your content bucket.
* A CloudFront distribution, using your S3 bucket as its "origin", setup with some standard TLS / SSL properties, along
  with your certificate and custom domain name
* A DNS record in Route53 for your site's custom domain name.

This example has two resource pre-requisites - a Route53 DNS _Hosted Zone_ and an SSL / TLS certificate in AWS
Certificate Manager (ACM). The additionally included "prereqs" template will deploy a new Route 53 zone, as well as a
certificate, but for your own needs you may already have these setup.

**SSL / TLS certificates for CloudFront MUST be deployed to AWS region us-east-1, even if you deploy the stack
containing the CloudFront distribution to a different region.**

## Deployment

### Required environment

* AWS Account
* Local terminal environment
* AWS profile with sufficient privs (e.g. admin)
* AWS CLI, cfn-lint

### Prereqs stack, if necessary

If you don't have a Route 53 hosted zone, or certificate, then deploy the prereqs stack. (If you have the zone, but not
the certificate, then comment out the hosted zone resource in the prereqs template.)

1. Switch to the [`prereqs`](./prereqs) directory
1. Update the `ZoneDomainName` parameter default value in [`template.yaml`](./prereqs/template.yaml)
1. Start deployment by running [`deploy.sh`](./prereqs/deploy.sh)
1. If you're creating a new hosted zone then once that resource has been deployed you'll need to update
   upstream DNS (either a parent zone,or DNS registration) with the new Name Servers / NS records (visible in the zone's
   details in [Route 53](https://console.aws.amazon.com/route53/v2/home#Dashboard))
1. Switch to the _Certificate Manager_ (ACM) web console **in
   us-east-1** [here](https://console.aws.amazon.com/acm/home?region=us-east-1#/)
1. Drill into the new certificate, select one of the "domains", and click "Create Record in Route 53"
1. Wait for CloudFormation to complete (there'll be a delay while ACM validates DNS)

### Web stack

1. Switch back to the root directory of this project
1. If you already had your own hosted zone and/or certificate, then in [`deploy.sh`](./deploy.sh)
   update `HOSTED_ZONE_ID` and `CERTIFICATE_ARN`, otherwise the script will use the prereqs stack
1. Update the `SiteDomainName` parameter default value in [`template.yaml`](./template.yaml)
1. Start deployment by running [`deploy.sh`](./deploy.sh)
1. Assuming deployment is successful you should be able to visit https://YOUR_SITE_DOMAIN_NAME

## Making updates

The most immediate thing you'll want to do next is deploy some actually interesting content. The [`deploy.sh`](./deploy.sh)
script performs an `s3 sync`, and you can change the source path in that line as necessary. Typically, you'll want to build your site just prior
to deployment.

After that you might want to consider changing some of the CloudFront caching configuration, for example default TTL or the
cache policy.

If you're hosting a "landing page" type website you might want to host both "yourdomain.com" and "www.yourdomain.com" .
To do this, and assuming you're using a wildcard certificate that will host both of these domain names, you can add a
second element to the `Aliases` list in the `CloudFrontDistribution` resource, e.g. as follows:

```yaml
- !Sub "www.${SiteDomainName}"
```

You'll also need to add a second DNS Record. You can do this by adding a new element to the `RecordSets` list in the
`DNSRecord` resource - duplicate the existing one, but change the name to the same as the new alias name.

For most websites you'll also often want things like default pages in subdirectories. For that your best bet is likely
to use [_CloudFront Functions_](https://aws.amazon.com/blogs/aws/introducing-cloudfront-functions-run-your-code-at-the-edge-with-low-latency-at-any-scale/) .

## Scaling and Cost

All of the primary resources in this example are _serverless_ - in other words they automatically scale according to
actual load, and their costs are tied to this load. Your biggest cost will likely be CloudFront - see the CloudFront
[pricing page here](https://aws.amazon.com/cloudfront/pricing/).

## Teardown

### Web stack

1. Empty the contents of the S3 bucket
1. Delete the 'web' stack in CloudFormation

### Prereqs stack, if necessary

1. Delete the "ACM" validation record in Route 53
1. Delete the 'web-prereqs' stack in CloudFormation
1. Manually delete the hosted zone in Route 53 if necessary.

## Questions / Feedback / etc.

If you have questions related to this example please add a Github issue, or drop me a line
at [mike@symphonia.io](mailto:mike@symphonia.io) . I'm also on Twitter
at [@mikebroberts](https://twitter.com/mikebroberts) .
