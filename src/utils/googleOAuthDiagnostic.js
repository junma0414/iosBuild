// app/src/utils/googleOAuthDiagnostic.js
export async function diagnoseGoogleOAuthIssues() {
  console.log('=== Google OAuth 诊断开始 ===');
  
  const issues = [];
  const warnings = [];
  const successes = [];
  
  // 1. 检查环境变量
  console.log('1. 检查环境变量...');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!clientId) {
    issues.push('❌ VITE_GOOGLE_CLIENT_ID 未配置');
  } else {
    successes.push(`✅ VITE_GOOGLE_CLIENT_ID: ${clientId.substring(0, 20)}...`);
  }
  
  if (!apiUrl) {
    issues.push('❌ VITE_API_URL 未配置');
  } else {
    successes.push(`✅ VITE_API_URL: ${apiUrl}`);
  }
  
  // 2. 检查 Google SDK 加载状态
  console.log('2. 检查 Google SDK 状态...');
  if (!window.google) {
    issues.push('❌ Google SDK 未加载 (window.google 不存在)');
  } else {
    successes.push('✅ Google SDK 已加载');
    
    if (!window.google.accounts) {
      issues.push('❌ Google Accounts API 未加载');
    } else {
      successes.push('✅ Google Accounts API 已加载');
      
      if (!window.google.accounts.id) {
        issues.push('❌ Google Identity Services 未加载');
      } else {
        successes.push('✅ Google Identity Services 已加载');
      }
    }
  }
  
  // 3. 检查当前 URL 是否在授权域名中
  console.log('3. 检查当前域名授权...');
  const currentUrl = window.location.href;
  const currentOrigin = window.location.origin;
  
  console.log(`当前 URL: ${currentUrl}`);
  console.log(`当前 Origin: ${currentOrigin}`);
  
  // 检查是否是 localhost 或有效的 HTTPS 域名
  if (!currentOrigin.includes('localhost') && !currentOrigin.startsWith('https://')) {
    warnings.push('⚠️ 当前不是 HTTPS 连接，Google OAuth 可能要求 HTTPS');
  }
  
  // 4. 测试后端 Google OAuth 配置
  console.log('4. 测试后端配置...');
  try {
    const response = await fetch(`${apiUrl}/auth/google/mobile-init?platform=web`);
    if (response.ok) {
      const data = await response.json();
      if (data.authUrl) {
        successes.push('✅ 后端 Google OAuth 配置正常');
      } else {
        issues.push('❌ 后端未返回有效的 authUrl');
      }
    } else {
      const errorText = await response.text();
      issues.push(`❌ 后端 Google OAuth 配置错误: ${response.status} ${errorText}`);
    }
  } catch (error) {
    issues.push(`❌ 无法连接到后端: ${error.message}`);
  }
  
  // 5. 检查 Google Client ID 格式
  console.log('5. 检查 Client ID 格式...');
  if (clientId) {
    // Google Client ID 通常以数字开头，包含 .apps.googleusercontent.com
    if (!clientId.includes('.apps.googleusercontent.com')) {
      warnings.push('⚠️ Client ID 格式可能不正确，应包含 .apps.googleusercontent.com');
    }
    
    // 检查是否是 Web 类型的 Client ID
    if (clientId.includes('-')) {
      const parts = clientId.split('-');
      if (parts.length > 0) {
        const firstPart = parts[0];
        if (firstPart.length === 12) {
          successes.push('✅ Client ID 格式看起来正确 (12位数字开头)');
        }
      }
    }
  }
  
  // 6. 检查浏览器控制台错误
  console.log('6. 检查浏览器控制台...');
  // 注意：我们无法直接读取控制台，但可以提示用户
  
  // 7. 提供修复建议
  console.log('7. 生成修复建议...');
  const recommendations = [];
  
  if (issues.length > 0) {
    recommendations.push('需要修复的问题:');
    issues.forEach(issue => recommendations.push(`  - ${issue}`));
  }
  
  if (warnings.length > 0) {
    recommendations.push('警告:');
    warnings.forEach(warning => recommendations.push(`  - ${warning}`));
  }
  
  if (successes.length > 0) {
    recommendations.push('正常的功能:');
    successes.forEach(success => recommendations.push(`  - ${success}`));
  }
  
  // 特定修复建议
  if (issues.includes('❌ Google SDK 未加载 (window.google 不存在)')) {
    recommendations.push('\n修复 Google SDK 加载问题:');
    recommendations.push('  1. 检查网络连接，确保可以访问 https://accounts.google.com');
    recommendations.push('  2. 检查浏览器是否阻止了第三方脚本');
    recommendations.push('  3. 尝试清除浏览器缓存并刷新页面');
    recommendations.push('  4. 检查是否有浏览器扩展程序阻止了 Google SDK');
  }
  
  if (issues.includes('❌ 无法连接到后端')) {
    recommendations.push('\n修复后端连接问题:');
    recommendations.push('  1. 确保后端服务器正在运行 (端口 3000)');
    recommendations.push('  2. 检查 VITE_API_URL 配置是否正确');
    recommendations.push('  3. 检查后端 CORS 配置');
  }
  
  // Google Cloud Console 配置检查
  recommendations.push('\nGoogle Cloud Console 配置检查:');
  recommendations.push('  1. 访问 https://console.cloud.google.com/');
  recommendations.push('  2. 选择正确的项目');
  recommendations.push('  3. 进入 "API和服务" > "凭据"');
  recommendations.push('  4. 检查 OAuth 2.0 客户端 ID 配置:');
  recommendations.push('     - 授权 JavaScript 来源: http://localhost:5173');
  recommendations.push('     - 授权重定向 URI: http://localhost:5173/auth/google/callback');
  recommendations.push('  5. 确保 "Google Sign-In" API 已启用');
  
  // 输出结果
  console.log('\n=== 诊断结果 ===');
  console.log(`问题: ${issues.length} 个`);
  console.log(`警告: ${warnings.length} 个`);
  console.log(`正常: ${successes.length} 个`);
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ 所有检查通过！Google OAuth 应该正常工作。');
  } else {
    console.log('\n=== 详细报告 ===');
    recommendations.forEach(rec => console.log(rec));
  }
  
  return {
    issues,
    warnings,
    successes,
    recommendations
  };
}

