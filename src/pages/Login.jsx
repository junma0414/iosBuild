// @ts-nocheck
// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Chrome, Apple as AppleIcon, Mail } from 'lucide-react';
import { isNativeApp, isIOS, isAndroid } from '../lib/planUtils';
import { base44 } from '../api/base44Client';






const getApiUrl = () => {
  if (window.Capacitor?.isNativePlatform?.()) {
    return import.meta.env?.VITE_API_URL || 'https://lang.omnifamily.cloud/api';
  }
  return import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
};

// 全局标志，防止 SDK 重复初始化
let googleSDKLoaded = false;
let googleSDKInitializing = false;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // 忘记密码相关状态
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  // 邮箱验证相关状态
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  const { login, register, isAuthenticated, authError: contextAuthError, checkAuth } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const googleInitializedRef = useRef(false);

  // 监听 OAuth 回调（Custom Scheme 或 Universal Link）
  useEffect(() => {
    if (!isNativeApp()) {
      console.log('📲 [deepLink] not native app, skipping deep link listener');
      return;
    }
    console.log('📲 [deepLink] setting up appUrlOpen listener');
    console.log('📲 [deepLink] Capacitor.App available:', !!window.Capacitor?.Plugins?.App);

    const handleOpenUrl = async (event) => {
      const url = event?.url || '';
      console.log('📲 [deepLink] App opened via URL:', url);

      const accessTokenMatch = url.match(/[?&]accessToken=([^&]+)/);
      if (accessTokenMatch) {
        const accessToken = decodeURIComponent(accessTokenMatch[1]);
        const refreshTokenMatch = url.match(/[?&]refreshToken=([^&]+)/);
        const refreshToken = refreshTokenMatch ? decodeURIComponent(refreshTokenMatch[1]) : null;
        console.log('📲 [deepLink] found accessToken, saving to localStorage');
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        console.log('📲 [deepLink] navigating to /');
        navigate('/');
        return;
      }

      const codeMatch = url.match(/[?&]code=([^&]+)/);
      if (!codeMatch) {
        console.log('📲 [deepLink] no code found in URL, ignoring');
        return;
      }

      const code = decodeURIComponent(codeMatch[1]);
      console.log('📲 [deepLink] Extracted authorization code from callback URL');

      try {
        const apiUrl = getApiUrl();
        console.log('📲 [deepLink] exchanging code at:', `${apiUrl}/auth/google/callback`);
        const response = await fetch(`${apiUrl}/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();
        console.log('📲 [deepLink] exchange response status:', response.status);
        console.log('📲 [deepLink] exchange response has accessToken:', !!data.accessToken);

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          console.log('📲 [deepLink] navigating to /');
          checkAuth();
          navigate('/');
        } else {
          console.error('📲 [deepLink] OAuth callback failed:', data.error);
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        console.error('📲 [deepLink] OAuth callback error:', err);
        setError(err.message || 'OAuth callback failed');
      }
    };

    // Capacitor App plugin
    if (window.Capacitor?.Plugins?.App) {
      console.log('📲 [deepLink] adding appUrlOpen listener');
      window.Capacitor.Plugins.App.addListener('appUrlOpen', handleOpenUrl);
    } else {
      console.warn('📲 [deepLink] Capacitor.App plugin not available');
    }

    return () => {
      if (window.Capacitor?.Plugins?.App) {
        window.Capacitor.Plugins.App.removeAllListeners('appUrlOpen');
      }
    };
  }, []);

  // 监听 Browser 关闭事件（如果用户关闭了 Custom Tab 但未登录）
  useEffect(() => {
    if (!isNativeApp()) return;
    const handleBrowserClosed = () => {
      console.log('📱 [browserClose] Browser Custom Tab was closed');
      setLoading(false);
    };
    if (window.Capacitor?.Plugins?.Browser) {
      window.Capacitor.Plugins.Browser.addListener('browserFinished', handleBrowserClosed);
      window.Capacitor.Plugins.Browser.addListener('browserPageLoaded', () => {
        console.log('📱 [browserPageLoaded] Browser page loaded');
      });
    }
    return () => {
      if (window.Capacitor?.Plugins?.Browser) {
        window.Capacitor.Plugins.Browser.removeAllListeners();
      }
    };
  }, []);

  // 清理旧的认证数据（避免切换账户时出现灰幕）- 已移除，避免清除已保存的 token

  // 监听来自 Context 的认证错误
  useEffect(() => {
    if (contextAuthError) {
      let errorMsg = contextAuthError.message || 'Authentication failed';
      
      // 如果是 JSON 格式，提取 error 字段
      if (typeof errorMsg === 'string' && errorMsg.includes('"error"')) {
        try {
          const parsed = JSON.parse(errorMsg);
          errorMsg = parsed.error || parsed.message || errorMsg;
        } catch (e) {
          // 解析失败，保持原样
        }
      }
      
      setServerError(errorMsg);
      const timer = setTimeout(() => setServerError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [contextAuthError]);

  // 如果已经认证，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 加载 Google SDK（只加载一次）
  useEffect(() => {
    // 移动端不需要加载 Web SDK
    if (isNativeApp()) return;
    
    // 如果已经加载过，直接返回
    if (googleSDKLoaded || googleSDKInitializing) return;
    
    const loadGoogleSDK = () => {
      googleSDKInitializing = true;
      
      // 检查是否已经存在
      if (window.google?.accounts?.id) {
        googleSDKLoaded = true;
        googleSDKInitializing = false;
        console.log('✅ Google SDK already present');
        return;
      }
      
      // 移除可能存在的旧脚本
      const oldScript = document.getElementById('google-oauth-script');
      if (oldScript) oldScript.remove();
      
      const script = document.createElement('script');
      script.id = 'google-oauth-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleSDKLoaded = true;
        googleSDKInitializing = false;
        console.log('✅ Google SDK loaded');
      };
      script.onerror = () => {
        googleSDKInitializing = false;
        console.error('❌ Google SDK load failed');
      };
      document.head.appendChild(script);
    };
    
    loadGoogleSDK();
    
    return () => {
      googleInitializedRef.current = false;
    };
  }, []);

  // 处理 Google 凭证
  const handleGoogleCredential = async (credential) => {
    try {
      const result = await base44.functions.invoke('googleLogin', { idToken: credential });
      
      if (result?.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        window.location.href = '/';
        return { success: true };
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Google credential error:', error);
      throw error;
    }
  };

  // 检查 URL 中的验证参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    const emailParam = params.get('email');
    
    if (token && emailParam) {
      verifyEmail(token, emailParam);
    }
  }, []);

  const verifyEmail = async (token, emailParam) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email: emailParam }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setVerificationEmail(emailParam);
        setShowVerificationMessage(true);
        setTimeout(() => setShowVerificationMessage(false), 5000);
      } else {
        setError(data.error || 'Email verification failed');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
  };

  // 处理法律条款/隐私链接点击（iOS WKWebView 不支持 target="_blank"）
  const handleLegalLink = (e, path) => {
    e.preventDefault();
    const isNative = isNativeApp();
    if (isNative && window.Capacitor?.Plugins?.Browser) {
      const url = `${window.location.origin}${path}`;
      window.Capacitor.Plugins.Browser.open({ url });
    } else {
      window.location.href = path;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthError(null);
    setShowTermsError(false);
    
    if (isRegister && !agreeToTerms) {
      setShowTermsError(true);
      return;
    }
    
    setLoading(true);

    try {
      if (isRegister) {
        const result = await register(email, password, fullName);
        
        if (result?.requiresVerification) {
          setVerificationEmail(email);
          setShowVerificationMessage(true);
          alert('Verification email sent! Please check your inbox to verify your email address.');
          setPassword('');
          setLoading(false);
          return;
        }
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      if (err.message.includes('verify') || err.message.includes('Email not verified')) {
        setVerificationEmail(email);
        setShowVerificationMessage(true);
      }
    } finally {
      setLoading(false);
    }
  };


   
  // Google 登录主函数
  /*const handleGoogleLogin = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const nativeApp = isNativeApp();
      
      if (nativeApp) {
        // ========== 移动端 ==========
        const platform = isIOS() ? 'ios' : 'android';
        const apiUrl = getApiUrl();

        const response = await fetch(`${apiUrl}/auth/google/mobile-init?platform=${platform}`);
        const data = await response.json();
        
        if (!data.authUrl) {
          throw new Error('Failed to get OAuth URL');
        }
        
        if (window.Capacitor?.Plugins?.Browser) {
          await window.Capacitor.Plugins.Browser.open({ url: data.authUrl });
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        } else {
          window.location.href = data.authUrl;
        }
      } else {
        // ========== Web 端 - 直接重定向 ==========
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          setError('Google Client ID not configured');
          setLoading(false);
          return;
        }
        
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scope = encodeURIComponent('email profile openid');
        const state = encodeURIComponent(Date.now().toString());
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=${scope}&` +
          `state=${state}&` +
          `access_type=online&` +
          `prompt=select_account`;
        
        console.log('Redirecting to Google OAuth:', authUrl);
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  }; */

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    const isNative = isNativeApp();

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID not configured');
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=email profile openid&` +
        `access_type=online&` +
        `prompt=select_account&` +
        `state=${Date.now()}`;

      if (isNative && window.Capacitor?.Plugins?.Browser) {
        await window.Capacitor.Plugins.Browser.open({ url: authUrl });
        setTimeout(() => setLoading(false), 1000);
      } else {
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  // Apple 登录处理（iOS 原生使用 @capacitor-community/apple-sign-in 插件）
  const handleAppleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiUrl();

      // iOS 原生：通过 Capacitor 插件调用系统 Apple 登录
      if (isIOS() && window.Capacitor?.Plugins?.SignInWithApple) {
        const result = await window.Capacitor.Plugins.SignInWithApple.authorize({
          scopes: 'name email',
        });

        if (!result?.response?.identityToken) {
          throw new Error('No identity token from Apple');
        }

        const identityToken = result.response.identityToken;
        const fullName = result.response.givenName
          ? `${result.response.givenName || ''} ${result.response.familyName || ''}`.trim() || null
          : null;

        const response = await fetch(`${apiUrl}/auth/apple`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identityToken, fullName }),
        });

        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          navigate('/');
          return;
        } else {
          throw new Error(data.error || 'Apple login failed');
        }
      } else {
        throw new Error('Apple Sign-In is only available on iOS devices');
      }
    } catch (err) {
      console.error('Apple login error:', err);
      setError(err.message || 'Apple login failed');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }
    
    setIsSendingReset(true);
    setResetError('');
    setResetMessage('');
    
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResetMessage('Password reset link has been sent to your email.');
        setResetEmail('');
        setTimeout(() => {
          setShowForgotPassword(false);
          setResetMessage('');
        }, 3000);
      } else {
        setResetError(data.error || 'Failed to send reset email.');
      }
    } catch (error) {
      setResetError('Network error. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });
      
      if (response.ok) {
        alert('Verification email sent! Please check your inbox.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* 邮箱验证提示 */}
        {showVerificationMessage && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Please verify your email
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  We've sent a verification link to <strong>{verificationEmail}</strong>. 
                  Please check your inbox and click the link to activate your account.
                </p>
                <button
                  onClick={handleResendVerification}
                  className="text-xs text-yellow-800 underline mt-2 hover:text-yellow-900"
                >
                  Resend verification email
                </button>
              </div>
              <button
                onClick={() => setShowVerificationMessage(false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 - 只显示后端返回的错误信息 */}
        {serverError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm text-red-700">
                  {serverError}
                </p>
              </div>
              <button
                onClick={() => setServerError('')}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 忘记密码弹窗 */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetError('');
                    setResetEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleForgotPassword}>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition mb-4"
                  required
                />
                
                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {resetError}
                  </div>
                )}
                
                {resetMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {resetMessage}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LinguMate</h1>
          <p className="text-gray-600 mt-2">Language Learning Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {!isRegister && !showForgotPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {isRegister && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked);
                    setShowTermsError(false);
                  }}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a 
                    href="/terms" 
                    className="text-primary hover:underline"
                    onClick={(e) => handleLegalLink(e, '/terms')}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a 
                    href="/privacy" 
                    className="text-primary hover:underline"
                    onClick={(e) => handleLegalLink(e, '/privacy')}
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {showTermsError && (
                <p className="text-red-600 text-sm">
                  Please agree to the Terms of Service and Privacy Policy to continue.
                </p>
              )}
            </div>
          )}

          {/* 普通错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isRegister ? 'Creating Account...' : 'Logging in...'}
              </span>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>

          {/* Google 登录按钮 */}
          {!isRegister && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              {t('signInWithGoogle')}
            </button>
          )}

          {/* Apple 登录按钮（仅 iOS 原生显示） */}
          {isIOS() && !isRegister && (
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              <AppleIcon className="w-5 h-5" />
              {t('signInWithApple')}
            </button>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setAgreeToTerms(false);
                setShowTermsError(false);
                setError('');
                setShowVerificationMessage(false);
              }}
              className="text-primary hover:text-primary/80 font-medium"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form> 

        {!isRegister && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600 text-sm">
              By continuing, you agree to our{' '}
              <a 
                href="/terms" 
                className="text-primary hover:underline"
                onClick={(e) => handleLegalLink(e, '/terms')}
              >
                Terms of Service
              </a>{' '}
              and{' '}
              <a 
                href="/privacy" 
                className="text-primary hover:underline"
                onClick={(e) => handleLegalLink(e, '/privacy')}
              >
                Privacy Policy
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;