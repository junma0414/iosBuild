// 性能监控和日志记录

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      rateLimitErrors: 0,
      avgResponseTime: 0,
      lastErrorTime: null
    };
    
    this.startTime = Date.now();
    this.requestTimes = [];
    
    // 定期报告
    setInterval(() => this.reportMetrics(), 60000); // 每分钟报告一次
  }

  recordRequest(startTime) {
    const duration = Date.now() - startTime;
    this.metrics.requests++;
    this.requestTimes.push(duration);
    
    // 保持最近100个请求的时间
    if (this.requestTimes.length > 100) {
      this.requestTimes.shift();
    }
    
    // 计算平均响应时间
    this.metrics.avgResponseTime = Math.round(
      this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length
    );
  }

  recordError(error) {
    this.metrics.errors++;
    this.metrics.lastErrorTime = new Date().toISOString();
    
    if (error.message.includes('429') || error.message.includes('Too many requests')) {
      this.metrics.rateLimitErrors++;
      console.warn('Rate limit error detected:', error.message);
      
      // 如果速率限制错误过多，建议调整策略
      if (this.metrics.rateLimitErrors > 10) {
        console.warn('High rate limit errors detected. Consider adjusting rate limiting strategy.');
      }
    }
  }

  reportMetrics() {
    const uptime = Math.round((Date.now() - this.startTime) / 1000);
    const errorRate = this.metrics.requests > 0 
      ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) 
      : 0;
    
    const report = {
      uptime: `${uptime}s`,
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      rateLimitErrors: this.metrics.rateLimitErrors,
      errorRate: `${errorRate}%`,
      avgResponseTime: `${this.metrics.avgResponseTime}ms`,
      lastError: this.metrics.lastErrorTime
    };
    
    console.log('Performance Metrics:', report);
    
    // 重置错误计数（保留其他指标）
    this.metrics.errors = 0;
    this.metrics.rateLimitErrors = 0;
  }

  getHealthStatus() {
    const errorRate = this.metrics.requests > 0 
      ? this.metrics.errors / this.metrics.requests 
      : 0;
    
    if (errorRate > 0.1) { // 10%错误率
      return 'degraded';
    } else if (errorRate > 0.05) { // 5%错误率
      return 'warning';
    } else {
      return 'healthy';
    }
  }
}

// 全局监控实例
export const performanceMonitor = new PerformanceMonitor();

// 包装fetch以监控性能
export function monitoredFetch(url, options) {
  const startTime = Date.now();
  
  return fetch(url, options)
    .then(response => {
      performanceMonitor.recordRequest(startTime);
      return response;
    })
    .catch(error => {
      performanceMonitor.recordError(error);
      throw error;
    });
}

// React Query配置建议
export function getQueryConfigSuggestions() {
  const status = performanceMonitor.getHealthStatus();
  
  const suggestions = {
    healthy: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
    },
    warning: {
      retry: 2,
      staleTime: 2 * 60 * 1000, // 2分钟
      cacheTime: 5 * 60 * 1000, // 5分钟
    },
    degraded: {
      retry: 1,
      staleTime: 1 * 60 * 1000, // 1分钟
      cacheTime: 2 * 60 * 1000, // 2分钟
    }
  };
  
  return suggestions[status] || suggestions.healthy;
}