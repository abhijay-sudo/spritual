import React from "react";
import { motion, Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { springPrana } from "@/lib/motion-theme";

export interface FoliateDrawSVGProps {
  className?: string;
  size?: number;
  color?: string;
}

export function FoliateDrawSVG({
  className,
  size = 48,
  color = "#B8860B",
}: FoliateDrawSVGProps) {
  const drawVariant: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.3 },
      },
    },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={cn("inline-block select-none", className)}
      aria-hidden="true"
    >
      {/* Central stylized manuscript floriated leaf / vine curve */}
      <motion.path
        d="M20 50 C 35 20, 65 25, 75 45 C 85 65, 55 85, 35 70 C 25 60, 40 45, 50 48 C 60 52, 60 62, 52 64 C 45 66, 42 58, 48 55"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={drawVariant}
      />
      {/* Budding foliate tendril */}
      <motion.path
        d="M75 45 C 82 35, 90 40, 85 48 C 80 55, 70 52, 75 45"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        variants={drawVariant}
      />
      {/* Delicate accent dot */}
      <motion.circle
        cx="20"
        cy="50"
        r="2"
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={springPrana}
      />
    </motion.svg>
  );
}
