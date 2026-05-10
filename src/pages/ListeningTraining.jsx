// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { getPlanLimits } from '../lib/planUtils';
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { LEARNING_LANGUAGES } from '../lib/i18n';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { speak, stopSpeaking, initSpeech } from '../lib/tts';
import { getTimezoneOffset, getLocalDateString, convertToLocalDate } from '../lib/utils';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Play, Loader2, CheckCircle2, Settings2, Square, ChevronRight, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 直接从 localStorage 获取计划限制
const getPlanLimitsFromStorage = () => {
  const plan = localStorage.getItem("lm_plan") || "free";
  const limitsMap = {
    free: { listening: 3 },
    pro: { listening: 15 },
    premium: { listening: 50 }
  };
  return limitsMap[plan] || limitsMap.free;
};

export default function ListeningTraining() {
  const { t, learningLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [manualDifficulty, setManualDifficulty] = useState(0);
  const [topic, setTopic] = useState("");
  const [voiceReady, setVoiceReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isPlayingRef = useRef(false);
  const timeoutRef = useRef(null);
  const lastLanguageRef = useRef(learningLanguage);
  const currentPlayingIdRef = useRef(null);

  const today = getLocalDateString();
  const timezoneOffset = getTimezoneOffset();
  const langName = LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.name || learningLanguage;
  const [user, setUser] = useState(null);
  
  useEffect(() => { 
    base44.auth.me().then(setUser).catch(() => {}); 
  }, []);
  
  // 从 localStorage 读取计划限制，同时尽量从 server 获取最新计划
  const limits = getPlanLimitsFromStorage();
  // 如果有 user 信息，用 server 返回的 plan 覆盖
  const effectiveLimits = user?.plan ? 
    (() => { const m = { free: { listening: 3 }, pro: { listening: 15 }, premium: { listening: 50 } }; return m[user.plan] || limits; })() 
    : limits;
  const queryKey = ["listening", learningLanguage, timezoneOffset];

  // 获取所有练习（按创建时间倒序）
  const { data: allExercises = [], isLoading, refetch: refetchExercises } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const exercises = await base44.entities.ListeningExercise.filter(
        { 
          target_language: learningLanguage,
          timezone_offset: timezoneOffset
        }, 
        "-created_date", 
        200
      );
      console.log('Fetched exercises count:', exercises.length);
      return exercises;
    },
    enabled: true,
    staleTime: 5000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 15000,

  });

  

  // 过滤今天的练习 - 按创建时间倒序（最新的在顶部）
  const todayExercises = allExercises.filter(ex => {
    const dateField = ex.generated_date;
    if (!dateField) return false;
    const localExDate = convertToLocalDate(dateField, timezoneOffset);
    return localExDate === today;
  }).sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  console.log('today string:', today);
