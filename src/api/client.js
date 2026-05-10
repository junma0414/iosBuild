// @ts-nocheck

// client.js
const isCapacitor = () => {
  return window.Capacitor?.isNativePlatform?.() === true;
};

// 动态获取 API 地址
const getApiUrl = () => {
  if (isCapacitor()) {
    // 移动端：使用电脑的局域网 IP
    //return 'http://192.168.10.51:3000/api';
    return import.meta.env?.VITE_API_URL || 'https://lang.omnifamily.cloud/api';

  }
  // Web 端：使用环境变量或 localhost
  return import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
};

const API_BASE_URL = getApiUrl();

let accessToken = null;
let refreshToken = null;

// 请求缓存和去重
const requestCache = new Map();
const pendingRequests = new Map();
const CACHE_TTL = 5 * 1000; // 5秒缓存

// 从localStorage加载token的函数
const loadTokensFromStorage = () => {
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
    refreshToken = localStorage.getItem('refreshToken');
  }
};

// 初始加载
loadTokensFromStorage();

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }
}

export function reloadTokens() {
  loadTokensFromStorage();
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export function clearAPICache() {
  requestCache.clear();
  pendingRequests.clear();
}

export function clearCacheForPath(pathPattern) {
  for (const [key] of requestCache) {
    if (key.includes(pathPattern)) {
      requestCache.delete(key);
    }
  }
}

async function refreshAccessToken() {
  const currentRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : refreshToken;
  
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // 修复：使用 API_BASE_URL 而不是 API_BASE
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch (error) {
    clearTokens();
    throw error;
  }
}

export async function apiFetch(path, options = {}) {
  // 修复：使用 API_BASE_URL 而不是 API_BASE
  const url = `${API_BASE_URL}${path}`;
  const method = options.method || 'GET';
  const body = options.body;
  
  const requestKey = `${method}:${path}:${body || ''}`;
  
  if (pendingRequests.has(requestKey)) {
    return pendingRequests.get(requestKey);
  }
  
  if (method === 'GET') {
    const cached = requestCache.get(requestKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Promise.resolve(cached.data);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const currentAccessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : accessToken;
  
  const isAuthRequest = path === '/auth/login' || path === '/auth/register' || path === '/auth/refresh';
  if (currentAccessToken && !isAuthRequest) {
    headers['Authorization'] = `Bearer ${currentAccessToken}`;
  }

  const requestPromise = (async () => {
    console.log('🔴 apiFetch called:', method, path);
    try {
      console.log('🔴 Fetching URL:', url);
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
      console.log('🔴 Response status:', response.status);

      if (response.status === 401 && currentAccessToken) {
        console.log(`Token expired for ${path}, attempting refresh...`);
        try {
          const newAccessToken = await refreshAccessToken();
          console.log('Token refresh successful');
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
          console.log(`Retry for ${path} returned status: ${response.status}`);
        } catch (error) {
          console.log('Token refresh failed:', error);
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw error;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`apiFetch error for ${path}: ${response.status} - ${errorText}`);
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          throw new Error(`HTTP 429 - Too many requests${retryAfter ? `, retry after ${retryAfter} seconds` : ''}`);
        }
        
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (method === 'GET' && !options.noCache) {
        requestCache.set(requestKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
    } finally {
      pendingRequests.delete(requestKey);
    }
  })();

  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
}

// 辅助函数：将参数转换为查询字符串
const toQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// 获取用户时区偏移
const getTimezoneOffset = () => {
  if (typeof window !== 'undefined') {
    return new Date().getTimezoneOffset();
  }
  return 0;
};

// 认证相关API
export const authAPI = {
  register: (data) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  googleLogin: (data) => apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  logout: () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();

    return apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  
  me: () => apiFetch('/auth/me'),
  
  refresh: (refreshToken) => apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }),
};

// 用户相关API
export const userAPI = {
  updateProfile: (data) => apiFetch('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  updatePlan: (plan, billing) => apiFetch('/users/plan', {
    method: 'PUT',
    body: JSON.stringify({ plan, billing }),
  }),
};

// 对话相关API
export const conversationAPI = {
  list: (sort = '-created_at', limit = 100) => 
    apiFetch(`/conversations?${toQueryString({ sort, limit })}`),
  
  get: (id) => apiFetch(`/conversations/${id}`),
  
  create: (data) => apiFetch('/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  update: (id, data) => apiFetch(`/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiFetch(`/conversations/${id}`, {
    method: 'DELETE',
  }),
  
  filter: (filters, sort = '-created_at', limit = 100) => {
    const params = { ...filters, sort, limit };
    return apiFetch(`/conversations/filter?${toQueryString(params)}`);
  },
};

// 作文相关API
export const essayAPI = {
  list: (sort = '-created_at', limit = 100) => 
    apiFetch(`/essays?${toQueryString({ sort, limit, timezone_offset: getTimezoneOffset() })}`),
  
  get: (id) => apiFetch(`/essays/${id}`),
  
  create: (data) => apiFetch('/essays', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      timezone_offset: getTimezoneOffset()
    }),
  }),
  
  update: (id, data) => apiFetch(`/essays/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiFetch(`/essays/${id}`, {
    method: 'DELETE',
  }),
  
  filter: (filters, sort = '-created_at', limit = 100) => {
    const params = { ...filters, sort, limit, timezone_offset: getTimezoneOffset() };
    return apiFetch(`/essays/filter?${toQueryString(params)}`);
  },
};

// 听力练习相关API
export const listeningExerciseAPI = {
  list: (sort = '-created_at', limit = 100) => 
    apiFetch(`/listening-exercises?${toQueryString({ sort, limit, timezone_offset: getTimezoneOffset() })}`),
  
  get: (id) => apiFetch(`/listening-exercises/${id}`),
  
  create: (data) => apiFetch('/listening-exercises', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      timezone_offset: getTimezoneOffset()
    }),
  }),
  
  update: (id, data) => apiFetch(`/listening-exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiFetch(`/listening-exercises/${id}`, {
    method: 'DELETE',
  }),
  
  filter: (filters, sort = '-created_at', limit = 100) => {
    const params = { ...filters, sort, limit, timezone_offset: getTimezoneOffset() };
    return apiFetch(`/listening-exercises/filter?${toQueryString(params)}`);
  },
};

