"use client";

import React from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-paper-base text-paper-text">
      <span className="text-xs uppercase tracking-widest text-gold-leaf font-semibold mb-2">
        Sacred Pause
      </span>
      <h2 className="font-retelling text-3xl md:text-4xl font-medium mb-3">
        The Folio Rested Momentarily
      </h2>
      <p className="text-xs text-paper-muted max-w-md mx-auto mb-8">
        An unexpected disturbance arose in the manuscript renderer. You may gently refresh the leaf.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold uppercase tracking-wider hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full border border-gold-leaf/50 text-paper-text text-xs font-semibold uppercase tracking-wider hover:bg-gold-leaf/10"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
