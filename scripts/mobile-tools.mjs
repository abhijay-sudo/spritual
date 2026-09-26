import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, delimiter, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const androidRoot = join(projectRoot, "web", "android");

function probe(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 15_000,
    ...options,
  });
  return result.status === 0
    ? `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
    : null;
}

function children(path) {
  try {
    return readdirSync(path);
  } catch {
    return [];
  }
}

function uniquePaths(paths) {
  return [...new Set(paths.filter(Boolean).map((path) => resolve(path)))];
}

function detectJava() {
  const registered = process.platform === "darwin"
    ? probe("/usr/libexec/java_home", ["-v", "21"])
    : null;
  const candidates = uniquePaths([
    process.env.JAVA_HOME,
    registered,
    "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
    "/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home",
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home",
    ...children("/Library/Java/JavaVirtualMachines").map((entry) =>
      join("/Library/Java/JavaVirtualMachines", entry, "Contents", "Home")),
    ...children("/usr/lib/jvm").map((entry) => join("/usr/lib/jvm", entry)),
  ]);
  for (const home of candidates) {
    const java = join(home, "bin", process.platform === "win32" ? "java.exe" : "java");
    if (!existsSync(java)) continue;
    const version = probe(java, ["-version"]);
    if (version?.match(/version\s+"21(?:\.|"|-)/))
      return { home, version: version.split("\n")[0] };
  }
  return null;
}

function requiredAndroidApi() {
  try {
    const variables = readFileSync(join(androidRoot, "variables.gradle"), "utf8");
    return Number(variables.match(/compileSdkVersion\s*=\s*(\d+)/)?.[1] ?? 36);
  } catch {
    return 36;
  }
}

function detectAndroidSdk(api) {
  const candidates = uniquePaths([
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    join(homedir(), "Library", "Android", "sdk"),
    join(homedir(), "Android", "Sdk"),
    "/opt/homebrew/share/android-commandlinetools",
    "/usr/local/share/android-commandlinetools",
  ]);
  const discovered = candidates.filter((root) => existsSync(root)).map((root) => {
    const buildTools = children(join(root, "build-tools")).filter((version) =>
      existsSync(join(root, "build-tools", version, "aapt2")));
    return {
      root,
      api,
      platformReady: existsSync(join(root, "platforms", `android-${api}`, "android.jar")),
      buildTools,
      adb: join(root, "platform-tools", "adb"),
      emulator: join(root, "emulator", "emulator"),
    };
  });
  return discovered.find((sdk) => sdk.platformReady && sdk.buildTools.length) ?? discovered[0] ?? null;
}

function detectXcode() {
  if (process.platform !== "darwin")
    return { ready: false, reason: "iOS local compilation requires macOS and full Xcode." };
  const selected = probe("/usr/bin/xcode-select", ["-p"]);
  const candidates = uniquePaths([
    process.env.DEVELOPER_DIR,
    selected,
    ...["/Applications", join(homedir(), "Applications")].flatMap((root) =>
      children(root).filter((entry) => /^Xcode.*\.app$/.test(entry))
        .map((entry) => join(root, entry, "Contents", "Developer"))),
  ]);
  for (const developerDir of candidates) {
    if (!existsSync(join(developerDir, "Platforms", "iPhoneOS.platform"))) continue;
    const env = { ...process.env, DEVELOPER_DIR: developerDir };
    const version = probe("/usr/bin/xcodebuild", ["-version"], { env });
    const sdk = probe("/usr/bin/xcrun", ["--sdk", "iphoneos", "--show-sdk-path"], { env });
    if (version && sdk)
      return { ready: true, developerDir, version: version.split("\n")[0] };
  }
  return {
    ready: false,
    reason: "Full Xcode with the iOS SDK was not found. Command Line Tools alone cannot compile iOS apps or run iOS Simulator.",
  };
}

export function inspectMobileTools() {
  const java = detectJava();
  const api = requiredAndroidApi();
  const sdk = detectAndroidSdk(api);
  const androidProblems = [];
  if (!java) androidProblems.push("Java 21 is required; no usable Java 21 installation was found.");
  if (!sdk) androidProblems.push("Android SDK was not found. Set ANDROID_HOME for this process.");
  else {
    if (!sdk.platformReady) androidProblems.push(`Android platform API ${api} is missing from ${sdk.root}.`);
    if (!sdk.buildTools.length) androidProblems.push(`Android build tools are missing from ${sdk.root}.`);
  }
  for (const file of ["gradlew", "gradle/wrapper/gradle-wrapper.jar", "app/build.gradle"]) {
    if (!existsSync(join(androidRoot, file))) androidProblems.push(`Native Android project is missing ${file}.`);
  }
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor < 22) androidProblems.push("Capacitor 8 requires Node 22 or newer.");
  return {
    node: process.version,
    java,
    sdk,
    android: { ready: androidProblems.length === 0, problems: androidProblems },
    ios: detectXcode(),
  };
}

/** Environment applies to child processes only; shell profiles stay untouched. */
export function androidEnvironment(tools) {
  if (!tools.android.ready || !tools.java || !tools.sdk)
    throw new Error(tools.android.problems.join("\n"));
  return {
    ...process.env,
    JAVA_HOME: tools.java.home,
    ANDROID_HOME: tools.sdk.root,
    ANDROID_SDK_ROOT: tools.sdk.root,
    PATH: [
      join(tools.java.home, "bin"),
      join(tools.sdk.root, "platform-tools"),
      join(tools.sdk.root, "emulator"),
      process.env.PATH ?? "",
    ].join(delimiter),
  };
}
