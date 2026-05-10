import React from "react";
import { Volume2, AlertCircle, Sparkles } from "lucide-react";
import { speak } from "../../lib/tts";
import { motion } from "framer-motion";

export default function ChatMessage({ message, learningLanguage }) {
  const isUser = message.role === "user";

  const handleSpeak = (text) => {
    speak(text, learningLanguage);
  };

  // Make individual words clickable for TTS
  const renderClickableText = (text) => {
    if (!text) return null;
    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      if (word.trim() === "") return <span key={i}>{word}</span>;
      return (
        <span
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            handleSpeak(word);
          }}
          className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-0.5 transition-colors"
        >
          {word}
        </span>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className={`max-w-[85%] ${isUser ? "order-1" : "order-1"}`}>
        {/* Main message */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border text-card-foreground rounded-bl-md shadow-sm"
          }`}
        >
          <div className="text-sm leading-relaxed">
            {isUser ? renderClickableText(message.content) : renderClickableText(message.content)}
          </div>
          {!isUser && (
            <button
              onClick={() => handleSpeak(message.content)}
              className={`mt-2 flex items-center gap-1 text-xs ${
                isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              } hover:text-primary transition-colors`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Play</span>
            </button>
          )}
        </div>

        {/* Correction */}
        {message.correction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 ml-2 p-3 rounded-xl bg-destructive/5 border border-destructive/15"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-destructive mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Correction
            </div>
            <p className="text-sm text-foreground">{renderClickableText(message.correction)}</p>
          </motion.div>
        )}

        {/* Better expression */}
        {message.better_expression && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 ml-2 p-3 rounded-xl bg-primary/5 border border-primary/15"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Native Expression
            </div>
            <p className="text-sm text-foreground">{renderClickableText(message.better_expression)}</p>
            <button
              onClick={() => handleSpeak(message.better_expression)}
              className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              Play
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}