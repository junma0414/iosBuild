// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { getCurrentPlan, getPlanLimits, isLanguageAllowed } from '../lib/planUtils';
import { Plus, ArrowLeft, Lock, MessageCircle, RefreshCw, Loader2 } from "lucide-react";
import { useLanguage } from '../lib/LanguageContext';
import { base44 } from '../api/base44Client';
import { LEARNING_LANGUAGES } from '../lib/i18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Link } from "react-router-dom";
import ChatMessage from '../components/oral/ChatMessage';
import ChatInput from '../components/oral/ChatInput';
import ScenarioPicker from '../components/oral/ScenarioPicker';
import { motion } from "framer-motion";
import { getTimezoneOffset, getLocalDateString, convertToLocalDate } from '../lib/utils';
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function OralPractice() {
  const { t, learningLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScenarios, setShowScenarios] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => { 
    base44.auth.me().then(setUser).catch(() => {}); 
  }, []);
  
  const plan = getCurrentPlan(user);
  const limits = getPlanLimits(user);
  const langAllowed = user !== null ? isLanguageAllowed(user, learningLanguage) : true;
  const messagesEndRef = useRef(null);
  const langName = LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.name || learningLanguage;
  const today = getLocalDateString();
  const timezoneOffset = getTimezoneOffset();
  const queryKey = ["conversations", learningLanguage, timezoneOffset];

  // 获取所有对话
  const { data: allConversations = [], isLoading: isLoadingConvs, refetch: refetchConversations } = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const convs = await base44.entities.Conversation.filter(
        { 
          target_language: learningLanguage,
          timezone_offset: timezoneOffset
        }, 
        "-created_date", 
        100
      );
      return convs || [];
    },
    enabled: !!user,
  });

  // 前端过滤今天的对话
  const todayConversations = (allConversations || []).filter(conv => {
    const dateField = conv.generated_date || conv.created_at;
    if (!dateField) return false;
    const localExDate = convertToLocalDate(dateField, timezoneOffset);
    return localExDate === today;
  }).sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(todayDate.getTime() - 86400000);
    
    if (date >= todayDate) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return '昨天';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleOpenConversation = async (conv) => {
    setConversation(conv);
    setMessages(conv.messages || []);
    setShowScenarios(false);
  };

  const handleRefresh = () => {
    refetchConversations();
  };

  // 检查自定义功能是否可用
  const isCustomScenarioAvailable = () => {
    return plan === 'premium'; // 只有 premium 可以用自定义场景
  };

  const handleStartConversation = async (scenario) => {
    // 检查是否是自定义场景
    const presetScenarios = ['casual', 'business', 'travel', 'restaurant', 'shopping', 'interview'];
    const isCustomScenario = scenario && !presetScenarios.includes(scenario);
    
    // 自定义场景且没有权限，直接返回，不做任何提示
    if (isCustomScenario && !isCustomScenarioAvailable()) {
      return;
    }
    
    if (todayConversations.length >= limits.conversations) {
      alert(t("oralLimitReached") || `今日对话已达上限 ${limits.conversations} 个`);
      return;
    }
    
    setShowScenarios(false);
    setIsLoading(true);

    try {
      const newConversation = await base44.entities.Conversation.create({
        title: scenario,
        target_language: learningLanguage,
        generated_date: today,
        timezone_offset: timezoneOffset,
        status: 'active',
        created_at: new Date().toISOString(),
      });
      
      const processedConversation = {
        ...newConversation,
        generated_date: today,
        created_at: new Date().toISOString()
      };
      
      queryClient.setQueryData(queryKey, (oldData) => {
        const oldList = oldData || [];
        const exists = oldList.some(item => item.id === processedConversation.id);
        if (exists) return oldList;
        return [processedConversation, ...oldList];
      });
      
      setConversation(processedConversation);
      setMessages([]);

      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: learningLanguage,
        prompt: `You are a language practice partner. Start a conversation in ${langName} about the topic: "${scenario}".
Greet the user warmly and ask an opening question. Keep it natural and at an intermediate level.
Respond ONLY in ${langName}. Keep your response to 2-3 sentences.
Return JSON: {"message": "your greeting here"}`,
      });
      const response = aiRes.data.result;

      const aiMsg = {
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString(),
      };
      setMessages([aiMsg]);
      await base44.entities.Conversation.update(processedConversation.id, { messages: [aiMsg] });
      
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(conv => 
          conv.id === processedConversation.id 
            ? { ...conv, messages: [aiMsg] }
            : conv
        );
      });
      
    } catch (error) {
      console.error('创建对话失败:', error);
      alert('创建对话失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text) => {
    const userMsgCount = messages.filter(m => m.role === "user").length;
    
    if (userMsgCount >= limits.messagesPerConv) {
      alert(`This conversation has reached the message limit (${limits.messagesPerConv}). Please start a new conversation.`);
      return;
    }

    const userMsg = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const chatHistory = newMessages.slice(-8).map(m => `${m.role}: ${m.content}`).join("\n");

    try {
      const aiRes = await base44.functions.invoke("aiChat", {
        type: "json",
        targetLanguage: learningLanguage,
        prompt: `You are a language practice partner having a conversation in ${langName}.

Chat history:
${chatHistory}

The user just said: "${text}"

You must:
1. Check if the user's message has any grammar or vocabulary mistakes. If yes, provide a correction.
2. Suggest a more natural/native way to express what the user said (better_expression).
3. Continue the conversation naturally in ${langName}. Keep your reply to 2-3 sentences.

IMPORTANT: Your reply MUST be entirely in ${langName}. 
The correction and better_expression should also be in ${langName}.
If the user's message is perfect, set correction to empty string.
Return JSON: {"correction": "...", "better_expression": "...", "reply": "..."}`,
      });
      const response = aiRes.data.result;

      const updatedUserMsg = {
        ...userMsg,
        correction: response.correction || "",
        better_expression: response.better_expression || "",
      };

      const aiMsg = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, updatedUserMsg, aiMsg];
      setMessages(updatedMessages);

      if (conversation) {
        await base44.entities.Conversation.update(conversation.id, { messages: updatedMessages });
        
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(conv => 
            conv.id === conversation.id 
              ? { ...conv, messages: updatedMessages }
              : conv
          );
        });
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversation(null);
    setMessages([]);
    setShowScenarios(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const LanguageLockedNotice = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
        <Lock className="w-7 h-7 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground mb-1">This language requires an upgrade</p>
        <p className="text-sm text-muted-foreground">
          {plan === "free" ? "Free plan supports Chinese/English only. Pro supports 7 major languages. Premium supports all 40+ languages." : "Pro plan supports 7 major languages. Premium supports all 40+ languages."}
        </p>
      </div>
      <Link to="/subscription">
        <Button className="rounded-xl gap-2">Upgrade to unlock</Button>
      </Link>
    </div>
  );

  const getScenarioTitle = (title) => {
    const presetScenarios = ['casual', 'business', 'travel', 'restaurant', 'shopping', 'interview'];
    const isCustom = title && !presetScenarios.includes(title);
    
    // 自定义场景且没有权限，显示锁图标
    if (isCustom && !isCustomScenarioAvailable()) {
      return `${title} 🔒`;
    }
    return title;
  };

  // 包装 ScenarioPicker，为没有权限的自定义场景添加锁
  const ScenarioPickerWithLock = () => {
    const [selectedScenario, setSelectedScenario] = useState(null);
    
    // 拦截自定义场景选择
    const handleSelect = (scenario) => {
      const presetScenarios = ['casual', 'business', 'travel', 'restaurant', 'shopping', 'interview'];
      const isCustom = scenario && !presetScenarios.includes(scenario);
      
      if (isCustom && !isCustomScenarioAvailable()) {
        // 没有权限，不执行任何操作
        return;
      }
      
      handleStartConversation(scenario);
    };
    
    return <ScenarioPicker onSelect={handleSelect} plan={plan} limits={limits} />;
  };

  if (conversation) {
    return (
      <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleNewConversation} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{conversation.title}</h1>
              <p className="text-sm text-muted-foreground">
                {LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.flag} {langName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-4 space-y-1 pr-2">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} learningLanguage={learningLanguage} />
          ))}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-start mb-4">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {limits.messagesPerConv < 999 && (
          <div className="text-xs text-center text-muted-foreground pb-1">
            {messages.filter(m => m.role === "user").length}/{limits.messagesPerConv} messages
          </div>
        )}

        <div className="pt-2">
          <ChatInput onSend={handleSend} disabled={isLoading} voiceEnabled={limits.voice} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground hidden md:block">{t("oralPractice") || "口语练习"}</h1>
          <p className="text-sm text-muted-foreground">
            {LEARNING_LANGUAGES.find(l => l.code === learningLanguage)?.flag} {langName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("todayRemaining")}: {todayConversations.length} / {limits.conversations}
          </p>
        </div>
      </div>

      {!langAllowed && <LanguageLockedNotice />}

      {langAllowed && (
        <>
          <div className="mb-6">
            <ScenarioPickerWithLock />
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">
                  {t("todayConversations") || "今日对话"} ({todayConversations.length}/{limits.conversations})
                </h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh} 
                className="h-7 w-7 p-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            {isLoadingConvs ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : todayConversations.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">{t("noConversationsYet") || "No conversation"}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("startNewConversation") || "Click Generate to create conversation"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayConversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card 
                      className="p-3 cursor-pointer hover:shadow-md transition-all border-0 shadow-sm"
                      onClick={() => handleOpenConversation(conv)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">
                            {getScenarioTitle(conv.title)}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-xs text-muted-foreground">
                              {(conv.messages?.length || 0)} {t("messages") || "messages"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatTime(conv.created_at)}
                            </p>
                            {conv.status === "completed" && (
                              <span className="text-xs text-emerald-600">{t("completed") || "Completed"}</span>
                            )}
                          </div>
                        </div>
                        <MessageCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}