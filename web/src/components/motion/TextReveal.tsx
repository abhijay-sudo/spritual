import React from "react";
import { motion, Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { springManuscript } from "@/lib/motion-theme";

export interface TextRevealProps {
  children: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  per?: "word" | "char";
  staggerDelay?: number;
  delay?: number;
}

export function TextReveal({
  children,
  className,
  as: Component = "h1",
  per = "word",
  staggerDelay = 0.035,
  delay = 0,
}: TextRevealProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 14,
      filter: "blur(6px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: springManuscript,
    },
  };

  const tokens = per === "word" ? children.split(" ") : children.split("");

  const MotionComponent = motion[Component as keyof typeof motion] as typeof motion.div;

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      className={cn("inline-block", className)}
    >
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="inline">
        {tokens.map((token, i) => (
          <motion.span
            key={`${token}-${i}`}
            variants={itemVariants}
            className="inline-block"
            style={{ willChange: "transform, opacity, filter" }}
          >
            {token}
            {per === "word" && i < tokens.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </span>
    </MotionComponent>
  );
}
