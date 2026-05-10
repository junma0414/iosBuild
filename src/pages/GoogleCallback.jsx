// src/pages/GoogleCallback.jsx
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let isProcessing = false;
    
    const handleCallback = async () => {

      if (isProcessing) return;
      isProcessing = true;

      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const errorParam = params.get('error');
        const state = params.get('state');
        
        console.log('🔵 [GoogleCallback] code:', code ? 'present' : 'missing');
        console.log('🔵 [GoogleCallback] state:', state);
        console.log('🔵 [GoogleCallback] full URL:', window.location.href);
        console.log('🔵 [GoogleCallback] fromApp (state===app_login):', state === 'app_login');
        
        if (errorParam) {
          throw new Error(`Google authentication failed: ${errorParam}`);
        }
        
        if (!code) {
          throw new Error('No authorization code received');
        }
        
        console.log('🔵 [GoogleCallback] calling API:', `${API_BASE_URL}/auth/google/callback`);
        
        const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        
        const data = await response.json();
        
        console.log('🔵 [GoogleCallback] response status:', response.status);
        console.log('🔵 [GoogleCallback] response data keys:', Object.keys(data));
        console.log('🔵 [GoogleCallback] has accessToken:', !!data.accessToken);
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Authentication failed`);
        }
        
        if (!data.accessToken) {
          throw new Error('No access token received from server');
        }
        
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        
        console.log('✅ [GoogleCallback] tokens saved to localStorage');
        
        if (isMounted) {
          const fromApp = state === 'app_login';
          console.log('🔵 [GoogleCallback] fromApp:', fromApp, '-> saving and redirecting...');
          if (fromApp) {
            const returnUrl = `com.lingumate.app://login?accessToken=${encodeURIComponent(data.accessToken)}${data.refreshToken ? '&refreshToken=' + encodeURIComponent(data.refreshToken) : ''}`;
            console.log('🔵 [GoogleCallback] redirecting to custom scheme:', returnUrl.substring(0, 80) + '...');
            window.location.href = returnUrl;
          } else {
            // 先刷新认证状态，再导航
            checkAuth();
            console.log('🔵 [GoogleCallback] navigating to /');
            navigate('/');
          }
        }
      } catch (err) {
        console.error('🔴 [GoogleCallback] error:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    
    handleCallback();
    
    return () => {
      isMounted = false;
    };
  }, [location, navigate]);

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Completing Google sign in...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;