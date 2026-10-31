import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { springSilk } from "@/lib/motion-theme";

export interface ProgressiveBlurHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export function ProgressiveBlurHeader({
  children,
  className,
}: ProgressiveBlurHeaderProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 24);
    });
  }, [scrollY]);

  const height = useTransform(scrollY, [0, 80], [72, 56]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 0.08]);

  return (
    <motion.header
      style={{ height }}
      transition={springSilk}
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        "backdrop-blur-[16px] saturate-[140%]",
        "bg-[#FAF6EE]/85 dark:bg-[#181614]/85",
        "border-b border-[#141210]/10",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      {/* Progressive bottom gradient mask for depth */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-3 h-3 bg-gradient-to-b from-[#141210]/[0.02] to-transparent"
        aria-hidden="true"
      />
    </motion.header>
  );
}
