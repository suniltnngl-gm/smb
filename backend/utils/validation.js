const validateRequest = (body, requiredFields) => {
  const errors = [];
  
  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push(`${field} is required`);
    }
  }
  
  if (errors.length > 0) {
    throw {
      statusCode: 400,
      message: 'Validation Error',
      details: errors
    };
  }
  
  return body;
};

module.exports = {
  validateRequest,
};