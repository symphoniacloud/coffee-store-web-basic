#!/bin/bash

set -euo pipefail

TEMPLATE=template.yaml
STACK_NAME=web

# Helper function for getting outputs from CloudFormation Stacks
get_cfn_output () {
  CFN_STACK=$1
  CFN_OUTPUT_NAME=$2
  CFN_OUTPUT_VALUE=$(aws cloudformation describe-stacks --stack-name "$CFN_STACK" --query "Stacks[0].Outputs[?OutputKey=='$CFN_OUTPUT_NAME'].OutputValue" --output text)
  if [ -z "$CFN_OUTPUT_VALUE" ]; then
    >&2 echo "Unable to locate Output '$CFN_OUTPUT_NAME' in stack '$CFN_STACK'"
    exit 1
  fi
  echo "$CFN_OUTPUT_VALUE"
}

# Get DNS and SSL Certificate pre-requisites
# We're assuming that this certificate is in region us-east-1, which is what CloudFront requires, wherever we're deploying to
# If you already had your either your own hosted zone resource, or certificate, then replace these with the relevant values
HOSTED_ZONE_ID=$(get_cfn_output "web-prereqs" "HostedZone")
CERTIFICATE_ARN=$(get_cfn_output "web-prereqs" "CertificateArn")

echo Linting template...
echo
cfn-lint $TEMPLATE

echo Deploying Stack $STACK_NAME...

# Deploy AWS resources
aws cloudformation deploy \
        --stack-name "$STACK_NAME" \
        --template-file "$TEMPLATE" \
        --parameter-overrides HostedZoneId="$HOSTED_ZONE_ID" CertificateArn="$CERTIFICATE_ARN" \
        --no-fail-on-empty-changeset

# Now deploy content. If you are generating content this would refer to your build output
SITE_BUCKET=$(get_cfn_output "$STACK_NAME" "SiteBucket")
aws s3 sync --delete src "s3://$SITE_BUCKET"

# Invalidate the CloudFront Cache
# If deploying frequently or using content that doesn't require invalidations then consider not using this, or modify for certain paths
CLOUDFRONT_DISTRIBUTION_ID=$(get_cfn_output "$STACK_NAME" "CloudFrontDistributionId")
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"
