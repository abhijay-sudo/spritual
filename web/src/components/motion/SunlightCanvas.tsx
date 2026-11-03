import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface SunlightCanvasProps {
  className?: string;
  moteCount?: number;
}

interface Mote {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  phase: number;
}

export function SunlightCanvas({
  className,
  moteCount = 25,
}: SunlightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize 25 organic drifting golden dust motes
    const motes: Mote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 1.8,
      speedX: 0.05 + Math.random() * 0.15,
      speedY: -0.08 - Math.random() * 0.2,
      opacity: 0.2 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.008;

      // 1. Subtle warm diagonal morning light shaft (Kangra morning glow)
      const rayGradient = ctx.createLinearGradient(0, 0, width, height);
      rayGradient.addColorStop(0, "rgba(255, 245, 220, 0.065)");
      rayGradient.addColorStop(0.35, "rgba(212, 175, 55, 0.035)");
      rayGradient.addColorStop(0.7, "rgba(250, 246, 238, 0.015)");
      rayGradient.addColorStop(1, "transparent");

      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(width * 0.1, 0);
      ctx.lineTo(width * 0.55, 0);
      ctx.lineTo(width * 0.9, height);
      ctx.lineTo(width * 0.35, height);
      ctx.closePath();
      ctx.fill();

      // 2. 25 Golden Dust Motes drifting peacefully
      for (const mote of motes) {
        mote.x += mote.speedX + Math.sin(time + mote.phase) * 0.12;
        mote.y += mote.speedY;

        // Wrap around bounds
        if (mote.y < -10) {
          mote.y = height + 10;
          mote.x = Math.random() * width;
        }
        if (mote.x > width + 10) mote.x = -10;
        if (mote.x < -10) mote.x = width + 10;

        const flicker = 0.85 + Math.sin(time * 2 + mote.phase) * 0.15;
        const currentAlpha = mote.opacity * flicker;

        ctx.fillStyle = `rgba(218, 165, 32, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Honor prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!prefersReducedMotion) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [moteCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full select-none z-10",
        className
      )}
      aria-hidden="true"
    />
  );
}
