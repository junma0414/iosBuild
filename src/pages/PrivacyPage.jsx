// @ts-nocheck
import React from 'react';
import { PrivacyPolicy } from '../components/TermsAndPrivacy';
import { useLanguage } from '../lib/LanguageContext';

export default function PrivacyPage() {
  const { uiLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <PrivacyPolicy language={uiLanguage} />
      </div>
    </div>
  );
}
