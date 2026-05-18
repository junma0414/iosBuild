// @ts-nocheck
import React from 'react';
import { TermsOfService } from '../components/TermsAndPrivacy';
import { useLanguage } from '../lib/LanguageContext';

export default function TermsPage() {
  const lang = localStorage.getItem("ui_language") || 'en';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <TermsOfService language={lang} />
      </div>
    </div>
  );
}
