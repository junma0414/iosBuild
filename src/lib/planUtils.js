// @ts-nocheck
// src/lib/planUtils.js

// Languages available per plan
export const FREE_LANGUAGES = ["en", "zh"];
export const PRO_LANGUAGES = ["en", "zh", "ms", "ja", "ko"];
// Premium = all languages

export const PLAN_LIMITS = {
  free:    { conversations: 5,   messagesPerConv: 10, essays: 0,  listening: 3,  qa: 3,  voice: false, customScenario: false },
  pro:     { conversations: 30,  messagesPerConv: 50, essays: 3,  listening: 15, qa: 10, voice: true, customScenario: true },
  premium: { conversations: 100, messagesPerConv: 99, essays: 10, listening: 50, qa: 30, voice: true,  customScenario: true  },
};

const detectCapacitorPlatform = () => {
  if (typeof window === 'undefined') return null;

  // 优先使用协议检测（最可靠）
  if (window.location && window.location.protocol === 'capacitor:') {
    if (typeof navigator !== 'undefined') {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return 'ios';
      if (/Android/.test(navigator.userAgent)) return 'android';
    }
    return 'web';
  }

  // Capacitor 4+ 方式
  if (window.Capacitor) {
    if (typeof window.Capacitor.getPlatform === 'function') {
      return window.Capacitor.getPlatform();
    }
    if (window.Capacitor.isNativePlatform) {
      const isNative = typeof window.Capacitor.isNativePlatform === 'function'
        ? window.Capacitor.isNativePlatform()
        : window.Capacitor.isNativePlatform;
      if (isNative) {
        if (typeof navigator !== 'undefined') {
          if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return 'ios';
          if (/Android/.test(navigator.userAgent)) return 'android';
        }
        return 'web';
      }
    }
  }

  // UserAgent 降级检测
  if (typeof navigator !== 'undefined') {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return 'ios';
    if (/Android/.test(navigator.userAgent)) return 'android';
  }

  return null;
};

// Detect if running inside a native app (Capacitor)
export function isNativeApp() {
  if (typeof window === 'undefined') return false;

  // 方法1：检查协议
  if (window.location && window.location.protocol === 'capacitor:') {
    console.log('🔎 isNativeApp - 检测到 capacitor:// 协议');
    return true;
  }

  // 方法2：检查 Capacitor 对象
  if (window.Capacitor) {
    if (typeof window.Capacitor.isNativePlatform === 'function') {
      try {
        const isNative = window.Capacitor.isNativePlatform();
        console.log('🔎 isNativeApp - Capacitor isNativePlatform:', isNative);
        if (isNative) return true;
      } catch (e) {
        console.log('🔎 isNativeApp - Capacitor.isNativePlatform threw:', e);
      }
    } else if (window.Capacitor.isNativePlatform) {
      console.log('🔎 isNativeApp - Capacitor.isNativePlatform truthy:', window.Capacitor.isNativePlatform);
      return true;
    } else if (window.Capacitor.getPlatform) {
      const platform = window.Capacitor.getPlatform();
      console.log('🔎 isNativeApp - Capacitor.getPlatform:', platform);
      if (platform === 'android' || platform === 'ios') return true;
    } else {
      console.log('🔎 isNativeApp - Capacitor exists but no isNativePlatform');
    }
  }
  
  // 方法3：检查 Android WebView 特征
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent;
    if (/Android/.test(ua) && (/\bwv\b/.test(ua) || /Version\/\d/.test(ua))) {
      console.log('🔎 isNativeApp - 检测到 Android WebView UA');
      return true;
    }
  }
  
  // React Native WebView 检测
  if (window.ReactNativeWebView) return true;
  
  console.log('🔎 isNativeApp - 不是原生环境');
  return false;
}

