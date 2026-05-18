// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const getApiUrl = () => {
  if (window.Capacitor?.isNativePlatform?.()) {
    return import.meta.env?.VITE_API_URL || 'https://lang.omnifamily.cloud/api';
  }
  return import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
};

const AppleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processAppleCallback = async () => {
      try {
        // Apple sends form POST data — check URL params first
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const idToken = params.get('id_token');
        const userJson = params.get('user');
        let fullName = null;

        if (userJson) {
          try {
            const userData = JSON.parse(userJson);
            if (userData?.name) {
              fullName = `${userData.name.firstName || ''} ${userData.name.lastName || ''}`.trim() || null;
            }
          } catch (e) {}
        }

        if (!idToken && !code) {
          setError('No authorization data received from Apple');
          setProcessing(false);
          return;
        }

        const apiUrl = getApiUrl();

        if (idToken) {
          const response = await fetch(`${apiUrl}/auth/apple`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identityToken: idToken, fullName }),
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
        } else if (code) {
          const redirectUri = window.location.origin + '/auth/apple/callback';
          const response = await fetch(`${apiUrl}/auth/apple/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, fullName, redirect_uri: redirectUri }),
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
        }
      } catch (err) {
        console.error('Apple callback error:', err);
        setError(err.message || 'Apple login failed');
        setProcessing(false);
      }
    };

    processAppleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">✕</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Signing in with Apple...</h2>
        <p className="text-gray-500">Please wait</p>
      </div>
    </div>
  );
};

export default AppleCallback;
