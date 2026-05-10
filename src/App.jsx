// @ts-nocheck
import React, { useEffect } from 'react';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from './lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { LanguageProvider } from './lib/LanguageContext';

import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import OralPractice from './pages/OralPractice';
import EssayCorrection from './pages/EssayCorrection';
import Subscription from './pages/Subscription';
import ListeningTraining from './pages/ListeningTraining';
import QATraining from './pages/QATraining';
//import Membership from './pages/Membership';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import TestRevenueCat from './pages/TestRevenueCat';
import TestGoogleOAuth from './pages/TestGoogleOAuth';
import GoogleCallback from './pages/GoogleCallback';
import AppleCallback from './pages/AppleCallback';

import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// 新增开屏页面
import Landing from './pages/Landing';
import Splash from './pages/Splash';

import { Navigate } from 'react-router-dom';


// 检测是否为移动端 App
const isNativeApp = () => {
  return window.Capacitor?.isNativePlatform?.() === true;
};

// 加载动画组件
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
        <span className="text-white font-bold text-xl">L</span>
      </div>
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  </div>
);

// 公共路由组件（不需要认证，没有布局）
const PublicRoutes = () => {
  const isNative = isNativeApp();
  
  return (
    <LanguageProvider>
      <Routes>
        {/* 开屏页面：Web 用 Landing，App 用 Splash */}
        <Route path="/" element={isNative ? <Splash /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/test-revenuecat" element={<TestRevenueCat />} />
        <Route path="/test-google-oauth" element={<TestGoogleOAuth />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/apple/callback" element={<AppleCallback />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </LanguageProvider>
  );
};

// 认证后的应用路由（有 AppLayout 布局）
const AuthenticatedAppRoutes = () => (
  <LanguageProvider>
    <Routes>
      {/* 带布局的路由 */}
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/oral-practice" element={<OralPractice />} />
        <Route path="/essay-correction" element={<EssayCorrection />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/listening" element={<ListeningTraining />} />
        <Route path="/qa-training" element={<QATraining />} />
    {/*     <Route path="/membership" element={<Membership />} />   */}
        <Route path="/checkout" element={<Checkout />} />
      </Route>
      {/* 不带布局的公共路由（已认证用户也需要能访问） */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/auth/apple/callback" element={<AppleCallback />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </LanguageProvider>
);

// 主应用组件
 const AuthenticatedApp = () => {
  const { isLoadingAuth, authCheckCompleted, isAuthenticated } = useAuth();

  // 认证检查尚未完成，显示加载状态
  if (isLoadingAuth || !authCheckCompleted) {
    return <LoadingSpinner />;
  }

  // 未认证（包括有错误的情况）：显示公共路由（开屏页/登录页）
  if (!isAuthenticated) {
    return <PublicRoutes />;
  }

  // 已认证用户：显示主应用
  return <AuthenticatedAppRoutes />;
}; 



// 暗色模式管理 Hook
const useDarkMode = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyDarkMode = (e) => document.documentElement.classList.toggle('dark', e.matches);
    
    applyDarkMode(mediaQuery);
    mediaQuery.addEventListener('change', applyDarkMode);
    
    return () => mediaQuery.removeEventListener('change', applyDarkMode);
  }, []);
};

function App() {
  useDarkMode();

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;