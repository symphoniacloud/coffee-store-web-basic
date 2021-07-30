#!/bin/bash

set -euo pipefail

TEMPLATE=template.yaml
STACK_NAME=web-prereqs

echo Linting template...
echo
cfn-lint $TEMPLATE

echo Deploying Stack $STACK_NAME...

# Always want to deploy to us-east-1 for CloudFront. If you also want to deploy to other regions, consider a loop here
aws cloudformation deploy \
        --region us-east-1 \
        --stack-name "$STACK_NAME" \
        --template-file "$TEMPLATE" \
        --no-fail-on-empty-changeset
