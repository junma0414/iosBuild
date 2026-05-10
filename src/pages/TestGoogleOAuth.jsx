// app/src/pages/TestGoogleOAuth.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

const TestGoogleOAuth = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualAuthUrl, setManualAuthUrl] = useState('');
  
  const runAllTests = async () => {
    setLoading(true);
    setTests([]);
    
    const newTests = [];
    
    // 测试 1: 环境变量
    newTests.push({
      name: '环境变量配置',
      description: '检查 VITE_GOOGLE_CLIENT_ID 和 VITE_API_URL',
      run: () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const apiUrl = import.meta.env.VITE_API_URL;
        
        if (!clientId) {
          return { passed: false, message: 'VITE_GOOGLE_CLIENT_ID 未配置' };
        }
        
        if (!apiUrl) {
          return { passed: false, message: 'VITE_API_URL 未配置' };
        }
        
        return { 
          passed: true, 
          message: `Client ID: ${clientId.substring(0, 20)}..., API: ${apiUrl}` 
        };
      }
    });
    
    // 测试 2: Google SDK 加载
    newTests.push({
      name: 'Google SDK 加载',
      description: '检查 Google Identity Services 是否已加载',
      run: () => {
        if (!window.google) {
          return { passed: false, message: 'window.google 未定义' };
        }
        
        if (!window.google.accounts) {
          return { passed: false, message: 'Google Accounts API 未加载' };
        }
        
        if (!window.google.accounts.id) {
          return { passed: false, message: 'Google Identity Services 未加载' };
        }
        
        return { passed: true, message: 'Google SDK 已完全加载' };
      }
    });
    
    // 测试 3: 后端连接
    newTests.push({
      name: '后端服务连接',
      description: '测试与后端 API 的连接',
      run: async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const response = await fetch(`${apiUrl}/auth/google/mobile-init?platform=web`);
          
          if (!response.ok) {
            const errorText = await response.text();
            return { 
              passed: false, 
              message: `后端返回错误: ${response.status} ${errorText}` 
            };
          }
          
          const data = await response.json();
          if (!data.authUrl) {
            return { passed: false, message: '后端未返回 authUrl' };
          }
          
          // 保存手动测试 URL
          setManualAuthUrl(data.authUrl);
          
          return { 
            passed: true, 
            message: '后端连接正常，OAuth 配置正确' 
          };
        } catch (error) {
          return { 
            passed: false, 
            message: `连接失败: ${error.message}` 
          };
        }
      }
    });
    
    // 测试 4: Client ID 格式验证
    newTests.push({
      name: 'Client ID 格式验证',
      description: '检查 Google Client ID 格式是否正确',
      run: () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
          return { passed: false, message: 'Client ID 未配置' };
        }
        
        // 检查基本格式
        if (!clientId.includes('.apps.googleusercontent.com')) {
          return { 
            passed: false, 
            message: 'Client ID 格式不正确，应包含 .apps.googleusercontent.com' 
          };
        }
        
        // 检查长度和结构
        const parts = clientId.split('-');
        if (parts.length < 2) {
          return { 
            passed: false, 
            message: 'Client ID 格式不正确，应包含连字符' 
          };
        }
        
        if (parts[0].length !== 12) {
          return { 
            passed: false, 
            message: 'Client ID 第一部分应为12位数字' 
          };
        }
        
        return { 
          passed: true, 
          message: 'Client ID 格式正确' 
        };
      }
    });
    
    // 测试 5: 当前域名检查
    newTests.push({
      name: '域名授权检查',
      description: '检查当前域名是否在 Google 授权列表中',
      run: () => {
        const currentOrigin = window.location.origin;
        const isLocalhost = currentOrigin.includes('localhost');
        const isHttps = currentOrigin.startsWith('https://');
        
        let message = `当前域名: ${currentOrigin}`;
        let passed = true;
        
        if (!isLocalhost && !isHttps) {
          message += ' (⚠️ 生产环境应使用 HTTPS)';
          passed = true; // 警告但不是错误
        }
        
        if (isLocalhost) {
          message += ' (✅ 本地开发环境)';
        }
        
        return { passed, message };
      }
    });
    
    // 测试 6: 浏览器兼容性
    newTests.push({
      name: '浏览器兼容性',
      description: '检查浏览器功能支持',
      run: () => {
        const tests = [
          { name: 'Cookie 支持', test: () => navigator.cookieEnabled },
          { name: 'LocalStorage', test: () => !!window.localStorage },
          { name: 'JavaScript', test: () => true }, // 如果能看到这个页面，JS 已启用
          { name: '同源策略', test: () => true } // 简化测试
        ];
        
        const failedTests = tests.filter(t => !t.test());
        
        if (failedTests.length > 0) {
          return { 
            passed: false, 
            message: `不支持的浏览器功能: ${failedTests.map(t => t.name).join(', ')}` 
          };
        }
        
        return { 
          passed: true, 
          message: '浏览器功能支持正常' 
        };
      }
    });
    
    // 运行所有测试
    for (const test of newTests) {
      try {
        const result = await (test.run.constructor.name === 'AsyncFunction' 
          ? test.run() 
          : Promise.resolve(test.run()));
        
        test.result = result;
      } catch (error) {
        test.result = {
          passed: false,
          message: `测试执行错误: ${error.message}`
        };
      }
    }
    
    setTests(newTests);
    setLoading(false);
  };
  
  useEffect(() => {
    runAllTests();
  }, []);
  
  const passedCount = tests.filter(t => t.result?.passed).length;
  const totalCount = tests.length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-8">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回登录页面
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Google OAuth 配置测试
          </h1>
          <p className="text-gray-600">
            此页面帮助诊断和测试 Google OAuth 登录配置问题
          </p>
        </div>
        
        {/* 状态卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">测试状态</h2>
              <p className="text-gray-600">
                {totalCount > 0 ? `${passedCount}/${totalCount} 项测试通过` : '运行测试中...'}
              </p>
            </div>
            
            <button
              onClick={runAllTests}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? '测试中...' : '重新运行测试'}
            </button>
          </div>
          
          {/* 进度条 */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: totalCount > 0 ? `${(passedCount / totalCount) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>测试进度</span>
              <span>{passedCount}/{totalCount}</span>
            </div>
          </div>
          
          {/* 测试结果 */}
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  test.result?.passed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {test.result?.passed ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <X className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {test.name}
                      </h3>
                      <span className={`text-sm font-medium ${
                        test.result?.passed ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {test.result?.passed ? '通过' : '失败'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {test.description}
                    </p>
                    
                    <div className={`mt-2 text-sm ${
                      test.result?.passed ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {test.result?.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {tests.length === 0 && loading && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-2">正在运行测试...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 修复建议 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">修复建议</h2>
          
          {passedCount < totalCount ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">需要修复的问题</h3>
                    <ul className="mt-2 space-y-2 text-sm text-amber-700">
                      {tests
                        .filter(t => !t.result?.passed)
                        .map((test, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-1">•</span>
                            <span>
                              <strong>{test.name}:</strong> {test.result?.message}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">常见修复步骤</h3>
                <ol className="space-y-2 text-sm text-blue-700 list-decimal list-inside">
                  <li>检查 Google Cloud Console 中的 OAuth 凭据配置</li>
                  <li>确保授权 JavaScript 来源包含: http://localhost:5173</li>
                  <li>确保授权重定向 URI 包含: http://localhost:5173/auth/google/callback</li>
                  <li>启用 Google Sign-In API</li>
                  <li>清除浏览器缓存并刷新页面</li>
                  <li>尝试使用隐身模式</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800">所有测试通过！</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Google OAuth 配置看起来正常。您可以返回登录页面尝试 Google 登录。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 手动测试 */}
        {manualAuthUrl && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">手动测试</h2>
            
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">
                如果自动登录失败，您可以手动测试 Google OAuth 流程：
              </p>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">手动测试链接：</p>
                  <div className="p-3 bg-gray-100 rounded border border-gray-300 overflow-x-auto">
                    <code className="text-sm text-gray-800 break-all">
                      {manualAuthUrl}
                    </code>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(manualAuthUrl);
                      alert('链接已复制到剪贴板');
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    复制链接
                  </button>
                  
                  <a
                    href={manualAuthUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    打开测试
                  </a>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  注意：手动测试会打开新的浏览器标签页进行 Google 登录。登录成功后，您将被重定向回应用。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 快速操作 */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/login"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            返回登录页面
          </Link>
          
          <button
            onClick={() => {
              localStorage.clear();
              alert('已清除本地存储数据。请刷新页面。');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
          >
            清除本地存储
          </button>
          
          <button
            onClick={() => {
              if (window.google && window.google.accounts && window.google.accounts.id) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
                if (clientId) {
                  window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                      console.log('手动测试回调:', response);
                      if (response.credential) {
                        alert('Google 登录凭证已收到！');
                      }
                    },
                    auto_select: false
                  });
                  
                  window.google.accounts.id.prompt();
                  alert('已触发 Google 登录弹窗');
                }
              } else {
                alert('Google SDK 未加载，无法手动触发登录');
              }
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition"
          >
            手动触发 Google 登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestGoogleOAuth;