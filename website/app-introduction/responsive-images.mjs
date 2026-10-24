import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {resolve, basename} from 'node:path';
import {createHash} from 'node:crypto';

// Delivery derivatives only. Keep the retrieved art, source manifest and full-size
// URLs intact; never upscale or recrop the owner's selected illustrations.
const prepared = new Map();
const sourceRoot = resolve(import.meta.dirname, 'public');
const deliveryRoot = resolve(import.meta.dirname, 'responsive-assets');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const webPath = file => `/stories-app/${file}`;

export function prepareResponsiveImages(output) {
  const directory = resolve(output);
  if (!prepared.has(directory)) {
    const pending = copyVerifiedImages(directory).catch(error => {
      prepared.delete(directory);
      throw error;
    });
    prepared.set(directory, pending);
  }
  return prepared.get(directory);
}

// Native WebP headers are enough to verify dimensions without installing an
// image library in the dependency-free public website deployment.
function webpDimensions(bytes) {
  if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Invalid WebP container');
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const type = bytes.toString('ascii', offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > bytes.length) throw new Error('Truncated WebP chunk');
    if (type === 'VP8X' && size >= 10) return {width: bytes.readUIntLE(start + 4, 3) + 1, height: bytes.readUIntLE(start + 7, 3) + 1};
    if (type === 'VP8L' && size >= 5 && bytes[start] === 0x2f) {
      const bits = bytes.readUInt32LE(start + 1);
      return {width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1};
    }
    if (type === 'VP8 ' && size >= 10 && bytes.subarray(start + 3, start + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))) {
      return {width: bytes.readUInt16LE(start + 6) & 0x3fff, height: bytes.readUInt16LE(start + 8) & 0x3fff};
    }
    offset = start + size + (size % 2);
  }
  throw new Error('WebP dimensions unavailable');
}

function verifyImage(bytes, expected, name) {
  const dimensions = webpDimensions(bytes);
  if (bytes.length !== expected.bytes || digest(bytes) !== expected.sha256 || dimensions.width !== expected.width || dimensions.height !== expected.height) {
    throw new Error(`Responsive artwork integrity mismatch: ${name}`);
  }
}

async function copyVerifiedImages(output) {
  const manifest = JSON.parse(await readFile(resolve(import.meta.dirname, 'source-manifest.json'), 'utf8'));
  const delivery = JSON.parse(await readFile(resolve(deliveryRoot, 'manifest.json'), 'utf8'));
  const sources = Object.keys(manifest.files).filter(file => /^assets\/[a-z-]+\.webp$/.test(file)).sort();
  if (delivery.schemaVersion !== 1 || !Array.isArray(delivery.images) || JSON.stringify(delivery.images.map(image => image.source).sort()) !== JSON.stringify(sources)) {
    throw new Error('Responsive artwork manifest does not match the pinned collection');
  }
  const directory = resolve(output, 'stories-app/assets/responsive');
  await mkdir(directory, {recursive: true});
  const images = {};
  for (const record of delivery.images) {
    const file = record.source;
    const source = await readFile(resolve(sourceRoot, file));
    if (record.sha256 !== manifest.files[file]) throw new Error(`Responsive artwork source changed: ${file}`);
    verifyImage(source, record, file);
    if (!Array.isArray(record.variants) || !record.variants.length) throw new Error(`Responsive variants missing: ${file}`);
    const variants = [];
    let previousWidth = 0;
    for (const variant of record.variants) {
      const name = `${basename(file, '.webp')}-${variant.width}-${String(variant.sha256).slice(0, 12)}.webp`;
      if (variant.file !== name || !/^[a-z0-9-]+\.webp$/.test(name) || variant.width <= previousWidth || variant.width >= record.width || variant.bytes >= record.bytes) {
        throw new Error(`Invalid responsive variant: ${variant.file}`);
      }
      const data = await readFile(resolve(deliveryRoot, name));
      verifyImage(data, variant, name);
      await writeFile(resolve(directory, name), data);
      variants.push({src: `/stories-app/assets/responsive/${name}`, width: variant.width, height: variant.height, bytes: variant.bytes});
      previousWidth = variant.width;
    }
    const original = {src: webPath(file), width: record.width, height: record.height, bytes: record.bytes};
    variants.push(original);
    images[basename(file)] = {
      original,
      variants,
      src: variants.find(variant => variant.width >= 720)?.src || original.src,
      srcset: variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
    };
  }
  return images;
}

