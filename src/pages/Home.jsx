// @ts-nocheck
// src/pages/Home.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Browser } from '@capacitor/browser';
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { UI_LANGUAGES } from '../lib/i18n';
import { getCurrentPlan, getCurrentBilling, isNativeApp, getUserPaymentPlatform } from '../lib/planUtils';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from '../components/layout/PullToRefresh';
import LanguageSwitcher from '../components/layout/LanguageSwitcher';
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
import { 
  MessageCircle, PenTool, Flame, BookOpen, ArrowRight, Globe,
  CalendarCheck, Trophy, Mic2, Headphones, MessageSquare, Star, 
  Share2, Copy, Trash2, ChevronDown, FileText, Calendar, RefreshCw,
  User, Mail, TrendingUp, Award, CheckCircle2, X, Facebook, Send, 
  Twitter, Linkedin, Link2, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 成就目标配置（多级目标）
const ACHIEVEMENT_LEVELS = {
  conversation: {
    levels: [
      { target: 10, title: "Chatterbox" },
      { target: 50, title: "Talkative" },
      { target: 100, title: "Social Butterfly" },
      { target: 500, title: "Conversation Master" },
      { target: 1000, title: "Legendary Speaker" },
    ],
    icon: MessageCircle,
    color: "bg-primary",
  },
  essay: {
    levels: [
      { target: 5, title: "Budding Writer" },
      { target: 20, title: "Skilled Author" },
      { target: 50, title: "Prolific Writer" },
      { target: 100, title: "Essay Master" },
      { target: 500, title: "Literary Legend" },
    ],
    icon: PenTool,
    color: "bg-accent",
  },
  listening: {
    levels: [
      { target: 10, title: "Attentive Ear" },
      { target: 30, title: "Audio Master" },
      { target: 100, title: "Listening Pro" },
      { target: 300, title: "Perfect Pitch" },
      { target: 1000, title: "Audio Legend" },
    ],
    icon: Headphones,
    color: "bg-blue-500",
  },
  qa: {
    levels: [
      { target: 10, title: "Curious Mind" },
      { target: 30, title: "Knowledge Seeker" },
      { target: 100, title: "Wisdom Seeker" },
      { target: 300, title: "Q&A Champion" },
      { target: 1000, title: "Oracle" },
    ],
    icon: MessageSquare,
    color: "bg-violet-500",
  },
  streak: {
    levels: [
      { target: 7, title: "Week Warrior" },
      { target: 30, title: "Monthly Master" },
      { target: 100, title: "Century Club" },
      { target: 365, title: "Year of Learning" },
    ],
    icon: Flame,
    color: "bg-amber-500",
  },
};

// 分享平台配置
const SHARE_PLATFORMS = {
  whatsapp: {
    name: "WhatsApp",
    icon: Send,
    color: "bg-green-500",
    getUrl: (text, url) => `https://wa.me/?text=${encodeURIComponent(text)}%20${encodeURIComponent(url)}`,
  },
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "bg-blue-600",
    getUrl: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "bg-black",
    getUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  telegram: {
    name: "Telegram",
    icon: Send,
    color: "bg-sky-500",
    getUrl: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  line: {
    name: "LINE",
    icon: MessageCircle,
    color: "bg-green-600",
    getUrl: (text, url) => `https://line.me/R/msg/text/?${encodeURIComponent(text)}%20${encodeURIComponent(url)}`,
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "bg-blue-700",
    getUrl: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
};

// 获取当前成就等级
const getCurrentAchievementLevel = (value, levels) => {
  let currentLevel = null;
  let nextLevel = null;
  
  for (let i = 0; i < levels.length; i++) {
    if (value >= levels[i].target) {
      currentLevel = levels[i];
    } else {
      nextLevel = levels[i];
      break;
    }
  }
  
  return { currentLevel, nextLevel };
};

// 成就卡片组件
const AchievementCard = ({ value, levels, icon: Icon, color }) => {
  const { currentLevel, nextLevel } = getCurrentAchievementLevel(value, levels);
  const nextTarget = nextLevel?.target || (currentLevel?.target || levels[0]?.target);
  const displayValue = Math.min(value, nextTarget);
  const percentage = Math.min(100, Math.floor((value / nextTarget) * 100));
  
  const getStatusText = () => {
    if (nextLevel) {
      return `${displayValue} / ${nextTarget} · ${percentage}%`;
    }
    return `🏆 MAX · ${value} total`;
  };
  
  const getTitle = () => {
    if (nextLevel) return nextLevel.title;
    return currentLevel?.title || levels[0]?.title;
  };
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{getTitle()}</p>
          <p className="text-xs text-muted-foreground">{getStatusText()}</p>
        </div>
      </div>
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default function Dashboard() {
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
  const [copied, setCopied] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 获取用户统计数据
  // Home.jsx - 使用 base44 方式
const fetchUserStats = async () => {
  setStatsLoading(true);
  try {
    // 并行获取所有数据
    const [conversations, essays, listeningExercises, qaExercises, badges] = await Promise.all([
      base44.entities.Conversation.list(),
      base44.entities.Essay.list(),
      base44.entities.ListeningExercise.list(),
      base44.entities.QAExercise.list(),
      base44.entities.Badge.list("-created_date", 50),
    ]);
    
    const stats = {
      total_conversations: conversations?.length || 0,
      total_essays: essays?.filter(e => e.status === "reviewed").length || 0,
      total_listening: listeningExercises?.filter(e => e.status === "answered").length || 0,
      total_qa: qaExercises?.filter(e => e.status === "answered").length || 0,
      total_checkin: badges?.filter(b => b.type === "checkin").length || 0,
    };
    
    console.log('Calculated stats:', stats);
    setUserStats(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    setUserStats({
      total_conversations: 0,
      total_essays: 0,
      total_listening: 0,
      total_qa: 0,
      total_checkin: 0,
    });
  } finally {
    setStatsLoading(false);
  }
};

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
          
          const updatedUser = await base44.auth.me();
          setUser(updatedUser);
          if (updatedUser?.stripe_subscription_id) {
            await fetchSubscriptionInfo();
          }
          
          localStorage.setItem("lm_plan", p);
          localStorage.setItem("lm_billing", b);
          window.history.replaceState({}, "", "/dashboard");
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
    fetchUserStats();
  }, []);

  // 获取 badges 数据
  const { data: badges = [] } = useQuery({
    queryKey: ["badges"],
    queryFn: () => base44.entities.Badge.list("-created_date", 50),
    enabled: !!user,
  });

  const currentPlan = getCurrentPlan(user);
  const currentBilling = getCurrentBilling(user);
  const isCanceling = subscriptionInfo?.subscription?.cancel_at_period_end === true;
  const periodEndDate = subscriptionInfo?.subscription?.current_period_end;
  const remainingDays = getRemainingDays();

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

  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ["badges"] });
    await fetchUserStats();
  };

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
      await fetchUserStats(); // 刷新统计数据
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
    
    const userPlatform = getUserPaymentPlatform(user);
    
    // RevenueCat 用户：引导去系统设置取消
    if (userPlatform !== 'stripe') {
      setShowDowngradeDialog(false);
      const manageHint = userPlatform === 'appstore'
        ? 'App Store (Settings > Apple ID > Subscriptions)'
        : 'Google Play (Play Store app > Subscriptions)';
      alert(`Please cancel your subscription in ${manageHint}. Once cancelled, your plan will downgrade to Free at the end of the current billing period.`);
      setIsDowngrading(false);
      return;
    }
    
    setIsDowngrading(true);
    try {
      const result = await base44.functions.invoke("cancelSubscription", {});
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
      
      setSubscriptionInfo(prev => ({
        ...prev,
        subscription: {
          ...prev?.subscription,
          cancel_at_period_end: false
        }
      }));
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      
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
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    const response = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'  // ← 添加这行
      },
      body: JSON.stringify({ isMobile: false })  // ← 添加 body
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Delete failed:', data);
      alert(data.error || data.message || 'Failed to delete account');
      return;
    }
    
    if (data.success) {
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ACCOUNT_DELETED' }));
      }
      
      window.location.href = '/';
    }
    
  } catch (error) {
    console.error('Delete account failed:', error);
    alert('Failed to delete account. Please try again.');
  }
};

  // 分享功能
  const handleShare = (platform) => {
    const shareText = t("shareText")
      .replace("{count}", userStats?.total_checkin || 0)
      .replace("{plan}", planLabels[currentPlan] || currentPlan);
    const shareUrl = window.location.origin;
    
    const platformConfig = SHARE_PLATFORMS[platform];
    if (platformConfig) {
      const shareLink = platformConfig.getUrl(shareText, shareUrl);
      window.open(shareLink, '_blank', 'width=600,height=500');
    }
  };

  // iOS WKWebView 兼容：使用 Capacitor Browser 打开法律文档链接
  const openLegalLink = (path) => {
    const isNative = isNativeApp();
    const baseUrl = isNative
      ? (import.meta.env.VITE_SITE_URL || 'https://lang.omnifamily.cloud')
      : window.location.origin;
    const lang = uiLanguage || 'en';
    const url = `${baseUrl}${path}?lang=${lang}`;
    if (Browser?.open) {
      Browser.open({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = window.location.origin;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const planLabels = { free: t("free"), pro: t("pro"), premium: t("premium") };
  const billingLabels = { monthly: t("monthlyPlan"), yearly: t("yearlyPlan") };

  if (!user || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 pb-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent p-6 md:p-8 text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium mb-1">
                  {t("welcomeBack")} {user?.full_name || user?.email?.split('@')[0] || ""}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 hidden md:block">{t("appName")}</h1>
                <p className="text-white/70 text-base mb-6">{t("appTagline")}</p>
                <Link to="/oral-practice">
                  <Button className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 rounded-xl">
                    <MessageCircle className="w-4 h-4" />
                    {t("startPractice")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-lg">
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Plan & Account */}
<Card className="border-0 shadow-sm p-6">
  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="font-medium text-foreground">{user?.full_name || user?.email?.split('@')[0]}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="w-3 h-3" />
          <span>{user?.email}</span>
        </div>
      </div>
    </div>
  </div>
  
  <div className="flex items-center justify-between flex-wrap gap-4">
    <div>
      <p className="text-sm text-muted-foreground mb-1">{t("currentPlan")}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xl font-bold text-foreground">{planLabels[currentPlan] || currentPlan}</span>
        {currentPlan !== "free" && (
          <Badge className="bg-primary/10 text-primary border-0">
            {currentBilling === "monthly" ? t("monthlyBilling") : t("yearlyBilling")}
          </Badge>
        )}
        {subscriptionInfo?.subscription?.current_period_start && (
          <p className="text-xs text-muted-foreground">
            {t("since")} {new Date(subscriptionInfo.subscription.current_period_start * 1000).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {/* 取消状态 */}
      {isCanceling && periodEndDate && (
        <div className="flex items-center gap-1 mt-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
          <Calendar className="w-4 h-4" />
          <span>
            {t("cancelingAtPeriodEnd")} {formatDate(periodEndDate)} ({remainingDays} {t("daysLeft")})
            {currentBilling === 'yearly' && (
              <span className="text-xs ml-1">(Annual plan ends)</span>
            )}
          </span>
        </div>
      )}
      
      {/* 下次扣款日期 */}
      {!isCanceling && currentPlan !== "free" && periodEndDate && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>
            {t("nextBillingOn")} {formatDate(periodEndDate)}
           {/*  {currentBilling === 'yearly' && (
              <span className="text-green-600 ml-1">(Annual - renews yearly)</span>
            )}
            {currentBilling === 'monthly' && (
              <span className="text-blue-500 ml-1">(Monthly)</span>
            )} */}
          </span>
        </div>
      )}
      
      {/* 待生效变更 */}
      {subscriptionInfo?.pending_change && (
        <div className="flex items-center gap-1 mt-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
          <Clock className="w-4 h-4" />
          <span>
            {t("planChangingTo")} {t(subscriptionInfo.pending_change.target_plan)}
            {subscriptionInfo.pending_change.target_billing && (
              <span className="text-xs ml-1">
                ({subscriptionInfo.pending_change.target_billing === 'monthly' ? t("monthlyBilling") : t("yearlyBilling")})
              </span>
            )}
            {t("on")} {formatDate(subscriptionInfo.pending_change.effective_at)}
          </span>
        </div>
      )}
    </div>
    
    <div className="flex flex-col gap-2 items-end">
      <Link to="/subscription">
        <Button size="sm" className="rounded-xl gap-2">
          <span>{currentPlan === "free" ? t("upgrade") : t("manageSubscription")}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  </div>
</Card>

        {/* Achievements Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t("yourAchievements")}</h2>
            </div>
           {/*  <Badge variant="outline" className="text-xs">
              {t("totalEarned")} {userStats?.total_checkin || 0} {t("badges")}
            </Badge>  */}
          </div>
          <div className="space-y-3">
            <AchievementCard 
              value={userStats?.total_conversations || 0}
              levels={ACHIEVEMENT_LEVELS.conversation.levels}
              icon={ACHIEVEMENT_LEVELS.conversation.icon}
              color={ACHIEVEMENT_LEVELS.conversation.color}
            />
            <AchievementCard 
              value={userStats?.total_essays || 0}
              levels={ACHIEVEMENT_LEVELS.essay.levels}
              icon={ACHIEVEMENT_LEVELS.essay.icon}
              color={ACHIEVEMENT_LEVELS.essay.color}
            />
            <AchievementCard 
              value={userStats?.total_listening || 0}
              levels={ACHIEVEMENT_LEVELS.listening.levels}
              icon={ACHIEVEMENT_LEVELS.listening.icon}
              color={ACHIEVEMENT_LEVELS.listening.color}
            />
            <AchievementCard 
              value={userStats?.total_qa || 0}
              levels={ACHIEVEMENT_LEVELS.qa.levels}
              icon={ACHIEVEMENT_LEVELS.qa.icon}
              color={ACHIEVEMENT_LEVELS.qa.color}
            />
          </div>
        </div>

        {/* Check-in */}
        <Card className="border-0 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <CalendarCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-base">{t("checkIn")}</h2>
                <p className="text-sm text-muted-foreground">{userStats?.total_checkin || 0} {t("checkInDaysTotal")}</p>
              </div>
            </div>
            <Button onClick={handleCheckIn} disabled={todayCheckedIn} className={todayCheckedIn ? "bg-emerald-500 text-white cursor-not-allowed rounded-xl" : "rounded-xl"}>
              {todayCheckedIn ? t("checkInDone") : t("checkIn")}
            </Button>
          </div>
        </Card>

        {/* Share Section */}
        <Card className="border-0 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">{t("shareAchievement")}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(SHARE_PLATFORMS).map(([key, platform]) => (
              <button
                key={key}
                onClick={() => handleShare(key)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${platform.color} text-white hover:opacity-90`}
              >
                <platform.icon className="w-4 h-4" />
                {platform.name}
              </button>
            ))}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-muted text-foreground hover:bg-muted/80"
            >
              <Link2 className="w-4 h-4" />
              {copied ? t("copied") : t("copyLink")}
            </button>
          </div>
        </Card>

        {/* Language Selection */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t("selectLanguage")}</h2>
          </div>
          <Card className="p-4 border-0 shadow-sm">
            <LanguageSwitcher type="learning" />
          </Card>
        </div>

        {/* Interface Language */}
        <Card className="border-0 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">{t("interfaceLanguage")}</h2>
          </div>
          <ScrollArea className="h-48">
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
            <button onClick={() => openLegalLink('/terms')} className="text-sm text-primary underline hover:no-underline bg-transparent border-none cursor-pointer p-0">
              {t("termsOfService")}
            </button>
            <button onClick={() => openLegalLink('/privacy')} className="text-sm text-primary underline hover:no-underline bg-transparent border-none cursor-pointer p-0">
              {t("privacyPolicy")}
            </button>
          </div>
        </Card>

        {/* Delete Account */}
        <Card className="border border-destructive/30 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-destructive">{t("deleteAccount")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("deleteAccountDesc")}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)} className="gap-2 rounded-xl">
              <Trash2 className="w-4 h-4" /> {t("deleteAccount")}
            </Button>
          </div>
        </Card>

        {/* Dialogs */}
        <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDowngrade")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("confirmDowngradeDesc").replace("{date}", formatDate(periodEndDate) || "")}
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
    </PullToRefresh>
  );
}