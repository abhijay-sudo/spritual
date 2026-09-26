import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.co.spiritual.app",
  appName: "Spritual",
  webDir: "dist-native",
  backgroundColor: "#faf8f3",
  server: { androidScheme: "https" },
  android: { allowMixedContent: false },
  ios: { contentInset: "never" },
  plugins: {
    SystemBars: { style: "LIGHT", insetsHandling: "css", animation: "NONE" },
  },
};

export default config;
