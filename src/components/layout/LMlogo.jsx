import React from "react";

export default function LMlogo({ size = 40 }) {
  return (
    <div
      className="rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.7} height={size * 0.55} viewBox="0 0 28 22" fill="none">
        {/* L */}
        <path d="M2 2 L2 20 L10 20 L10 17 L5 17 L5 2 Z" fill="white" />
        {/* M */}
        <path d="M12 20 L12 2 L16 2 L20 11 L24 2 L28 2 L28 20 L25 20 L25 8 L21 17 L19 17 L15 8 L15 20 Z" fill="white" />
      </svg>
    </div>
  );
}