import logger from './logger';

class RateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequestsPerMinute: number = 60;
  private readonly windowMs: number = 60 * 1000; // 1 minute

  async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Remove requests older than 1 minute
    this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
    
    // Check if we've hit the rate limit
    if (this.requestTimes.length >= this.maxRequestsPerMinute) {
      const oldestRequest = this.requestTimes[0];
      const timeToWait = this.windowMs - (now - oldestRequest);
      
      if (timeToWait > 0) {
        logger.warn(`Rate limit reached. Need to wait ${timeToWait}ms`);
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
    }
    
    // Add current request
    this.requestTimes.push(now);
    return true;
  }

  getRequestsRemaining(): number {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
    return this.maxRequestsPerMinute - this.requestTimes.length;
  }
}

export const rateLimiter = new RateLimiter(); 