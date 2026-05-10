// @ts-nocheck
// src/lib/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { t as translate } from "./i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [uiLanguage, setUiLanguage] = useState(() => {
    return localStorage.getItem("ui_language") || "en";
  });
  const [learningLanguage, setLearningLanguage] = useState(() => {
    return localStorage.getItem("learning_language") || "en";
  });

  useEffect(() => {
    localStorage.setItem("ui_language", uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    localStorage.setItem("learning_language", learningLanguage);
  }, [learningLanguage]);

  const t = (key, params) => translate(key, uiLanguage, params);

  return (
    <LanguageContext.Provider value={{ uiLanguage, setUiLanguage, learningLanguage, setLearningLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}