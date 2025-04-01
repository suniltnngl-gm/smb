const logger = require('../utils/logger');
const ResponseService = require('../utils/response.service');
const { ValidationError, DatabaseError, AuthenticationError, RateLimitError, NotFoundError } = require('../utils/errors');
const { CONFIG } = require('../../constants/config');

const errorHandler = (error) => {
  logger.error('Error:', error);

  if (error instanceof ValidationError) {
    return ResponseService.badRequest(error.message, error.details);
  }

  if (error instanceof NotFoundError) {
    return ResponseService.notFound(error.message);
  }

  if (error instanceof AuthenticationError) {
    return ResponseService.unauthorized(error.message);
  }

  if (error instanceof RateLimitError) {
    return ResponseService.error(error.message, 429);
  }

  if (error instanceof DatabaseError) {
    logger.error('Database Error:', error.message, error.operation);
    return ResponseService.error(CONFIG.ERROR_MESSAGES.DATABASE_ERROR, 500);
  }

  if (error.name === 'ConditionalCheckFailedException') {
    return ResponseService.error('Resource already exists or conditions not met', 409);
  }

  if (error.code === 'ThrottlingException') {
    return ResponseService.error('Too Many Requests', 429);
  }

  return ResponseService.error('An unexpected error occurred', 500);
};

module.exports = errorHandler;