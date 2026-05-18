//@ts-nocheck

import React, { useState, useRef } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useLanguage } from "../../lib/LanguageContext";
import { startSpeechRecognition } from "../../lib/tts";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatInput({ onSend, disabled, voiceEnabled = false }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const { t, learningLanguage } = useLanguage();

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    recognitionRef.current = startSpeechRecognition(
      learningLanguage,
      (transcript, isFinal) => {
        setText(transcript);
        if (isFinal) {
          setIsRecording(false);
        }
      },
      () => setIsRecording(false)
    );

    if (!recognitionRef.current) {
      setIsRecording(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-14 left-0 right-0 flex justify-center"
          >
            <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {t("listening")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 bg-card rounded-2xl border border-border p-2 shadow-sm">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("typeMessage")}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none px-3 py-2 max-h-24 min-h-[40px]"
          style={{ overflow: "auto" }}
        />
        <div className="flex items-center gap-1">
          {voiceEnabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRecording}
              disabled={disabled}
              className={`rounded-xl h-10 w-10 ${
                isRecording ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            size="icon"
            className="rounded-xl h-10 w-10 bg-primary hover:bg-primary/90"
          >
            {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}