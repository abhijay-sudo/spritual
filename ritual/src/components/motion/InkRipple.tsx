"use client";

import React, { useState } from "react";
import { useMotionConfig } from "@/context/MotionConfigContext";

interface InkRippleProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  color?: string;
}

interface RippleState {
  x: number;
  y: number;
  id: number;
}

export function InkRipple({
  children,
  className = "",
  onClick,
  color = "rgba(184, 150, 62, 0.28)",
}: InkRippleProps) {
  const [ripples, setRipples] = useState<RippleState[]>([]);
  const { shouldAnimate } = useMotionConfig();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldAnimate("minimal")) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple: RippleState = { x, y, id: Date.now() };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 750);
    }

    if (onClick) onClick(e);
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden cursor-pointer select-none ${className}`}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full animate-ink-diffuse"
          style={{
            left: r.x - 30,
            top: r.y - 30,
            width: 60,
            height: 60,
            backgroundColor: color,
            transform: "scale(2.4)",
            filter: "blur(2px)",
          }}
        />
      ))}
      {children}
    </div>
  );
};
