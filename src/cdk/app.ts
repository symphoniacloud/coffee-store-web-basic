#!/usr/bin/env node
import 'source-map-support/register';
import {App, Fn, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Website} from "@symphoniacloud/cdk-website";
import {createStackProps} from "./initSupport";

const DEFAULT_STACK_NAME = 'coffee-store-web'

class CoffeeStoreWeb extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        new Website(this, 'Website', {
            // Remove this customDomain property if you don't want to setup a custom domain,
            // and instead just use the default "cloudfront.net" domain name
            customDomain: {
                domainName: 'cloudcoffeebreak.com',
                hostedZone: {fromDomainName: 'cloudcoffeebreak.com'},
                certificate: {fromArn: Fn.importValue('CloudCoffeeBreakCertificate')}
            },
            content: {
                // If you build your site before deployment then change this path to that of your build output
                path: 'src/site',
                performCacheInvalidation: true
            }
        })
    }
}

const app = new App();
new CoffeeStoreWeb(app, 'CoffeeStoreWeb', createStackProps(app, DEFAULT_STACK_NAME));