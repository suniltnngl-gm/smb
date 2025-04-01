# AWS Free Tier Resource Strategy

## Budget Allocation
- Total Monthly Budget: $50
- Total Forecast Limit: $100

### Service Distribution
- Lambda: $15/month
- DynamoDB: $15/month
- S3: $15/month
- Other Services: $5/month

## Budget Constraints

### Per-Resource Budget ($1/month)
- Individual resource monitoring.
- Forecast alert at 80% of budget.
- Automatic cleanup when approaching limit.

### Total Resources Budget ($5/month)
- Combined resource utilization.
- Forecast alert at 90% of budget.
- Service degradation when approaching limit.

### Codebase Budget ($15/month)
- Development and deployment resources.
- Forecast alert at 20% over budget.
- Code freeze when approaching limit.

### AWS Total Budget ($25/month)
- Overall AWS services.
- Forecast alert at 20% over budget.
- Emergency shutdown procedures when approaching limit.

## 12-Month Free Tier Resources

1. **EC2 (t2.micro)**
   - Current: Using t2.micro instance (free for 12 months).
   - After 12 months: Transition to AWS Lambda for stateless workloads or scale down based on usage patterns.
   - Automation: Use AWS Config rules to monitor EC2 usage and trigger Lambda deployment.

2. **RDS (db.t2.micro)**
   - Current: MySQL db.t2.micro instance.
   - After 12 months: Transition to DynamoDB with on-demand capacity (Always-Free) or Aurora Serverless v2 for cost optimization.
   - Automation: Use EventBridge to trigger DynamoDB migration scripts.

## Always-Free Resources

1. **AWS Lambda**
   - Free tier includes 1M free requests per month.
   - 400,000 GB-seconds of compute time per month.

2. **DynamoDB**
   - 25 GB of storage.
   - 25 provisioned write capacity units (WCU).
   - 25 provisioned read capacity units (RCU).
   - Using on-demand pricing for automatic scaling.

3. **S3**
   - Configured with lifecycle policies.
   - Standard storage transitions to STANDARD_IA after 30 days.
   - Further transitions to GLACIER after 90 days for cost optimization.

4. **CloudWatch**
   - Basic monitoring enabled.
   - Custom metrics and alarms within free tier limits.

## S3 Backup Strategy
- All backups are automatically deleted after 30 days.
- No transition to Glacier/Deep Archive.
- Immediate cleanup of incomplete multipart uploads.
- Local backups are recommended for critical data.

## Backup Strategy Alignment

- The project now uses a centralized backup configuration (see `config/backupConfig.js`) to manage automatic reversion of unintended modifications.
- Automatic backup reversion is enabled if `backupStrategy.enabled` is true.
- The backup folder location and budget thresholds are defined to align with the overall budget proposal.
- In emergency or budget-critical scenarios, the system will revert noncritical changes to preserve the application’s integrity.

## Cost Optimization Measures
1. **S3 Storage**
   - Aggressive lifecycle policies
   - Versioning enabled only for critical data
   - Immediate cleanup of incomplete multipart uploads
   - Transition to STANDARD_IA after 7 days
   - Object expiration after 30 days

2. **DynamoDB**
   - On-demand capacity for cost efficiency.
   - Regular cleanup of unused data.
   - Minimal secondary indexes.

3. **Lambda**
   - Optimized memory allocation.
   - Reduced execution time.
   - Cold start mitigation.

4. **CloudWatch**
   - Basic monitoring only.
   - Minimal custom metrics.
   - Log retention of 7 days.

## Automation and Monitoring

1. **Automated Transition**:
   - Use AWS Config rules to monitor Free Tier usage and trigger transitions.
   - Example: Transition EC2 to Lambda or RDS to DynamoDB.

2. **Monitoring and Alerts**:
   - Set up CloudWatch alarms to notify when usage approaches Free Tier limits.
   - Use AWS Budgets to track costs and send alerts.

## Emergency Procedures
1. When approaching resource budget ($1):
   - Disable non-critical features.
   - Increase cleanup frequency.

2. When approaching total resource budget ($5):
   - Enter maintenance mode.
   - Restrict write operations.

3. When approaching codebase budget ($15):
   - Freeze deployments.
   - Restrict development environments.

4. When approaching AWS budget ($25):
   - Initiate emergency shutdown.
   - Preserve critical data only.

## Centralized Configuration
- Free-tier configurations, such as thresholds and limits, are managed using `constants.js` for consistency and maintainability.

## Region-Specific Configuration

- The application is configured to use the AWS region specified in `CONFIG.AWS.REGION`.
- Update the region in `src/config/constants.ts` to match your deployment region.
- Ensure all AWS services (e.g., Lambda, DynamoDB, S3) are initialized with the correct region.

## Fallback Strategy

1. **Workloads Requiring RDS**:
   - Use Aurora Serverless v2 for cost optimization.
   - Scale down RDS instance size if necessary.

2. **High-Compute Workloads**:
   - Use AWS Batch or Spot Instances for cost savings.

## Monthly Reset Protocol
If S3 costs force data loss:
1. Document current state.
2. Export critical data locally.
3. Plan for fresh deployment.
4. Initialize new data structure.

## Testing and Validation

1. Perform a test deployment using Always-Free resources.
2. Validate application functionality after the transition.
3. Document any required changes to the application or infrastructure.
