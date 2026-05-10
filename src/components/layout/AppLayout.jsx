import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNavbar from "./BottomNavbar";
import { useLanguage } from "../../lib/LanguageContext";

const PAGE_TITLE_KEYS = {
  "/": "home",
  "/home": "home",
  "/oral-practice": "oralPractice",
  "/essay-correction": "essayCorrection",
  "/listening": "listeningTraining",
  "/qa-training": "qaTraining",
  "/subscription": "subscription",
  "/checkout": "payNow",
  "/terms": "terms",
  "/privacy": "privacy",
};

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const titleKey = PAGE_TITLE_KEYS[location.pathname] || "home";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header — always visible, shows screen title */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-lg border-b border-border flex items-center h-14 px-3 gap-2 safe-top">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-xl hover:bg-secondary transition-colors shrink-0"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {location.pathname !== "/" && location.pathname !== "/home" && (
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-xl hover:bg-secondary transition-colors shrink-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}

        <span className="font-semibold text-base text-foreground ml-1 flex-1">{t(titleKey)}</span>

        <span className="font-bold text-lg text-primary/70">LM</span>
      </header>

      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-64 min-h-screen safe-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="p-4 pt-[60px] md:pt-4 md:p-8 pb-20 md:pb-8 max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNavbar />
    </div>
  );
}