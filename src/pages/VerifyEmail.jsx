// src/pages/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      let token = searchParams.get('token');
      let email = searchParams.get('email');
      
      console.log('Raw params:', { token, email });

      if (!token || !email) {
        setError('Invalid verification link');
        setLoading(false);
        return;
      }
      
      // 解码 email（处理 URL 编码）
      try {
        email = decodeURIComponent(email);
      } catch (e) {
        console.error('Failed to decode email:', e);
      }
      
      console.log('Decoded email:', email);

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email }),
        });

        const data = await response.json();
        console.log('Verification response:', data);

        if (response.ok) {
          setSuccess(true);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setError(data.error || 'Verification failed');
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">Your email has been successfully verified. You can now log in.</p>
          <Link to="/login" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link to="/login" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          Back to Login
        </Link>
      </div>
    </div>
  );
}