console.log('first exercise generated_date:', allExercises[0]?.generated_date);
console.log('converted date:', convertToLocalDate(allExercises[0]?.generated_date, timezoneOffset));
console.log('todayExercises count:', todayExercises.length);

  const todayCount = todayExercises.length;
  const dailyLimit = effectiveLimits.listening;
  const todayRemaining = Math.max(0, dailyLimit - todayCount);
  const canGenerate = !isGenerating && dailyLimit > 0 && todayRemaining > 0 && !isLoading;

  const todayDone = todayExercises.filter(e => e.status === "answered").length;
  const todayCorrect = todayExercises.filter(e => e.status === "answered" && e.is_correct === true).length;
  const todayAccuracy = todayDone > 0 ? (todayCorrect / todayDone) * 100 : 0;

  // 初始化语音引擎
  useEffect(() => {
    const initVoice = async () => {
      await initSpeech();
      setVoiceReady(true);
    };
    initVoice();
  }, []);

  // 语言切换时重新初始化语音
  useEffect(() => {
    if (lastLanguageRef.current !== learningLanguage) {
      lastLanguageRef.current = learningLanguage;
      stopSpeaking();
      setIsPlaying(false);
      isPlayingRef.current = false;
      initSpeech().then(() => setVoiceReady(true));
    }
  }, [learningLanguage]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  // 获取去重的句子列表（防止重复）
  const getRecentSentences = () => {
    const recent = allExercises.slice(0, 100);
    return recent.map(e => e.sentence).join("\n");
  };

  // 根据当天准确率动态调整难度
  const getDynamicDifficulty = () => {
    if (todayDone < 3) return 3;
    if (todayAccuracy > 80) return 5;
    if (todayAccuracy > 60) return 4;
    if (todayAccuracy > 40) return 3;
    if (todayAccuracy > 20) return 2;
    return 1;
  };

  // 播放音频
  const handlePlay = (exerciseId, sentence, exerciseLanguage) => {
    if (!sentence) return;
    if (isPlayingRef.current) {
      stopSpeaking();
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
    
    if (!voiceReady) {
      alert(t("voiceInitializing"));
      return;
    }
    
    currentPlayingIdRef.current = exerciseId;
    isPlayingRef.current = true;
    setIsPlaying(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const playLanguage = exerciseLanguage || learningLanguage;
      speak(sentence, playLanguage, {
        onEnd: () => {
          if (currentPlayingIdRef.current === exerciseId) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            currentPlayingIdRef.current = null;
          }
        },
        onError: (error) => {
          console.error('Speech error:', error);
          isPlayingRef.current = false;
          setIsPlaying(false);
          currentPlayingIdRef.current = null;
        }
      });
    }, 100);
  };

  // 停止播放
  const handleStop = () => {
    stopSpeaking();
    isPlayingRef.current = false;
    setIsPlaying(false);
    currentPlayingIdRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // 关闭详情面板
  const handleCloseDetail = () => {
    setSelectedExercise(null);
    setUserAnswer("");
    setResult(null);
  };

  // 生成一条听力练习
  const handleGenerate = async () => {
    if (dailyLimit === 0) {
      alert(t("essayPlanRequired"));
      return;
    }
    
    if (todayRemaining <= 0) {
      alert(`${t("dailyListening")} ${dailyLimit} ${t("essayLimitReached")}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      const difficulty = manualDifficulty > 0 ? manualDifficulty : getDynamicDifficulty();
      const recentSentences = getRecentSentences();
      const topicHint = topic.trim() ? `${t("selectTopic")}: ${topic.trim()}.` : "";
      
      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: learningLanguage,
        prompt: `Generate 1 UNIQUE ${langName} listening exercise sentence for a language learner.
Difficulty level: ${difficulty}/5 (1=very simple short sentences, 5=complex native-level).
${topicHint}
IMPORTANT: Do NOT repeat these recent sentences:
${recentSentences}
The sentence must be in ${langName}.
Return JSON: {"sentences": ["sentence"]}`,
      });
      const response = aiRes.data.result;
      const sentence = response.sentences[0];

      console.log('Generated sentence:', sentence);

      const newExercise = await base44.entities.ListeningExercise.create({
        sentence: sentence,
        target_language: learningLanguage,
        status: "pending",
        difficulty: difficulty,
        sort_order: 0,
        generated_date: today,
        timezone_offset: timezoneOffset,
        created_at: new Date().toISOString(),
      });

      console.log('Created exercise:', newExercise);

      queryClient.setQueryData(queryKey, (oldData) => {
        const oldList = oldData || [];
        const exists = oldList.some(item => item.id === newExercise.id);
        if (exists) return oldList;
        const newData = [newExercise, ...oldList];
        console.log('Cache updated, new length:', newData.length);
        return newData;
      });

//await refetchExercises();

      
      setSelectedExercise(newExercise);
      setUserAnswer("");
      setResult(null);
      
      setTimeout(() => {
        handlePlay(newExercise.id, sentence, learningLanguage);
      }, 500);

     // await refetchExercises();

      
    } catch (error) {
      console.error('Generation error:', error);
      // 检查是否是后端限额拒绝
      if (error?.status === 429 || error?.message?.includes('limit reached')) {
        alert(t("dailyListening") + ' ' + t("essayLimitReached"));
        refetchExercises();
      } else {
        alert(t("generateFailed"));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 选择练习 - 点击同一练习收起，点击其他练习展开
  const handleSelectExercise = (exercise) => {
    handleStop();
    if (selectedExercise?.id === exercise.id) {
      // 点击同一个，收起
      setSelectedExercise(null);
      setUserAnswer("");
      setResult(null);
    } else {
      // 点击不同的，展开
      setSelectedExercise(exercise);
      setUserAnswer("");
      setResult(null);
    }
  };

  // 提交答案
  const handleSubmit = async () => {
    if (!selectedExercise || isSubmitting) return;
    
    setIsSubmitting(true);
    const isCorrect = userAnswer.trim().toLowerCase() === selectedExercise.sentence.toLowerCase();
    
    setResult({ 
      isCorrect, 
      original: selectedExercise.sentence,
      showFeedback: true 
    });
    
    if (selectedExercise.status === "pending") {
      await base44.entities.ListeningExercise.update(selectedExercise.id, {
        user_answer: userAnswer,
        status: "answered",
        is_correct: isCorrect,
      });
      
      if (isCorrect) {
        await base44.entities.Badge.create({
          type: "listening",
          name: t("badgeListening"),
          description: t("listenAndType"),
          earned_date: today,
          icon: "Headphones",
        });
      }
      
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(ex => 
          ex.id === selectedExercise.id 
            ? { ...ex, status: "answered", user_answer: userAnswer, is_correct: isCorrect }
            : ex
        );
      });
      
      setSelectedExercise(prev => ({ 
        ...prev, 
        status: "answered", 
        user_answer: userAnswer, 
        is_correct: isCorrect 
      }));
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("listeningTraining")}</h1>
          <p className="text-sm text-muted-foreground">
            {LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.flag} {langName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("todayRemaining")}: {todayRemaining} / {dailyLimit}
       {/*      {todayDone > 0 && ` | ${t("accuracy")}: ${Math.round(todayAccuracy)}%`} */}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowSettings(s => !s)} className={`rounded-xl ${showSettings ? "bg-primary/10 border-primary/30" : ""}`}>
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!canGenerate} 
            className="gap-2 rounded-xl"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isGenerating ? t("generating") : t("generateListening")}
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-card border border-border rounded-xl p-4 space-y-4"
          >
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("selectDifficulty")}</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  {v:0, label: t("difficulty.auto")},
                  {v:1, label: "⭐ " + t("difficultyLevel.1")},
                  {v:2, label: "⭐⭐ " + t("difficultyLevel.2")},
                  {v:3, label: "⭐⭐⭐ " + t("difficultyLevel.3")},
                  {v:4, label: "⭐⭐⭐⭐ " + t("difficultyLevel.4")},
                  {v:5, label: "⭐⭐⭐⭐⭐ " + t("difficultyLevel.5")}
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
              <p className="text-sm font-medium text-foreground">{t("selectTopic")}</p>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={t("topicPlaceholder")}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Exercises List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {t("todayExercises")} ({todayExercises.length}/{dailyLimit})
          </h3>
          {todayExercises.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("completed")}: {todayDone}
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {todayExercises.length === 0 ? (
            <Card className="border-0 shadow-sm p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">{t("noListeningYet")}</p>
              {canGenerate && (
                <p className="text-xs text-muted-foreground mt-2">{t("clickGenerateToStart")}</p>
              )}
            </Card>
          ) : (
            todayExercises.map((ex, idx) => (
              <div key={ex.id} className="space-y-2">
                {/* 练习卡片 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleSelectExercise(ex)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedExercise?.id === ex.id
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-card border-border hover:border-primary/20 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={ex.status === "answered" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {ex.status === "answered" ? `✓ ${t("completed")}` : `○ ${t("pending")}`}
                        </Badge>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(d => (
                            <div key={d} className={`w-1.5 h-1.5 rounded-full ${d <= (ex.difficulty || 3) ? "bg-primary" : "bg-muted"}`} />
                          ))}
                        </div>
                      </div>
                      {ex.status === "answered" ? (
                        <p className="text-sm text-foreground line-clamp-2">
                          {idx + 1}. {ex.sentence}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {idx + 1}. {t("clickToListen")}
                        </p>
                      )}
                      {ex.status === "answered" && ex.user_answer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("yourAnswer")}: {ex.user_answer}
                          {ex.is_correct ? " ✓" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(ex.id, ex.sentence, ex.target_language);
                        }}
                      >
                        {isPlaying && currentPlayingIdRef.current === ex.id ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${selectedExercise?.id === ex.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </motion.div>
                
                {/* 选中时显示的详情 */}
                {selectedExercise?.id === ex.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="pl-4 pr-2 overflow-hidden"
                  >
                    <Card className="border-0 shadow-sm p-5 space-y-4 bg-muted/20">
                      {/* 关闭按钮 */}
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseDetail}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* 完成时显示句子 */}
                      {selectedExercise.status === "answered" && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">{t("sentenceToListen")}:</p>
                          <p className="text-sm text-foreground font-medium">{selectedExercise.sentence}</p>
                        </div>
                      )}
                      
                      {/* 播放区域 */}
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/15 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {t("listenAndType")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t("clickPlayToHear")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handlePlay(selectedExercise.id, selectedExercise.sentence, selectedExercise.target_language)}
                              size="lg"
                              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                            >
                              {isPlaying && currentPlayingIdRef.current === selectedExercise.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                              )}
                            </Button>
                            {isPlaying && currentPlayingIdRef.current === selectedExercise.id && (
                              <Button
                                onClick={handleStop}
                                size="lg"
                                variant="outline"
                                className="w-14 h-14 rounded-full border-destructive text-destructive hover:bg-destructive/10"
                              >
                                <Square className="w-5 h-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 答案输入区域 */}
                      {selectedExercise.status === "pending" && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground">
                            {t("typeWhatYouHear")}
                          </label>
                          <textarea
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            placeholder={t("typeHere")}
                            disabled={!!result}
                            rows={3}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSubmit}
                              disabled={!userAnswer.trim() || isSubmitting}
                              className="flex-1"
                            >
                              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              {t("submitAnswer")}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setUserAnswer("")}
                              disabled={!userAnswer}
                            >
                              {t("clear")}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* 结果显示 */}
                      {result && result.showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-3 rounded-lg border ${result.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {result.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="font-medium text-emerald-700 text-sm">{t("correct")}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span className="font-medium text-amber-700 text-sm">{t("incorrect")}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-foreground">
                            {t("originalSentence")}: {result.original}
                          </p>
                          {!result.isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("tryAgain")}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setResult(null)}
                          >
                            {t("continue")}
                          </Button>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}