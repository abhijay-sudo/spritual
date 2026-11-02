import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/context/AppProviders";
import { SiteHeader } from "@/components/ui/SiteHeader";

export const metadata: Metadata = {
  title: "Spritual — The Ritual Reading Environment for Itihasa & Purana",
  description: "A living manuscript, paced by breath. No feeds. No ads. No noise.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-paper-base text-paper-text">
        {/* SVG Ink Bleed and Glyph Distortion Filter Definitions */}
        <svg
          className="sr-only"
          aria-hidden="true"
          style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        >
          <defs>
            <filter id="sacred-ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <AppProviders>
          <SiteHeader />
          <main id="main" className="flex-1 flex flex-col">
            {children}
          </main>
          <footer className="w-full border-t border-paper-border/40 py-8 px-4 text-center text-xs text-paper-muted select-none">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <span>Spritual · A Living Manuscript for Civilisational Memory</span>
              <div className="flex items-center gap-4">
                <span>0 Advertisements</span>
                <span>·</span>
                <span>100% Private</span>
                <span>·</span>
                <span>Paced by Breath</span>
              </div>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}
