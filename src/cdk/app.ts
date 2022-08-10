#!/usr/bin/env node
import 'source-map-support/register';
import {App, CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Website} from "@symphoniacloud/cdk-website";
import {createStackProps} from "./initSupport";

const DEFAULT_STACK_NAME = 'coffee-store-web'

class CoffeeStoreWeb extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // This is a very basic example that just uses the default cloudfront.net domain name
        // For an example of setting a custom domain name, see the https://github.com/symphoniacloud/coffee-store-web-demo project
        const website = new Website(this, 'Website', {
            // This
            content: {
                // If you build your site before deployment then change this path to that of your build output
                path: 'src/site',
                // You probably don't want to do this on a real project in development since invalidations can start costing money
                // For a better production vs development setup, see how I do it
                // in the https://github.com/symphoniacloud/coffee-store-web-demo project
                performCacheInvalidation: true
            }
        })

        new CfnOutput(this, 'CloudFrontUrl', { value: website.cloudFront.distributionDomainName })
    }
}

const app = new App();
new CoffeeStoreWeb(app, 'CoffeeStoreWeb', createStackProps(app, DEFAULT_STACK_NAME));