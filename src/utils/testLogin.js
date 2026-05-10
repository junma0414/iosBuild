// @ts-nocheck
// src/utils/testLogin.js
// 登录问题诊断工具

import { isNativeApp, isIOS, isAndroid } from '../lib/planUtils';

export async function testLoginIssues() {
  console.log('=== 登录问题诊断 ===');
  
  const results = {
    platform: {},
    environment: {},
    googleSDK: {},
    api: {},
    errors: []
  };
  
  try {
    // 1. 平台检测
    const isMobile = isNativeApp();
    const ios = isIOS();
    const android = isAndroid();
    
    results.platform = {
      isMobile,
      ios,
      android,
      userAgent: navigator.userAgent
    };
    
    console.log('1. 平台检测:');
    console.log('- 是否移动端:', isMobile);
    console.log('- iOS:', ios);
    console.log('- Android:', android);
    console.log('- User Agent:', navigator.userAgent);
    
    // 2. 环境变量检查
    const apiUrl = import.meta.env.VITE_API_URL;
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const revenueCatKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
    
    results.environment = {
      apiUrl,
      googleClientId: googleClientId ? '已配置' : '未配置',
      revenueCatKey: revenueCatKey ? '已配置' : '未配置',
      isDevelopment: import.meta.env.DEV
    };
    
    console.log('\n2. 环境变量:');
    console.log('- API URL:', apiUrl);
    console.log('- Google Client ID:', googleClientId ? '已配置' : '未配置');
    console.log('- RevenueCat公钥:', revenueCatKey ? '已配置' : '未配置');
    console.log('- 开发环境:', import.meta.env.DEV);
    
    // 3. Google SDK检查
    results.googleSDK = {
      windowGoogle: !!window.google,
      windowGoogleAccounts: !!window.google?.accounts,
      windowGoogleAccountsId: !!window.google?.accounts?.id
    };
    
    console.log('\n3. Google SDK:');
    console.log('- window.google:', !!window.google);
    console.log('- window.google.accounts:', !!window.google?.accounts);
    console.log('- window.google.accounts.id:', !!window.google?.accounts?.id);
    
    if (!window.google && !isMobile) {
      console.log('⚠️ Web端缺少Google SDK，正在尝试加载...');
      
      // 尝试加载Google SDK
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log('✅ Google SDK加载成功');
          setTimeout(() => {
            console.log('- 加载后 window.google:', !!window.google);
            console.log('- 加载后 window.google.accounts.id:', !!window.google?.accounts?.id);
            resolve();
          }, 1000);
        };
        
        script.onerror = () => {
          console.log('❌ Google SDK加载失败');
          reject(new Error('Failed to load Google SDK'));
        };
        
        document.head.appendChild(script);
      });
    }
    
    // 4. API端点测试
    console.log('\n4. API端点测试:');
    
    // 测试后端是否可达 - 使用auth端点测试
    try {
      const testResponse = await fetch(`${apiUrl}/auth/login`, {
        method: 'OPTIONS'
      });
      results.api.health = {
        status: testResponse.status,
        ok: testResponse.ok,
        url: `${apiUrl}/auth/login`
      };
      console.log('- 后端连接测试:', testResponse.ok ? '✅ 正常' : `❌ 失败 (${testResponse.status})`);
    } catch (error) {
      results.api.health = {
        error: error.message,
        url: `${apiUrl}/auth/login`
      };
      console.log('- 后端连接测试: ❌ 错误:', error.message);
    }
    
    // 测试移动端Google登录端点
    if (isMobile) {
      try {
        const platform = ios ? 'ios' : 'android';
        const mobileInitUrl = `${apiUrl}/auth/google/mobile-init?platform=${platform}`;
        console.log('- 测试移动端Google登录端点:', mobileInitUrl);
        
        const response = await fetch(mobileInitUrl);
        const data = await response.json();
        
        results.api.googleMobileInit = {
          status: response.status,
          ok: response.ok,
          hasAuthUrl: !!data.authUrl,
          url: mobileInitUrl
        };
        
        console.log('- 移动端Google登录:', response.ok ? '✅ 正常' : `❌ 失败 (${response.status})`);
        if (data.authUrl) {
          console.log('- 获取到OAuth URL:', data.authUrl.substring(0, 50) + '...');
        }
      } catch (error) {
        results.api.googleMobileInit = {
          error: error.message
        };
        console.log('- 移动端Google登录: ❌ 错误:', error.message);
      }
    }
    
    // 5. 邮箱登录测试端点
    try {
      const testData = {
        email: 'test@example.com',
        password: 'testpassword123'
      };
      
      console.log('- 测试邮箱登录端点结构...');
      
      // 只测试端点是否存在，不实际登录
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results.api.loginEndpoint = {
        status: response.status,
        ok: response.ok,
        allowsPost: response.headers.get('allow')?.includes('POST'),
        url: `${apiUrl}/auth/login`
      };
      
      console.log('- 登录端点:', response.ok ? '✅ 存在' : `❌ 不存在 (${response.status})`);
      console.log('- 允许POST方法:', response.headers.get('allow')?.includes('POST') ? '✅ 是' : '❌ 否');
      
    } catch (error) {
      results.api.loginEndpoint = {
        error: error.message
      };
      console.log('- 登录端点测试: ❌ 错误:', error.message);
    }
    
    // 6. 检查CORS配置
    console.log('\n5. CORS检查:');
    console.log('- 当前域名:', window.location.origin);
    console.log('- API域名:', new URL(apiUrl).origin);
    
    if (window.location.origin !== new URL(apiUrl).origin) {
      console.log('⚠️ 跨域请求，需要CORS配置');
    }
    
    // 7. 检查localStorage
    console.log('\n6. localStorage检查:');
    console.log('- 支持localStorage:', typeof localStorage !== 'undefined');
    if (typeof localStorage !== 'undefined') {
      console.log('- accessToken:', localStorage.getItem('accessToken') ? '已设置' : '未设置');
      console.log('- refreshToken:', localStorage.getItem('refreshToken') ? '已设置' : '未设置');
    }
    
    // 8. 检查Capacitor（移动端）
    if (isMobile) {
      console.log('\n7. Capacitor检查:');
      console.log('- window.Capacitor:', !!window.Capacitor);
      console.log('- window.Capacitor.Plugins:', !!window.Capacitor?.Plugins);
      console.log('- window.Capacitor.Plugins.Browser:', !!window.Capacitor?.Plugins?.Browser);
    }
    
  } catch (error) {
    console.error('诊断过程中出错:', error);
    results.errors.push(error.message);
  }
  
  console.log('\n=== 诊断总结 ===');
  
  // 生成建议
  const suggestions = [];
  
  if (!results.environment.googleClientId && !results.platform.isMobile) {
    suggestions.push('Web端需要配置Google Client ID');
  }
  
  if (!results.api.health?.ok) {
    suggestions.push('后端服务可能未启动，请检查后端是否运行在端口3000');
  }
  
  if (results.platform.isMobile && !results.api.googleMobileInit?.ok) {
    suggestions.push('移动端Google登录端点可能未正确配置');
  }
  
  if (!results.googleSDK.windowGoogle && !results.platform.isMobile) {
    suggestions.push('Web端Google SDK未加载，可能需要手动刷新页面');
  }
  
  if (suggestions.length > 0) {
    console.log('\n⚠️ 建议修复的问题:');
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  } else {
    console.log('✅ 所有基础检查通过');
  }
  
  return results;
}

// 导出诊断函数
export default testLoginIssues;