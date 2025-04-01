const { CONFIG } = require('../../constants/config');

class RateLimiter {
    constructor() {
        // ...existing code...
        this.lock = new AsyncLock({
            timeout: CONFIG.TIMEOUTS.LOCK.DEFAULT,
            retries: CONFIG.TIMEOUTS.RETRY.ATTEMPTS,
            retryInterval: CONFIG.TIMEOUTS.RETRY.DELAY
        });
    }

    async isRateLimited(ip) {
        try {
            return await this.lock.acquire(ip, async () => {
                // ...existing code...
            }, {
                timeout: CONFIG.TIMEOUTS.LOCK.DEFAULT,
                retries: CONFIG.TIMEOUTS.RETRY.ATTEMPTS
            });
        } catch (error) {
            console.error('Rate limit check failed:', error);
            return true; // Fail safe: treat as rate limited if lock acquisition fails
        }
    }
    // ...existing code...
}
