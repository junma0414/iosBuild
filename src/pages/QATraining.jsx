// @ts-nocheck
import React, { useState, useEffect } from "react";
import { getPlanLimits } from '../lib/planUtils';
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { LEARNING_LANGUAGES } from '../lib/i18n';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { speak } from '../lib/tts';
import { getTimezoneOffset, getLocalDateString, convertToLocalDate } from '../lib/utils';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Loader2, Volume2, ChevronRight, Sparkles, Settings2, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QATraining() {
  const { t, learningLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [manualDifficulty, setManualDifficulty] = useState(0);
  const [topic, setTopic] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const today = getLocalDateString();
  const timezoneOffset = getTimezoneOffset();
  const langName = LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.name || learningLanguage;
  const [user, setUser] = useState(null);
  
  useEffect(() => { 
    base44.auth.me().then(setUser).catch(() => {}); 
  }, []);
  
  const limits = getPlanLimits(user);
  const queryKey = ["qa", learningLanguage, timezoneOffset];

  // 获取所有题目
  const { data: allExercises = [], isLoading } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const exercises = await base44.entities.QAExercise.filter(
        { 
          target_language: learningLanguage,
          timezone_offset: timezoneOffset
        }, 
        "-created_date", 
        100
      );
      return exercises;
    },
    enabled: true,
      staleTime: 30000,        // 添加：30秒内不重新获取（与 EssayCorrection 一致）

  });

  // 过滤今天的题目
  const todayExercises = (allExercises || []).filter(ex => {
    const dateField = ex.generated_date;
    if (!dateField) return false;
    const localExDate = convertToLocalDate(dateField, timezoneOffset);
    return localExDate === today;
  }).sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // 按日期分组的历史题目
  const groupedExercises = (allExercises || []).reduce((groups, ex) => {
    const date = ex.generated_date;
    if (!date) return groups;
    const localDate = convertToLocalDate(date, timezoneOffset);
    if (!groups[localDate]) {
      groups[localDate] = [];
    }
    groups[localDate].push(ex);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedExercises).sort((a, b) => new Date(b) - new Date(a));

  const handleGenerate = async () => {
    if (limits.qa === 0) {
      alert(t("essayPlanRequired"));
      return;
    }
    if (todayExercises.length >= limits.qa) {
      alert(`${t("dailyQA")} ${limits.qa} ${t("essayLimitReached")}`);
      return;
    }
    setIsGenerating(true);
    
    const totalDone = allExercises.filter(e => e.status === "answered").length;
    const autoDifficulty = Math.min(5, 1 + Math.floor(totalDone / 4));
    const difficulty = manualDifficulty > 0 ? manualDifficulty : autoDifficulty;
    const topicHint = topic.trim() ? `${t("selectTopic")}: ${topic.trim()}.` : "";
    const recentQuestions = allExercises.slice(0, 20).map(e => e.question).join("\n");

    try {
      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: learningLanguage,
        prompt: `Generate 1 conversation question in ${langName} for a language learner.
Difficulty: ${difficulty}/5. ${topicHint} Open-ended, do NOT repeat:\n${recentQuestions}
All in ${langName}.
Return JSON: {"questions": ["question1"]}`,
      });
      const response = aiRes.data.result;
      const question = response.questions[0];

      const newExercise = await base44.entities.QAExercise.create({
        question,
        target_language: learningLanguage,
        status: "pending",
        generated_date: today,
        difficulty,
        created_at: new Date().toISOString(),
      });

      queryClient.setQueryData(queryKey, (oldData) => {
        const oldList = oldData || [];
        const newData = [newExercise, ...oldList];
        return newData;
      });

      setSelectedExercise(newExercise);
      setUserAnswer("");
      setResult(null);
      
    } catch (error) {
      console.error('Generation error:', error);
      alert(t("generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  // 点击同一练习收起/展开
  const handleSelectExercise = (exercise) => {
    if (selectedExercise?.id === exercise.id) {
      setSelectedExercise(null);
      setUserAnswer("");
      setResult(null);
    } else {
      setSelectedExercise(exercise);
      setUserAnswer(exercise.user_answer || "");
      setResult(exercise.status === "answered" ? {
        correction: exercise.ai_correction,
        native_expression: exercise.native_expression
      } : null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedExercise(null);
    setUserAnswer("");
    setResult(null);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedExercise || isChecking) return;
    setIsChecking(true);

    try {
      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: learningLanguage,
        prompt: `You are a ${langName} language teacher.
Question: ${selectedExercise.question}
Student's answer: ${userAnswer}

Please:
1. Correct any grammar/vocabulary mistakes. Write the corrected version.
2. Rewrite in a more natural, native-level ${langName}.
3. If the answer is already perfect, set correction to empty string.
All responses must be in ${langName}.
Return JSON: {"correction": "...", "native_expression": "..."}`,
      });
      const response = aiRes.data.result;

      await base44.entities.QAExercise.update(selectedExercise.id, {
        user_answer: userAnswer,
        ai_correction: response.correction,
        native_expression: response.native_expression,
        status: "answered",
      });

      await base44.entities.Badge.create({
        type: "qa",
        name: t("badgeQA"),
        description: t("qaTraining"),
        earned_date: today,
        icon: "MessageSquare",
      });

      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(ex => 
          ex.id === selectedExercise.id 
            ? { ...ex, user_answer: userAnswer, ai_correction: response.correction, native_expression: response.native_expression, status: "answered" }
            : ex
        );
      });

      setResult({
        correction: response.correction,
        native_expression: response.native_expression
      });
      
      setSelectedExercise(prev => ({ 
        ...prev, 
        user_answer: userAnswer, 
        ai_correction: response.correction, 
        native_expression: response.native_expression, 
        status: "answered" 
      }));
      
    } catch (error) {
      console.error('Submit error:', error);
      alert(t("submitFailed"));
    } finally {
      setIsChecking(false);
    }
  };

  const todayCount = todayExercises.length;
  const dailyLimit = limits.qa;
  const todayRemaining = Math.max(0, dailyLimit - todayCount);
  const todayCompleted = todayExercises.filter(e => e.status === "answered").length;

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("qaTraining")}</h1>
          <p className="text-sm text-muted-foreground">
            {LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.flag} {langName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("todayRemaining")}: {todayRemaining} / {dailyLimit}
            {todayCompleted > 0 && ` | ${t("completed")}: ${todayCompleted}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowHistory(!showHistory)} className={`rounded-xl ${showHistory ? "bg-primary/10 border-primary/30" : ""}`}>
            <Sparkles className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(s => !s)} className={`rounded-xl ${showSettings ? "bg-primary/10 border-primary/30" : ""}`}>
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || todayRemaining <= 0} 
            className="gap-2 rounded-xl"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? t("generating") : t("generateQA")}
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("selectDifficulty")}</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  {v:0, label: t("difficultyAuto")},
                  {v:1, label: "⭐ " + t("difficultyLevel1")},
                  {v:2, label: "⭐⭐ " + t("difficultyLevel2")},
                  {v:3, label: "⭐⭐⭐ " + t("difficultyLevel3")},
                  {v:4, label: "⭐⭐⭐⭐ " + t("difficultyLevel4")},
                  {v:5, label: "⭐⭐⭐⭐⭐ " + t("difficultyLevel5")}
                ].map(({v,label}) => (
                  <button key={v} onClick={() => setManualDifficulty(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${manualDifficulty === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("selectTopic")}</p>
              <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder={t("topicPlaceholder")} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Exercises List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">
            {t("todayExercises")} ({todayCount}/{dailyLimit})
          </h3>
          {todayCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {t("completed")}: {todayCompleted}
            </Badge>
          )}
        </div>

        {todayCount === 0 ? (
          <Card className="border-0 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground">{t("noQAYet")}</p>
            {todayRemaining > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{t("clickGenerateToStart")}</p>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {todayExercises.map((ex, idx) => (
              <div key={ex.id} className="space-y-2">
                {/* 题目卡片 */}
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
                      <p className="text-sm text-foreground line-clamp-2">
                        {idx + 1}. {ex.question}
                      </p>
                      {ex.status === "answered" && ex.user_answer && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {t("yourAnswer")}: {ex.user_answer.substring(0, 60)}...
                        </p>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground ml-3 transition-transform ${selectedExercise?.id === ex.id ? 'rotate-90' : ''}`} />
                  </div>
                </motion.div>

                {/* 选中时显示的详情 - 不重复显示问题 */}
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
                        <Button variant="ghost" size="sm" onClick={handleCloseDetail} className="h-8 w-8 p-0 rounded-full">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* 问题已经在上面的卡片显示，这里不再重复 */}

                      {/* 已完成的显示结果 / 未完成的显示输入框 */}
                      {selectedExercise.status === "answered" && result ? (
                        <div className="space-y-3">
                          {result.correction && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 mb-2">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {t("correction")}
                              </div>
                              <p className="text-sm text-foreground">{result.correction}</p>
                            </div>
                          )}
                          {result.native_expression && (
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                  <Sparkles className="w-3.5 h-3.5" /> {t("betterExpression")}
                                </div>
                                <button onClick={() => speak(result.native_expression, learningLanguage)} className="text-primary">
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-foreground">{result.native_expression}</p>
                            </div>
                          )}
                          <Button variant="outline" onClick={handleCloseDetail} className="w-full">
                            {t("close")}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground">
                            {t("yourAnswer")}
                          </label>
                          <textarea
                            value={userAnswer}
                            onChange={e => setUserAnswer(e.target.value)}
                            placeholder={t("typeAnswerHere")}
                            rows={4}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSubmitAnswer}
                              disabled={!userAnswer.trim() || isChecking}
                              className="flex-1 gap-2"
                            >
                              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                              {isChecking ? t("reviewing") : t("submitAnswer")}
                            </Button>
                            <Button variant="outline" onClick={handleCloseDetail}>
                              {t("cancel")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      {showHistory && sortedDates.length > 0 && (
        <div className="border-t border-border pt-6 mt-4">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t("history")}
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {date === today ? t("today") : date}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {groupedExercises[date].length} {t("questions")}
                  </Badge>
                </div>
                <div className="space-y-2 pl-6">
                  {groupedExercises[date].map(ex => (
                    <div
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex)}
                      className="p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground line-clamp-1 flex-1">
                          {ex.question}
                        </p>
                        <Badge className={ex.status === "answered" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                          {ex.status === "answered" ? t("completed") : t("pending")}
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
      )}
    </div>
  );
}