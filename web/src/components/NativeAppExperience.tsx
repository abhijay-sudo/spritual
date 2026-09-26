import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as NativeApp } from "@capacitor/app";
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { useApp } from "../context";
import { manageNativeListener } from "../lib/nativeListeners";
import { isNativeApp } from "../lib/platform";

export function NativeAppExperience() {
  const { state, notify } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const evening =
    pathname.startsWith("/practice/") && state.readingTheme === "evening";
  useEffect(() => {
    if (!isNativeApp) return;
    document.documentElement.dataset.platform = Capacitor.getPlatform();
    void SystemBars.setStyle({
      style: evening ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
    }).catch(() => {});
  }, [evening]);
  useEffect(() => {
    if (!isNativeApp || Capacitor.getPlatform() !== "android") return;
    let active = true;
    const cleanup = manageNativeListener(
      NativeApp.addListener("backButton", ({ canGoBack }) => {
        if (!active) return;
        const dialog =
          document.querySelector<HTMLDialogElement>("dialog[open]");
        if (dialog) {
          const cancelled = !dialog.dispatchEvent(
            new Event("cancel", { cancelable: true }),
          );
          if (!cancelled) dialog.close();
        } else if (canGoBack) {
          navigate(-1);
        } else {
          void NativeApp.minimizeApp().catch(() => {
            notify(
              state.language === "hi"
                ? "ऐप से बाहर जाने के लिए फ़ोन का होम जेस्चर इस्तेमाल करें।"
                : "Use your phone’s Home gesture to leave the app.",
            );
          });
        }
      }),
    );
    return () => {
      active = false;
      cleanup();
    };
  }, [navigate, notify, state.language]);
  return null;
}