// 快速测试函数
export async function quickGoogleSDKTest() {
  console.log('=== Google SDK 快速测试 ===');
  
  const tests = [];
  
  // 测试 1: window.google 是否存在
  tests.push({
    name: 'Google SDK 全局对象',
    passed: !!window.google,
    message: window.google ? '✅ window.google 存在' : '❌ window.google 不存在'
  });
  
  // 测试 2: Google Accounts API
  tests.push({
    name: 'Google Accounts API',
    passed: !!(window.google && window.google.accounts),
    message: window.google?.accounts ? '✅ Google Accounts API 已加载' : '❌ Google Accounts API 未加载'
  });
  
  // 测试 3: Google Identity Services
  tests.push({
    name: 'Google Identity Services',
    passed: !!(window.google && window.google.accounts && window.google.accounts.id),
    message: window.google?.accounts?.id ? '✅ Google Identity Services 已加载' : '❌ Google Identity Services 未加载'
  });
  
  // 测试 4: Client ID 配置
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  tests.push({
    name: 'Google Client ID 配置',
    passed: !!clientId,
    message: clientId ? `✅ Client ID 已配置 (${clientId.substring(0, 15)}...)` : '❌ Client ID 未配置'
  });
  
  // 测试 5: 当前域名
  const currentOrigin = window.location.origin;
  tests.push({
    name: '当前域名',
    passed: true, // 总是通过，只是信息
    message: `ℹ️ 当前域名: ${currentOrigin}`
  });
  
  // 输出结果
  console.log('\n测试结果:');
  tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.message}`);
  });
  
  const passedCount = tests.filter(t => t.passed).length;
  const totalCount = tests.length;
  
  console.log(`\n总结: ${passedCount}/${totalCount} 项测试通过`);
  
  if (passedCount === totalCount) {
    console.log('✅ 所有基本测试通过！Google SDK 配置正常。');
  } else {
    console.log('⚠️ 有些测试未通过，请检查上面的错误信息。');
  }
  
  return tests;
}