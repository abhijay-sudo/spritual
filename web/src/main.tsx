import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { AppProvider } from "./context";
import App from "./App";
import { AlphaOpening } from "./components/AlphaOpening";
import { AlphaWebUpdates } from "./components/AlphaWebUpdates";
import { isDesignPreview } from "./design/preferences";
const DesignPlayground = React.lazy(() => import("./design/DesignPlayground"));
const AlphaApp = React.lazy(() => import("./alpha/AlphaApp"));
function RootExperience() {
  const location = useLocation();
  // The current member journey owns the root entry on web and native.
  // Older named routes remain reachable with their saved data untouched.
  if (location.pathname === "/") return <Navigate to="/alpha" replace />;
  if (location.pathname === "/alpha" || location.pathname.startsWith("/alpha/"))
    return (
      <>
        {!Capacitor.isNativePlatform() && <AlphaWebUpdates />}
        <React.Suspense fallback={<AlphaOpening />}>
          <AlphaApp />
        </React.Suspense>
      </>
    );
  return isDesignPreview(location.pathname, location.search) ? (
    <React.Suspense
      fallback={<main className="recovery">Loading preview…</main>}
    >
      <DesignPlayground />
    </React.Suspense>
  ) : (
    <AppProvider>
      <App />
    </AppProvider>
  );
}
import "./styles.css";
import "./motion.css";
import "./collection.css";
import "./reading-theme.css";
import "./native.css";
if (Capacitor.isNativePlatform()) {
  document.documentElement.dataset.platform = Capacitor.getPlatform();
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="recovery">
          <h1>Let’s try that again.</h1>
          <p>
            {Capacitor.isNativePlatform()
              ? "Your saved reading stays in this app."
              : "Your saved reading stays in this browser."}{" "}
            फिर से प्रयास करें।
          </p>
          <button className="primary" onClick={() => window.location.reload()}>
            Reload / फिर खोलें
          </button>
          <a href="/">Back to Today / आज पर लौटें</a>
        </main>
      );
    return this.props.children;
  }
}
const root = import.meta.hot?.data.root ?? ReactDOM.createRoot(document.getElementById("root")!);
if (import.meta.hot) import.meta.hot.dispose(data => { data.root = root; });
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <RootExperience />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
