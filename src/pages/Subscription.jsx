// Subscription.jsx
// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from '../lib/LanguageContext';
import { useAuth } from '../lib/AuthContext';
import { getCurrentPlan, getCurrentBilling, isNativeApp, isIOS, isAndroid, getUserPaymentPlatform } from '../lib/planUtils';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, Crown, Zap, Star, X, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const PLAN_FEATURE_KEYS = {
  free: ["planFeatureFree1", "planFeatureFree2", "planFeatureFree3", "planFeatureFree4"],
  freeExcluded: ["planFeaturePro5", "planFeaturePro6", "planFeaturePro7", "planFeaturePremium8"],
  pro: ["planFeaturePro1", "planFeaturePro2", "planFeaturePro3", "planFeaturePro4", "planFeaturePro5", "planFeaturePro6", "planFeaturePro7"],
  proExcluded: ["planFeaturePremium8"],
  premium: ["planFeaturePremium1", "planFeaturePremium2", "planFeaturePremium3", "planFeaturePremium4", "planFeaturePremium5", "planFeaturePremium6", "planFeaturePremium7", "planFeaturePremium8"],
};

const planIcons = { free: Zap, pro: Star, premium: Crown };
const planColors = { free: "from-slate-400 to-slate-500", pro: "from-primary to-violet-600", premium: "from-accent to-amber-600" };

