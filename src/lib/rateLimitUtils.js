// 速率限制和重试工具

class RateLimiter {
  constructor(maxRequests = 5, timeWindow = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // 清理过期请求
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    // 检查是否超过限制
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getWaitTime() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    
    // 返回需要等待的时间（毫秒）
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (now - oldestRequest);
  }
}

// 指数退避重试
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 如果是429错误，使用更长的退避时间
      if (error.message.includes('429') || error.message.includes('Too many requests')) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (attempt < maxRetries) {
        // 其他错误也重试，但使用较短的退避
        const delay = baseDelay * Math.pow(1.5, attempt);
        console.log(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// 请求队列
class RequestQueue {
  constructor(concurrentLimit = 5) {
    this.concurrentLimit = concurrentLimit;
    this.queue = [];
    this.activeCount = 0;
    this.rateLimiter = new RateLimiter(10, 1000); // 每秒最多10个请求
  }

  async enqueue(requestFn, priority = 0) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, priority, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.activeCount >= this.concurrentLimit || this.queue.length === 0) {
      return;
    }

    // 按优先级排序
    this.queue.sort((a, b) => b.priority - a.priority);
    
    const item = this.queue.shift();
    this.activeCount++;

    try {
      // 检查速率限制
      const waitTime = this.rateLimiter.getWaitTime();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const result = await retryWithBackoff(item.requestFn);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.activeCount--;
      // 继续处理队列
      setTimeout(() => this.processQueue(), 0);
    }
  }
}

// 全局请求队列实例
export const requestQueue = new RequestQueue();

// 包装API调用
export function withRateLimit(apiFn, priority = 0) {
  return async (...args) => {
    return requestQueue.enqueue(() => apiFn(...args), priority);
  };
}

// 检查是否是速率限制错误
export function isRateLimitError(error) {
  return error && (
    error.message.includes('429') ||
    error.message.includes('Too many requests') ||
    error.message.includes('rate limit')
  );
}

// 获取友好的错误消息
export function getRateLimitMessage(error, retryAfter = null) {
  if (isRateLimitError(error)) {
    if (retryAfter) {
      return `系统繁忙，请 ${Math.ceil(retryAfter / 60)} 分钟后再试`;
    }
    return '系统繁忙，请稍后再试';
  }
  return error.message || '请求失败，请重试';
}