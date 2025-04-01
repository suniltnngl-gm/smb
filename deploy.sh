#!/bin/bash

# Set environment variables (replace with your values)
export PROJECT_NAME="accounting-dashboard"
export ENVIRONMENT="dev"

echo "Starting deployment..."

# Deploy backend infrastructure
echo "Deploying backend infrastructure..."
cd infrastructure/cloudformation
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name ${PROJECT_NAME}-${ENVIRONMENT} \
  --parameter-overrides \
    ProjectName=${PROJECT_NAME} \
    EnvironmentName=${ENVIRONMENT} \
  --capabilities CAPABILITY_IAM

# Get stack outputs
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name ${PROJECT_NAME}-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name ${PROJECT_NAME}-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`StorageBucketName`].OutputValue' \
  --output text)

# Build frontend
echo "Building frontend..."
cd ../../frontend
echo "REACT_APP_API_ENDPOINT=${API_ENDPOINT}" > .env
npm install
npm run build

# Deploy frontend to S3
echo "Deploying frontend to S3..."
aws s3 sync build/ s3://${S3_BUCKET} --delete

echo "Deployment completed successfully!"
echo "Frontend URL: http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
echo "API Endpoint: ${API_ENDPOINT}"
