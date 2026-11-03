"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { charactersData, CharacterProfile } from "@/lib/data/characters";
import { useMotionConfig } from "@/context/MotionConfigContext";
import { useSound } from "@/context/SoundContext";
import { X, Volume2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ConstellationProps {
  onSelectCharacter?: (slug: string) => void;
  className?: string;
}

export function ConstellationNode({
  onSelectCharacter,
  className = "",
}: ConstellationProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedChar, setSelectedChar] = useState<CharacterProfile | null>(null);
  const { shouldAnimate, prefersReducedMotion } = useMotionConfig();
  const { playTempleBell, soundEnabled } = useSound();

  const chars = Object.values(charactersData);

  useEffect(() => {
    if (!mountRef.current || prefersReducedMotion) return;

    const width = mountRef.current.clientWidth || 800;
    const height = 480;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    mountRef.current.appendChild(renderer.domElement);

    // Character Celestial Node Positions in Hexagonal Dharma Circle
    const radius = 6.5;
    const nodeObjects: { mesh: THREE.Mesh; slug: string; pos: THREE.Vector3 }[] = [];
    const positions: THREE.Vector3[] = [];

    chars.forEach((c, i) => {
      const angle = (i / chars.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.65);
      const pos = new THREE.Vector3(x, y, 0);
      positions.push(pos);

      // Node sphere
      const geometry = new THREE.SphereGeometry(0.35, 24, 24);
      const material = new THREE.MeshBasicMaterial({ color: 0xb8963e });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(pos);
      scene.add(mesh);

      // Outer halo ring
      const ringGeo = new THREE.RingGeometry(0.48, 0.54, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf6d365,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      scene.add(ringMesh);

      nodeObjects.push({ mesh, slug: c.slug, pos });
    });

    // Connecting Dharma Tension Lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xb8963e,
      transparent: true,
      opacity: 0.25,
    });

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([positions[i], positions[j]]);
        const line = new THREE.Line(lineGeo, lineMaterial);
        scene.add(line);
      }
    }

    // Particle flow along celestial paths
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const pCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pCoords[i] = (Math.random() - 0.5) * 14;
      pCoords[i + 1] = (Math.random() - 0.5) * 10;
      pCoords[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pCoords, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xf4ede2,
      size: 0.08,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, pMat);
    scene.add(particles);

    // Animation loop (60fps target)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (shouldAnimate("full")) {
        // Slow celestial rotation
        scene.rotation.z = Math.sin(elapsedTime * 0.15) * 0.05;
        particles.rotation.y = elapsedTime * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth || 800;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [chars, prefersReducedMotion, shouldAnimate]);

  const selectCharacter = (slug: string) => {
    const char = charactersData[slug];
    if (char) {
      setSelectedChar(char);
      playTempleBell(480);
      if (onSelectCharacter) onSelectCharacter(slug);
    }
  };

  return (
    <div className={`relative w-full rounded-2xl border border-paper-border/60 bg-paper-base/40 overflow-hidden ${className}`}>
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[480px] flex items-center justify-center cursor-pointer"
        aria-hidden="true"
      />

      {/* Accessible Interactive Overlay for Screen Readers & Keyboard Navigation */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-leaf font-medium">
              Interactive Constellation
            </p>
            <h3 className="font-retelling text-xl text-paper-text">
              Six Archetypes of Dharma
            </h3>
          </div>
          <span className="text-[11px] text-paper-muted hidden md:inline-block">
            Connected by cosmic ethical tensions
          </span>
        </div>

        {/* Keyboard-navigable node pill buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pointer-events-auto">
          {chars.map((c) => (
            <button
              key={c.slug}
              onClick={() => selectCharacter(c.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedChar?.slug === c.slug
                  ? "bg-gold-leaf text-ink-black border-gold-leaf shadow-md"
                  : "bg-paper-base/90 text-paper-text border-paper-border hover:border-gold-leaf"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Character Tension Side Drawer */}
      {selectedChar && (
        <div
          role="region"
          aria-label={`Character Profile: ${selectedChar.name}`}
          className="absolute inset-y-0 right-0 w-full md:w-96 p-6 bg-paper-base/98 border-l border-paper-border shadow-2xl backdrop-blur-lg flex flex-col justify-between z-20 animate-fade-in"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-gold-leaf font-semibold">
                Character Sanctuary
              </span>
              <button
                onClick={() => setSelectedChar(null)}
                className="p-1 rounded-full text-paper-muted hover:text-paper-text"
                aria-label="Close character preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="font-retelling text-3xl text-paper-text mb-1">
              {selectedChar.name}
            </h4>
            <p className="text-xs italic text-paper-muted mb-4">
              {selectedChar.epithet}
            </p>

            {/* Core Tension */}
            <div className="p-4 rounded-xl bg-parchment-warm/70 border border-gold-leaf/25 my-4">
              <span className="text-[10px] uppercase tracking-wider text-terracotta font-bold">
                Core Dharma Tension
              </span>
              <p className="font-retelling text-base text-paper-text font-medium mt-1">
                {selectedChar.coreTension}
              </p>
            </div>

            {/* Sanskrit Inscription */}
            <div className="my-3">
              <p className="font-sanskrit text-sm text-paper-text leading-relaxed whitespace-pre-line">
                {selectedChar.sanskritInvocation}
              </p>
              <p className="font-retelling text-xs italic text-paper-muted mt-1">
                “{selectedChar.invocationTranslation}”
              </p>
            </div>

            {/* Audio Prologue Note */}
            {soundEnabled && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gold-leaf/10 border border-gold-leaf/20 my-3 text-xs text-gold-leaf">
                <Volume2 className="w-4 h-4 flex-shrink-0" />
                <span>{selectedChar.audioPrologueNote}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-paper-border">
            <Link
              href={`/characters/${selectedChar.slug}`}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold-leaf text-ink-black font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <span>Explore {selectedChar.name}&apos;s Sacred Arc</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
