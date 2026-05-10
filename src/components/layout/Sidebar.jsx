// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../lib/LanguageContext";
import { useAuth } from "../../lib/AuthContext";
import { Home, MessageCircle, PenTool, Crown, LogOut, Headphones, MessageSquare, User, Globe, ChevronDown } from "lucide-react";
import { UI_LANGUAGES } from "../../lib/i18n";
import { base44 } from "../../api/base44Client";
import LMlogo from "./LMlogo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const navItems = [
  { key: "home", path: "/", icon: Home },
  { key: "oralPractice", path: "/oral-practice", icon: MessageCircle },
  { key: "essayCorrection", path: "/essay-correction", icon: PenTool },
  { key: "listeningTraining", path: "/listening", icon: Headphones },
  { key: "qaTraining", path: "/qa-training", icon: MessageSquare },
  { key: "subscription", path: "/subscription", icon: Crown },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { t, uiLanguage, setUiLanguage } = useLanguage();
  const { logout } = useAuth();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const NavContent = () => (
    <div className="flex flex-col overflow-y-auto md:h-auto" style={{ height: "calc(100dvh - 3.5rem - env(safe-area-inset-top))" }}>
      
      {/* Logo */}
      <div className="px-6 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <LMlogo size={40} />
          <div>
            <h1 className="font-bold text-lg text-foreground">{t("appName")}</h1>
            <p className="text-xs text-muted-foreground">{t("appTagline")}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.path}
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-5 h-5" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* User info & Language & Logout */}
      <div className="px-3 pb-6 space-y-3 border-t border-border pt-4 mt-2 shrink-0">
        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.full_name || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.plan === "free" ? t("free") : user.plan === "pro" ? t("pro") : t("premium")}
              </p>
            </div>
          </div>
        )}

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-between w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <span>{UI_LANGUAGES.find(l => l.code === uiLanguage)?.name || "Language"}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {UI_LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setUiLanguage(lang.code)}
                className={`cursor-pointer ${uiLanguage === lang.code ? "bg-primary/10 text-primary" : ""}`}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout button */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          {t("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <NavContent />
      </aside>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmLogout")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmLogoutDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
              {t("logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}