import sharp from "sharp";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const original = await readFile(
  resolve(root, "web/public/favicon.svg"),
  "utf8",
);
const symbol = original.match(/<g[\s\S]*<\/g>/)?.[0];
if (!symbol) throw new Error("Brand symbol not found");
const svg = (body) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">${body}</svg>`,
  );
const icon = svg(
  `<rect width="108" height="108" fill="#243d32"/><g transform="translate(22 22)">${symbol}</g>`,
);
const foreground = svg(`<g transform="translate(22 22)">${symbol}</g>`);
const res = resolve(root, "web/android/app/src/main/res");
for (const [density, scale] of Object.entries({
  mdpi: 1,
  hdpi: 1.5,
  xhdpi: 2,
  xxhdpi: 3,
  xxxhdpi: 4,
})) {
  for (const name of ["ic_launcher", "ic_launcher_round"]) {
    await sharp(icon)
      .resize(48 * scale)
      .png()
      .toFile(resolve(res, `mipmap-${density}/${name}.png`));
  }
  await sharp(foreground)
    .resize(108 * scale)
    .png()
    .toFile(resolve(res, `mipmap-${density}/ic_launcher_foreground.png`));
}
// Replace template launch bitmaps at their existing dimensions; never stretch the symbol.
for (const directory of await readdir(res)) {
  if (!directory.startsWith("drawable")) continue;
  const path = resolve(res, directory, "splash.png");
  let metadata;
  try {
    metadata = await sharp(path).metadata();
  } catch {
    continue;
  }
  const size = Math.max(
    48,
    Math.round(Math.min(metadata.width, metadata.height) * 0.19),
  );
  await sharp({
    create: {
      width: metadata.width,
      height: metadata.height,
      channels: 3,
      background: "#faf8f3",
    },
  })
    .composite([
      {
        input: await sharp(icon).resize(size).png().toBuffer(),
        gravity: "centre",
      },
    ])
    .png()
    .toFile(path);
}
const ios = resolve(root, "web/ios/App/App/Assets.xcassets");
await sharp(icon)
  .resize(1024)
  .removeAlpha()
  .png()
  .toFile(resolve(ios, "AppIcon.appiconset/AppIcon-512@2x.png"));
const splash = await sharp({
  create: { width: 2732, height: 2732, channels: 3, background: "#faf8f3" },
})
  .composite([
    {
      input: await sharp(icon).resize(300).png().toBuffer(),
      gravity: "centre",
    },
  ])
  .png()
  .toBuffer();
for (const name of [
  "splash-2732x2732.png",
  "splash-2732x2732-1.png",
  "splash-2732x2732-2.png",
]) {
  await writeFile(resolve(ios, "Splash.imageset", name), splash);
}
console.log(
  "Android and iOS brand assets generated from the existing local symbol.",
);
