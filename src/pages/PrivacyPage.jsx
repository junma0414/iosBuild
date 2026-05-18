// @ts-nocheck
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { PrivacyPolicy } from '../components/TermsAndPrivacy';

export default function PrivacyPage() {
  const [params] = useSearchParams();
  const lang = params.get('lang') || 'en';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <PrivacyPolicy language={lang} />
      </div>
    </div>
  );
}
