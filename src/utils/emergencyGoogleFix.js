// app/src/utils/emergencyGoogleFix.js
// 紧急修复 Google 登录问题的脚本

export async function emergencyGoogleFix() {
  console.log('=== 紧急 Google 登录修复开始 ===');
  
  const fixes = [];
  const results = [];
  
  // 修复 1: 清除所有 Google 相关缓存
  fixes.push('1. 清除 Google 相关缓存...');
  try {
    // 清除 localStorage 中的 Google 相关数据
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes('google')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`  已清除: ${key}`);
    });
    
    results.push(`✅ 清除 ${keysToRemove.length} 个 Google 相关缓存项`);
  } catch (error) {
    results.push(`❌ 清除缓存失败: ${error.message}`);
  }
  
  // 修复 2: 重新加载 Google SDK 脚本
  fixes.push('2. 强制重新加载 Google SDK...');
  try {
    // 移除所有现有的 Google SDK 脚本
    const scripts = document.getElementsByTagName('script');
    const googleScripts = [];
    
    for (let script of scripts) {
      if (script.src && script.src.includes('accounts.google.com/gsi/client')) {
        googleScripts.push(script);
      }
    }
    
    googleScripts.forEach(script => {
      script.remove();
      console.log(`  已移除脚本: ${script.src}`);
    });
    
    // 创建新的脚本
    const newScript = document.createElement('script');
    newScript.id = 'google-oauth-emergency-script';
    newScript.src = 'https://accounts.google.com/gsi/client';
    newScript.async = true;
    newScript.defer = true;
    newScript.crossOrigin = 'anonymous';
    
    newScript.onload = () => {
      console.log('✅ 紧急 Google SDK 加载成功');
      window.googleSDKEmergencyLoaded = true;
    };
    
    newScript.onerror = (error) => {
      console.error('❌ 紧急 Google SDK 加载失败:', error);
    };
    
    document.head.appendChild(newScript);
    results.push('✅ 已重新加载 Google SDK 脚本');
    
  } catch (error) {
    results.push(`❌ 重新加载 SDK 失败: ${error.message}`);
  }
  
  // 修复 3: 重置 Google 初始化状态
  fixes.push('3. 重置 Google 初始化状态...');
  try {
    // 清除全局 Google 相关变量
    delete window.googleLoginInitialized;
    delete window.googleSDKLoaded;
    delete window.googleSDKEmergencyLoaded;
    
    // 如果 window.google 存在但有问题，尝试修复
    if (window.google && window.google.accounts) {
      try {
        // 尝试调用一个简单的方法来验证
        window.google.accounts.id.cancel();
        results.push('✅ Google SDK 状态已重置');
      } catch (error) {
        console.warn('Google SDK 存在但可能有问题:', error);
        results.push('⚠️ Google SDK 存在但可能有问题');
      }
    } else {
      results.push('ℹ️ window.google 不存在，等待 SDK 加载');
    }
  } catch (error) {
    results.push(`❌ 重置状态失败: ${error.message}`);
  }
  
  // 修复 4: 测试环境配置
  fixes.push('4. 测试环境配置...');
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID 未配置');
    }
    
    if (!apiUrl) {
      throw new Error('VITE_API_URL 未配置');
    }
    
    // 验证 Client ID 格式
    if (!clientId.includes('.apps.googleusercontent.com')) {
      results.push('⚠️ Client ID 格式可能不正确');
    } else {
      results.push('✅ Client ID 格式正确');
    }
    
    results.push(`✅ 环境变量配置正常`);
    results.push(`   Client ID: ${clientId.substring(0, 20)}...`);
    results.push(`   API URL: ${apiUrl}`);
    
  } catch (error) {
    results.push(`❌ 环境配置错误: ${error.message}`);
  }
  
  // 修复 5: 测试后端连接
  fixes.push('5. 测试后端连接...');
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/auth/google/mobile-init?platform=web`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.authUrl) {
        results.push('✅ 后端 Google OAuth 配置正常');
        console.log(`   授权 URL: ${data.authUrl.substring(0, 80)}...`);
      } else {
        results.push('❌ 后端未返回有效的 authUrl');
      }
    } else {
      const errorText = await response.text();
      results.push(`❌ 后端错误: ${response.status} ${errorText}`);
    }
  } catch (error) {
    results.push(`❌ 无法连接到后端: ${error.message}`);
  }
  
  // 修复 6: 提供手动测试链接
  fixes.push('6. 生成手动测试链接...');
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId) {
      const redirectUri = encodeURIComponent('http://localhost:5173/auth/google/callback');
      const scope = encodeURIComponent('email profile');
      const state = encodeURIComponent('emergency_fix_' + Date.now());
      
      const manualAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scope}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      results.push('✅ 手动测试链接已生成');
      console.log('\n📋 手动测试链接:');
      console.log(manualAuthUrl);
      console.log('\n📋 复制此链接到浏览器地址栏测试 Google 登录');
    }
  } catch (error) {
    results.push(`❌ 生成测试链接失败: ${error.message}`);
  }
  
  // 输出结果
  console.log('\n=== 修复结果 ===');
  fixes.forEach((fix, index) => {
    console.log(`\n${fix}`);
    console.log(`  ${results[index]}`);
  });
  
  // 等待 Google SDK 加载
  console.log('\n⏳ 等待 Google SDK 加载（5秒）...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 检查最终状态
  console.log('\n=== 最终状态检查 ===');
  if (window.google && window.google.accounts && window.google.accounts.id) {
    console.log('✅ Google SDK 已完全加载');
    console.log('✅ 可以尝试 Google 登录');
  } else {
    console.log('❌ Google SDK 仍未加载');
    console.log('⚠️ 可能需要检查网络连接或浏览器设置');
  }
  
  return {
    fixes,
    results,
    googleSDKLoaded: !!(window.google && window.google.accounts && window.google.accounts.id)
  };
}

// 快速修复函数
export function quickGoogleFix() {
  console.log('=== Google 登录快速修复 ===');
  
  // 1. 清除可能的缓存问题
  try {
    // 清除特定的 Google 相关项目
    const items = ['g_state', 'g_csrf_token', 'google_login_state'];
    items.forEach(item => {
      if (localStorage.getItem(item)) {
        localStorage.removeItem(item);
        console.log(`✅ 已清除: ${item}`);
      }
    });
  } catch (error) {
    console.log('⚠️ 清除缓存时出错:', error);
  }
  
  // 2. 重新加载页面（最彻底的修复）
  console.log('\n🔄 建议刷新页面以应用修复');
  console.log('   按 F5 或 Ctrl+R 刷新页面');
  
  // 3. 如果刷新后问题仍然存在
  console.log('\n📋 如果问题仍然存在:');
  console.log('   1. 尝试使用隐身模式');
  console.log('   2. 清除浏览器缓存和 Cookie');
  console.log('   3. 暂时禁用广告拦截器');
  console.log('   4. 检查 Google Cloud Console 配置');
  
  return {
    message: '快速修复已完成，建议刷新页面',
    needsRefresh: true
  };
}

// 测试 Google SDK 的简单方法
export function testGoogleSDKSimple() {
  console.log('=== Google SDK 简单测试 ===');
  
  const tests = [
    { name: 'window.google', test: () => !!window.google },
    { name: 'window.google.accounts', test: () => !!(window.google && window.google.accounts) },
    { name: 'window.google.accounts.id', test: () => !!(window.google && window.google.accounts && window.google.accounts.id) },
    { name: 'Client ID 配置', test: () => !!import.meta.env.VITE_GOOGLE_CLIENT_ID },
    { name: '当前页面协议', test: () => window.location.protocol === 'http:' || window.location.protocol === 'https:' }
  ];
  
  tests.forEach(testItem => {
    try {
      const passed = testItem.test();
      console.log(`${passed ? '✅' : '❌'} ${testItem.name}: ${passed ? '通过' : '失败'}`);
    } catch (error) {
      console.log(`❌ ${testItem.name}: 测试出错 - ${error.message}`);
    }
  });
  
  // 额外信息
  console.log(`\n📋 额外信息:`);
  console.log(`   当前 URL: ${window.location.href}`);
  console.log(`   Client ID: ${import.meta.env.VITE_GOOGLE_CLIENT_ID ? '已配置' : '未配置'}`);
  console.log(`   用户代理: ${navigator.userAgent.substring(0, 80)}...`);
  
  return tests.map(t => ({ 
    name: t.name, 
    passed: t.test() 
  }));
}