export default function Subscription() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billing, setBilling] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [pendingBilling, setPendingBilling] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [prorationInfo, setProrationInfo] = useState(null);

  const currentPlan = user?.plan || "free";
  const currentBilling = user?.billing || "monthly";
  
  const nativeApp = isNativeApp();
  const ios = isIOS();
  const android = isAndroid();

  const prices = {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 9.9, yearly: 79 },
    premium: { monthly: 19.9, yearly: 149 },
  };

  const plans = [
    { key: "free", included: PLAN_FEATURE_KEYS.free, excluded: PLAN_FEATURE_KEYS.freeExcluded, popular: false },
    { key: "pro", included: PLAN_FEATURE_KEYS.pro, excluded: PLAN_FEATURE_KEYS.proExcluded, popular: true },
    { key: "premium", included: PLAN_FEATURE_KEYS.premium, excluded: [], popular: false },
  ];

  const getApiUrl = () => {
    if (nativeApp) {
      return import.meta.env.VITE_API_URL || 'http://192.168.10.51:3000/api';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  };

  const getPlanDisplayName = (plan) => {
    if (plan === 'pro') return t("pro");
    if (plan === 'premium') return t("premium");
    return t("free");
  };

  const executePlanChange = async (planKey, billingCycle, type, platform) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = getApiUrl();
      
      if (planKey === 'free' && platform === 'stripe') {
        const response = await fetch(`${apiUrl}/stripe/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          window.location.reload();
        } else {
          throw new Error(data.error || t("cancellationFailed"));
        }
      } else {
        const response = await fetch(`${apiUrl}/subscription/change`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: planKey, billing: billingCycle, type, platform }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          if (data.checkoutUrl) {
            window.location.href = data.checkoutUrl;
            return;
          }
          if (data.platform === 'revenuecat') {
            navigate(`/checkout?plan=${planKey}&billing=${billingCycle}&packageId=${data.packageId}`);
            return;
          }
          window.location.reload();
        } else {
          throw new Error(data.error || t("planChangeFailed"));
        }
      }
    } catch (error) {
      console.error('Plan change error:', error);
      alert(error.message || t("planChangeFailedTryAgain"));
    } finally {
      setLoading(false);
    }
  };

  /* const handleSelectPlan = async (planKey, billingCycle) => {
    if (planKey === currentPlan && billingCycle === currentBilling) return;
    
    const userPaymentPlatform = getUserPaymentPlatform(user);
    const platform = userPaymentPlatform;
    
    // 移动端降级到 Free 的提示
    if (planKey === 'free' && platform !== 'stripe') {
      const manageHint = platform === 'appstore'
        ? t("appStoreManageHint")
        : t("googlePlayManageHint");
      alert(t("cancelSubscriptionGuide") + " " + manageHint);
      return;
    }
    
    setPendingPlan(planKey);
    setPendingBilling(billingCycle);
    
    // 获取单个账单周期的价格（用于判断升级/降级）
    const getCyclePrice = (plan, billing) => {
      const priceMap = {
        pro: { monthly: 9.9, yearly: 79 },
        premium: { monthly: 19.9, yearly: 149 },
        free: { monthly: 0, yearly: 0 }
      };
      return priceMap[plan]?.[billing] || 0;
    };
    
    const currentCyclePrice = getCyclePrice(currentPlan, currentBilling);
    const newCyclePrice = getCyclePrice(planKey, billingCycle);
    const isUpgrade = newCyclePrice > currentCyclePrice;
    
    // 情况1：取消到 Free
    if (planKey === 'free') {
      setShowCancelDialog(true);
      return;
    }
    
    // 情况2：免费用户 → 任何付费计划
    if (currentPlan === 'free' && planKey !== 'free') {
      await executePlanChange(planKey, billingCycle, 'upgrade', platform);
      return;
    }
    
    // 情况3：升级（需要支付更多钱）
    if (isUpgrade) {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = getApiUrl();
        
        const prorationRes = await fetch(`${apiUrl}/stripe/proration-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: planKey, billing: billingCycle }),
        });
        const prorationData = await prorationRes.json();
        
        const prorationAmount = (prorationData.proration_amount || 0) / 100;
        const regularPrice = prices[planKey]?.[billingCycle];
        const periodText = billingCycle === 'monthly' ? t("perMonthShort") : t("perYearShort");
        const billingText = billingCycle === 'monthly' ? t("monthlyBilling") : t("yearlyBilling");
        const planDisplayName = planKey === 'pro' ? t("pro") : t("premium");
        
        setProrationInfo({
          amount: prorationAmount.toFixed(2),
          regularPrice,
          periodText,
          billingText,
          planName: planDisplayName,
          planKey,
          billingCycle,
        });
        setShowUpgradeDialog(true);
        setLoading(false);
      } catch (error) {
        console.error('Proration preview error:', error);
        await executePlanChange(planKey, billingCycle, 'upgrade', platform);
        setLoading(false);
      }
      return;
    }
    
    // 情况4：降级（付更少钱）
    setShowDowngradeDialog(true);
  }; */

  const handleSelectPlan = async (planKey, billingCycle) => {
  if (planKey === currentPlan && billingCycle === currentBilling) return;
  
  const userPaymentPlatform = getUserPaymentPlatform(user);
  const platform = userPaymentPlatform;
  
  console.log('========== 订阅调试 ==========');
  console.log('platform:', platform);
  console.log('currentPlan:', currentPlan);
  console.log('currentBilling:', currentBilling);
  console.log('planKey:', planKey);
  console.log('billingCycle:', billingCycle);
  console.log('user.subscription_source:', user?.subscription_source);
  
  // 获取 RevenueCat 包 ID
  /* const getRevenueCatPackageId = (plan, billing) => {
    const packageMap = {
      pro: { monthly: 'pro_monthly', yearly: 'pro_yearly' },
      premium: { monthly: 'premium_monthly', yearly: 'premium_yearly' }
    };
    return packageMap[plan]?.[billing];
  };*/

  const getRevenueCatPackageId = (plan, billing) => {
  const packageMap = {
    pro: { monthly: 'pro_monthly', yearly: 'pro_yearly' },
    premium: { monthly: 'premium_monthly', yearly: 'premium_yearly' }
  };
  return packageMap[plan]?.[billing];
};
  
  // 获取单个账单周期的价格（用于判断升级/降级）
  const getCyclePrice = (plan, billing) => {
    const priceMap = {
      pro: { monthly: 9.9, yearly: 79 },
      premium: { monthly: 19.9, yearly: 149 },
      free: { monthly: 0, yearly: 0 }
    };
    return priceMap[plan]?.[billing] || 0;
  };
  
  setPendingPlan(planKey);
  setPendingBilling(billingCycle);
  
  const currentCyclePrice = getCyclePrice(currentPlan, currentBilling);
  const newCyclePrice = getCyclePrice(planKey, billingCycle);
  const isUpgrade = newCyclePrice > currentCyclePrice;
  
  // ========== 情况1：取消到 Free ==========
  if (planKey === 'free') {
    if (platform === 'stripe') {
      setShowCancelDialog(true);
    } else {
      // RevenueCat 用户：提示去系统设置取消
      const manageHint = platform === 'appstore'
        ? t("appStoreManageHint")
        : t("googlePlayManageHint");
      alert(t("cancelSubscriptionGuide") + " " + manageHint);
    }
    return;
  }
  
  // ========== 情况2：免费用户 → 任何付费计划 ==========
  if (currentPlan === 'free' && planKey !== 'free') {
    if (platform === 'stripe') {
      console.log('免费用户 - Web 使用 Stripe');
      await executePlanChange(planKey, billingCycle, 'upgrade', platform);
    } else {
      console.log('免费用户 - 移动端使用 RevenueCat');
      const packageId = getRevenueCatPackageId(planKey, billingCycle);
      navigate(`/checkout?plan=${planKey}&billing=${billingCycle}&packageId=${packageId}`);
    }
    return;
  }
  
  // ========== 情况3：已有订阅用户的升级/降级 ==========
  // 根据订阅来源决定处理方式
  const subscriptionSource = user?.subscription_source;
  
  if (subscriptionSource === 'stripe') {
    // Stripe 用户
    if (isUpgrade) {
      // 升级：显示按比例对话框
      console.log('Stripe 用户升级');
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = getApiUrl();
        
        const prorationRes = await fetch(`${apiUrl}/stripe/proration-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: planKey, billing: billingCycle }),
        });
        const prorationData = await prorationRes.json();
        
        const prorationAmount = (prorationData.proration_amount || 0) / 100;
        const regularPrice = prices[planKey]?.[billingCycle];
        const periodText = billingCycle === 'monthly' ? t("perMonthShort") : t("perYearShort");
        const billingText = billingCycle === 'monthly' ? t("monthlyBilling") : t("yearlyBilling");
        const planDisplayName = planKey === 'pro' ? t("pro") : t("premium");
        
        setProrationInfo({
          amount: prorationAmount.toFixed(2),
          regularPrice,
          periodText,
          billingText,
          planName: planDisplayName,
          planKey,
          billingCycle,
        });
        setShowUpgradeDialog(true);
        setLoading(false);
      } catch (error) {
        console.error('Proration preview error:', error);
        await executePlanChange(planKey, billingCycle, 'upgrade', platform);
        setLoading(false);
      }
    } else {
      // 降级：周期结束生效
      console.log('Stripe 用户降级');
      setShowDowngradeDialog(true);
    }
  } else if (subscriptionSource === 'revenuecat' || platform === 'googleplay' || platform === 'appstore') {
    // RevenueCat 用户（移动端）
    console.log('RevenueCat 用户变更计划');
    
    if (isUpgrade) {
      // 升级：直接走 RevenueCat 升级流程
      const packageId = getRevenueCatPackageId(planKey, billingCycle);
      navigate(`/checkout?plan=${planKey}&billing=${billingCycle}&packageId=${packageId}`);
    } else {
      // 降级：RevenueCat 降级提示
      alert(t("downgradeNotice") + " " + (platform === 'appstore' ? t("appStoreManageHint") : t("googlePlayManageHint")));
    }
  } else {
    // 默认：使用原有逻辑
    if (isUpgrade) {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = getApiUrl();
        
        const prorationRes = await fetch(`${apiUrl}/stripe/proration-preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: planKey, billing: billingCycle }),
        });
        const prorationData = await prorationRes.json();
        
        const prorationAmount = (prorationData.proration_amount || 0) / 100;
        const regularPrice = prices[planKey]?.[billingCycle];
        const periodText = billingCycle === 'monthly' ? t("perMonthShort") : t("perYearShort");
        const billingText = billingCycle === 'monthly' ? t("monthlyBilling") : t("yearlyBilling");
        const planDisplayName = planKey === 'pro' ? t("pro") : t("premium");
        
        setProrationInfo({
          amount: prorationAmount.toFixed(2),
          regularPrice,
          periodText,
          billingText,
          planName: planDisplayName,
          planKey,
          billingCycle,
        });
        setShowUpgradeDialog(true);
        setLoading(false);
      } catch (error) {
        console.error('Proration preview error:', error);
        await executePlanChange(planKey, billingCycle, 'upgrade', platform);
        setLoading(false);
      }
    } else {
      setShowDowngradeDialog(true);
    }
  }
};

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("subscription") || "Subscription"}</h1>
          <p className="text-muted-foreground mt-2">{t("selectPlanSubtitle") || "Choose the right plan for you"}</p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("currentPlan") || "Current Plan"}</p>
            <h2 className="text-2xl font-bold text-foreground">{getPlanDisplayName(currentPlan)}</h2>
            {currentPlan !== "free" && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentBilling === "monthly" ? t("monthlyBilling") : t("yearlyBilling")}
              </p>
            )}
          </div>
          <Badge className="bg-primary/10 text-primary border-0 px-3 py-1">
            {currentPlan === "free" ? t("freeLabel") : t("active")}
          </Badge>
        </div>
      </Card>

      {/* Billing Toggle */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("billingMonthly")}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("billingYearly")}
            <Badge className="ml-2 bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
              {t("billingYearlySave")}
            </Badge>
          </button>
        </div>
      </div>

      {/* Currency notice */}
      {currentPlan !== "free" && nativeApp && (
        <p className="text-xs text-muted-foreground text-center -mt-4">
          Show SGD for reference. Actual charge in your local currency as set by App Store / Google Play.
        </p>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {plans.map((plan, i) => {
          const Icon = planIcons[plan.key];
          const price = prices[plan.key][billing];
          const isCurrentPlan = currentPlan === plan.key && 
            (plan.key === "free" || currentBilling === billing);

          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative overflow-hidden border-0 shadow-sm p-6 h-full flex flex-col ${plan.popular ? "ring-2 ring-primary shadow-lg" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-primary text-primary-foreground rounded-none rounded-bl-xl text-xs px-3 py-1 border-0">
                      {t("recommended")}
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0">
                    <Badge className="bg-emerald-500 text-white rounded-none rounded-br-xl text-xs px-3 py-1 border-0">
                      {t("currentPlanBadge")}
                    </Badge>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planColors[plan.key]} flex items-center justify-center mb-4 mt-2`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold text-foreground">{getPlanDisplayName(plan.key)}</h3>

                <div className="mt-3 mb-5">
                  {price === 0 ? (
                    <span className="text-3xl font-bold text-foreground">{t("freeLabel")}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-foreground">S$</span>
                      <span className="text-3xl font-bold text-foreground">{price}</span>
                      <span className="text-muted-foreground text-sm"> {billing === "monthly" ? t("perMonthShort") : t("perYearShort")}</span>
                    </>
                  )}
                </div>

                <div className="space-y-2.5 mb-6 flex-1">
                  {plan.included.map((key) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{t(key)}</span>
                    </div>
                  ))}
                  {plan.excluded.map((key) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-muted">
                        <X className="w-3 h-3 text-muted-foreground/40" />
                      </div>
                      <span className="text-sm text-muted-foreground/60">{t(key)}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan.key, billing)}
                  disabled={isCurrentPlan || loading}
                  className={`w-full rounded-xl ${
                    isCurrentPlan ? "bg-emerald-500 text-white cursor-not-allowed" :
                    plan.popular ? "bg-primary hover:bg-primary/90" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    t("currentPlanBadge")
                  ) : (
                    t("selectPlan")
                  )}
                </Button>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Cancel subscription confirmation dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelSubscription")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelSubscriptionDesc", { plan: currentPlan === 'pro' ? t("pro") : t("premium") })}
              {"\n\n"}{t("noFurtherCharges")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLoading(false)}>{t("goBack")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelDialog(false);
                executePlanChange(pendingPlan, pendingBilling, 'downgrade', getUserPaymentPlatform(user));
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("proceedCancellation")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Premium → Pro downgrade confirmation dialog */}
      <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("downgradePlan")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("downgradePlanDesc", {
                fromPlan: t("premium"),
                toPlan: t("pro"),
                billing: pendingBilling === 'monthly' ? t("monthlyBilling") : t("yearlyBilling"),
                price: prices.pro?.[pendingBilling] || 0,
                period: pendingBilling === 'monthly' ? t("perMonthShort") : t("perYearShort")
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLoading(false)}>{t("goBack")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDowngradeDialog(false);
                executePlanChange(pendingPlan, pendingBilling, 'downgrade', getUserPaymentPlatform(user));
              }}
            >
              {t("proceedDowngrade")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade confirmation dialog with proration info */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("upgradePlan")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("upgradePlanDesc", {
                fromPlan: getPlanDisplayName(currentPlan),
                fromBilling: currentBilling === 'monthly' ? t("monthlyBilling") : t("yearlyBilling"),
                toPlan: prorationInfo?.planName,
                toBilling: prorationInfo?.billingText
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="border-t pt-2 mt-2">
            <p className="font-semibold">{t("todayPayment")}: S${prorationInfo?.amount}</p>
            <p className="text-muted-foreground text-sm">
              {t("nextBilling")}: S${prorationInfo?.regularPrice}{prorationInfo?.periodText}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {t("upgradeNote")}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLoading(false)}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowUpgradeDialog(false);
                await executePlanChange(
                  prorationInfo?.planKey, 
                  prorationInfo?.billingCycle, 
                  'upgrade', 
                  getUserPaymentPlatform(user)
                );
              }}
            >
              {t("confirmUpgrade")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}