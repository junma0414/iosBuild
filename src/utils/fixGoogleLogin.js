// @ts-nocheck
// src/utils/fixGoogleLogin.js
// Google登录快速修复工具

/**
 * 诊断和修复Google登录问题
 */
export async function diagnoseAndFixGoogleLogin() {
  console.log('=== Google登录问题诊断 ===');
  
  const diagnostics = {
    sdk: {},
    config: {},
    network: {},
    suggestions: []
  };
  
  try {
    // 1. 检查Google SDK
    diagnostics.sdk = {
      windowGoogle: !!window.google,
      windowGoogleAccounts: !!window.google?.accounts,
      windowGoogleAccountsId: !!window.google?.accounts?.id,
      googleLoginInitialized: !!window.googleLoginInitialized
    };
    
    console.log('1. Google SDK状态:');
    console.log('- window.google:', diagnostics.sdk.windowGoogle);
    console.log('- window.google.accounts:', diagnostics.sdk.windowGoogleAccounts);
    console.log('- window.google.accounts.id:', diagnostics.sdk.windowGoogleAccountsId);
    
    // 2. 检查配置
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    diagnostics.config = {
      clientId: clientId ? '已配置' : '未配置',
      clientIdLength: clientId?.length || 0,
      currentOrigin: window.location.origin,
      isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    };
    
    console.log('\n2. 配置检查:');
    console.log('- Google Client ID:', diagnostics.config.clientId);
    console.log('- 当前域名:', diagnostics.config.currentOrigin);
    console.log('- 是否本地环境:', diagnostics.config.isLocalhost);
    
    // 3. 网络检查
    try {
      const testUrl = `https://accounts.google.com/gsi/status?client_id=${clientId || 'test'}`;
      console.log('\n3. 网络检查:');
      console.log('- 测试URL:', testUrl);
      
      // 注意：这个端点可能返回403，但我们可以检查错误类型
      const response = await fetch(testUrl, { mode: 'no-cors' });
      diagnostics.network.status = '测试完成';
    } catch (error) {
      diagnostics.network.error = error.message;
      console.log('- 网络测试错误:', error.message);
    }
    
    // 4. 生成建议
    if (!diagnostics.sdk.windowGoogle) {
      diagnostics.suggestions.push('Google SDK未加载，尝试手动加载');
    }
    
    if (!diagnostics.config.clientId) {
      diagnostics.suggestions.push('Google Client ID未配置，检查.env文件');
    }
    
    if (!diagnostics.config.isLocalhost && diagnostics.config.currentOrigin.includes('localhost')) {
      diagnostics.suggestions.push('使用IP地址而非localhost可能解决授权问题');
    }
    
    // 5. 执行修复
    console.log('\n4. 执行修复:');
    
    if (!diagnostics.sdk.windowGoogle) {
      console.log('- 尝试加载Google SDK...');
      await loadGoogleSDK();
    }
    
    if (diagnostics.suggestions.length > 0) {
      console.log('\n5. 建议修复:');
      diagnostics.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('✅ 未发现明显问题');
    }
    
    return diagnostics;
    
  } catch (error) {
    console.error('诊断过程中出错:', error);
    return { error: error.message };
  }
}

/**
 * 手动加载Google SDK
 */
export function loadGoogleSDK() {
  return new Promise((resolve, reject) => {
    const scriptId = 'google-oauth-script-fix';
    
    // 移除已存在的脚本
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google SDK加载成功');
      // 等待SDK完全初始化
      setTimeout(() => {
        console.log('加载后检查:');
        console.log('- window.google:', !!window.google);
        console.log('- window.google.accounts.id:', !!window.google?.accounts?.id);
        resolve();
      }, 1000);
    };
    
    script.onerror = (error) => {
      console.error('❌ Google SDK加载失败:', error);
      reject(new Error('Failed to load Google SDK'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * 创建备用Google登录URL
 */
export function createFallbackGoogleLoginUrl() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Google Client ID not configured');
  }
  
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
  const scope = encodeURIComponent('email profile');
  const state = encodeURIComponent(`fallback_${Date.now()}`);
  
  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `state=${state}&` +
    `access_type=offline&` +
    `prompt=select_account`;
}

/**
 * 测试Google登录功能
 */
export async function testGoogleLogin() {
  console.log('=== Google登录功能测试 ===');
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.log('❌ Google Client ID未配置');
    return false;
  }
  
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    console.log('⚠️ Google SDK未加载，尝试加载...');
    try {
      await loadGoogleSDK();
    } catch (error) {
      console.log('❌ Google SDK加载失败:', error.message);
      return false;
    }
  }
  
  // 测试初始化
  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        console.log('✅ Google登录回调测试成功');
        console.log('响应类型:', response ? '有响应' : '无响应');
      },
      auto_select: false,
    });
    
    console.log('✅ Google SDK初始化成功');
    return true;
  } catch (error) {
    console.log('❌ Google SDK初始化失败:', error.message);
    return false;
  }
}

/**
 * 紧急修复：如果Google登录失败，提供替代方案
 */
export function setupEmergencyGoogleLogin() {
  console.log('设置紧急Google登录方案...');
  
  // 添加备用登录按钮
  const loginPage = document.querySelector('button[onclick*="Google"]')?.closest('form')?.parentElement;
  
  if (loginPage && !document.getElementById('emergency-google-login')) {
    const emergencyButton = document.createElement('button');
    emergencyButton.id = 'emergency-google-login';
    emergencyButton.type = 'button';
    emergencyButton.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg style="width: 18px; height: 18px;" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>使用备用Google登录</span>
      </div>
    `;
    emergencyButton.style.cssText = `
      width: 100%;
      padding: 12px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      color: #333;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: background 0.2s;
    `;
    emergencyButton.onmouseover = () => {
      emergencyButton.style.background = '#f8f8f8';
    };
    emergencyButton.onmouseout = () => {
      emergencyButton.style.background = 'white';
    };
    emergencyButton.onclick = () => {
      const url = createFallbackGoogleLoginUrl();
      window.location.href = url;
    };
    
    loginPage.appendChild(emergencyButton);
    console.log('✅ 紧急登录按钮已添加');
  }
}

// 导出所有函数
export default {
  diagnoseAndFixGoogleLogin,
  loadGoogleSDK,
  createFallbackGoogleLoginUrl,
  testGoogleLogin,
  setupEmergencyGoogleLogin
};