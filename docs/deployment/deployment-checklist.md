# Deployment Checklist

## Prerequisites
- [ ] AWS CLI installed and configured
- [ ] Node.js v16+ installed
- [ ] Required environment variables set
- [ ] AWS credentials with appropriate permissions

## Pre-deployment Tasks
1. Backend
   - [ ] Run unit tests: `npm test`
   - [ ] Validate CloudFormation template:
     ```bash
     aws cloudformation validate-template \
       --template-body file://infrastructure/cloudformation/template.yaml
     ```
   - [ ] Check AWS service quotas
   - [ ] Review IAM permissions

2. Frontend
   - [ ] Run tests: `npm test`
   - [ ] Build locally to verify: `npm run build`
   - [ ] Check environment variables

## Deployment Steps
1. Run deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. Verify Deployment
   - [ ] Check CloudFormation stack status
   - [ ] Verify API endpoints
   - [ ] Test frontend application
   - [ ] Confirm CloudWatch logs
   - [ ] Check S3 bucket configuration

## Post-deployment
- [ ] Monitor CloudWatch metrics
- [ ] Verify error reporting
- [ ] Test user workflows
- [ ] Check SSL certificates
- [ ] Update documentation

## Rollback Plan
1. CloudFormation:
   ```bash
   aws cloudformation rollback-stack --stack-name accounting-dashboard-dev
   ```

2. Frontend:
   ```bash
   # Revert to previous S3 version
   aws s3 sync s3://backup-bucket/previous-version/ s3://frontend-bucket/
   ```