// These lengths account for object-fit:cover: a tall frame needs more of the
// landscape's intrinsic width than the visible frame width alone suggests.
export const imageSizes = Object.freeze({
  hero: '(max-width: 600px) 620px, (max-width: 700px) 720px, (max-width: 1100px) 900px, 1020px',
  landscape: 'max(100vw, 1000px)',
  card: '(max-width: 600px) calc(100vw - 67px), (max-width: 700px) calc((100vw - 63px) / 2), (max-width: 900px) calc((100vw - 91px) / 2), (max-width: 1440px) calc((100vw - 136px) / 3), 411px',
  dialog: '(max-width: 600px) calc(100vw - 20px), (max-width: 900px) 430px, 540px',
  phone: '(max-width: 700px) 280px, (max-width: 1100px) 310px, 332px',
  shelfHero: '(max-width: 700px) 640px, 900px',
  shelfCard: '(max-width: 600px) calc((100vw - 58px) / 2), (max-width: 900px) calc((100vw - 100px) / 3), 266px',
  reader: '(max-width: 700px) 320px, 440px',
});

function attribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}="[^"]*"`);
  const addition = ` ${name}="${value}"`;
  return pattern.test(tag) ? tag.replace(pattern, addition) : tag.replace(/\s*\/?>$/, addition + '>');
}

function adaptImage(tag, image, sizes, {lazy = false, lowPriority = false} = {}) {
  let result = attribute(tag, 'src', image.src);
  result = attribute(result, 'srcset', image.srcset);
  result = attribute(result, 'sizes', sizes);
  result = attribute(result, 'decoding', 'async');
  if (lazy) result = attribute(result, 'loading', 'lazy');
  if (lowPriority) result = attribute(result, 'fetchpriority', 'low');
  return result;
}

function deferImage(tag) {
  // The real request attributes stay out of the preload scanner. An inline
  // display rule keeps the empty image out of no-JS layout; the parent already
  // reserves the painting's aspect ratio. No-JS visitors see the normal image.
  let deferred = tag.replace(/\ssrc=/, ' data-deferred-src=').replace(/\ssrcset=/, ' data-deferred-srcset=');
  deferred = attribute(deferred, 'data-deferred-image', '');
  const existingStyle = tag.match(/\sstyle="([^"]*)"/)?.[1] || '';
  deferred = attribute(deferred, 'style', `${existingStyle}${existingStyle ? ';' : ''}display:none`);
  const fallback = tag.replace(/\sid="[^"]*"/, '');
  return `${deferred}<noscript>${fallback}</noscript>`;
}

export function responsiveImageHtml(html, images, {page = 'home'} = {}) {
  let hasDeferredImages = false;
  const deferred = tag => {
    hasDeferredImages = true;
    return deferImage(tag);
  };
  let result = html.replace(/<img\b[^>]*>/g, (tag, offset) => {
    const source = tag.match(/\ssrc="\/stories-app\/assets\/([a-z-]+\.webp)"/)?.[1];
    const image = images[source];
    if (!image) return tag;
    const preceding = html.slice(Math.max(0, offset - 300), offset);
    if (page === 'reader') return adaptImage(tag, image, imageSizes.reader);
    if (page === 'shelf') {
      return tag.includes('fetchpriority="high"')
        ? adaptImage(tag, image, imageSizes.shelfHero)
        : deferred(adaptImage(tag, image, imageSizes.shelfCard));
    }
    if (tag.includes('id="story-dialog-image"')) return adaptImage(tag, image, imageSizes.dialog, {lazy: true});
    if (preceding.endsWith('<figure class="invitation-painting">')) return adaptImage(tag, image, imageSizes.hero);
    if (/class="(?:experience|launch)-landscape"[^>]*>\s*$/.test(preceding)) return deferred(adaptImage(tag, image, imageSizes.landscape, {lowPriority: true}));
    if (preceding.includes('class="no-script-preview"')) {
      // JS initializes the interactive preview only near the viewport. Preserve
      // the painting for no-JS visitors without starting its request in advance.
      return deferred(adaptImage(tag, image, imageSizes.phone, {lazy: true}));
    }
    return deferred(adaptImage(tag, image, imageSizes.card));
  });
  if (page === 'home') {
    const hero = images['forest-journey.webp'];
    result = result.replace(/<link\b(?=[^>]*rel="preload")(?=[^>]*href="\/stories-app\/assets\/forest-journey.webp")[^>]*>/, `<link rel="preload" as="image" href="${hero.src}" imagesrcset="${hero.srcset}" imagesizes="${imageSizes.hero}" fetchpriority="high">`);
  }
  if (hasDeferredImages) result = result.replace('</body>', '<script src="/stories-app/responsive-loading.js" defer></script></body>');
  return result;
}

