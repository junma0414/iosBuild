// @ts-nocheck
import React, { useState, useEffect } from "react";
import { setPlan, isNativeApp, isIOS, isAndroid, getPaymentPlatform, getRevenueCatPackageId, getUserPaymentPlatform } from '../lib/planUtils';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { Link, useNavigate } from "react-router-dom";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Lock, CheckCircle2, Loader2, Smartphone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '../lib/AuthContext';

const prices = {
  pro: { monthly: 9.9, yearly: 79 },
  premium: { monthly: 19.9, yearly: 149 },
};

export default function Checkout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, updateUser, user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get("plan") || "pro";
  const billing = urlParams.get("billing") || "monthly";

  const price = prices[plan]?.[billing] || 9.9;
  const planLabel = plan === "pro" ? t("pro") : t("premium");

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentPlatform, setPaymentPlatform] = useState(null);
  const [prorationAmount, setProrationAmount] = useState(null);
  const [isLoadingProration, setIsLoadingProration] = useState(true);
  
  const nativeApp = isNativeApp();
  const ios = isIOS();
  const android = isAndroid();
  
  const currentPlan = user?.plan || "free";
  const currentBilling = user?.billing || "monthly";
  
  const { 
    purchaseProduct, 
    loading: revenueCatLoading,
    error: revenueCatError,
    isMobile: revenueCatAvailable,
    initialized: revenueCatInitialized
  } = useRevenueCat();

  // 获取按比例计费预览（仅 Stripe 用户需要）
  useEffect(() => {
    const fetchProration = async () => {
      const userPlatform = user?.subscription_source || 'stripe';
      // RevenueCat 用户不需要按比例计费预览
      if (userPlatform !== 'stripe') {
        setProrationAmount(price);
        setIsLoadingProration(false);
        return;
      }
      
      // 只有当用户不是 free 套餐时才需要计算差价
      if (currentPlan === 'free') {
        setProrationAmount(price);
        setIsLoadingProration(false);
        return;
      }
      
      // 如果是相同套餐，不计算
      if (currentPlan === plan && currentBilling === billing) {
        setProrationAmount(0);
        setIsLoadingProration(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        
        const response = await fetch(`${apiUrl}/stripe/proration-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ plan, billing }),
        });
        
        const data = await response.json();
        
        if (data.proration_amount > 0) {
          // 将金额从分转换为元
          setProrationAmount(data.proration_amount / 100);
        } else {
          setProrationAmount(price);
        }
      } catch (error) {
        console.error('Failed to get proration:', error);
        setProrationAmount(price);
      } finally {
        setIsLoadingProration(false);
      }
    };
    
    fetchProration();
  }, [plan, billing, currentPlan, currentBilling, price]);

  const refreshUserInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        updateUser?.(userData);
        return userData;
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
    return null;
  };

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  useEffect(() => {
    // 已有订阅的用户按已有平台走；新用户按设备平台走

    const detectPlatform = () => {
      console.log('🔍 paymentPlatform DEBUG ==========');
      console.log('🔍 user:', user);
      console.log('🔍 user?.subscription_source:', user?.subscription_source);
      console.log('🔍 window.Capacitor:', window.Capacitor);
      console.log('🔍 isNativeApp():', isNativeApp());
      console.log('🔍 isIOS():', isIOS());
      console.log('🔍 isAndroid():', isAndroid());
      console.log('🔍 navigator.userAgent:', navigator.userAgent);
      
      let platform;
      if (user?.subscription_source) {
        platform = user.subscription_source === 'stripe' ? 'stripe' : (isIOS() ? 'appstore' : 'googleplay');
        console.log(`🔍 has subscription_source → platform: ${platform}`);
      } else {
        platform = getPaymentPlatform();
        console.log(`🔍 no subscription_source → getPaymentPlatform(): ${platform}`);
      }
      setPaymentPlatform(platform);
    };

    detectPlatform();
  }, [user]);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getOrigin = () => {
    try {
      return window.top.location.origin;
    } catch (_) {
      return window.location.origin;
    }
  };

  // 支付成功后跳转到首页并刷新用户状态
  const handlePaymentSuccess = async () => {
    setSuccess(true);
    
    // 等待一小段时间确保后端已处理
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 刷新用户信息
    const updatedUser = await refreshUserInfo();
    
    if (updatedUser) {
      console.log('✅ User info refreshed:', updatedUser.plan);
    }
    
    // 强制刷新页面，确保认证状态完全重置
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError("");
    
    try {
      console.log('🔴 handlePayment called with paymentPlatform:', paymentPlatform);
      console.log('🔴 revenueCatAvailable:', revenueCatAvailable, 'revenueCatInitialized:', revenueCatInitialized);
      
      if (paymentPlatform === 'stripe' || (nativeApp && !revenueCatInitialized)) {
        // 移动端 RevenueCat 未就绪时回退到 Stripe Web 支付
        const origin = getOrigin();
        console.log('Calling stripeCheckout with:', { plan, billing });
        
        localStorage.setItem("checkout_plan", plan);
        localStorage.setItem("checkout_billing", billing);
        
        const response = await base44.functions.invoke("stripeCheckout", {
          plan,
          billing,
          successUrl: `${origin}/checkout?payment=success&plan=${plan}&billing=${billing}`,
          cancelUrl: `${origin}/checkout?plan=${plan}&billing=${billing}`,
        });
        
        if (!response || !response.data) {
          throw new Error(`Invalid response from payment service: ${JSON.stringify(response)}`);
        }
        
        const { url } = response.data;
        if (url) {
          window.location.href = url;
        }
      } else if (paymentPlatform === 'appstore' || paymentPlatform === 'googleplay') {
        if (!revenueCatAvailable || !revenueCatInitialized) {
          throw new Error('payment on mobile APP is not ready, please try later');
        }
        
        const packageId = getRevenueCatPackageId(plan, billing);
        if (!packageId) {
          throw new Error('fetching product Id failed');
        }
        
        console.log(`使用RevenueCat支付:`, { plan, billing, packageId, platform: paymentPlatform });
        
        const result = await purchaseProduct(packageId);
        
        if (result.success) {
  console.log('RevenueCat purchase successful:', result);
  setPlan(plan, billing);
  await handlePaymentSuccess();
} else if (result.cancelled) {
  // User cancelled the purchase - just close the dialog, no error
  console.log('User cancelled the purchase');
  setError(null);
  // Optionally show a temporary message or just do nothing
  // You can add a toast notification here if you want
} else {
  throw new Error(result.error || 'Purchase incomplete');
}
      }
    } catch (err) {
      console.error('支付错误:', err);
      setError(err.message || "Payment failer");
      setIsProcessing(false);
    }
  };

  // 处理支付成功后的回调（从 Stripe 重定向回来）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentSuccess = params.get('payment') === 'success';
    
    if (paymentSuccess) {
      window.history.replaceState({}, '', '/checkout');
      handlePaymentSuccess();
    }
  }, []);

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("paymentSuccess")}</h2>
          <p className="text-muted-foreground">{t("redirecting")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/subscription">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">{t("payNow")}</h1>
      </div>

      {/* Order summary */}
      <Card className="border-0 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{planLabel}</p>
            <p className="text-sm text-muted-foreground">{billing === "monthly" ? t("monthlyPlan") : t("yearlyPlan")}</p>
            {currentPlan !== 'free' && prorationAmount && prorationAmount < price && (
              <p className="text-xs text-muted-foreground line-through mt-1">
                Regular: S${price}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {isLoadingProration ? (
                <Loader2 className="w-5 h-5 animate-spin inline" />
              ) : (
                `S$${(prorationAmount !== null ? prorationAmount : price).toFixed(2)}`
              )}
            </p>
            {currentPlan !== 'free' && prorationAmount && prorationAmount < price && (
              <p className="text-xs text-green-600 mt-1">
                Prorated amount (one-time)
              </p>
            )}
          </div>
        </div>
        
        {/* 显示当前套餐信息 */}
        {currentPlan !== 'free' && currentPlan !== plan && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Upgrading from {currentPlan} {currentBilling} plan
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You'll only pay the prorated difference for the remaining period.
              Next billing will be at the new plan price.
            </p>
          </div>
        )}
      </Card>

      {/* Native App: IAP Notice */}
      {nativeApp ? (
        <Card className="border-0 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {ios ? t("iapTitleApple") : t("iapTitleGoogle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {ios ? t("iapRequiredByApple") : t("iapRequiredByGoogle")}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {ios ? t("iapGuidelineApple") : t("iapGuidelineGoogle")}
          </p>
          <Button
            className="w-full rounded-xl h-12 text-base font-semibold"
            onClick={handlePayment}
            disabled={isProcessing || revenueCatLoading}
          >
            {(isProcessing || revenueCatLoading) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {ios ? t("iapConnectingApple") : t("iapConnectingGoogle")}
              </>
            ) : (
              ios ? t("iapSubscribeApple") : t("iapSubscribeGoogle")
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {ios ? t("iapManageApple") : t("iapManageGoogle")}
          </p>
          <p className="text-xs text-center text-muted-foreground/60">
            SGD reference price. Actual charge in your local currency as set by {ios ? "App Store" : "Google Play"}.
          </p>
        </Card>
      ) : (
        /* Web: Stripe Checkout */
        <Card className="border-0 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t("creditCard")}</p>
              <div className="flex gap-1 mt-0.5">
                {["VISA", "MC", "AMEX"].map(brand => (
                  <span key={brand} className="text-[10px] font-bold px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{brand}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You'll be redirected to Stripe's secure checkout page to complete your payment.
          </p>

          {(error || revenueCatError) && (
            <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-xl">
              {error || revenueCatError}
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={isProcessing || isLoadingProration}
            className="w-full rounded-xl gap-2 h-12 text-base font-semibold"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
            {isProcessing 
              ? t("processing") 
              : `${t("completePayment")} S$${(prorationAmount !== null ? prorationAmount : price).toFixed(2)}`
            }
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            {t("sslNote")}
          </div>
        </Card>
      )}
    </div>
  );
}