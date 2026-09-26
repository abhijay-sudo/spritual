import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as NativeApp } from "@capacitor/app";
import { Capacitor, SystemBars, SystemBarsStyle, registerPlugin } from "@capacitor/core";
import { manageNativeListener } from "../lib/nativeListeners";
import { isNativeApp } from "../lib/platform";
import { useAlpha } from "./context";

const nativeCanvas = registerPlugin<{ setAppearance(options: { appearance: "light" | "dusk" | "night" }): Promise<void> }>("AlphaCanvas");

/** Native shell behavior for the current member journey; no browser listeners. */
export function AlphaNativeExperience({ language, appearance, onReady }: { language: "en" | "hi"; appearance: "light" | "dusk" | "night"; onReady?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { localNotice } = useAlpha();
  const barQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (!isNativeApp) return;
    document.documentElement.dataset.platform = Capacitor.getPlatform();
    let active = true;
    const syncBars = async () => {
      if (!active) return;
      try {
        // On Android, the local plugin paints the canvas and icons together.
        // Capacitor's setStyle repaints the canvas pale before our next call.
        if (Capacitor.getPlatform() === "android")
          await nativeCanvas.setAppearance({ appearance });
        else
          await SystemBars.setStyle({ style: appearance === "light" ? SystemBarsStyle.Light : SystemBarsStyle.Dark });
      } catch {
        // If the native canvas bridge is unavailable, dark icons remain legible
        // against Capacitor's default pale system-bar canvas.
        if (active) await SystemBars.setStyle({ style: SystemBarsStyle.Light }).catch(() => {});
      }
      if (active) onReady?.();
    };
    barQueue.current = barQueue.current.then(syncBars, syncBars);
    return () => { active = false; };
  }, [appearance, onReady]);

  useEffect(() => {
    if (!isNativeApp || Capacitor.getPlatform() !== "android") return;
    let active = true;
    const cleanup = manageNativeListener(
      NativeApp.addListener("backButton", ({ canGoBack }) => {
        if (!active) return;
        const dialog = document.querySelector<HTMLDialogElement>("dialog[open]");
        if (dialog) {
          const cancelled = !dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
          if (!cancelled) dialog.close();
          return;
        }
        if (pathname === "/alpha/today" || pathname === "/alpha") {
          void NativeApp.minimizeApp().catch(() => localNotice(language === "hi"
            ? "ऐप से बाहर जाने के लिए फ़ोन का होम जेस्चर इस्तेमाल करें।"
            : "Use your phone’s Home gesture to leave the app."));
        } else if (canGoBack) {
          navigate(-1);
        } else {
          navigate("/alpha/today", { replace: true });
        }
      }),
    );
    return () => { active = false; cleanup(); };
  }, [language, localNotice, navigate, pathname]);

  return null;
}
