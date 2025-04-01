/**
 * Helper functions for common operations
 */

async function retry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay);
    }
}

function parseRequestBody(body) {
    try {
        return JSON.parse(body);
    } catch (error) {
        throw new Error('Invalid request body');
    }
}

async function logAudit(action, details) {
    // Audit logging implementation
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ timestamp, action, details }));
}

module.exports = {
    retry,
    parseRequestBody,
    logAudit
};