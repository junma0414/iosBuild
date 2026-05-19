// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const code = params.get('code');
        const errorParam = params.get('error');

        if (errorParam) {
          throw new Error(`Google authentication failed: ${errorParam}`);
        }

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
          checkAuth();
          navigate('/');
          return;
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

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

        checkAuth();
        navigate('/');
      } catch (err) {
        console.error('[GoogleCallback] error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate, checkAuth]);

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