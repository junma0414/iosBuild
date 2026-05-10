// @ts-nocheck
// src/components/subscription/SubscriptionManager.jsx
// 统一的订阅管理组件 - 支持Web（Stripe）和移动端（RevenueCat）

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRevenueCat } from '../../hooks/useRevenueCat';
import { isNativeApp, isIOS, isAndroid, getPaymentPlatform } from '../../lib/planUtils';
import { base44 } from '../../api/base44Client';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Calendar,
  CreditCard,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function SubscriptionManager({ user, subscriptionInfo, onRefresh }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  
  // RevenueCat Hook
  const {
    isMobile,
    initialized: revenueCatInitialized,
    loading: revenueCatLoading,
    subscriptionStatus,
    getManageSubscriptionsUrl,
    restorePurchases,
    refreshSubscriptionStatus,
  } = useRevenueCat();
  
  const paymentPlatform = getPaymentPlatform();
  const isWeb = paymentPlatform === 'stripe';
  const isIOSApp = isIOS() && isNativeApp();
  const isAndroidApp = isAndroid() && isNativeApp();
  
  // 获取订阅管理URL
  const [manageUrl, setManageUrl] = useState(null);
  
  useEffect(() => {
    const fetchManageUrl = async () => {
      if (isMobile && revenueCatInitialized) {
        const url = await getManageSubscriptionsUrl();
        setManageUrl(url);
      }
    };
    
    fetchManageUrl();
  }, [isMobile, revenueCatInitialized, getManageSubscriptionsUrl]);
  
  // 恢复购买（移动端）
  const handleRestorePurchases = async () => {
    if (!isMobile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        setSuccess('购买已成功恢复！');
        
        // 刷新订阅状态
        await refreshSubscriptionStatus();
        
        // 通知父组件刷新
        if (onRefresh) {
          onRefresh();
        }
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('未找到有效的购买记录');
      }
    } catch (err) {
      console.error('恢复购买失败:', err);
      setError(err.message || '恢复购买失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 打开订阅管理页面
  const handleManageSubscription = async () => {
    if (isWeb) {
      // Web端：打开Stripe客户门户
      try {
        setLoading(true);
        const response = await base44.functions.invoke('createCustomerPortal', {});
        
        if (response?.data?.url) {
          window.open(response.data.url, '_blank');
        } else {
          setError('无法创建客户门户，请联系客服');
        }
      } catch (err) {
        console.error('打开客户门户失败:', err);
        setError('打开客户门户失败');
      } finally {
        setLoading(false);
      }
    } else if (isMobile && manageUrl) {
      // 移动端：打开RevenueCat订阅管理页面
      window.open(manageUrl, '_blank');
    } else if (isMobile) {
      // 移动端但无法获取URL，显示提示
      setError('无法获取订阅管理链接，请稍后重试');
    }
  };
  
  // 取消订阅（Web端）
  const handleCancelSubscription = async () => {
    if (!isWeb) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('cancelSubscription', {});
      
      if (response?.data?.success) {
        setSuccess('订阅已取消，将在当前计费周期结束时生效');
        setShowCancelDialog(false);
        
        // 刷新订阅信息
        if (onRefresh) {
          onRefresh();
        }
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('取消订阅失败，请联系客服');
      }
    } catch (err) {
      console.error('取消订阅失败:', err);
      setError('取消订阅失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 重新激活订阅（Web端）
  const handleReactivateSubscription = async () => {
    if (!isWeb) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('reactivateSubscription', {});
      
      if (response?.data?.success) {
        setSuccess('订阅已重新激活！');
        setShowReactivateDialog(false);
        
        // 刷新订阅信息
        if (onRefresh) {
          onRefresh();
        }
        
        // 3秒后清除成功消息
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('重新激活订阅失败，请联系客服');
      }
    } catch (err) {
      console.error('重新激活订阅失败:', err);
      setError('重新激活订阅失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };
  
  // 计算剩余天数
  const getRemainingDays = () => {
    if (isWeb && subscriptionInfo?.subscription?.current_period_end) {
      const periodEndDate = subscriptionInfo.subscription.current_period_end;
      const now = Math.floor(Date.now() / 1000);
      const daysLeft = Math.ceil((periodEndDate - now) / (24 * 60 * 60));
      return Math.max(0, daysLeft);
    }
    return null;
  };
  
  // 获取订阅状态
  const getSubscriptionStatus = () => {
    if (isWeb) {
      if (!subscriptionInfo) return 'unknown';
      
      const status = subscriptionInfo.subscription?.status;
      const cancelAtPeriodEnd = subscriptionInfo.subscription?.cancel_at_period_end;
      
      if (status === 'active' && !cancelAtPeriodEnd) {
        return 'active';
      } else if (status === 'active' && cancelAtPeriodEnd) {
        return 'canceling';
      } else if (status === 'canceled' || status === 'unpaid') {
        return 'canceled';
      } else {
        return 'unknown';
      }
    } else if (isMobile) {
      return subscriptionStatus.hasActiveSubscription ? 'active' : 'inactive';
    }
    
    return 'unknown';
  };
  
  const status = getSubscriptionStatus();
  const remainingDays = getRemainingDays();
  
  return (
    <div className="space-y-6">
      {/* 平台标识 */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isWeb ? 'bg-blue-500/10' : 'bg-primary/10'
            }`}>
              {isWeb ? (
                <Globe className="w-5 h-5 text-blue-500" />
              ) : isIOSApp ? (
                <Smartphone className="w-5 h-5 text-primary" />
              ) : (
                <Smartphone className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isWeb ? 'Web订阅 (Stripe)' : 
                 isIOSApp ? 'iOS订阅 (App Store)' : 
                 'Android订阅 (Google Play)'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isWeb ? '通过Stripe管理订阅' : 
                 isIOSApp ? '通过App Store管理订阅' : 
                 '通过Google Play管理订阅'}
              </p>
            </div>
          </div>
          
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? '活跃' : 
             status === 'canceling' ? '即将到期' : 
             status === 'canceled' ? '已取消' : '未知'}
          </Badge>
        </div>
      </Card>
      
      {/* 错误和成功消息 */}
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-500/10 text-emerald-600 text-sm px-4 py-3 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {/* 订阅详情 */}
      <Card className="p-6 border-0 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-foreground">订阅详情</h3>
        
        {isWeb && subscriptionInfo && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">当前计划</span>
              <span className="font-medium">{subscriptionInfo.plan || '免费版'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">计费周期</span>
              <span className="font-medium">
                {subscriptionInfo.billing === 'yearly' ? '年付' : '月付'}
              </span>
            </div>
            
            {subscriptionInfo.subscription?.current_period_start && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">当前周期开始</span>
                <span className="font-medium">
                  {formatDate(subscriptionInfo.subscription.current_period_start)}
                </span>
              </div>
            )}
            
            {subscriptionInfo.subscription?.current_period_end && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">当前周期结束</span>
                <span className="font-medium">
                  {formatDate(subscriptionInfo.subscription.current_period_end)}
                </span>
              </div>
            )}
            
            {remainingDays !== null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">剩余天数</span>
                <span className="font-medium text-primary">{remainingDays} 天</span>
              </div>
            )}
          </div>
        )}
        
        {isMobile && subscriptionStatus.hasActiveSubscription && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">当前计划</span>
              <span className="font-medium capitalize">{subscriptionStatus.plan}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">订阅状态</span>
              <span className="font-medium text-primary">活跃</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">管理平台</span>
              <span className="font-medium">
                {isIOSApp ? 'App Store' : 'Google Play'}
              </span>
            </div>
          </div>
        )}
        
        {(!subscriptionInfo && !subscriptionStatus.hasActiveSubscription) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暂无活跃订阅</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/subscription')}
            >
              查看订阅计划
            </Button>
          </div>
        )}
      </Card>
      
      {/* 操作按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 管理订阅按钮 */}
        {(status === 'active' || status === 'canceling') && (
          <Button
            onClick={handleManageSubscription}
            disabled={loading || revenueCatLoading}
            className="w-full"
            variant="outline"
          >
            {(loading || revenueCatLoading) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            {isWeb ? '管理订阅 (Stripe门户)' : 
             isIOSApp ? '管理订阅 (App Store)' : 
             '管理订阅 (Google Play)'}
          </Button>
        )}
        
        {/* 恢复购买按钮 (移动端) */}
        {isMobile && !subscriptionStatus.hasActiveSubscription && (
          <Button
            onClick={handleRestorePurchases}
            disabled={loading || revenueCatLoading}
            className="w-full"
            variant="outline"
          >
            {(loading || revenueCatLoading) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            恢复购买
          </Button>
        )}
        
        {/* 取消订阅按钮 (Web端) */}
        {isWeb && status === 'active' && (
          <Button
            onClick={() => setShowCancelDialog(true)}
            disabled={loading}
            className="w-full"
            variant="destructive"
          >
            取消订阅
          </Button>
        )}
        
        {/* 重新激活按钮 (Web端) */}
        {isWeb && status === 'canceling' && (
          <Button
            onClick={() => setShowReactivateDialog(true)}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            重新激活订阅
          </Button>
        )}
        
        {/* 刷新按钮 */}
        <Button
          onClick={onRefresh}
          disabled={loading || revenueCatLoading}
          className="w-full"
          variant="ghost"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新状态
        </Button>
      </div>
      
      {/* 取消订阅确认对话框 (Web端) */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认取消订阅</AlertDialogTitle>
            <AlertDialogDescription>
              取消后，您仍然可以享受订阅权益直到当前计费周期结束 ({remainingDays} 天后)。
              之后将自动降级到免费版。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              确认取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 重新激活确认对话框 (Web端) */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重新激活订阅</AlertDialogTitle>
            <AlertDialogDescription>
              重新激活后，您的订阅将继续按原计划计费。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReactivateSubscription}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              确认重新激活
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* 平台说明 */}
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>所有支付都通过安全加密连接处理</span>
        </div>
        
        {isWeb && (
          <div className="flex items-start gap-2">
            <CreditCard className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Web订阅通过Stripe处理，支持Visa、MasterCard、American Express等</span>
          </div>
        )}
        
        {isMobile && (
          <div className="flex items-start gap-2">
            <Smartphone className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {isIOSApp 
                ? 'iOS订阅通过App Store处理，可在iPhone/iPad的"设置"中管理' 
                : 'Android订阅通过Google Play处理，可在Play Store中管理'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}