import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface PranaBreathingCanvasProps {
  className?: string;
  onPhaseChange?: (phase: "Inhale" | "Hold" | "Exhale", secondsLeft: number) => void;
}

export function PranaBreathingCanvas({
  className,
  onPhaseChange,
}: PranaBreathingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const [currentPhase, setCurrentPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);

  // Toggle Procedural Tanpura / Singing Bowl Harmonic Drone via Web Audio API
  const toggleAudio = useCallback(() => {
    if (!audioEnabled) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Base Sa (C#3 / 138.59 Hz) + Pa (G#3 / 207.65 Hz) harmonic drone
      const freqs = [138.59, 207.65, 277.18, 415.3];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = i % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Soft detune for authentic shimmer
        osc.detune.setValueAtTime((i - 1.5) * 4, ctx.currentTime);

        oscGain.gain.setValueAtTime(0.2 / (i + 1), ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        oscs.push(osc);
      });

      oscillatorsRef.current = oscs;
      setAudioEnabled(true);
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      oscillatorsRef.current = [];
      setAudioEnabled(false);
    }
  }, [audioEnabled]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // 120fps Mandala Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth * 2);
    let height = (canvas.height = canvas.offsetHeight * 2);
    ctx.scale(2, 2);

    let dprW = width / 2;
    let dprH = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * 2;
      height = canvas.height = canvas.offsetHeight * 2;
      dprW = width / 2;
      dprH = height / 2;
      ctx.scale(2, 2);
    };
    window.addEventListener("resize", handleResize);

    // Interactive pointer ripples
    const ripples: { x: number; y: number; r: number; alpha: number }[] = [];
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (ripples.length < 12) {
        ripples.push({ x, y, r: 2, alpha: 0.35 });
      }
    };

    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchmove", handlePointerMove);

    // Cycle: 4s Inhale (0-4), 2s Hold (4-6), 6s Exhale (6-12) = Total 12s
    const TOTAL_CYCLE = 12000;
    const startTime = performance.now();

    const render = (now: number) => {
      ctx.clearRect(0, 0, dprW, dprH);
      const elapsed = (now - startTime) % TOTAL_CYCLE;
      const cx = dprW / 2;
      const cy = dprH / 2;

      let expansion = 0; // 0 to 1
      let phaseName: "Inhale" | "Hold" | "Exhale" = "Inhale";
      let secondsRemaining = 4;

      if (elapsed < 4000) {
        // Inhale 4s
        phaseName = "Inhale";
        const t = elapsed / 4000;
        expansion = 0.5 - 0.5 * Math.cos(t * Math.PI); // easeInOut
        secondsRemaining = Math.ceil(4 - elapsed / 1000);
      } else if (elapsed < 6000) {
        // Hold 2s (micro shimmer)
        phaseName = "Hold";
        const holdProgress = (elapsed - 4000) / 2000;
        const shimmer = Math.sin(now * 0.006) * 0.02;
        expansion = 1.0 + shimmer;
        secondsRemaining = Math.ceil(2 - holdProgress * 2);
      } else {
        // Exhale 6s
        phaseName = "Exhale";
        const t = (elapsed - 6000) / 6000;
        expansion = 0.5 + 0.5 * Math.cos(t * Math.PI); // easeInOut
        secondsRemaining = Math.ceil(6 - (elapsed - 6000) / 1000);
      }

      setCurrentPhase(phaseName);
      setPhaseSecondsLeft(secondsRemaining);
      if (onPhaseChange) onPhaseChange(phaseName, secondsRemaining);

      // Adjust tanpura drone swell with breath
      if (gainNodeRef.current && audioCtxRef.current) {
        const targetVol = 0.05 + expansion * 0.06;
        gainNodeRef.current.gain.setTargetAtTime(targetVol, audioCtxRef.current.currentTime, 0.1);
      }

      // Draw concentric water-ripple aura
      const baseRadius = 48 + expansion * 64;
      const gradient = ctx.createRadialGradient(cx, cy, baseRadius * 0.2, cx, cy, baseRadius * 1.5);
      gradient.addColorStop(0, "rgba(212, 175, 55, 0.22)");
      gradient.addColorStop(0.5, "rgba(200, 75, 49, 0.08)");
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw 12 Lotus Petals unfurling with Kangra miniature precision
      const petalCount = 12;
      const petalLen = 32 + expansion * 52;
      const petalWidth = 14 + expansion * 10;

      ctx.save();
      ctx.translate(cx, cy);

      for (let i = 0; i < petalCount; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / petalCount);

        // Individual petal curve
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(petalWidth, petalLen * 0.35, petalWidth * 0.8, petalLen * 0.8, 0, petalLen);
        ctx.bezierCurveTo(-petalWidth * 0.8, petalLen * 0.8, -petalWidth, petalLen * 0.35, 0, 0);

        ctx.fillStyle = `rgba(200, 75, 49, ${0.12 + expansion * 0.22})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(184, 134, 11, ${0.35 + expansion * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
      }

      // Central gold lotus seed / bindu
      ctx.beginPath();
      ctx.arc(0, 0, 8 + expansion * 4, 0, Math.PI * 2);
      ctx.fillStyle = "#B8860B";
      ctx.fill();

      ctx.restore();

      // Render interactive pointer ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += 1.8;
        rip.alpha -= 0.012;

        if (rip.alpha <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212, 175, 55, ${rip.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("touchmove", handlePointerMove);
    };
  }, [onPhaseChange]);

  return (
    <div className={cn("relative flex flex-col items-center justify-center select-none", className)}>
      <canvas
        ref={canvasRef}
        className="w-full max-w-[480px] h-[400px] cursor-pointer"
        aria-label={`Breathing sanctuary: ${currentPhase} for ${phaseSecondsLeft} seconds`}
      />

      {/* Live Phase & Timer Overlay */}
      <div className="mt-4 flex flex-col items-center text-center">
        <p className="font-serif text-2xl font-medium tracking-wide text-[#141210]">
          {currentPhase}
        </p>
        <p className="mt-1 font-mono text-sm tracking-widest text-[#7A7064]">
          {phaseSecondsLeft}s
        </p>

        {/* Audio Harmonic Drone Button */}
        <button
          type="button"
          onClick={toggleAudio}
          className={cn(
            "mt-6 flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-all duration-200",
            audioEnabled
              ? "border-[#B8860B] bg-[#B8860B]/15 text-[#B8860B]"
              : "border-[#141210]/15 text-[#7A7064] hover:border-[#141210]/30 hover:text-[#141210]"
          )}
        >
          <span>{audioEnabled ? "♪ Drone Playing (Sa-Pa)" : "♪ Play Harmonic Drone"}</span>
        </button>
      </div>
    </div>
  );
}
