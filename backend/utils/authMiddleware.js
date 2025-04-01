// Utility function to extract token from headers
const extractToken = (headers) => {
  const authHeader = headers?.Authorization || headers?.authorization;
  return authHeader?.replace('Bearer ', '') || null;
};

const { CONFIG } = require('../../constants/config');

const verifyToken = async (token, cognitoIdentityServiceProvider) => {
  if (!token) {
    console.error('Token is missing');
    return null;
  }
  
  try {
    const params = {
      AccessToken: token
    };
    
    // Add timeout handling
    const verifyPromise = cognitoIdentityServiceProvider.getUser(params).promise();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Token verification timeout')), CONFIG.TIMEOUTS.OPERATION.DEFAULT);
    });

    const response = await Promise.race([verifyPromise, timeoutPromise]);
    return response.UserAttributes.find(attr => attr.Name === 'sub').Value;
  } catch (error) {
    console.error('Token verification failed:', error.code || error.message);
    return null;
  }
};

const getUserRole = async (token, cognitoIdentityServiceProvider) => {
  try {
    const params = { AccessToken: token };
    const response = await cognitoIdentityServiceProvider.getUser(params).promise();
    return response.UserAttributes.find(attr => attr.Name === 'custom:role')?.Value || 'staff';
  } catch (error) {
    console.error('Failed to fetch user role:', error.code || error.message);
    return 'staff'; // Default role
  }
};

const authenticate = async (event, cognitoIdentityServiceProvider, requiredRoles = null) => {
  // Skip auth for health check endpoint
  if (event.path === '/health') {
    return true;
  }

  const token = extractToken(event.headers);
  const userId = await verifyToken(token, cognitoIdentityServiceProvider);

  if (!userId) {
    throw {
      statusCode: 401,
      message: 'Unauthorized'
    };
  }

  // Fetch user role from Cognito
  const userRole = await getUserRole(token, cognitoIdentityServiceProvider);

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    throw {
      statusCode: 403,
      message: 'Forbidden: Insufficient permissions'
    };
  }

  return { userId, userRole };
};

module.exports = {
  authenticate,
  verifyToken,
  extractToken
};