// Base44 SDK 兼容层
// 用于逐步迁移到新的API系统

import { 
  authAPI, 
  conversationAPI, 
  essayAPI, 
  listeningExerciseAPI,
  qaExerciseAPI,
  badgeAPI,
  userAPI,
  aiAPI,
  stripeAPI 
} from './client.js';

// 模拟Base44 SDK结构
export const base44 = {
  auth: {
    me: () => authAPI.me(),
    logout: () => authAPI.logout(),
    updateMe: (data) => userAPI.updateProfile(data),
    redirectToLogin: (returnUrl) => {
      window.location.href = returnUrl || '/';
    }
  },
  
  entities: {
    Conversation: {
      list: (sort = '-created_date', limit = 100) => 
        conversationAPI.list(sort.replace('created_date', 'created_at'), limit),
      create: (data) => conversationAPI.create(data),
      update: (id, data) => conversationAPI.update(id, data),
      filter: (filters, sort = '-created_date', limit = 100) => 
        conversationAPI.filter(filters, sort.replace('created_date', 'created_at'), limit)
    },
    
    Essay: {
      list: (sort = '-created_date', limit = 100) => 
        essayAPI.list(sort.replace('created_date', 'created_at'), limit),
      create: (data) => essayAPI.create(data),
      update: (id, data) => essayAPI.update(id, data),
      filter: (filters, sort = '-created_date', limit = 100) => 
        essayAPI.filter(filters, sort.replace('created_date', 'created_at'), limit)
    },
    
    ListeningExercise: {
      list: (sort = '-created_date', limit = 100) => 
        listeningExerciseAPI.list(sort.replace('created_date', 'created_at'), limit),
      create: (data) => listeningExerciseAPI.create(data),
      update: (id, data) => listeningExerciseAPI.update(id, data),
      filter: (filters, sort = '-created_date', limit = 100) => 
        listeningExerciseAPI.filter(filters, sort.replace('created_date', 'created_at'), limit)
    },
    
    QAExercise: {
      list: (sort = '-created_date', limit = 100) => 
        qaExerciseAPI.list(sort.replace('created_date', 'created_at'), limit),
      create: (data) => qaExerciseAPI.create(data),
      update: (id, data) => qaExerciseAPI.update(id, data),
      filter: (filters, sort = '-created_date', limit = 100) => 
        qaExerciseAPI.filter(filters, sort.replace('created_date', 'created_at'), limit)
    },
    
    Badge: {
      list: (sort = '-created_date', limit = 100) => 
        badgeAPI.list(sort.replace('created_date', 'created_at'), limit),
      create: (data) => badgeAPI.create(data)
    },
    
    User: {
      updatePlan: (plan, billing) => userAPI.updatePlan(plan, billing)
    }
  },
  
  functions: {
    invoke: (functionName, data) => {
      switch (functionName) {
        case 'aiChat':
          console.log('aiChat called with data:', data);
          const aiData = {
            messages: [{ role: 'user', content: data.prompt || '' }],
            targetLanguage: data.targetLanguage || 'en'
          };
          console.log('Sending to aiAPI.chat:', aiData);
          return aiAPI.chat(aiData).then(response => ({
            data: { result: response.result }
          }));
          
        case 'stripeCheckout':
          console.log('stripeCheckout called with data:', data);
          return stripeAPI.createCheckoutSession(data).then(response => {
            console.log('stripeAPI.createCheckoutSession response:', response);
            if (response && response.error) {
              throw new Error(response.error);
            }
            return {
              data: response
            };
          });
        
        case 'getSubscription':
          console.log('getSubscription called');
          return stripeAPI.getSubscription().then(response => ({
            data: response
          }));
          
        case 'reactivateSubscription':
          console.log('reactivateSubscription called');
          return stripeAPI.reactivateSubscription().then(response => ({
            data: response
          }));
          
        case 'cancelSubscription':
          console.log('cancelSubscription called');
          return stripeAPI.cancelSubscription()
            .then(response => {
              console.log('cancelSubscription response:', response);
              return { data: response };
            })
            .catch(error => {
              console.error('cancelSubscription error:', error);
              // 如果是 "No active subscription found" 错误，返回成功（用户已经是免费用户）
              if (error.message && error.message.includes('No active subscription')) {
                return { data: { alreadyFree: true, message: 'No active subscription found' } };
              }
              throw error;
            });
          
        case 'googleLogin':
          console.log('googleLogin called with data:', data);
          return authAPI.googleLogin(data).then(response => ({
            data: response
          }));
          
        default:
          throw new Error(`Function ${functionName} not implemented in compatibility layer`);
      }
    }
  }
};