export function isIOS() {
  const platform = detectCapacitorPlatform();
  if (platform === 'ios') return true;
  
  // 降级：User Agent 检测
  if (typeof navigator !== 'undefined') {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
  return false;
}

export function isAndroid() {
  const platform = detectCapacitorPlatform();
  if (platform === 'android') return true;
  
  // 降级：User Agent 检测
  if (typeof navigator !== 'undefined') {
    return /Android/.test(navigator.userAgent);
  }
  return false;
}

export function getCurrentPlan(user) {
  if (user?.plan) return user.plan;
  if (typeof localStorage !== 'undefined') {
    const savedPlan = localStorage.getItem("lm_plan");
    if (savedPlan && savedPlan !== 'undefined') return savedPlan;
  }
  return "free";
}

export function getCurrentBilling(user) {
  if (user?.billing) return user.billing;
  if (typeof localStorage !== 'undefined') {
    const savedBilling = localStorage.getItem("lm_billing");
    if (savedBilling && savedBilling !== 'undefined') return savedBilling;
  }
  return "monthly";
}

export function setPlan(plan, billing = "monthly") {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem("lm_plan", plan);
    localStorage.setItem("lm_billing", billing);
  }
}

export function getPlanLimits(user) {
  const plan = getCurrentPlan(user);
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

// Returns list of allowed language codes for the user's plan
export function getAllowedLanguages(user) {
  const plan = getCurrentPlan(user);
  if (plan === "premium") return null; // null = all languages allowed
  if (plan === "pro") return PRO_LANGUAGES;
  return FREE_LANGUAGES;
}

// Returns true if the user can use the given language
export function isLanguageAllowed(user, langCode) {
  const allowed = getAllowedLanguages(user);
  if (allowed === null) return true;
  return allowed.includes(langCode);
}

// 根据用户当前订阅来源判断支付平台（不依赖设备类型）
export function getUserPaymentPlatform(user) {
  const source = user?.subscription_source;
  if (source === 'stripe') return 'stripe';
  if (source === 'revenuecat' || source === 'appstore' || source === 'googleplay') {
    if (source === 'revenuecat') {
      return isIOS() ? 'appstore' : 'googleplay';
    }
    return source;
  }
  // 没有活跃订阅，按设备平台决定
  return getPaymentPlatform();
}

// 检测支付平台
/* export function getPaymentPlatform(forceRefresh = false) {
  // 优先使用协议检测
  if (window.location && window.location.protocol === 'capacitor:') {
    console.log('⚠️ 协议检测到 capacitor://');
    if (isAndroid()) {
      console.log('⚠️ 返回 googleplay');
      return 'googleplay';
    }
    if (isIOS()) {
      console.log('⚠️ 返回 appstore');
      return 'appstore';
    }
  }
  
  const native = isNativeApp();
  console.log('⚠️ is native:', native);

  if (!native) {
    return 'stripe';
  }
  
  if (isIOS()) {
    return 'appstore';
  }
  
  if (isAndroid()) {
    return 'googleplay';
  }
  
  console.warn('⚠️ getPaymentPlatform: Unknown platform, defaulting to stripe');
  return 'stripe';
} */

  // 检测支付平台
export function getPaymentPlatform(forceRefresh = false) {
  // 🔴 临时强制：如果是 Android 环境，直接返回 googleplay
  if (typeof navigator !== 'undefined' && /Android/.test(navigator.userAgent)) {
    console.log('⚠️ 强制返回 googleplay (Android)');
    return 'googleplay';
  }
  
  // 原有逻辑...
  const native = isNativeApp();
  console.log('⚠️ is native:', native);

  if (!native) {
    return 'stripe';
  }
  
  if (isIOS()) {
    return 'appstore';
  }
  
  if (isAndroid()) {
    return 'googleplay';
  }
  
  console.warn('⚠️ getPaymentPlatform: Unknown platform, defaulting to stripe');
  return 'stripe';
}

// 检测是否应用内购买
export function isAppStorePayment() {
  return getPaymentPlatform() === 'appstore';
}

// 检测是否Google Play结算
export function isGooglePlayPayment() {
  return getPaymentPlatform() === 'googleplay';
}

// 获取RevenueCat产品包ID（用于购买）
export function getRevenueCatPackageId(plan, billing) {
  const packageIds = {
    pro: { monthly: 'pro_monthly', yearly: 'pro_yearly' },
    premium: { monthly: 'premium_monthly', yearly: 'premium_yearly' }
  };
  
  const packageId = packageIds[plan]?.[billing];
  
  console.log('getRevenueCatPackageId:', { plan, billing, packageId });
  
  return packageId;
}