import React, { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { springSilk } from "@/lib/motion-theme";

export interface RollingCounterProps {
  value: number;
  padTo?: number;
  className?: string;
}

function DigitColumn({ digit }: { digit: number }) {
  const animatedValue = useSpring(digit, springSilk);

  useEffect(() => {
    animatedValue.set(digit);
  }, [digit, animatedValue]);

  const y = useTransform(animatedValue, (v) => `-${v * 10}%`);

  return (
    <div className="relative inline-block h-[1em] overflow-hidden align-baseline">
      <motion.div style={{ y }} className="flex flex-col">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="flex h-[1em] items-center justify-center font-mono tabular-nums leading-none"
          >
            {n}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function RollingCounter({
  value,
  padTo = 2,
  className,
}: RollingCounterProps) {
  const strVal = String(value).padStart(padTo, "0");
  const digits = strVal.split("").map((ch) => parseInt(ch, 10));

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-mono tabular-nums tracking-wider",
        className
      )}
      aria-label={String(value)}
    >
      {digits.map((digit, i) => (
        <DigitColumn key={`digit-${i}`} digit={digit} />
      ))}
    </span>
  );
}
