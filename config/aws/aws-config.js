/**
 * AWS Configuration
 * Centralizes AWS configuration settings
 */

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  dynamodb: {
    tablePrefix: process.env.TABLE_PREFIX || 'myproject-',
    endpoints: {
      development: 'http://localhost:8000',
      production: null // Use default AWS endpoint
    }
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID
  },
  api: {
    stage: process.env.API_STAGE || 'dev',
    timeout: 30000,
    retryAttempts: 3
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enabled: process.env.ENABLE_LOGGING === 'true'
  },
  monitoring: {
    enabled: process.env.ENABLE_MONITORING === 'true',
    interval: parseInt(process.env.MONITORING_INTERVAL) || 300,
    metrics: {
      cpu: true,
      memory: true,
      latency: true
    }
  },
  environments: {
    development: {
      endpointUrl: 'http://localhost:3000',
      logLevel: 'debug',
      corsOrigins: ['http://localhost:3000']
    },
    production: {
      endpointUrl: process.env.API_ENDPOINT,
      logLevel: 'error',
      corsOrigins: [process.env.ALLOWED_ORIGIN]
    }
  }
};

module.exports = config;