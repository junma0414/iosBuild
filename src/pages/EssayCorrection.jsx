// @ts-nocheck
// src/pages/EssayCorrection.jsx
import React, { useState, useEffect } from "react";
import { getPlanLimits } from '../lib/planUtils';
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { LEARNING_LANGUAGES } from '../lib/i18n';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2, Settings2, Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import EssayTopicCard from '../components/essay/EssayTopicCard';
import EssayEditor from '../components/essay/EssayEditor';
import { getTimezoneOffset, getLocalDateString, convertToLocalDate } from '../lib/utils';

export default function EssayCorrection() {
  const { t, learningLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedEssay, setSelectedEssay] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [manualDifficulty, setManualDifficulty] = useState(0);
  const [topic, setTopic] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const langName = LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.name || learningLanguage;
  const today = getLocalDateString();
  const timezoneOffset = getTimezoneOffset();
  const [user, setUser] = useState(null);
  const [limits, setLimits] = useState({ essays: 1 });

  const queryKey = ["essays-all", timezoneOffset];

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      const planLimits = getPlanLimits(userData);
      setLimits(planLimits);
    }).catch(() => {});
  }, []);

  // 获取所有作文
  const { data: allEssays = [], isLoading, refetch: refetchAll } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const essays = await base44.entities.Essay.filter(
        { 
          timezone_offset: timezoneOffset
        }, 
        "-created_date", 
        100
      );
      console.log('Fetched all essays count:', essays.length);
      return essays;
    },
    enabled: !!user,
    staleTime: 30000, // 30秒内不重新获取，避免覆盖手动更新
  });

  // 过滤今天的作文
  const todayEssays = (allEssays || []).filter(essay => {
    const dateField = essay.generated_date;
    if (!dateField) return false;
    const localExDate = convertToLocalDate(dateField, timezoneOffset);
    return localExDate === today;
  }).sort((a, b) => {
    return (a.sort_order || 0) - (b.sort_order || 0);
  });

  // 按日期分组的历史作文
  const groupedEssays = (allEssays || []).reduce((groups, essay) => {
    const date = essay.generated_date;
    if (!date) return groups;
    const localDate = convertToLocalDate(date, timezoneOffset);
    if (!groups[localDate]) {
      groups[localDate] = [];
    }
    groups[localDate].push(essay);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedEssays).sort((a, b) => new Date(b) - new Date(a));

  const handleGenerateTopics = async () => {
    console.log('=== 开始生成作文题目 ===');
    console.log('今日作文数量:', todayEssays.length);
    console.log('限制数量:', limits.essays);
    console.log('Today date:', today);
    
    if (todayEssays.length >= limits.essays) {
      alert(t("essayLimitReached") || `今日已达上限 ${limits.essays} 篇`);
      return;
    }
    setIsGenerating(true);

    const totalEssays = allEssays.length;
    const autoDifficulty = Math.min(5, 1 + Math.floor(totalEssays / 3));
    const difficulty = manualDifficulty > 0 ? manualDifficulty : autoDifficulty;
    const topicHint = topic.trim() ? `${t("selectTopic")}: ${topic.trim()}.` : "";
    const recentTopics = allEssays.slice(0, 15).map(e => e.topic).join("\n");

    try {
      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: learningLanguage,
        prompt: `Generate 1 unique essay topic for a ${langName} language learner.
Difficulty level: ${difficulty}/5 (${difficulty <= 2 ? "beginner: simple everyday topics" : difficulty <= 3 ? "intermediate: opinions and experiences" : "advanced: abstract, philosophical, or complex social topics"}).
${topicHint}
The topic should be written in ${langName} and require a written essay response.
IMPORTANT: Do NOT repeat or closely resemble these recent topics:\n${recentTopics}
Make it engaging. Return JSON: {"topics": ["topic1"]}`,
      });
      
      const response = aiRes.data.result;
      const generatedTopic = response.topics[0];

      console.log('生成的题目:', generatedTopic);
      
      // 创建新作文
      const newEssay = await base44.entities.Essay.create({
        topic: generatedTopic,
        target_language: learningLanguage,
        status: "pending",
        generated_date: today,
        timezone_offset: timezoneOffset,
      });

      console.log('新作文创建成功:', newEssay);
      
      // 确保新作文有正确的日期格式
      const essayWithDate = {
        ...newEssay,
        generated_date: today  // 强制使用今天的日期
      };
      
      // 只手动更新缓存，不触发后台刷新
      queryClient.setQueryData(queryKey, (oldData) => {
        const newData = oldData ? [essayWithDate, ...oldData] : [essayWithDate];
        console.log('Cache updated, new length:', newData.length);
        return newData;
      });
      
    } catch (error) {
      console.error('生成作文题目失败:', error);
      alert(t("generateFailed") || '生成失败: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitEssay = async (content) => {
    if (!selectedEssay) return;
    
    setIsReviewing(true);
    console.log('=== 开始批改作文 ===', selectedEssay.id);

    try {
      const essayLanguage = selectedEssay.target_language || learningLanguage;
      const essayLangName = LEARNING_LANGUAGES.find(l => l.code === essayLanguage)?.name || essayLanguage;
      
      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: essayLanguage,
        prompt: `You are a professional ${essayLangName} language teacher reviewing a student's essay.

Topic: ${selectedEssay.topic}
Student's Essay: ${content}

Please provide:
1. A corrected version (fix all grammar, spelling, punctuation errors).
2. Detailed feedback on quality, structure, vocabulary, and grammar.
3. A rewritten version using more native/natural ${essayLangName} expressions.
4. A score from 0-100 based on grammar (30%), vocabulary (25%), content (25%), structure (20%).

IMPORTANT: All responses must be in ${essayLangName}.
Return JSON: {"correction": "...", "feedback": "...", "better_expression": "...", "score": 85}`,
      });
      
      const response = aiRes.data.result;
      console.log('批改结果:', response);

      // 更新作文
      const updatedEssayData = {
        content: content,
        correction: response.correction,
        feedback: response.feedback,
        better_expression: response.better_expression,
        score: response.score,
        status: "reviewed",
      };
      
      await base44.entities.Essay.update(selectedEssay.id, updatedEssayData);

      console.log('更新完成，状态改为 reviewed');
      
      // 手动更新缓存中的作文数据
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(essay => 
          essay.id === selectedEssay.id 
            ? { ...essay, ...updatedEssayData }
            : essay
        );
      });
      
      // 更新选中的作文状态
      setSelectedEssay({
        ...selectedEssay,
        ...updatedEssayData
      });
      
    } catch (error) {
      console.error('批改作文失败:', error);
      alert(t("reviewFailed") || '批改失败: ' + error.message);
    } finally {
      setIsReviewing(false);
    }
  };

  // 处理返回列表
  const handleBackToList = () => {
    setSelectedEssay(null);
  };

  if (selectedEssay) {
    return (
      <EssayEditor
        essay={selectedEssay}
        onSubmit={handleSubmitEssay}
        onBack={handleBackToList}
        isReviewing={isReviewing}
      />
    );
  }

  const todayCount = todayEssays.length;
  const dailyLimit = limits.essays;
  const todayRemaining = Math.max(0, dailyLimit - todayCount);
  const todayCompleted = todayEssays.filter(e => e.status === "reviewed").length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground hidden md:block">{t("essayCorrection")}</h1>
          <p className="text-sm text-muted-foreground">
            {LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.flag} {langName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("todayRemaining")}: {todayRemaining} / {dailyLimit}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowSettings(s => !s)} className={`rounded-xl ${showSettings ? "bg-primary/10 border-primary/30" : ""}`}>
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleGenerateTopics} 
            disabled={isGenerating || todayRemaining <= 0} 
            className="gap-2 rounded-xl"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? t("generating") : t("generateTopics")}
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t("difficultyLabel") || "Difficult Level"}</p>
            <div className="flex gap-2 flex-wrap">
              {[
                {v:0, label: t("difficulty.auto") || "自动"},
                {v:1, label: "⭐ " + (t("difficultyLevel.1") || "Beginner")},
                {v:2, label: "⭐⭐ " + (t("difficultyLevel.2") || "Intermediate")},
                {v:3, label: "⭐⭐⭐ " + (t("difficultyLevel.3") || "Advanced")},
                {v:4, label: "⭐⭐⭐⭐ " + (t("difficultyLevel.4") || "Expert")},
                {v:5, label: "⭐⭐⭐⭐⭐ " + (t("difficultyLevel.5") || "Master")}
              ].map(({v,label}) => (
                <button
                  key={v}
                  onClick={() => setManualDifficulty(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${manualDifficulty === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t("selectTopic") || "Select Topic"}</p>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={t("topicPlaceholderEssay") || "e.g., technology, environment, education..."}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </motion.div>
      )}

      {/* Today's Essays */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {t("todayExercises") || "今日练习"} ({todayCount}/{dailyLimit})
          </h3>
          {todayCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {t("completed") || "已完成"}: {todayCompleted}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : todayCount === 0 ? (
          <Card className="border-0 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">{t("noEssaysYet")}</p>
            {todayRemaining > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{t("clickGenerateToStart") || "Click Generate to start"}</p>
            )}
          </Card>
        ) : (
          <div className="space-y-2">
            {todayEssays.map((essay, i) => (
              <EssayTopicCard
                key={essay.id}
                essay={essay}
                onClick={() => setSelectedEssay(essay)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      {/* 
      {sortedDates.length > 0 && (
        <div className="border-t border-border pt-6 mt-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t("history") || "历史记录"}
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {date === today ? (t("today") || "今天") : date}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {groupedEssays[date].length} {t("essays") || "篇"}
                  </Badge>
                </div>
                <div className="space-y-2 pl-6">
                  {groupedEssays[date].map(essay => (
                    <div
                      key={essay.id}
                      onClick={() => setSelectedEssay(essay)}
                      className="p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground line-clamp-1 flex-1">
                          [{essay.target_language?.toUpperCase()}] {essay.topic}
                        </p>
                        <Badge className={essay.status === "reviewed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {essay.status === "reviewed" ? (t("reviewed") || "已批改") : (t("pending") || "待批改")}
                          {essay.score && essay.status === "reviewed" && ` (${essay.score}分)`}
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground ml-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}. */}
    </div>
  );
}