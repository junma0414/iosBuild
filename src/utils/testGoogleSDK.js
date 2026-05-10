// app/src/utils/testGoogleSDK.js
// 测试Google SDK加载和功能的工具

export function testGoogleSDK() {
  console.log('=== Google SDK 测试开始 ===');
  
  const tests = [];
  
  // 测试1: window.google 是否存在
  tests.push({
    name: 'window.google 对象',
    test: () => {
      if (!window.google) {
        throw new Error('window.google 未定义');
      }
      return true;
    }
  });
  
  // 测试2: Google Accounts API
  tests.push({
    name: 'Google Accounts API',
    test: () => {
      if (!window.google.accounts) {
        throw new Error('Google Accounts API 未加载');
      }
      return true;
    }
  });
  
  // 测试3: Google Identity Services
  tests.push({
    name: 'Google Identity Services',
    test: () => {
      if (!window.google.accounts.id) {
        throw new Error('Google Identity Services 未加载');
      }
      return true;
    }
  });
  
  // 测试4: 初始化测试
  tests.push({
    name: 'SDK 初始化测试',
    test: () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('VITE_GOOGLE_CLIENT_ID 未配置');
      }
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: () => console.log('✅ 回调函数可设置'),
          auto_select: false
        });
        return true;
      } catch (error) {
        throw new Error(`初始化失败: ${error.message}`);
      }
    }
  });
  
  // 运行测试
  let allPassed = true;
  tests.forEach((test, index) => {
    try {
      const passed = test.test();
      console.log(`✅ 测试 ${index + 1}: ${test.name} - 通过`);
    } catch (error) {
      console.log(`❌ 测试 ${index + 1}: ${test.name} - 失败: ${error.message}`);
      allPassed = false;
    }
  });
  
  console.log(`\n=== 测试结果: ${allPassed ? '全部通过' : '有失败项'} ===`);
  
  if (!allPassed) {
    console.log('\n🔧 建议的修复步骤:');
    console.log('1. 检查网络连接，确保可以访问 https://accounts.google.com');
    console.log('2. 检查浏览器控制台是否有CSP错误');
    console.log('3. 尝试清除浏览器缓存并刷新页面');
    console.log('4. 检查是否有浏览器扩展程序阻止了Google SDK');
    console.log('5. 尝试使用隐身模式');
  }
  
  return allPassed;
}

// 手动加载Google SDK
export function loadGoogleSDKManually() {
  console.log('🔄 手动加载 Google SDK...');
  
  // 移除现有的Google SDK脚本
  const existingScripts = document.querySelectorAll('script[src*="accounts.google.com/gsi/client"]');
  existingScripts.forEach(script => script.remove());
  
  // 创建新的脚本
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.crossOrigin = 'anonymous';
  
  script.onload = () => {
    console.log('✅ Google SDK 手动加载成功');
    
    // 等待一段时间让SDK完全初始化
    setTimeout(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log('✅ Google Identity Services 已完全初始化');
      } else {
        console.log('⚠️ Google SDK 已加载但 Identity Services 未初始化');
      }
    }, 1000);
  };
  
  script.onerror = (error) => {
    console.error('❌ 手动加载 Google SDK 失败:', error);
  };
  
  document.head.appendChild(script);
}

// 测试Google登录流程
export async function testGoogleLoginFlow() {
  console.log('=== Google 登录流程测试 ===');
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('❌ VITE_GOOGLE_CLIENT_ID 未配置');
    return false;
  }
  
  console.log(`✅ Client ID: ${clientId.substring(0, 20)}...`);
  
  // 测试后端连接
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    console.log(`🔗 测试后端连接: ${apiUrl}/auth/google/mobile-init?platform=web`);
    
    const response = await fetch(`${apiUrl}/auth/google/mobile-init?platform=web`);
    if (!response.ok) {
      throw new Error(`后端返回错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ 后端连接正常，返回 authUrl`);
    console.log(`   Redirect URI: ${data.authUrl.includes('redirect_uri=') ? '包含' : '不包含'}`);
    
    // 检查redirect_uri
    const redirectUriMatch = data.authUrl.match(/redirect_uri=([^&]+)/);
    if (redirectUriMatch) {
      const redirectUri = decodeURIComponent(redirectUriMatch[1]);
      console.log(`   Redirect URI 值: ${redirectUri}`);
      
      // 检查是否是正确的Web重定向URI
      const expectedUri = 'http://localhost:5173/auth/google/callback';
      if (redirectUri !== expectedUri) {
        console.warn(`⚠️ 重定向URI不匹配:`);
        console.warn(`   期望: ${expectedUri}`);
        console.warn(`   实际: ${redirectUri}`);
      } else {
        console.log(`✅ 重定向URI正确`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ 后端连接测试失败: ${error.message}`);
    return false;
  }
}

// 生成手动测试链接
export function generateManualTestLink() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('❌ 无法生成测试链接: Client ID 未配置');
    return null;
  }
  
  const redirectUri = encodeURIComponent('http://localhost:5173/auth/google/callback');
  const scope = encodeURIComponent('email profile');
  const state = encodeURIComponent('manual_test_' + Date.now());
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=consent`;
  
  console.log('🔗 手动测试链接已生成:');
  console.log(authUrl);
  
  return authUrl;
}