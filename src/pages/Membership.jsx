// @ts-nocheck
// src/pages/Membership.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { UI_LANGUAGES } from '../lib/i18n';
import { getCurrentPlan, getCurrentBilling } from '../lib/planUtils';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { getTimezoneOffset, getLocalDateString, convertToLocalDate } from '../lib/utils';
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
import { CalendarCheck, Trophy, Globe, Mic2, PenTool, Headphones, MessageSquare, Star, Share2, Copy, Trash2, ChevronDown, ShieldCheck, FileText, Calendar, RefreshCw } from "lucide-react";
import SubscriptionManager from '../components/subscription/SubscriptionManager';
import { motion } from "framer-motion";

const BADGE_DEFS = {
  checkin:   { icon: CalendarCheck, color: "bg-emerald-500", labelKey: "badgeCheckin" },
  oral:      { icon: Mic2,          color: "bg-primary",     labelKey: "badgeOral" },
  essay:     { icon: PenTool,       color: "bg-accent",      labelKey: "badgeEssay" },
  listening: { icon: Headphones,    color: "bg-blue-500",    labelKey: "badgeListening" },
  qa:        { icon: MessageSquare, color: "bg-violet-500",  labelKey: "badgeQA" },
  streak:    { icon: Star,          color: "bg-amber-500",   labelKey: "badgeStreak" },
};

