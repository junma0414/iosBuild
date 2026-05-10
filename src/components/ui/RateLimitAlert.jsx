import React from 'react';
import { AlertCircle, RefreshCw, Clock } from 'lucide-react';

export function RateLimitAlert({ error, onRetry, retryAfter }) {
  if (!error) return null;

  const isRateLimit = error.type === 'rate_limit';
  const message = error.message || '请求失败，请重试';
  
  // 计算重试时间
  let retryTime = null;
  if (retryAfter) {
    const minutes = Math.ceil(retryAfter / 60000);
    retryTime = minutes > 1 ? `${minutes} 分钟` : '1 分钟';
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {isRateLimit ? '系统繁忙' : '请求失败'}
          </h3>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            <p>{message}</p>
            
            {isRateLimit && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>建议操作：</span>
                </div>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li>稍等片刻再重试</li>
                  <li>减少频繁操作</li>
                  <li>如果持续出现，请刷新页面</li>
                </ul>
                
                {retryTime && (
                  <div className="flex items-center text-xs mt-2">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    <span>{retryTime}后自动重试...</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs h-8 px-3 border border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                立即重试
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs h-8 px-3 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/30 transition-colors"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 内联的小型提示
export function InlineRateLimitHint({ error }) {
  if (!error || error.type !== 'rate_limit') return null;

  return (
    <div className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
      <AlertCircle className="h-3 w-3 mr-1" />
      <span>系统繁忙，请稍后再试</span>
    </div>
  );
}