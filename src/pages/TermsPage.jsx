// @ts-nocheck
// src/pages/TermsPage.jsx
import React from 'react';
import { TermsOfService } from '../components/TermsAndPrivacy';

// 直接从 localStorage 或默认获取语言
const getLanguage = () => {
  return localStorage.getItem('ui_language') || 'en';
};

export default function TermsPage() {
  const language = getLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <TermsOfService language={language} />
      </div>
    </div>
  );
}