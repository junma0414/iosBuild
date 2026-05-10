// @ts-nocheck
// src/pages/TestRevenueCat.jsx
// RevenueCat 测试页面

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { isNativeApp, isIOS, isAndroid, getPaymentPlatform } from '../lib/planUtils';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Smartphone,
  Globe,
  RefreshCw,
  ExternalLink,
  ShoppingCart,
  UserCheck,
  Package,
  CreditCard,
} from 'lucide-react';

export default function TestRevenueCat() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    isMobile,
    initialized,
    loading: revenueCatLoading,
    products,
    subscriptionStatus,
    purchaseProduct,
    restorePurchases,
    getManageSubscriptionsUrl,
    refreshProducts,
    refreshSubscriptionStatus,
  } = useRevenueCat();
  
  const paymentPlatform = getPaymentPlatform();
  const isWeb = paymentPlatform === 'stripe';
  const isIOSApp = isIOS() && isNativeApp();
  const isAndroidApp = isAndroid() && isNativeApp();
  
  const runTests = async () => {
    setLoading(true);
    setError(null);
    const results = [];
    
    try {
      // 测试1: 平台检测
      results.push({
        name: '平台检测',
        status: isMobile ? 'success' : 'info',
        message: isWeb ? 'Web环境 (使用Stripe)' : 
                 isIOSApp ? 'iOS应用' : 
                 isAndroidApp ? 'Android应用' : '未知平台',
      });
      
      // 测试2: RevenueCat初始化
      results.push({
        name: 'RevenueCat初始化',
        status: initialized ? 'success' : revenueCatLoading ? 'loading' : 'error',
        message: initialized ? '初始化成功' : 
                 revenueCatLoading ? '初始化中...' : '初始化失败',
      });
      
      // 测试3: 产品列表
      results.push({
        name: '产品列表',
        status: products.length > 0 ? 'success' : 'warning',
        message: `获取到 ${products.length} 个产品`,
        details: products.map(p => `${p.title} (${p.id})`),
      });
      
      // 测试4: 订阅状态
      results.push({
        name: '订阅状态',
        status: subscriptionStatus.hasActiveSubscription ? 'success' : 'info',
        message: subscriptionStatus.hasActiveSubscription 
          ? `活跃订阅: ${subscriptionStatus.plan}` 
          : '无活跃订阅',
      });
      
      // 测试5: 环境变量配置
      const publicKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
      const isKeyConfigured = publicKey && publicKey !== 'your_revenuecat_public_key';
      
      results.push({
        name: '环境变量配置',
        status: isKeyConfigured ? 'success' : 'error',
        message: isKeyConfigured ? '公钥已配置' : '公钥未配置或使用默认值',
      });
      
      // 测试6: 购买功能
      if (isMobile && initialized) {
        results.push({
          name: '购买功能',
          status: 'info',
          message: '购买功能就绪',
        });
      }
      
      // 测试7: 恢复购买功能
      if (isMobile && initialized) {
        results.push({
          name: '恢复购买功能',
          status: 'info',
          message: '恢复购买功能就绪',
        });
      }
      
    } catch (err) {
      setError(err.message);
      results.push({
        name: '测试执行',
        status: 'error',
        message: `测试执行失败: ${err.message}`,
      });
    } finally {
      setLoading(false);
      setTestResults(results);
    }
  };
  
  const handlePurchaseTest = async (productId) => {
    if (!isMobile || !initialized) {
      setError('RevenueCat未初始化或非移动端环境');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await purchaseProduct(productId);
      
      if (result.success) {
        setTestResults(prev => [...prev, {
          name: '测试购买',
          status: 'success',
          message: `购买成功: ${productId}`,
          details: `交易ID: ${result.transactionId}`,
        }]);
        
        // 刷新订阅状态
        await refreshSubscriptionStatus();
      } else {
        setTestResults(prev => [...prev, {
          name: '测试购买',
          status: 'error',
          message: `购买失败: ${result.error}`,
        }]);
      }
    } catch (err) {
      setError(err.message);
      setTestResults(prev => [...prev, {
        name: '测试购买',
        status: 'error',
        message: `购买错误: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestoreTest = async () => {
    if (!isMobile || !initialized) {
      setError('RevenueCat未初始化或非移动端环境');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        setTestResults(prev => [...prev, {
          name: '测试恢复购买',
          status: 'success',
          message: '恢复购买成功',
          details: result.message,
        }]);
        
        // 刷新订阅状态
        await refreshSubscriptionStatus();
      } else {
        setTestResults(prev => [...prev, {
          name: '测试恢复购买',
          status: 'warning',
          message: '恢复购买未找到有效记录',
          details: result.message,
        }]);
      }
    } catch (err) {
      setError(err.message);
      setTestResults(prev => [...prev, {
        name: '测试恢复购买',
        status: 'error',
        message: `恢复购买错误: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGetManageUrl = async () => {
    if (!isMobile || !initialized) {
      setError('RevenueCat未初始化或非移动端环境');
      return;
    }
    
    setLoading(true);
    
    try {
      const url = await getManageSubscriptionsUrl();
      
      if (url) {
        setTestResults(prev => [...prev, {
          name: '获取管理URL',
          status: 'success',
          message: '获取成功',
          details: url,
        }]);
        
        // 在新标签页打开
        window.open(url, '_blank');
      } else {
        setTestResults(prev => [...prev, {
          name: '获取管理URL',
          status: 'warning',
          message: '无法获取管理URL',
        }]);
      }
    } catch (err) {
      setTestResults(prev => [...prev, {
        name: '获取管理URL',
        status: 'error',
        message: `获取错误: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    runTests();
  }, [initialized, revenueCatLoading]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'loading': return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">RevenueCat 集成测试</h1>
          <p className="text-muted-foreground">测试移动端支付和订阅管理集成</p>
        </div>
        <Link to="/">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>
      
      {/* 平台信息 */}
      <Card className="p-6 border-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isWeb ? 'bg-blue-500/10' : 'bg-primary/10'
            }`}>
              {isWeb ? (
                <Globe className="w-6 h-6 text-blue-500" />
              ) : (
                <Smartphone className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {isWeb ? 'Web环境' : 
                 isIOSApp ? 'iOS应用' : 
                 isAndroidApp ? 'Android应用' : '未知平台'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isWeb ? 'outline' : 'default'}>
                  {isWeb ? '使用Stripe支付' : 
                   isIOSApp ? '使用App Store支付' : 
                   '使用Google Play支付'}
                </Badge>
                <Badge variant={initialized ? 'default' : 'secondary'}>
                  RevenueCat: {initialized ? '已初始化' : '未初始化'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            onClick={runTests}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            重新测试
          </Button>
        </div>
      </Card>
      
      {/* 错误显示 */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">错误</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 测试结果 */}
      <Card className="p-6 border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">测试结果</h3>
        
        <div className="space-y-4">
          {testResults.map((test, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl">
              <div className="flex-shrink-0">
                {getStatusIcon(test.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{test.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    test.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                    test.status === 'error' ? 'bg-destructive/10 text-destructive' :
                    test.status === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {test.status === 'success' ? '通过' :
                     test.status === 'error' ? '失败' :
                     test.status === 'warning' ? '警告' :
                     test.status === 'loading' ? '加载中' : '信息'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">{test.message}</p>
                
                {test.details && (
                  <div className="mt-2">
                    {Array.isArray(test.details) ? (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {test.details.map((detail, i) => (
                          <li key={i}>• {detail}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {test.details}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* 产品列表 */}
      {products.length > 0 && (
        <Card className="p-6 border-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">可用产品</h3>
            <Button
              onClick={refreshProducts}
              disabled={loading}
              size="sm"
              variant="ghost"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="p-4 border rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{product.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{product.packageType}</Badge>
                      <span className="text-sm font-medium">
                        {product.price} {product.currencyCode}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchaseTest(product.id)}
                    disabled={loading || !isMobile || !initialized}
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    测试购买
                  </Button>
                </div>
                
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>ID: {product.id}</p>
                  <p>产品ID: {product.product.identifier}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* 操作面板 */}
      <Card className="p-6 border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">功能测试</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleRestoreTest}
            disabled={loading || !isMobile || !initialized}
            className="w-full"
            variant="outline"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            测试恢复购买
          </Button>
          
          <Button
            onClick={handleGetManageUrl}
            disabled={loading || !isMobile || !initialized}
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            测试管理链接
          </Button>
          
          <Button
            onClick={refreshSubscriptionStatus}
            disabled={loading || !isMobile || !initialized}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新订阅状态
          </Button>
        </div>
      </Card>
      
      {/* 配置说明 */}
      <Card className="p-6 border-0 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">配置说明</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-xl">
            <h4 className="font-medium text-foreground mb-2">环境变量配置</h4>
            <p className="text-sm text-muted-foreground mb-3">
              请在 <code className="bg-background px-2 py-1 rounded">app/.env</code> 文件中配置：
            </p>
            <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`VITE_REVENUECAT_PUBLIC_KEY=your_public_sdk_key_here
VITE_REVENUECAT_APPLE_APP_ID=com.lingumate.app
VITE_REVENUECAT_GOOGLE_PACKAGE_NAME=com.lingumate.app`}
            </pre>
          </div>
          
          <div className="p-4 bg-muted rounded-xl">
            <h4 className="font-medium text-foreground mb-2">RevenueCat 设置</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>1. 登录 RevenueCat Dashboard</li>
              <li>2. 创建项目并获取 API 密钥</li>
              <li>3. 配置产品 (pro_monthly, pro_yearly 等)</li>
              <li>4. 配置权益 (pro, premium)</li>
              <li>5. 添加测试用户</li>
            </ul>
          </div>
          
          <div className="p-4 bg-muted rounded-xl">
            <h4 className="font-medium text-foreground mb-2">平台说明</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Web 环境</p>
                  <p className="text-sm text-muted-foreground">使用 Stripe 支付，无需 RevenueCat</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">移动端环境</p>
                  <p className="text-sm text-muted-foreground">使用 RevenueCat 管理应用内购买</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* 下一步操作 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/checkout" className="flex-1">
          <Button className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            测试支付页面
          </Button>
        </Link>
        
        <Link to="/membership" className="flex-1">
          <Button className="w-full" variant="outline">
            <Package className="w-4 h-4 mr-2" />
            测试订阅管理
          </Button>
        </Link>
      </div>
    </div>
  );
}