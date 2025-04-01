/**
 * Constants used throughout the backend application
 */

module.exports = {
    // DynamoDB table name
    TABLE_NAME: 'accounting-table', // Ensure this matches the DynamoDB table
    
    // Default values
    DEFAULT_PAGE_SIZE: 10,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    
    // Rate limiting
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    MAX_REQUESTS_PER_WINDOW: 100,
    
    // Free tier configurations
    FREE_TIER_DURATION: 12 * 30 * 24 * 60 * 60 * 1000, // 12 months in milliseconds
    ALWAYS_FREE_LIMITS: {
        MAX_REQUESTS_PER_MONTH: 1000,
        MAX_STORAGE_MB: 500
    },

    // HTTP status codes
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500
    },

    // Environments
    ENVIRONMENTS: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    },
    
    // Validation constraints
    VALIDATION: {
        MAX_NAME_LENGTH: 100,
        MAX_PRICE: 1000000,
        MIN_QUANTITY: 0,
        MAX_DESCRIPTION_LENGTH: 500
    },
    
    // Error messages
    ERROR_MESSAGES: {
        INVALID_INPUT: 'Invalid input provided',
        UNAUTHORIZED: 'Unauthorized access',
        NOT_FOUND: 'Resource not found',
        SERVER_ERROR: 'Internal server error',
        VALIDATION: {
            INVALID_NAME: 'Name must be between 1 and 100 characters',
            INVALID_PRICE: 'Price must be between 0 and 1,000,000',
            INVALID_QUANTITY: 'Quantity must be a positive number'
        }
    }
};