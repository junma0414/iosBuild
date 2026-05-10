// @ts-nocheck
// app/src/services/googleLoginService.js
import { base44 } from '../api/base44Client';

// Web 环境的 Google 登录
export const webGoogleLogin = () => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      reject(new Error('Google Client ID not configured'));
      return;
    }
    
    if (!window.google) {
      reject(new Error('Google SDK not loaded'));
      return;
    }
    
    // 使用 One Tap 或弹出窗口
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        console.log('Google response:', response);
        if (response.credential) {
          try {
            const result = await base44.functions.invoke('googleLogin', { 
              idToken: response.credential 
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('No credential received'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    
    // 弹出登录窗口
    window.google.accounts.id.prompt();
  });
};

// 渲染 Google 按钮
export const renderGoogleButton = (elementId, onSuccess, onError) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error('Google Client ID not configured');
    return;
  }
  
  const checkGoogle = setInterval(() => {
    if (window.google) {
      clearInterval(checkGoogle);
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          console.log('Google button response:', response);
          if (response.credential) {
            try {
              const result = await base44.functions.invoke('googleLogin', { 
                idToken: response.credential 
              });
              if (onSuccess) onSuccess(result);
            } catch (error) {
              if (onError) onError(error);
            }
          } else {
            if (onError) onError(new Error('No credential received'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      const buttonElement = document.getElementById(elementId);
      if (buttonElement) {
        window.google.accounts.id.renderButton(
          buttonElement,
          { theme: 'outline', size: 'large', width: '100%' }
        );
      }
    }
  }, 100);
};

// 统一的 Google 登录入口
export const googleLogin = async () => {
  return webGoogleLogin();
};