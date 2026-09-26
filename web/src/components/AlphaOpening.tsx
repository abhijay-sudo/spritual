import type { ReactNode } from "react";

/** A calm, theme-neutral handoff while the local member bundle and native bars load. */
export function AlphaOpening({ language = "en", children }: { language?: "en" | "hi"; children?: ReactNode }) {
  return (
    <main className="alpha-opening" role="status">
      {children}
      <img src="/favicon.svg" width="64" height="64" alt="" />
      <strong>Spritual</strong>
      <span>{language === "hi" ? "आज का पाठ खोल रहे हैं…" : "Opening today’s reading…"}</span>
    </main>
  );
}
