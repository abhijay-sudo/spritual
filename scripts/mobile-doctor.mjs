import { inspectMobileTools } from "./mobile-tools.mjs";

const tools = inspectMobileTools();
console.log(`Node: ${tools.node}`);
console.log(`Java 21: ${tools.java ? `${tools.java.version} (${tools.java.home})` : "not found"}`);
console.log(`Android SDK: ${tools.sdk?.root ?? "not found"}`);
if (tools.sdk) {
  console.log(`Android API ${tools.sdk.api}: ${tools.sdk.platformReady ? "installed" : "missing"}`);
  console.log(`Android build tools: ${tools.sdk.buildTools.join(", ") || "missing"}`);
}
console.log(`Android local build prerequisites: ${tools.android.ready ? "ready" : "blocked"}`);
for (const problem of tools.android.problems) console.log(`  ${problem}`);
console.log(`iOS local build prerequisites: ${tools.ios.ready ? "ready" : "blocked"}`);
console.log(tools.ios.ready ? `  ${tools.ios.version} (${tools.ios.developerDir})` : `  ${tools.ios.reason}`);
console.log("Readiness checks do not compile the app, confirm signing, or verify simulator/device execution.");
console.log("No tools, licenses, shell settings or global environment variables were changed.");
process.exitCode = tools.android.ready || tools.ios.ready ? 0 : 1;
