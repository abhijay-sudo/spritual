import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.env.PRODUCT_CAPTURE_DIR || 'docs/qa/full-product-baseline-2026-10-04');
await mkdir(output, { recursive: true });

const surfaces = [
  { id: 'home', url: 'http://127.0.0.1:4190/' },
  { id: 'explore-library', url: 'http://127.0.0.1:4190/library/' },
  { id: 'deity-hanuman', url: 'http://127.0.0.1:4190/characters/hanuman/' },
  { id: 'source-guide-sundara', url: 'http://127.0.0.1:4190/library/ramayana/sundara/' },
  { id: 'source-guide-sundara-saved', url: 'http://127.0.0.1:4190/library/ramayana/sundara/', prepare: page => page.locator('[data-save]').click() },
  { id: 'saved-empty', url: 'http://127.0.0.1:4190/my-reading/' },
  { id: 'alpha-today', url: 'http://127.0.0.1:5173/alpha/today' },
];
const viewports = [
  { id: 'mobile-390', width: 390, height: 844 },
  { id: 'desktop-1440', width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
const evidence = [];
try {
  for (const viewport of viewports) {
    for (const surface of surfaces) {
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('pageerror', error => consoleErrors.push(error.message));
      const response = await page.goto(surface.url, { waitUntil: 'networkidle' });
      if (surface.prepare) await surface.prepare(page);
      const h1 = await page.locator('h1').first().textContent().catch(() => null);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      const file = resolve(output, `${surface.id}-${viewport.id}.png`);
      await page.screenshot({ path: file, fullPage: true });
      evidence.push({
        surface: surface.id,
        viewport: viewport.id,
        status: response?.status() ?? null,
        title: await page.title(),
        h1: h1?.trim() || null,
        overflow,
        consoleErrors,
        screenshot: file,
      });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(evidence, null, 2));
