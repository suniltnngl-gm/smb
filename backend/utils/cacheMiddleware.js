const cache = new Map();
const { CONFIG } = require('../../constants/config');

const CACHE_TTL = CONFIG.CACHE.TTL * 1000; // Convert seconds to milliseconds

const cacheMiddleware = (event) => {
  if (event.httpMethod !== 'GET') {
    return null;
  }

  const cacheKey = `${event.path}-${JSON.stringify(event.queryStringParameters)}`;
  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse && (Date.now() - cachedResponse.timestamp < CACHE_TTL)) {
    return cachedResponse.data;
  }
  
  return null;
};

const setCacheResponse = (event, response) => {
  if (event.httpMethod !== 'GET') {
    return;
  }

  const cacheKey = `${event.path}-${JSON.stringify(event.queryStringParameters)}`;
  cache.set(cacheKey, {
    data: response,
    timestamp: Date.now()
  });
};

module.exports = {
  cacheMiddleware,
  setCacheResponse
};