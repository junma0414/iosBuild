// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import { SUPPORTED_LANGUAGES, LEARNING_LANGUAGES } from "../../lib/i18n";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../../components/ui/drawer";
import { ChevronDown, Lock } from "lucide-react";
import { base44 } from "../../api/base44Client";
import { getAllowedLanguages } from "../../lib/planUtils";

function LanguageList({ languages, current, onSelect, allowedCodes, onLanguageClick }) {

  const { t } = useLanguage();

  return (
    <ScrollArea className="h-64">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 p-1">
        {languages.map((lang) => {
          const locked = allowedCodes !== null && !allowedCodes.includes(lang.code);
          return (
            <button
              key={lang.code}
              onClick={() => { if (!locked) { onLanguageClick(lang.code); onSelect?.(); } }}
              className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-all min-h-[44px] relative ${
                locked
                  ? "opacity-40 cursor-not-allowed text-muted-foreground"
                  : current === lang.code
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-secondary text-foreground"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="truncate flex-1 text-left">{lang.name}</span>
              {locked && <Lock className="w-3 h-3 shrink-0" />}
            </button>
          );
        })}
      </div>
      {allowedCodes !== null && (
        <p className="text-xs text-muted-foreground text-center py-2 px-4">
          🔒 {t("upgradeToUnlock")}
        </p>
      )}
    </ScrollArea>
  );
}

export default function LanguageSwitcher({ type = "ui" }) {
  const { uiLanguage, setUiLanguage, learningLanguage, setLearningLanguage } = useLanguage();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const uiLangs = SUPPORTED_LANGUAGES.filter(l => ["en","zh","ja","ko","es","fr","de","it","pt","ru","ar","hi","tr","vi","th"].includes(l.code));
  const languages = type === "ui" ? uiLangs : LEARNING_LANGUAGES;
  const current = type === "ui" ? uiLanguage : learningLanguage;
  const setter = type === "ui" ? setUiLanguage : setLearningLanguage;

  // Only restrict learning language selection, not UI language
  const allowedCodes = type === "learning" ? getAllowedLanguages(user) : null;

  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selectedRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSelectLanguage = (code) => {
    setter(code);
    setDrawerOpen(false);
  };

  const currentLang = useMemo(() => languages.find(l => l.code === current), [languages, current]);

  if (isMobile) {
    return (
      <Drawer open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) selectedRef.current = false; }}>
        <DrawerTrigger asChild>
          <button
            className="flex items-center gap-2 w-full px-3 py-3 rounded-xl border border-border bg-secondary text-sm font-medium text-foreground min-h-[44px]"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <span className="text-base">{currentLang?.flag}</span>
            <span className="flex-1 text-left">{currentLang?.name}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{type === "ui" ? "Interface Language" : "Learning Language"}</DrawerTitle>
          </DrawerHeader>
          <div className="pb-safe px-4 pb-6">
            <LanguageList
              languages={languages}
              current={current}
              onSelect={() => setDrawerOpen(false)}
              allowedCodes={allowedCodes}
              onLanguageClick={handleSelectLanguage}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <LanguageList languages={languages} current={current} allowedCodes={allowedCodes} onLanguageClick={(code) => setter(code)} />
  );
}