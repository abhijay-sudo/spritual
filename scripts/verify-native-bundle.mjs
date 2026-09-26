import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'web/dist-native');
const sourceHtml = await readFile(resolve(source, 'index.html'), 'utf8');
async function bundleFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      files.push(...await bundleFiles(resolve(directory, entry.name), relative + '/'));
    } else {
      assert(entry.isFile(), `Native bundle contains an unsupported entry: ${relative}`);
      files.push(relative);
    }
  }
  return files.sort();
}
const files = await bundleFiles(source);
const generatedExtras = new Set(['cordova.js', 'cordova_plugins.js']);
assert(!files.some(name => /(^|\/)(sw\.js|registerSW\.js|manifest\.webmanifest|workbox-)/.test(name)), 'Native assets must not contain a web update worker');
assert(!files.some(name => /(^|\/)river-sanctuary-v1\.png$/.test(name)), 'Ship the optimized WebP, not the original artwork PNG');
assert(!/<script[^>]+src=["']https?:\/\//.test(sourceHtml), 'Native startup must not require remote JavaScript');
assert(!/<link[^>]+rel=["']manifest/.test(sourceHtml), 'Native bundle must not install a second PWA');

for (const platform of [
  { name: 'Android', base: 'web/android/app/src/main/assets' },
  { name: 'iOS', base: 'web/ios/App/App' },
]) {
  const base = resolve(root, platform.base);
  const config = JSON.parse(await readFile(resolve(base, 'capacitor.config.json'), 'utf8'));
  assert.equal(config.appId, 'in.co.spiritual.app');
  assert(!config.server?.url, `${platform.name} must boot bundled assets, not the Mac's server`);
  assert(!config.server?.allowNavigation?.length, 'External sources must remain outside the privileged app view');
  assert(!config.android?.allowMixedContent);
  const synced = resolve(base, 'public');
  const syncedFiles = await bundleFiles(synced);
  assert.deepEqual(syncedFiles.filter(name => !generatedExtras.has(name)), files.filter(name => !generatedExtras.has(name)), `${platform.name}: missing or unexpected bundled files`);
  for (const name of files) {
    assert.deepEqual(await readFile(resolve(synced, name)), await readFile(resolve(source, name)), `${platform.name}: stale ${name}`);
  }
}
const manifest = await readFile(resolve(root, 'web/android/app/src/main/AndroidManifest.xml'), 'utf8');
assert(manifest.includes('android:allowBackup="false"'));
assert(manifest.includes('android:usesCleartextTraffic="false"'));
assert(manifest.includes('android:dataExtractionRules="@xml/data_extraction_rules"'));
const pluginConfig = JSON.parse(await readFile(resolve(root, 'web/android/app/src/main/assets/capacitor.plugins.json'), 'utf8'));
assert.deepEqual(pluginConfig.map(plugin => plugin.pkg).sort(), ['@capacitor/app', '@capacitor/haptics', '@capacitor/share']);
console.log(`Native bundle checks passed: ${files.length} files recursively byte-matched on both platforms (including artwork and fonts), offline startup, no PWA worker, restricted navigation and Android privacy defaults.`);
