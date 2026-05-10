// @ts-nocheck
// src/services/revenueCatService.js
// RevenueCat service - Mobile only, Web continues to use Stripe

import { isNativeApp, isIOS, isAndroid } from '../lib/planUtils';

class RevenueCatService {
  constructor() {
    this.purchases = null;
    this.initialized = false;
    this.initializing = false;
    this.platform = null;
    this.initPromise = null;
    this.maxRetries = 3;
    this.cachedProducts = null;
    this.initCompleted = false;
  }

  // Get API Key for current platform
  getApiKey() {
    if (isIOS()) {
      return import.meta.env.VITE_REVENUECAT_PUBLIC_KEY_IOS;
    }
    if (isAndroid()) {
      return import.meta.env.VITE_REVENUECAT_PUBLIC_KEY_ANDROID;
    }
    return import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
  }

  // Wait for BillingClient to be ready (Android only)
  async waitForBillingClientReady(maxWaitMs = 8000) {
    const startTime = Date.now();
    let lastError = null;

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const customerInfo = await this.purchases.getCustomerInfo();
        if (customerInfo !== null) {
          console.log('💰 BillingClient is ready');
          return true;
        }
      } catch (error) {
        lastError = error;
        console.log(`💰 BillingClient not ready yet, waiting... (${Date.now() - startTime}ms)`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.warn('💰 BillingClient not ready after waiting:', lastError);
    return false;
  }

  // Initialize RevenueCat (with retry mechanism)
  async initialize(retryCount = 0) {
    // Not native app, skip
    if (!isNativeApp()) {
      console.log('RevenueCat: Web environment, using Stripe');
      return;
    }

    // Already initialized
    if (this.initialized && this.initCompleted) {
      console.log('💰 RevenueCat already initialized');
      return;
    }

    // Currently initializing, wait for it to complete
    if (this.initializing) {
      console.log('💰 RevenueCat initialization in progress, waiting...');
      let waitCount = 0;
      while (!this.initCompleted && waitCount < 30) {
        await new Promise(resolve => setTimeout(resolve, 200));
        waitCount++;
      }
      return;
    }

    // Prevent multiple concurrent initializations
    if (this.initPromise) {
      console.log('💰 RevenueCat initialization already in progress, waiting...');
      return this.initPromise;
    }

    this.initializing = true;
    this.initPromise = (async () => {
      try {
        const publicKey = this.getApiKey();
        
        if (!publicKey || publicKey === 'your_revenuecat_public_key') {
          console.warn('RevenueCat public key not configured, skipping initialization');
          this.initializing = false;
          this.initPromise = null;
          return;
        }

        if (isIOS()) {
          this.platform = 'ios';
        } else if (isAndroid()) {
          this.platform = 'android';
        } else {
          console.warn('RevenueCat: Unknown platform');
          this.initializing = false;
          this.initPromise = null;
          return;
        }

        const { Purchases } = await import('@revenuecat/purchases-capacitor');
        this.purchases = Purchases;
        
        console.log(`💰 RevenueCat configuring with apiKey: ${publicKey.substring(0, 10)}... for platform: ${this.platform}`);
        
        await this.purchases.configure({
          apiKey: publicKey,
          appUserID: null,
          observerMode: false,
        });
        
        console.log(`💰 RevenueCat configure completed for ${this.platform}`);
        
        // Wait for BillingClient to be ready (Android only)
        if (isAndroid()) {
          const isReady = await this.waitForBillingClientReady(10000);
          
          if (!isReady) {
            if (retryCount < this.maxRetries) {
              console.log(`💰 BillingClient not ready, retrying initialization (${retryCount + 1}/${this.maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 3000));
              this.initializing = false;
              this.initPromise = null;
              return this.initialize(retryCount + 1);
            } else {
              console.warn('💰 BillingClient not ready after all retries, continuing anyway');
            }
          }
        }
        
        // Verify connection with getCustomerInfo
        try {
          const customerInfo = await this.purchases.getCustomerInfo();
          console.log('💰 getCustomerInfo result:', customerInfo ? 'has data' : 'null (new user)');
        } catch (verifyError) {
          console.warn('💰 getCustomerInfo verification failed:', verifyError);
          // Don't throw, continue anyway
        }
        
        console.log(`💰 RevenueCat ${this.platform.toUpperCase()} SDK initialized successfully`);
        this.initialized = true;
        this.initCompleted = true;

        // Sync existing purchases
        try {
          await this.purchases.syncPurchases();
          console.log('💰 RevenueCat syncPurchases completed');
        } catch (syncErr) {
          console.warn('💰 RevenueCat syncPurchases failed (non-fatal):', syncErr);
        }
      } catch (error) {
        console.error('RevenueCat initialization failed:', error);
        
        if (retryCount < this.maxRetries) {
          console.log(`💰 Retrying initialization after error (${retryCount + 1}/${this.maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          this.initializing = false;
          this.initPromise = null;
          return this.initialize(retryCount + 1);
        }
      } finally {
        this.initializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  // Ensure RevenueCat is ready before operations
  async ensureReady(maxWaitMs = 10000) {
    if (!isNativeApp()) {
      return false;
    }

    if (this.initialized && this.initCompleted) {
      return true;
    }

    // Wait for initialization to complete
    const startTime = Date.now();
    while (!this.initCompleted && (Date.now() - startTime) < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return this.initCompleted;
  }

  // Get products list
  async getProducts(forceRefresh = false) {
    if (!isNativeApp()) {
      return [];
    }

    // Ensure RevenueCat is ready
    await this.ensureReady();

    if (!this.initialized) {
      console.warn('💰 RevenueCat not initialized, returning empty products');
      return [];
    }

    // Use cache if available
    if (this.cachedProducts && !forceRefresh) {
      console.log('💰 RevenueCat returning cached products');
      return this.cachedProducts;
    }

    try {
      const offerings = await this.purchases.getOfferings();
      console.log('💰 RevenueCat offerings fetched');
      
      if (offerings.current) {
        const packages = offerings.current.availablePackages;
        console.log(`💰 RevenueCat current offering has ${packages.length} packages`);
        
        this.cachedProducts = packages.map(pkg => ({
          id: pkg.identifier,
          packageObject: pkg,
          product: pkg.product,
          packageType: pkg.packageType,
          price: pkg.product.price,
          currencyCode: pkg.product.currencyCode,
          title: pkg.product.title,
          description: pkg.product.description,
        }));
        
        return this.cachedProducts;
      }
      
      return [];
    } catch (error) {
      console.error('💰 RevenueCat failed to get products:', error);
      return [];
    }
  }

  // Purchase product
  async purchaseProduct(packageIdOrObject) {
    if (!isNativeApp()) {
      throw new Error('RevenueCat only available in mobile environment');
    }

    // Ensure RevenueCat is ready
    await this.ensureReady(15000);

    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      let targetPackage;

      // If package object is passed directly, use it
      if (typeof packageIdOrObject === 'object' && packageIdOrObject.identifier) {
        targetPackage = packageIdOrObject;
      } else {
        // Get offerings and find the target package by identifier
        const offerings = await this.purchases.getOfferings();
        const currentOffering = offerings.current;
        
        if (!currentOffering) {
          throw new Error('No current offering found');
        }
        
        targetPackage = currentOffering.availablePackages.find(
          pkg => pkg.identifier === packageIdOrObject
        );
        
        if (!targetPackage) {
          throw new Error(`Package ${packageIdOrObject} not found in offerings`);
        }
      }
      
      console.log(`💰 Purchasing package: ${targetPackage.identifier}`);
      
      // Purchase using the Package object
      const result = await this.purchases.purchasePackage({
        aPackage: targetPackage,
      });
      
      // Clear cache after purchase to refresh status
      this.cachedProducts = null;
      
      // Check if purchase was successful
      const activeSubscriptions = result.customerInfo.activeSubscriptions || [];
      const purchasedProductId = targetPackage.product?.identifier;
      
      const isSubscribed = activeSubscriptions.some(sub => 
        sub === purchasedProductId || 
        (purchasedProductId && sub.includes(purchasedProductId.split(':')[0]))
      );
      
      if (isSubscribed) {
        return {
          success: true,
          customerInfo: result.customerInfo,
          transactionId: result.transactionIdentifier,
        };
      } else {
        return {
          success: false,
          error: 'Purchase not completed or user cancelled',
        };
      }
    } catch (error) {
      console.error('Purchase product failed:', error);
      
      // Handle user cancellation gracefully
      if (error.message?.includes('cancel') || error.code === '1') {
        return {
          success: false,
          error: 'User cancelled the purchase',
          cancelled: true,
        };
      }
      
      throw error;
    }
  }

  // Restore purchases
  async restorePurchases() {
    if (!isNativeApp() || !this.initialized) {
      throw new Error('RevenueCat not initialized or not in mobile environment');
    }

    try {
      const customerInfo = await this.purchases.restorePurchases();
      
      if (customerInfo.activeSubscriptions?.length > 0) {
        return {
          success: true,
          customerInfo,
          message: 'Purchases restored successfully',
        };
      } else {
        return {
          success: false,
          message: 'No valid purchase records found',
        };
      }
    } catch (error) {
      console.error('Restore purchases failed:', error);
      throw error;
    }
  }

  // Get current user info
  async getCustomerInfo() {
    if (!isNativeApp() || !this.initialized) {
      return null;
    }

    try {
      return await this.purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Set user ID for backend association
  async setAppUserId(userId) {
    if (!isNativeApp() || !this.initialized) {
      return;
    }

    try {
      await this.purchases.logIn({ appUserID: userId });
      console.log('RevenueCat user ID set successfully:', userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  // Check user subscription status
  async checkSubscriptionStatus() {
    if (!isNativeApp() || !this.initialized) {
      return { hasActiveSubscription: false, plan: 'free' };
    }

    try {
      const customerInfo = await this.getCustomerInfo();
      
      if (!customerInfo) {
        return { hasActiveSubscription: false, plan: 'free' };
      }

      const activeProducts = customerInfo.activeSubscriptions || [];
      
      if (activeProducts.length > 0) {
        let plan = 'free';
        
        for (const productId of activeProducts) {
          if (productId.includes('premium')) {
            plan = 'premium';
            break;
          } else if (productId.includes('pro')) {
            plan = 'pro';
          }
        }
        
        return {
          hasActiveSubscription: true,
          plan,
          activeProducts,
          customerInfo,
        };
      }
      
      return { hasActiveSubscription: false, plan: 'free' };
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return { hasActiveSubscription: false, plan: 'free' };
    }
  }

  // Get subscription management URL
  async getManageSubscriptionsUrl() {
    if (!isNativeApp() || !this.initialized) {
      return null;
    }

    try {
      return await this.purchases.getManageSubscriptionUrl();
    } catch (error) {
      console.error('Failed to get subscription management URL:', error);
      return null;
    }
  }
}

// Create singleton instance
const revenueCatService = new RevenueCatService();

export default revenueCatService;