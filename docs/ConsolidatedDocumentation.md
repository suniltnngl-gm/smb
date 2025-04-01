# System Documentation

## Architecture Overview

## 1. Overview
- Brief description of features and core components.

## 2. Architecture & Directory Structure
- Summary of backend (handlers, services, middlewares) and frontend (components, utilities).

```text
accounting-dashboard/
├── src/
│   ├── backend/              # Handlers, services, and utilities
│   ├── frontend/             # React components, styles, and utilities
│   └── shared/               # Shared utilities and constants
├── docs/                     # Documentation
│   └── ConsolidatedDocumentation.md
├── tests/                    # Unit, integration, and E2E tests
├── infrastructure/           # CloudFormation templates and scripts
├── config/                   # Configuration files
└── package.json
```

## 3. Deployment & Configuration
- Details on CloudFormation templates and environment-specific configuration.
- Free-tier and AWS-specific budget thresholds now configured in src/constants/config.ts.

## 4. Code Organization & Testing
- Explanation of shared utilities moved to src/shared.
- Testing instructions.

## 5. Performance & Security
- Overview of caching, rate limiting, and structured logging.

## 6. Contributing
- See CONTRIBUTING guidelines consolidated into this document.

# Consolidated Documentation

## Overview
The codebase has been restructured to remove duplicate and outdated files.  
Key changes:
- Removed old_project directory containing legacy code
- Removed outdated configuration files
- Consolidated documentation into this file
- Moved shared utilities to src/shared directory

## Directory Structure
- **src**
  - **shared**: Centralized location for utilities and constants
  - **backend**: Server-side implementation
  - **frontend**: Client-side implementation
- **docs**: Consolidated documentation
- **config**: Essential configuration only
- **tests**: Test suites

## Deployment and Infrastructure
See the respective CloudFormation and SAM templates in the infrastructure folder for details on AWS, GCP, and multicloud configurations.

---

<!-- Multicloud Deployment Strategy -->
## Multicloud Deployment Strategy

### Budget Allocation
- Total Monthly Budget: $50
- Total Forecast Limit: $100

#### Per-Cloud Distribution
- AWS: $25/month (forecast $50)
- Azure: $25/month (forecast $50)
- GCP: Optional fallback with $16 allocation

#### Service Distribution
1. **Primary Services**
   - Storage: AWS S3 (with IA transition after 30 days)
   - Compute: AWS Lambda
   - Database: DynamoDB (with point-in-time recovery)

2. **Fallback Services**
   - Storage: Azure Blob
   - Compute: Azure Functions
   - Database: CosmosDB

#### Security and Compliance
- SSE encryption enabled for all storage
- Public access blocked by default
- Minimum 12-character passwords
- MFA required for admin actions

#### Monitoring and Cost Control
- CloudWatch for AWS resources
- Azure Monitor for Azure resources
- Per-service budget limits
- Automated fallback triggers

---

<!-- Code Integrity and Reversion -->
## Code Integrity and Reversion

- The system computes SHA-256 hashes to verify file and folder integrity.
- When modification is detected, the system reverts changes automatically using backup strategies.
- Utilities such as `computeHash`, `verifyIntegrity`, and `autoRevertOnModification` are centralized in the backend utils.

---

<!-- Shared Utilities -->
## Shared Utilities

- Shared constant values and helper functions are now located under `c:\Users\Tech\code\src\shared`.

---

## Code Organization

### Shared Services
- All shared utilities are now in `src/shared`
- Centralized configuration in `src/shared/constants/config.ts`
- Common cleanup functionality in `src/shared/services/cleanup.service.ts`

### Budget Management
- Budget thresholds and alerts defined in centralized config
- Automated budget monitoring and emergency procedures
- Tiered response system for different budget levels

### Cleanup Strategy
1. **Integrity Verification**
   - SHA-256 hash verification for files and folders
   - Automatic reversion of unauthorized modifications
   - Backup strategy integration

2. **Budget-Aware Operations**
   - Operations check budget before execution
   - Automatic scaling based on budget utilization
   - Emergency procedures for budget overruns

3. **Batch Processing**
   - Configurable batch sizes for large operations
   - Automatic retry with exponential backoff
   - Progress tracking and metrics collection

<!-- Additional documentation sections can be added as needed -->
