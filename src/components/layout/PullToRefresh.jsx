import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.4, 60));
  };

  const handleTouchEnd = async () => {
    if (pullY >= 50 && onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullY(0);
    touchStartY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(pullY > 0 || isRefreshing) && (
        <div className="flex justify-center pb-2">
          <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 shadow-sm text-xs text-muted-foreground">
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : pullY * 3 }}
              transition={isRefreshing ? { repeat: Infinity, duration: 0.6, ease: "linear" } : {}}
              className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full"
            />
            {isRefreshing ? "刷新中..." : "下拉刷新"}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}