function replaceRequired(source, before, after, label) {
  if (!source.includes(before) || source.indexOf(before) !== source.lastIndexOf(before)) {
    throw new Error(`Image delivery adapter contract changed: ${label}`);
  }
  return source.replace(before, after);
}

export function responsiveIntroductionScript(file, code, images) {
  if (file === 'app.js') {
    let result = code.replace(/<img\b[^>]*>/g, tag => {
      const source = tag.match(/\ssrc="\/stories-app\/assets\/([a-z-]+\.webp)"/)?.[1];
      return images[source] ? adaptImage(tag, images[source], imageSizes.phone, {lazy: source === 'forest-sages.webp', lowPriority: source === 'forest-sages.webp'}) : tag;
    });
    const sceneAttributes = Object.fromEntries(['valmiki-manuscript.webp', 'narada-river-path.webp'].map(name => [name, `src="${images[name].src}" srcset="${images[name].srcset}" sizes="${imageSizes.phone}" decoding="async"`]));
    result = replaceRequired(result, "  'use strict';", `  'use strict';\n  let previewObserver = null;\n  const sceneImageAttributes = ${JSON.stringify(sceneAttributes)};`, 'preview image map');
    result = replaceRequired(result, `src="/stories-app/assets/' + scene.image + '"`, `' + sceneImageAttributes[scene.image] + '`, 'dynamic scene image');
    result = replaceRequired(result, '  function render(animate = false) {', '  function render(animate = false) {\n    previewObserver?.disconnect();\n    panel.dataset.previewReady = "true";', 'preview readiness');
    result = replaceRequired(result, '  render();\n})();', `  function ensurePreview() {
    if (panel.dataset.previewReady !== 'true') render();
  }
  if ('IntersectionObserver' in window) {
    previewObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) ensurePreview();
    }, {rootMargin: '200px'});
    previewObserver.observe(panel);
    panel.addEventListener('focusin', ensurePreview, {once: true});
  } else {
    ensurePreview();
  }
})();`, 'deferred preview');
    return result;
  }
  if (file === 'collection.js') {
    const names = ['rama-bow-mithila.webp', 'sita-the-furrow.webp', 'krishna-govardhana.webp', 'hanuman-ocean-leap.webp', 'shiva-ganga-descent.webp', 'dhruva-under-stars.webp'];
    const sources = Object.fromEntries(names.map(name => [name, {src: images[name].src, srcset: images[name].srcset}]));
    let result = replaceRequired(code, "  'use strict';", `  'use strict';\n  const storyImageSources = ${JSON.stringify(sources)};`, 'dialog image map');
    result = replaceRequired(result, `    const imagePath = '/stories-app/assets/' + story.image;
    if (art.getAttribute('src') !== imagePath) art.src = imagePath;`, `    const image = storyImageSources[story.image];
    const imagePath = image ? image.src : '/stories-app/assets/' + story.image;
    art.sizes = ${JSON.stringify(imageSizes.dialog)};
    if (image) art.srcset = image.srcset;
    else art.removeAttribute('srcset');
    if (art.getAttribute('src') !== imagePath) art.src = imagePath;`, 'dialog image selection');
    return result;
  }
  if (file === 'site.js') {
    let result = replaceRequired(code, `  const gallery = document.querySelector('.hero-gallery');
  let framePending = false;
  let galleryVisible = true;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      galleryVisible = entries[0].isIntersecting;
      if (galleryVisible) scheduleFrame();
    }, { rootMargin: '100px' });
    observer.observe(gallery);
  }`, '  let framePending = false;', 'unused gallery observer');
    result = replaceRequired(result, `    if (!reducedMotion.matches && window.innerWidth > 900 && galleryVisible) {
      const bounds = gallery.getBoundingClientRect();
      const stage = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      root.style.setProperty('--fan-spread', (stage * 18).toFixed(2) + 'px');
      root.style.setProperty('--fan-lift', (-stage * 12).toFixed(2) + 'px');
    } else if (reducedMotion.matches || window.innerWidth <= 900) {
      root.style.setProperty('--fan-spread', '0px');
      root.style.setProperty('--fan-lift', '0px');
    }`, '', 'unused fan scroll work');
    return result;
  }
  return code;
}
