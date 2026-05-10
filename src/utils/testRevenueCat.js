// @ts-nocheck
// src/utils/testRevenueCat.js
// RevenueCat 集成测试工具

import revenueCatService from '../services/revenueCatService';
import { isNativeApp, isIOS, isAndroid } from '../lib/planUtils';

export async function testRevenueCatIntegration() {
  console.log('=== RevenueCat 集成测试 ===');
  
  const isMobile = isNativeApp();
  const ios = isIOS();
  const android = isAndroid();
  
  console.log('平台检测:');
  console.log('- 是否移动端:', isMobile);
  console.log('- iOS:', ios);
  console.log('- Android:', android);
  
  if (!isMobile) {
    console.log('⚠️ 非移动端环境，跳过RevenueCat测试');
    console.log('Web端应使用Stripe支付');
    return { success: true, message: 'Web环境，使用Stripe' };
  }
  
  console.log('\n1. 初始化RevenueCat...');
  try {
    await revenueCatService.initialize();
    
    if (!revenueCatService.initialized) {
      console.log('❌ RevenueCat初始化失败');
      return { success: false, error: '初始化失败' };
    }
    
    console.log('✅ RevenueCat初始化成功');
  } catch (error) {
    console.log('❌ RevenueCat初始化错误:', error.message);
    return { success: false, error: error.message };
  }
  
  console.log('\n2. 获取产品列表...');
  try {
    const products = await revenueCatService.getProducts();
    console.log(`✅ 获取到 ${products.length} 个产品`);
    
    if (products.length > 0) {
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.title} - ${product.price} ${product.currencyCode}`);
        console.log(`      ID: ${product.id}, 类型: ${product.packageType}`);
      });
    } else {
      console.log('⚠️ 未获取到产品，请检查RevenueCat配置');
    }
  } catch (error) {
    console.log('❌ 获取产品列表错误:', error.message);
  }
  
  console.log('\n3. 检查订阅状态...');
  try {
    const status = await revenueCatService.checkSubscriptionStatus();
    console.log('✅ 订阅状态检查完成');
    console.log('- 是否有活跃订阅:', status.hasActiveSubscription);
    console.log('- 当前计划:', status.plan);
    
    if (status.hasActiveSubscription && status.entitlement) {
      console.log('- 权益信息:', JSON.stringify(status.entitlement, null, 2));
    }
  } catch (error) {
    console.log('❌ 检查订阅状态错误:', error.message);
  }
  
  console.log('\n4. 获取订阅管理URL...');
  try {
    const manageUrl = await revenueCatService.getManageSubscriptionsUrl();
    if (manageUrl) {
      console.log('✅ 订阅管理URL:', manageUrl);
    } else {
      console.log('⚠️ 无法获取订阅管理URL');
    }
  } catch (error) {
    console.log('❌ 获取订阅管理URL错误:', error.message);
  }
  
  console.log('\n5. 获取用户信息...');
  try {
    const customerInfo = await revenueCatService.getCustomerInfo();
    if (customerInfo) {
      console.log('✅ 用户信息获取成功');
      console.log('- 原始App User ID:', customerInfo.originalAppUserId);
      console.log('- 首次购买时间:', customerInfo.firstSeen);
      console.log('- 最近购买时间:', customerInfo.latestPurchaseTime);
    } else {
      console.log('⚠️ 无法获取用户信息');
    }
  } catch (error) {
    console.log('❌ 获取用户信息错误:', error.message);
  }
  
  console.log('\n=== 测试总结 ===');
  console.log('平台:', ios ? 'iOS' : android ? 'Android' : '未知');
  console.log('RevenueCat状态:', revenueCatService.initialized ? '已初始化' : '未初始化');
  console.log('环境变量配置:', import.meta.env.VITE_REVENUECAT_PUBLIC_KEY ? '已配置' : '未配置');
  
  if (!import.meta.env.VITE_REVENUECAT_PUBLIC_KEY || 
      import.meta.env.VITE_REVENUECAT_PUBLIC_KEY === 'your_revenuecat_public_key') {
    console.log('\n⚠️ 警告: RevenueCat公钥未配置或使用默认值');
    console.log('请在 .env 文件中配置正确的公钥:');
    console.log('VITE_REVENUECAT_PUBLIC_KEY=your_actual_public_key');
  }
  
  return { 
    success: revenueCatService.initialized,
    platform: ios ? 'ios' : android ? 'android' : 'unknown',
    initialized: revenueCatService.initialized,
    message: '测试完成' 
  };
}

// 导出测试函数
export default testRevenueCatIntegration;