// QA练习相关API
export const qaExerciseAPI = {
  list: (sort = '-created_at', limit = 100) => 
    apiFetch(`/qa-exercises?${toQueryString({ sort, limit, timezone_offset: getTimezoneOffset() })}`),
  
  get: (id) => apiFetch(`/qa-exercises/${id}`),
  
  create: (data) => apiFetch('/qa-exercises', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      timezone_offset: getTimezoneOffset()
    }),
  }),
  
  update: (id, data) => apiFetch(`/qa-exercises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id) => apiFetch(`/qa-exercises/${id}`, {
    method: 'DELETE',
  }),
  
  filter: (filters, sort = '-created_at', limit = 100) => {
    const params = { ...filters, sort, limit, timezone_offset: getTimezoneOffset() };
    return apiFetch(`/qa-exercises?${toQueryString(params)}`);
  },
};

// 徽章相关API
export const badgeAPI = {
  list: (sort = '-created_at', limit = 100) => 
    apiFetch(`/badges?${toQueryString({ sort, limit, timezone_offset: getTimezoneOffset() })}`),
  
  create: (data) => apiFetch('/badges', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      timezone_offset: getTimezoneOffset()
    }),
  }),
  
  filter: (filters, sort = '-created_at', limit = 100) => {
    const params = { ...filters, sort, limit, timezone_offset: getTimezoneOffset() };
    return apiFetch(`/badges?${toQueryString(params)}`);
  },
};

// AI相关API
export const aiAPI = {
  chat: (data) => {
    console.log('aiAPI.chat called with:', data);
    return apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Stripe相关API
export const stripeAPI = {
  createCheckoutSession: (data) => apiFetch('/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  cancelSubscription: () => apiFetch('/stripe/cancel', {
    method: 'POST',
  }),
  
  getSubscription: () => apiFetch('/stripe/subscription'),
  
  reactivateSubscription: () => apiFetch('/stripe/reactivate', {
    method: 'POST',
  }),
};

export default apiFetch;