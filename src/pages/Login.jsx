// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { Chrome, Apple, Mail } from 'lucide-react';
import { isNativeApp, isIOS, isAndroid } from '../lib/planUtils';
import { base44 } from '../api/base44Client';

const capBrowser = () => {
  try { return window.Capacitor?.Plugins?.Browser; } catch (_) { return null; }
};


const openLegalDoc = (path) => {
  const isNative = isNativeApp();
  const baseUrl = isNative
    ? (import.meta.env.VITE_SITE_URL || 'https://lang.omnifamily.cloud')
    : window.location.origin;
  const url = `${baseUrl}${path}?lang=en`;
  const browser = capBrowser();
  if (browser?.open) {
    browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

const pollForToken = async (stateId, provider) => {
  const apiUrl = getApiUrl();
  for (let i = 0; i < 200; i++) {
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await fetch(`${apiUrl}/auth/poll-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stateId, provider }),
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        window.location.href = '/';
        return;
      }
    } catch (_) {}
  }
};

const getApiUrl = () => {
  if (window.Capacitor?.isNativePlatform?.()) {
    return import.meta.env?.VITE_API_URL || 'https://lang.omnifamily.cloud/api';
  }
  return import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
};

let googleSDKLoaded = false;
let googleSDKInitializing = false;
let googleAuthInstance = null;

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

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const { login, register, isAuthenticated, authError: contextAuthError, checkAuth } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const googleInitializedRef = useRef(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    const handleOpenUrl = async (event) => {
      const url = event?.url || '';

      // Handle com.lingumate.app://login redirect (from backend OAuth callbacks)
      const urlObj = (() => {
        try { return new URL(url); } catch (_) { return null; }
      })();
      const params = urlObj ? urlObj.searchParams : new URLSearchParams(url.split('?')[1] || '');

      const accessToken = params.get('accessToken');
      if (accessToken) {
        const refreshToken = params.get('refreshToken');
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        checkAuth();
        navigate('/');
        return;
      }

      // Apple OAuth callback (native: custom scheme with query params)
      if (url.startsWith('com.lingumate.omnifamily://auth/apple/callback')) {
        const appleCode = url.match(/[?&]code=([^&]+)/);
        const appleIdToken = url.match(/[?&]id_token=([^&]+)/);
        if (appleCode || appleIdToken) {
          try {
            const apiUrl = getApiUrl();
            let body, endpoint;
            if (appleIdToken) {
              endpoint = `${apiUrl}/auth/apple`;
              body = JSON.stringify({ identityToken: decodeURIComponent(appleIdToken[1]) });
            } else {
              endpoint = `${apiUrl}/auth/apple/callback`;
              body = JSON.stringify({
                code: decodeURIComponent(appleCode[1]),
                redirect_uri: 'com.lingumate.omnifamily://auth/apple/callback',
              });
            }
            const response = await fetch(endpoint, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
            });
            const data = await response.json();
            if (data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
              checkAuth();
              navigate('/');
            } else {
              setError(data.error || 'Apple login failed');
            }
          } catch (err) {
            setError(err.message || 'Apple login failed');
          }
        }
        return;
      }

      const codeMatch = url.match(/[?&]code=([^&]+)/);
      if (!codeMatch) return;

      const code = decodeURIComponent(codeMatch[1]);
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await response.json();
        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          checkAuth();
          navigate('/');
        } else {
          setError(data.error || 'Login failed');
        }
      } catch (err) {
        setError(err.message || 'OAuth callback failed');
      }
    };

    if (window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.addListener('appUrlOpen', handleOpenUrl);
    }
    return () => {
      if (window.Capacitor?.Plugins?.App) {
        window.Capacitor.Plugins.App.removeAllListeners('appUrlOpen');
      }
    };
  }, []);

  useEffect(() => {
    if (!isNativeApp() || !isIOS()) return;
    if (window.Capacitor?.Plugins?.Browser) {
      window.Capacitor.Plugins.Browser.addListener('browserFinished', () => {
        setLoading(false);
      });
      window.Capacitor.Plugins.Browser.addListener('browserPageLoaded', () => {});
    }
    return () => {
      if (window.Capacitor?.Plugins?.Browser) {
        window.Capacitor.Plugins.Browser.removeAllListeners();
      }
    };
  }, []);

  // iOS 插件诊断（仅用于调试）
  useEffect(() => {
    if (!isNativeApp() || !isIOS()) return;
    const status = [];
    status.push('Capacitor: ' + !!window.Capacitor);
    status.push('Browser: ' + !!window.Capacitor?.Plugins?.Browser);
    status.push('SignInWithApple: ' + !!window.Capacitor?.Plugins?.SignInWithApple);
    status.push('App: ' + !!window.Capacitor?.Plugins?.App);
    const platform = window.Capacitor?.getPlatform?.() || 'unknown';
    status.push('Platform: ' + platform);
    status.push('Protocol: ' + window.location.protocol);
    try {
      fetch('https://lang.omnifamily.cloud/api/auth/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'debug', message: 'plugin-status', data: status.join(' | ') }),
      });
    } catch (_) {}
  }, []);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify');
    const emailParam = params.get('email');
    if (token && emailParam) {
      verifyEmail(token, emailParam);
    }
  }, []);

  // iOS 调试信息
  const [pluginStatus, setPluginStatus] = useState('');
  useEffect(() => {
    if (!isNativeApp() || !isIOS()) return;
    const status = [];
    status.push('Capacitor: ' + !!window.Capacitor);
    status.push('Browser: ' + !!window.Capacitor?.Plugins?.Browser);
    status.push('SignInWithApple: ' + !!window.Capacitor?.Plugins?.SignInWithApple);
    status.push('App: ' + !!window.Capacitor?.Plugins?.App);
    const platform = window.Capacitor?.getPlatform?.() || 'unknown';
    status.push('Platform: ' + platform);
    status.push('Protocol: ' + window.location.protocol);
    setPluginStatus(status.join(' | '));
    // 发送诊断日志到后端
    try {
      fetch('https://lang.omnifamily.cloud/api/auth/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: 'debug', message: 'plugin-status', data: status.join(' | ') }),
      });
    } catch (_) {}
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

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    const isNative = isNativeApp();

    // ========== Native (Android): Capacitor Google Sign-In plugin ==========
    if (isNative && !isIOS()) {
      try {
        const { GoogleSignIn } = await import('capacitor-google-sign-in');
        const result = await GoogleSignIn.handleSignInButton();
        const idToken = result.response?.authorizationCode || result.response?.idToken;

        if (!idToken) {
          throw new Error('No identity token received from Google');
        }

        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Google login failed');
        }

        if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          checkAuth();
          navigate('/');
        } else {
          throw new Error('No access token received from server');
        }
        return;
      } catch (err) {
        if (err.message === 'USER_CANCELLED') {
          console.log('Google Sign-In cancelled by user');
          setLoading(false);
          return;
        }
        console.error('Google Sign-In native error:', err);
        setError(err.message || 'Google login failed');
        setLoading(false);
        return;
      }
    }

    // ========== iOS: Google login (try native plugin, fallback to GIS popup) ==========
    if (isNative && isIOS()) {
      try {
        const { GoogleSignIn } = await import('capacitor-google-sign-in');
        const result = await GoogleSignIn.handleSignInButton();
        const idToken = result.response?.authorizationCode || result.response?.idToken;
        if (idToken) {
          const apiUrl = getApiUrl();
          const res = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          const data = await res.json();
          if (res.ok && data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            checkAuth();
            navigate('/');
            return;
          }
        }
      } catch (_) {}

      // Fallback: open in system Safari
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) throw new Error('Google Client ID not configured');

        const redirectUri = 'https://lang.omnifamily.cloud/auth/google/callback';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&scope=email profile openid&access_type=offline&prompt=select_account&state=app`;

        window.location.href = authUrl;
      } catch (err) {
        console.error('Google login error:', err);
        setError('Google Sign-In is not available on this device. Please use email to sign in.');
        setLoading(false);
      }
    }

    // ========== Web: Google Identity Services (GIS) popup ==========
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError('Google Client ID not configured');
        setLoading(false);
        return;
      }

      if (!googleAuthInstance) {
        if (typeof google === 'undefined' || !google.accounts) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        googleAuthInstance = google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'email profile openid',
          ux_mode: 'popup',
          callback: async (response) => {
            if (response.error) {
              setError(response.error_description || response.error || 'Google login failed');
              setLoading(false);
              return;
            }

            try {
              const apiUrl = getApiUrl();
              const res = await fetch(`${apiUrl}/auth/google/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: response.code, redirect_uri: 'postmessage' }),
              });
              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.error || 'Google login failed');
              }

              if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
                checkAuth();
                navigate('/');
              } else {
                throw new Error('No access token received from server');
              }
            } catch (err) {
              console.error('Google login error:', err);
              setError(err.message || 'Google login failed');
              setLoading(false);
            }
          },
          error_callback: (err) => {
            console.error('GIS error:', err);
            setError(err.message || 'Google login failed');
            setLoading(false);
          },
        });
      }

      googleAuthInstance.requestCode();
      setTimeout(() => setLoading(false), 15000);
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError('');

    const isNative = isNativeApp();

    // ========== Native (iOS): SignInWithApple (ESM import) ==========
    if (isNative && isIOS()) {
      try {
        const { SignInWithApple } = await import('@capacitor/app');
        // Capacitor 7 内置 SignInWithApple，需要 ESM import
      } catch (_) {}

      try {
        const SignInWithApple = window.Capacitor?.Plugins?.SignInWithApple;
        if (SignInWithApple) {
          const result = await SignInWithApple.authorize({
            clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
            redirectUri: import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin + '/auth/apple/callback',
            scopes: 'email name',
          });

          const identityToken = result.response?.identityToken;
          const fullName = result.response?.fullName
            ? `${result.response.fullName.givenName || ''} ${result.response.fullName.familyName || ''}`.trim()
            : null;

          if (identityToken) {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/auth/apple`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ identityToken, fullName }),
            });
            const data = await res.json();
            if (res.ok && data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
              checkAuth();
              navigate('/');
              return;
            }
          }
        }
      } catch (_) {}

      setError('Apple Sign-In is not available on this device. Please use Google or email to sign in.');
      setLoading(false);
      return;
    }

    // ========== Web: Apple OAuth ==========
    try {
      const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
      if (!clientId) {
        setError('Apple Client ID not configured');
        setLoading(false);
        return;
      }

      const platform = isNative ? (isIOS() ? 'ios' : 'android') : 'web';
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/auth/apple/init?platform=${platform}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (!data.authUrl) {
        throw new Error('Failed to get Apple OAuth URL');
      }

      window.location.href = data.authUrl;
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md">
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

        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reset Password</h2>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetError('');
                    setResetEmail('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleForgotPassword}>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition mb-4 text-base"
                  required
                />
                {resetError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {resetError}
                  </div>
                )}
                {resetMessage && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">LinguMate</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Language Learning Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-base"
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
                <label htmlFor="agreeTerms" className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <button 
                    type="button"
                    onClick={() => openLegalDoc('/terms')}
                    className="text-primary hover:underline bg-transparent border-none cursor-pointer p-0 inline text-sm"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button 
                    type="button"
                    onClick={() => openLegalDoc('/privacy')}
                    className="text-primary hover:underline bg-transparent border-none cursor-pointer p-0 inline text-sm"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {showTermsError && (
                <p className="text-red-600 text-sm">
                  Please agree to the Terms of Service and Privacy Policy to continue.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
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

          {!isRegister && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Chrome className="w-5 h-5" />
              {t('signInWithGoogle')}
            </button>
          )}

          {!isRegister && !isAndroid() && (
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              <Apple className="w-5 h-5" />
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
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              By continuing, you agree to our{' '}
              <button 
                type="button"
                onClick={() => openLegalDoc('/terms')}
                className="text-primary hover:underline bg-transparent border-none cursor-pointer p-0 inline text-sm"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button 
                type="button"
                onClick={() => openLegalDoc('/privacy')}
                className="text-primary hover:underline bg-transparent border-none cursor-pointer p-0 inline text-sm"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