export default function Membership() {
  const { t, uiLanguage, setUiLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const location = useLocation();
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [user, setUser] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  // 获取订阅信息
  const fetchSubscriptionInfo = async () => {
    try {
      const response = await base44.functions.invoke("getSubscription", {});
      if (response?.data) {
        setSubscriptionInfo(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription info:", error);
    }
  };

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // 计算剩余天数
  const getRemainingDays = () => {
    const periodEndDate = subscriptionInfo?.subscription?.current_period_end;
    if (!periodEndDate) return 0;
    const now = Math.floor(Date.now() / 1000);
    const daysLeft = Math.ceil((periodEndDate - now) / (24 * 60 * 60));
    return Math.max(0, daysLeft);
  };

  // 处理支付成功重定向
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const params = new URLSearchParams(location.search);
      
      const isNewFormat = params.get("payment") === "success";
      const isOldFormat = params.get("success") === "true";
      
      if (isNewFormat || isOldFormat) {
        let p = params.get("plan");
        let b = params.get("billing");
        
        if (isOldFormat && (!p || !b)) {
          p = localStorage.getItem("checkout_plan");
          b = localStorage.getItem("checkout_billing");
        }
        
        if (p && b) {
          try { 
            await base44.entities.User.updatePlan(p, b); 
          } catch (err) {
            console.error('Failed to update user plan:', err);
            try { 
              await base44.auth.updateMe({ plan: p, billing: b }); 
            } catch (fallbackErr) {
              console.error('Fallback also failed:', fallbackErr);
            }
          }
          
          // 刷新数据
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
          if (updatedUser?.stripe_subscription_id) {
            await fetchSubscriptionInfo();
          }
          
          localStorage.setItem("lm_plan", p);
          localStorage.setItem("lm_billing", b);
          window.history.replaceState({}, "", "/membership");
        }
      }
    };
    
    handlePaymentSuccess();
  }, [location.search]);

  // 获取用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        
        if (u?.plan) {
          localStorage.setItem("lm_plan", u.plan);
        }
        if (u?.billing) {
          localStorage.setItem("lm_billing", u.billing);
        }
        
        if (u?.stripe_subscription_id) {
          await fetchSubscriptionInfo();
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    
    loadUserData();
  }, []);

  const currentPlan = getCurrentPlan(user);
  const currentBilling = getCurrentBilling(user);
  
  // 检查是否已标记取消
  const isCanceling = subscriptionInfo?.subscription?.cancel_at_period_end === true;
  const periodEndDate = subscriptionInfo?.subscription?.current_period_end;
  const remainingDays = getRemainingDays();

  const planLabels = { free: t("free"), pro: t("pro"), premium: t("premium") };
  const billingLabels = { monthly: t("monthlyPlan"), yearly: t("yearlyPlan") };

  const { data: badges = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: () => base44.entities.Badge.list("-created_date", 50),
    enabled: !!user,
  });

  // 检查今天是否已签到
  useEffect(() => {
    const today = getLocalDateString();
    const checkedToday = badges.some(b => {
      if (b.type === "checkin" && b.earned_date) {
        const localEarnedDate = convertToLocalDate(b.earned_date);
        return localEarnedDate === today;
      }
      return false;
    });
    setTodayCheckedIn(checkedToday);
  }, [badges]);

  const handleCheckIn = async () => {
    if (todayCheckedIn) {
      alert(t("checkInDone"));
      return;
    }
    
    const today = getLocalDateString();
    const timezoneOffset = getTimezoneOffset();
    try {
      await base44.entities.Badge.create({
        type: "checkin",
        name: "checkin",
        description: "Daily check-in",
        earned_date: today,
        icon: "CalendarCheck",
        timezone_offset: timezoneOffset,
      });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setTodayCheckedIn(true);
    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Failed to check in. Please try again.');
    }
  };

  const handleDowngrade = async () => {
    if (currentPlan === 'free') {
      setShowDowngradeDialog(false);
      return;
    }
    
    setIsDowngrading(true);
    try {
      const result = await base44.functions.invoke("cancelSubscription", {});
      
      // 立即更新本地状态
      const periodEndTimestamp = result.data?.current_period_end 
        ? new Date(result.data.current_period_end).getTime() / 1000 
        : periodEndDate;
      
      setSubscriptionInfo(prev => ({
        ...prev,
        subscription: {
          ...prev?.subscription,
          cancel_at_period_end: true,
          current_period_end: periodEndTimestamp || prev?.subscription?.current_period_end
        }
      }));
      
      // 后台刷新用户数据
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
      alert("Your subscription will be cancelled at the end of your current billing period.");
    } catch (e) {
      console.error("Downgrade error:", e);
      alert("Failed to downgrade: " + (e.message || "Unknown error"));
    }
    setIsDowngrading(false);
    setShowDowngradeDialog(false);
  };

  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      await base44.functions.invoke("reactivateSubscription", {});
      
      // 立即更新本地状态
      setSubscriptionInfo(prev => ({
        ...prev,
        subscription: {
          ...prev?.subscription,
          cancel_at_period_end: false
        }
      }));
      
      // 后台刷新用户数据
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
      // 重新获取订阅信息确保同步
      const response = await base44.functions.invoke("getSubscription", {});
      if (response?.data) {
        setSubscriptionInfo(response.data);
      }
      
      alert("Your subscription has been reactivated.");
    } catch (error) {
      console.error("Reactivate error:", error);
      alert("Failed to reactivate: " + error.message);
    }
    setIsReactivating(false);
  };

  const handleDeleteAccount = async () => {
    await base44.auth.logout();
  };

  const groupedBadges = badges.reduce((acc, badge) => {
    if (!acc[badge.type]) acc[badge.type] = [];
    acc[badge.type].push(badge);
    return acc;
  }, {});

  const handleShare = (platform) => {
    const text = t("shareText")
      .replace("{count}", badges.length)
      .replace("{plan}", planLabels[currentPlan]);
    const encoded = encodeURIComponent(text);

    if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => alert(t("captionCopied"))).catch(() => alert(t("captionCopied")));
      } else {
        alert(t("captionCopied"));
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">{t("membership")}</h1>

      {/* Current Plan */}
      <Card className="border-0 shadow-sm p-6">

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
    <div>
      <p className="text-sm text-muted-foreground">{t("account")}</p>
      <p className="font-medium text-foreground">{user?.full_name || user?.email}</p>
      <p className="text-xs text-muted-foreground">{user?.email}</p>
    </div>
    <div className="text-right">
      <p className="text-sm text-muted-foreground">{t("memberSince")}</p>
      <p className="text-sm text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
    </div>
  </div>
  
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t("currentPlan")}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-foreground">{planLabels[currentPlan] || currentPlan}</span>
              {currentPlan !== "free" && (
                <Badge className="bg-primary/10 text-primary border-0">{billingLabels[currentBilling]}</Badge>
              )}
            </div>
            {/* 显示取消状态 */}
            {isCanceling && periodEndDate && (
              <div className="flex items-center gap-1 mt-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                <Calendar className="w-4 h-4" />
                <span>
                  Canceling - Expires on {formatDate(periodEndDate)} ({remainingDays} days left)
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            {/* 免费用户：显示 Upgrade */}
            {currentPlan === "free" && (
              <Link to="/subscription">
                <Button size="sm" className="rounded-xl">{t("upgrade")}</Button>
              </Link>
            )}
            
            {/* 已取消用户：显示 Reactivate 按钮 */}
            {currentPlan !== "free" && isCanceling && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-2"
                onClick={handleReactivate}
                disabled={isReactivating}
              >
                {isReactivating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Reactivate {planLabels[currentPlan]}
              </Button>
            )}
            
            {/* 正常订阅用户（非免费、未取消）：显示 Upgrade 和 Downgrade */}
            {currentPlan !== "free" && !isCanceling && (
              <div className="flex gap-2">
                {currentPlan !== "premium" && (
                  <Link to="/subscription">
                    <Button size="sm" className="rounded-xl">{t("upgrade")}</Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-muted-foreground text-xs gap-1"
                  onClick={() => setShowDowngradeDialog(true)}
                >
                  <ChevronDown className="w-3 h-3" />
                  {t("downgradeToFree")}
                </Button>
              </div>
            )}
          </div>
        </div>
       </Card>

      {/* Subscription Management */}
      <SubscriptionManager 
        user={user}
        subscriptionInfo={subscriptionInfo}
        onRefresh={fetchSubscriptionInfo}
      />

      {/* Check-in */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CalendarCheck className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">{t("checkIn")}</h2>
              <p className="text-sm text-muted-foreground">{badges.filter(b => b.type === "checkin").length} {t("checkInDaysTotal")}</p>
            </div>
          </div>
          <Button
            onClick={handleCheckIn}
            disabled={todayCheckedIn}
            className={todayCheckedIn ? "bg-emerald-500 text-white cursor-not-allowed" : ""}
          >
            {todayCheckedIn ? t("checkInDone") : t("checkIn")}
          </Button>
        </div>
      </Card>

      {/* Legal Documents */}
      <Card className="border-0 shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">{t("legalDocuments")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("legalDocumentsDesc")}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <a 
            href="/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary underline hover:no-underline"
          >
            {t("termsOfService")}
          </a>
          <a 
            href="/privacy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary underline hover:no-underline"
          >
            {t("privacyPolicy")}
          </a>
        </div>
      </Card>

      {/* Interface Language */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">{t("interfaceLanguage")}</h2>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {UI_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setUiLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  uiLanguage === lang.code
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-secondary text-foreground border border-border"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="truncate">{lang.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Badges */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-foreground">{t("myBadges")}</h2>
          <Badge className="bg-primary/10 text-primary border-0 ml-auto">{badges.length} {t("badgesEarned")}</Badge>
        </div>
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleShare("x")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 text-xs font-medium hover:bg-sky-500/20 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> {t("shareToX")}
            </button>
            <button
              onClick={() => handleShare("instagram")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-600 text-xs font-medium hover:bg-pink-500/20 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Instagram ({t("copyCaption")})
            </button>
            <button
              onClick={() => handleShare("tiktok")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/10 text-foreground text-xs font-medium hover:bg-black/15 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> TikTok ({t("copyCaption")})
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-secondary transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> {t("copyCaption")}
            </button>
          </div>
        )}
        {badges.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">{t("noBadgesYet")}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(groupedBadges).map(([type, items]) => {
              const def = BADGE_DEFS[type] || BADGE_DEFS.checkin;
              const Icon = def.icon;
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary"
                >
                  <div className={`w-12 h-12 rounded-full ${def.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-foreground text-center">{t(def.labelKey)}</p>
                  <Badge className="bg-background text-foreground border border-border text-[10px]">x{items.length}</Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Delete Account */}
      <Card className="border border-destructive/30 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-destructive">{t("deleteAccount")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("deleteAccountDesc")}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="gap-2">
            <Trash2 className="w-4 h-4" /> {t("deleteAccount")}
          </Button>
        </div>
      </Card>

      {/* Downgrade Dialog */}
      <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDowngrade")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>{t("confirmDowngradeDesc")}</span>
              {periodEndDate && (
                <div className="mt-2 p-2 bg-amber-50 rounded-md text-amber-700 text-sm">
                  Your subscription will remain active until {formatDate(periodEndDate)}. 
                  You will lose access to Pro/Premium features after that date.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDowngrade} disabled={isDowngrading}>
              {isDowngrading ? "..." : t("confirmDowngradeBtn")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDeleteAccount")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
              {t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}