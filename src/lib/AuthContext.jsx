// @ts-nocheck
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { isNativeApp } from './planUtils';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  authError: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  navigateToLogin: () => {},
  updateUser: () => {},
  checkAuth: async () => {},
  googleLogin: async () => {},  // 添加这行
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      checkAuth();
    }
    
    // 监听 localStorage 变化（例如 token 更新后无需刷新页面即可重新认证）
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        hasCheckedRef.current = false;
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🟡 Starting auth check');
      if (isMountedRef.current) {
        setIsLoadingAuth(true);
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('🟡 No token found, skipping auth check');
        if (isMountedRef.current) {
          setIsAuthenticated(false);
          setIsLoadingAuth(false);
          setAuthCheckCompleted(true);
        }
        return;
      }
      
      console.log('🟡 Calling authAPI.me()');
      const userData = await authAPI.me();
      console.log('🟡 authAPI.me() completed');
      
      if (isMountedRef.current) {
        setUser(userData);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
        setAuthCheckCompleted(true);

        // 移动端：将用户ID同步到RevenueCat
        if (isNativeApp() && userData?.id) {
          import('../services/revenueCatService').then(mod => {
            const rcService = mod.default || mod;
            if (rcService.setAppUserId) {
              rcService.setAppUserId(userData.id);
            }
          }).catch(err => console.warn('RevenueCat not available:', err));
        }
      }
    } catch (error) {
      console.error('🔴 Auth check error:', error.message);
      
      if (isMountedRef.current) {
        if (error.message.includes('Token') || error.message.includes('401') || error.message.includes('403')) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthCheckCompleted(true);
        
        setAuthError({
          type: 'auth_failed',
          message: error.message || 'Authentication failed'
        });
      }
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const result = await authAPI.login({ email, password });
      
      if (result.accessToken && result.refreshToken) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      
      if (isMountedRef.current) {
        setUser(result.user);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      
      if (isMountedRef.current) {
        setAuthError({ 
          type: 'login_failed', 
          message: errorMessage
        });
        setIsLoadingAuth(false);
      }
      throw error;
    }
  };

  const register = async (email, password, full_name) => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      const result = await authAPI.register({ email, password, full_name });
      
      if (result.requiresVerification) {
        console.log('Registration requires email verification');
        if (isMountedRef.current) {
          setIsLoadingAuth(false);
        }
        return { 
          requiresVerification: true, 
          email: result.email || email,
          message: result.message || 'Verification email sent'
        };
      }
      
      if (result.accessToken && result.refreshToken) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
      }
      
      if (isMountedRef.current) {
        setUser(result.user);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = error.message || 'Registration failed';
      
      if (errorMessage.includes('already registered') || errorMessage.includes('Email already')) {
        errorMessage = 'Email already registered. Please login or use a different email.';
      }
      
      if (isMountedRef.current) {
        setAuthError({ 
          type: 'registration_failed', 
          message: errorMessage
        });
        setIsLoadingAuth(false);
      }
      throw new Error(errorMessage);
    }
  };

// src/lib/AuthContext.jsx

const googleLogin = async (idToken) => {
  try {
    setIsLoadingAuth(true);
    setAuthError(null);
    
    console.log('AuthContext.googleLogin called');
    
    const result = await authAPI.googleLogin({ idToken });
    console.log('AuthContext.googleLogin result:', result);
    
    if (result.accessToken && result.refreshToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      console.log('Tokens saved to localStorage');
    }
    
    if (isMountedRef.current) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      console.log('Auth state updated: isAuthenticated = true');
    }
    
    return result;
  } catch (error) {
    console.error('AuthContext.googleLogin error:', error);
    if (isMountedRef.current) {
      setAuthError({
        type: 'google_login_failed',
        message: error.message || 'Google login failed'
      });
      setIsLoadingAuth(false);
    }
    throw error;
  }
};

  /* const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (isMountedRef.current) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
      }
      window.location.href = '/login';
    }
  };*/

  // AuthContext.jsx
/*const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    
    if (isMountedRef.current) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthCheckCompleted(true);
    }
    
    navigate('/');
  }
}; */

// AuthContext.jsx
const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // 清除存储
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    
    if (isMountedRef.current) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      setIsLoadingAuth(false);
      setAuthCheckCompleted(true);
    }
    
    // 根据平台决定跳转目标
    const isNative = window.Capacitor?.isNativePlatform?.() === true;
    if (isNative) {
      // App 端：跳转到登录页
      window.location.href = '/login';
    } else {
      // Web 端：跳转到 Landing 页
      window.location.href = '/';
    }
  }
};

const navigateToLogin = () => {
  navigate('/login');
};

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authCheckCompleted,
    authError,
    login,
    register,
    logout,
    navigateToLogin,
    updateUser,
    checkAuth,
    googleLogin,  // 添加这行
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};