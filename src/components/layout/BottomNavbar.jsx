import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, PenTool, Headphones, MessageSquare } from "lucide-react";
import { useLanguage } from "../../lib/LanguageContext";

const isTabActive = (itemPath, currentPath) => {
  if (itemPath === "/") return currentPath === "/" || currentPath === "/home";
  return currentPath === itemPath;
};

const bottomNavItems = [
  { key: "home", path: "/", icon: Home },
  { key: "oralPractice", path: "/oral-practice", icon: MessageCircle },
  { key: "essayCorrection", path: "/essay-correction", icon: PenTool },
  { key: "listeningTraining", path: "/listening", icon: Headphones },
  { key: "qaTraining", path: "/qa-training", icon: MessageSquare },
];

export default function BottomNavbar() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-lg border-t border-border select-none safe-bottom">
      <div className="flex items-center justify-around h-14">
        {bottomNavItems.map((item) => {
          const isActive = isTabActive(item.path, location.pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors select-none ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "drop-shadow-sm" : ""}`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
