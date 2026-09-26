import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { androidEnvironment, androidRoot, inspectMobileTools, projectRoot } from "./mobile-tools.mjs";

const tools = inspectMobileTools();
if (!tools.android.ready) {
  console.error("Android build prerequisites are incomplete:");
  for (const problem of tools.android.problems) console.error(`  ${problem}`);
  process.exit(1);
}
const env = androidEnvironment(tools);

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, env, stdio: "inherit" });
  if (result.error) {
    console.error(`Could not start ${command}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${command} failed${result.signal ? ` (${result.signal})` : ""}. No APK was copied.`);
    process.exit(result.status ?? 1);
  }
}

console.log("Building and syncing the native web bundle…");
run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "mobile:sync"], projectRoot);
console.log("Building the Android debug application…");
run("./gradlew", ["assembleDebug", "--no-daemon"], androidRoot);

const source = join(androidRoot, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
if (!existsSync(source)) {
  console.error("Gradle completed without the expected app-debug.apk. No APK was copied.");
  process.exit(1);
}
const artifacts = join(projectRoot, "artifacts");
mkdirSync(artifacts, { recursive: true });
const output = join(artifacts, "Spritual-0.1.0-debug.apk");
copyFileSync(source, output);
console.log(`Debug APK: ${output}`);
console.log("This debug APK is for local testing, not a signed store release.");
