//@ts-nocheck

import React, { useState } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Send, Loader2, ArrowLeft, Volume2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { speak } from "../../lib/tts";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export default function EssayEditor({ essay, onSubmit, onBack, isReviewing }) {
  const { t, learningLanguage } = useLanguage();
  const [content, setContent] = useState(essay.content || "");
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.trim().length;
  // For CJK languages (no spaces), use character count >= 30; otherwise word count >= 10
  const hasEnoughContent = charCount >= 30 || wordCount >= 10;

  // 判断当前语言是否是中文、日文、韩文等（主要使用字符计数的语言）
  const isCJKLanguage = () => {
    const cjkLanguages = ['zh', 'ja', 'ko'];
    return cjkLanguages.includes(learningLanguage);
  };

  const getWordCountDisplay = () => {
    if (isCJKLanguage()) {
      return `${charCount} ${t("chars") || "字"}`;
    } else {
      return `${wordCount} ${t("words") || "词"}`;
    }
  };

  const getHintText = () => {
    if (isCJKLanguage()) {
      return t("minCharsHint") || "至少30字";
    } else {
      return t("minWordsHint") || "至少10词或30字";
    }
  };

  const handleSpeak = (text) => {
    speak(text, learningLanguage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{essay.topic}</h2>
          {essay.status === "reviewed" && essay.score != null && (
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-primary/10 text-primary border-0 text-lg font-bold px-3">
                {essay.score}/100
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("essayPlaceholder")}
            disabled={essay.status === "reviewed"}
            className="w-full min-h-[200px] p-4 text-sm text-foreground bg-transparent outline-none resize-none leading-relaxed placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            {getWordCountDisplay()} · {getHintText()}
          </span>
          {essay.status !== "reviewed" && (
            <Button
              onClick={() => onSubmit(content)}
              disabled={!hasEnoughContent || isReviewing}
              className="gap-2 rounded-xl"
            >
              {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isReviewing ? t("reviewing") : t("submitEssay")}
            </Button>
          )}
        </div>
      </Card>

      {/* AI Review Results */}
      {essay.status === "reviewed" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Correction */}
          {essay.correction && (
            <Card className="border-0 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <h3 className="font-semibold text-foreground">{t("correction")}</h3>
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{essay.correction}</ReactMarkdown>
              </div>
            </Card>
          )}

          {/* Feedback */}
          {essay.feedback && (
            <Card className="border-0 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="font-semibold text-foreground">{t("aiReview")}</h3>
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{essay.feedback}</ReactMarkdown>
              </div>
            </Card>
          )}

          {/* Better Expression */}
          {essay.better_expression && (
            <Card className="border-0 shadow-sm p-5 bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">{t("betterExpression")}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSpeak(essay.better_expression)}
                  className="gap-1 text-primary"
                >
                  <Volume2 className="w-4 h-4" />
                  {t("play")}
                </Button>
              </div>
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{essay.better_expression}</ReactMarkdown>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}