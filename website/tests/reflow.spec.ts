import { expect, test } from '@playwright/test';

test('critical surfaces reflow at 200% before web fonts are available', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.route('**/*.woff2', route => route.abort());

  const cases = [
    {
      path: '/',
      zoom: 'body{font-size:200%} p,li,button,a{font-size:1em!important}',
      probes: ['#main', 'h1', '.hero-actions'],
    },
    {
      path: '/read/across-the-ocean/',
      zoom: '.reader-stage{font-size:200%}.reader-stage p,.reader-stage a,.reader-stage strong,.reader-stage span,.reader-stage summary{font-size:1em!important;line-height:1.55!important}',
      probes: ['.reader-stage', '.reader-column', '[data-reader-scene="the-edge"]'],
    },
  ];

  for (const current of cases) {
    await page.goto(current.path, { waitUntil: 'domcontentloaded' });
    // Remove the decorative bleed guard for this assertion: content must reflow
    // intrinsically even while the local display fonts are unavailable.
    await page.addStyleTag({ content: 'html,body{overflow-x:visible!important}' });
    await page.addStyleTag({ content: current.zoom });

    const layout = await page.evaluate(probes => ({
      viewport: innerWidth,
      root: document.documentElement.scrollWidth,
      probes: probes.map(selector => {
        const rect = document.querySelector(selector)!.getBoundingClientRect();
        return { selector, left: rect.left, right: rect.right, width: rect.width };
      }),
    }), current.probes);

    expect(layout.root, `${current.path} cold-font root width`).toBeLessThanOrEqual(layout.viewport);
    for (const probe of layout.probes) {
      expect(probe.left, `${current.path} ${probe.selector} left edge`).toBeGreaterThanOrEqual(-0.5);
      expect(probe.right, `${current.path} ${probe.selector} right edge`).toBeLessThanOrEqual(layout.viewport + 0.5);
      expect(probe.width, `${current.path} ${probe.selector} readable width`).toBeGreaterThan(120);
    }
  }
});
