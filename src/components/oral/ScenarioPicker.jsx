// @ts-nocheck
// src/components/oral/ScenarioPicker.jsx
import React, { useState } from "react";
import { useLanguage } from "../../lib/LanguageContext";
import { Coffee, Briefcase, Plane, UtensilsCrossed, ShoppingBag, Users, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion } from "framer-motion";

const scenarioIcons = {
  casual: Coffee,
  business: Briefcase,
  travel: Plane,
  restaurant: UtensilsCrossed,
  shopping: ShoppingBag,
  interview: Users,
};

const scenarioColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
];

export default function ScenarioPicker({ onSelect, plan, limits }) {
  const { t } = useLanguage();
  const scenarios = Object.keys(scenarioIcons);
  const [customInput, setCustomInput] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const canCustom = limits?.customScenario;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("chooseScenario")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {scenarios.map((key, i) => {
          const Icon = scenarioIcons[key];
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(key)}
              className="group relative overflow-hidden rounded-xl p-5 text-left transition-all hover:shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${scenarioColors[i]} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <Icon className="w-7 h-7 text-primary mb-3" />
              <p className="font-medium text-sm text-foreground">{t(`scenarios.${key}`)}</p>
            </motion.button>
          );
        })}

        {/* Custom scenario tile */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: scenarios.length * 0.05 }}
          onClick={() => canCustom ? setShowCustom(true) : null}
          className={`group relative overflow-hidden rounded-xl p-5 text-left transition-all border-2 border-dashed ${canCustom ? "hover:shadow-lg border-primary/30 hover:border-primary/60 cursor-pointer" : "border-muted cursor-default opacity-60"}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 opacity-5 group-hover:opacity-10 transition-opacity" />
          <Sparkles className={`w-7 h-7 mb-3 ${canCustom ? "text-primary" : "text-muted-foreground"}`} />
          <p className="font-medium text-sm text-foreground">{t("customScenario")}</p>
          {!canCustom && <p className="text-xs text-muted-foreground mt-0.5">{t("premiumOnly")}</p>}
        </motion.button>
      </div>

      {/* Custom scenario input */}
      {showCustom && canCustom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 bg-card border border-border rounded-xl p-4"
        >
          <p className="text-sm font-medium text-foreground">{t("customScenarioPrompt")}</p>
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder={t("customScenarioPlaceholder")}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            autoFocus
            onKeyDown={e => { if (e.key === "Enter" && customInput.trim()) onSelect(customInput.trim()); }}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setShowCustom(false)}>
              {t("cancel")}
            </Button>
            <Button size="sm" className="rounded-xl flex-1" disabled={!customInput.trim()} onClick={() => onSelect(customInput.trim())}>
              {t("startPractice")}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}