// @ts-nocheck
import React, { useState } from 'react';
import { PrivacyPolicy } from '../components/TermsAndPrivacy';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

export default function PrivacyPage() {
  const [lang, setLang] = useState('en');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Privacy Policy</h2>
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all min-h-[36px] ${
                  lang === l.code
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {l.flag} {l.name}
              </button>
            ))}
          </div>
        </div>
        <PrivacyPolicy language={lang} />
      </div>
    </div>
  );
}
