// @ts-nocheck
// src/hooks/useRevenueCat.js
// RevenueCat Hook - 仅在移动端有效

import { useState, useEffect, useCallback } from 'react';
import revenueCatService from '../services/revenueCatService';
import { isNativeApp } from '../lib/planUtils';

export function useRevenueCat() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    hasActiveSubscription: false,
    plan: 'free',
  });
  const [error, setError] = useState(null);
  
  const [isMobile, setIsMobile] = useState(isNativeApp());

  // 初始化RevenueCat
  const initialize = useCallback(async () => {
    const mobile = isNativeApp();
    setIsMobile(mobile);
    if (!mobile) {
      setInitialized(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await revenueCatService.initialize();
      if (revenueCatService.initialized) {
        setInitialized(true);
      }
      
      // 初始化后获取产品列表
      const productList = await revenueCatService.getProducts();
      setProducts(productList);
      
      // 检查订阅状态
      const status = await revenueCatService.checkSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('RevenueCat初始化失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 购买产品
  const purchaseProduct = useCallback(async (productId) => {
    if (!isNativeApp() || !initialized) {
      throw new Error('RevenueCat未初始化或非移动端环境');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await revenueCatService.purchaseProduct(productId);
      
      if (result.success) {
        // 更新订阅状态
        const status = await revenueCatService.checkSubscriptionStatus();
        setSubscriptionStatus(status);
      }
      
      return result;
    } catch (err) {
      console.error('购买失败:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isMobile, initialized]);

  // 恢复购买
  const restorePurchases = useCallback(async () => {
    if (!isNativeApp() || !initialized) {
      throw new Error('RevenueCat未初始化或非移动端环境');
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await revenueCatService.restorePurchases();
      
      if (result.success) {
        const status = await revenueCatService.checkSubscriptionStatus();
        setSubscriptionStatus(status);
      }
      
      return result;
    } catch (err) {
      console.error('恢复购买失败:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // 设置用户ID
  const setAppUserId = useCallback(async (userId) => {
    if (!isNativeApp() || !initialized) {
      return;
    }

    try {
      await revenueCatService.setAppUserId(userId);
    } catch (err) {
      console.error('设置用户ID失败:', err);
    }
  }, [initialized]);

  // 获取订阅管理URL
  const getManageSubscriptionsUrl = useCallback(async () => {
    if (!isNativeApp() || !initialized) {
      return null;
    }

    try {
      return await revenueCatService.getManageSubscriptionsUrl();
    } catch (err) {
      console.error('获取订阅管理URL失败:', err);
      return null;
    }
  }, [initialized]);

  // 刷新产品列表
  const refreshProducts = useCallback(async () => {
    if (!isNativeApp() || !initialized) {
      return;
    }

    setLoading(true);
    
    try {
      const productList = await revenueCatService.getProducts();
      setProducts(productList);
    } catch (err) {
      console.error('刷新产品列表失败:', err);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // 刷新订阅状态
  const refreshSubscriptionStatus = useCallback(async () => {
    if (!isNativeApp() || !initialized) {
      return;
    }

    setLoading(true);
    
    try {
      const status = await revenueCatService.checkSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      console.error('刷新订阅状态失败:', err);
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // 组件挂载时初始化
  useEffect(() => {
    if (isMobile) {
      initialize();
    } else {
      const retry = setTimeout(() => {
        if (isNativeApp()) {
          initialize();
        } else {
          setInitialized(true);
        }
      }, 1500);
      return () => clearTimeout(retry);
    }
  }, [initialize, isMobile]);

  return {
    // 状态
    isMobile,
    initialized,
    loading,
    products,
    subscriptionStatus,
    error,
    
    // 方法
    initialize,
    purchaseProduct,
    restorePurchases,
    setAppUserId,
    getManageSubscriptionsUrl,
    refreshProducts,
    refreshSubscriptionStatus,
    
    // 便捷方法
    hasActiveSubscription: subscriptionStatus.hasActiveSubscription,
    currentPlan: subscriptionStatus.plan,
  };
}