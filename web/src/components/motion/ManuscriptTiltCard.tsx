import React, { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { springManuscript } from "@/lib/motion-theme";

export interface ManuscriptTiltCardProps {
  children?: React.ReactNode;
  className?: string;
  maxTilt?: number;
  specular?: boolean;
}

export function ManuscriptTiltCard({
  children,
  className,
  maxTilt = 5,
  specular = true,
}: ManuscriptTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springX = useSpring(mouseX, springManuscript);
  const springY = useSpring(mouseY, springManuscript);

  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);

  const specularX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const specularY = useTransform(springY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-[#F3ECE0] border border-[#141210]/10 shadow-sm transition-shadow duration-300 hover:shadow-xl",
        className
      )}
    >
      {children}

      {/* Radial Gold-Leaf Specular Highlight */}
      {specular && isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 350px at ${specularX.get()} ${specularY.get()}, rgba(212, 175, 55, 0.14), transparent 80%)`,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
