#!/bin/bash

echo "Deploying MSD SEO Audit Actor to Apify..."

# Check if APIFY_TOKEN is set
if [ -z "$APIFY_TOKEN" ]; then
    echo "Error: APIFY_TOKEN environment variable is not set"
    echo "Please set your Apify token: export APIFY_TOKEN=your_token_here"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Run tests
echo "Running tests..."
npm test

# Deploy to Apify
echo "Deploying to Apify..."
apify deploy

echo "Deployment completed!"
echo "Your actor is now available at: https://console.apify.com/actors/YOUR_USERNAME~msd-seo-audit"
