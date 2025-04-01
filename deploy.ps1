# Set environment variables
$env:PROJECT_NAME = "accounting-dashboard"
$env:ENVIRONMENT = "dev"

Write-Host "Starting deployment..."

# Deploy backend infrastructure
Write-Host "Deploying backend infrastructure..."
Set-Location -Path "infrastructure/cloudformation"
aws cloudformation deploy `
  --template-file template.yaml `
  --stack-name "$env:PROJECT_NAME-$env:ENVIRONMENT" `
  --parameter-overrides `
    ProjectName=$env:PROJECT_NAME `
    EnvironmentName=$env:ENVIRONMENT `
    AlertEmail="your-email@example.com" `
    DBUsername="admin" `
    DBPassword="your-password-here" `
  --capabilities CAPABILITY_IAM

# Get stack outputs
$API_ENDPOINT = aws cloudformation describe-stacks `
  --stack-name "$env:PROJECT_NAME-$env:ENVIRONMENT" `
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' `
  --output text

$S3_BUCKET = aws cloudformation describe-stacks `
  --stack-name "$env:PROJECT_NAME-$env:ENVIRONMENT" `
  --query 'Stacks[0].Outputs[?OutputKey==`StorageBucketName`].OutputValue' `
  --output text

# Build and deploy frontend
Write-Host "Building frontend..."
Set-Location -Path "../../frontend"
$env:REACT_APP_API_ENDPOINT = $API_ENDPOINT
npm install
npm run build

Write-Host "Deploying frontend to S3..."
aws s3 sync build/ "s3://$S3_BUCKET" --delete

Write-Host "Deployment completed successfully!"
Write-Host "Frontend URL: http://$S3_BUCKET.s3-website-$env:AWS_REGION.amazonaws.com"
Write-Host "API Endpoint: $API_ENDPOINT"
