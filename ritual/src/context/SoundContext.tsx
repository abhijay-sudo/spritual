"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playTempleBell: (pitch?: number) => void;
  playTanpura: (active: boolean) => void;
  playInkBrush: () => void;
  playPageTurn: () => void;
  isTanpuraPlaying: boolean;
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  toggleSound: () => {},
  playTempleBell: () => {},
  playTanpura: () => {},
  playInkBrush: () => {},
  playPageTurn: () => {},
  isTanpuraPlaying: false,
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isTanpuraPlaying, setIsTanpuraPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tanpuraNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("spritual_sound_opt_in");
    if (saved === "true") {
      setSoundEnabled(true);
    }
  }, []);

  const getAudioContext = (): AudioContext | null => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("spritual_sound_opt_in", String(next));
    if (next) {
      getAudioContext();
      playTempleBell(432);
    } else {
      if (isTanpuraPlaying) {
        playTanpura(false);
      }
    }
  };

  const playTempleBell = (pitch = 432) => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.998, now + 3.0);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 4.2);
  };

  const playTanpura = (active: boolean) => {
    if (!soundEnabled && active) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (!active) {
      if (tanpuraNodesRef.current) {
        const { osc1, osc2, gain } = tanpuraNodesRef.current;
        const now = ctx.currentTime;
        gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch {}
          tanpuraNodesRef.current = null;
        }, 1300);
      }
      setIsTanpuraPlaying(false);
      return;
    }

    if (tanpuraNodesRef.current) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(216, now);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(432, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 2.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    tanpuraNodesRef.current = { osc1, osc2, gain };
    setIsTanpuraPlaying(true);
  };

  const playInkBrush = () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.15);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.value = 2.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  };

  const playPageTurn = () => {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(450, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  };

  return (
    <SoundContext.Provider
      value={{
        soundEnabled,
        toggleSound,
        playTempleBell,
        playTanpura,
        playInkBrush,
        playPageTurn,
        isTanpuraPlaying,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);
