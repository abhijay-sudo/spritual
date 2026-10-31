import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import {resolve, relative, extname, dirname, sep} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chapters, collectionHome, chapterRoute, revision} from './model.mjs';
import {publicBooks} from '../../books/model.mjs';

const ORIGIN = 'https://spritual.co.in';
const SAME_SITE = new Set(['spritual.co.in', 'www.spritual.co.in', '127.0.0.1', 'localhost']);
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (all, key) => {
  if (key[0] === '#') {const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1)); return code <= 0x10ffff ? String.fromCodePoint(code) : all;}
  return {amp:'&', quot:'"', apos:"'", lt:'<', gt:'>'}[key.toLowerCase()];
});

// Bounded tokenizer for generated markup, including quoted '>' characters and
// raw script/style text. This deliberately does not evaluate inline scripts.
export function inspectMarkup(html) {
  const tags = [], ids = new Set(), duplicates = [], styles = [];
  const token = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w:-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
  let match;
  while ((match = token.exec(html))) {
    if (!match[1] || match[0][1] === '/') continue;
    const name = match[1].toLowerCase(), attributes = {};
    const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    for (const part of match[2].matchAll(pattern)) attributes[part[1].toLowerCase()] = decode(part[2] ?? part[3] ?? part[4] ?? '');
    if (attributes.id) {if (ids.has(attributes.id)) duplicates.push(attributes.id); ids.add(attributes.id);}
    if (name === 'a' && attributes.name) ids.add(attributes.name);
    if (attributes.style) styles.push(attributes.style);
    tags.push({name, attributes});
    if (['script', 'style', 'textarea', 'title'].includes(name)) {
      const close = new RegExp(`</${name}\\s*>`, 'gi'); close.lastIndex = token.lastIndex;
      const ending = close.exec(html);
      if (ending) {if (name === 'style') styles.push(html.slice(token.lastIndex, ending.index)); token.lastIndex = close.lastIndex;}
    }
  }
  return {tags, ids, duplicates, styles};
}

export function localReference(raw, from) {
  if (!raw?.trim() || /^(?:data|mailto|tel|blob):/i.test(raw)) return null;
  let url; try {url = new URL(raw, new URL(from, ORIGIN));} catch {return {invalid:raw};}
  if (!['http:', 'https:'].includes(url.protocol)) return {invalid:raw};
  if (!SAME_SITE.has(url.hostname)) return null;
  let path, fragment;
  try {path = decodeURIComponent(url.pathname); fragment = decodeURIComponent(url.hash.slice(1)).split(':~:')[0];} catch {return {invalid:raw};}
  return {path, fragment};
}

function cssReferences(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...clean.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)|@import\s+(?:"([^"]*)"|'([^']*)')/gi)].map(m => m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5]);
}

export async function auditNavigation(root, {collection = true, expectedPublicIds, expectedCollectionRoutes, expectedLibraryRoutes} = {}) {
  root = resolve(root);
  const entries = [], failures = [], pages = new Map(), fileSet = new Set(), graph = new Map(), checkedAssets = new Set();
  const walk = async directory => {
    for (const entry of await readdir(directory, {withFileTypes:true})) {
      const file = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {fileSet.add(file); if (extname(file) === '.html') entries.push(file);}
    }
  };
  await walk(root);
  const routeOf = file => '/' + relative(root, file).split(sep).join('/').replace(/index\.html$/, '');
  const fileFor = path => {
    const requested = resolve(root, '.' + path);
    if (requested !== root && !requested.startsWith(root + sep)) return null;
    if (fileSet.has(requested)) return requested;
    const index = resolve(requested, 'index.html');
    return fileSet.has(index) ? index : null;
  };
  for (const file of entries) {
    const route = routeOf(file), parsed = inspectMarkup(await readFile(file, 'utf8'));
    pages.set(file, {route, ...parsed}); graph.set(route, new Set());
    for (const id of parsed.duplicates) failures.push({kind:'duplicate-id', from:route, target:id});
  }
  let internalLinks = 0, fragments = 0, assetReferences = 0, metadataLinks = 0;
  const validate = async (raw, from, kind, clickable = false) => {
    const ref = localReference(raw, from);
    if (!ref) return;
    if (ref.invalid) {failures.push({kind:'invalid-url', from, target:raw}); return;}
    const file = fileFor(ref.path);
    if (kind === 'asset') assetReferences++; else if (kind === 'metadata') metadataLinks++; else internalLinks++;
    if (!file) {failures.push({kind:`missing-${kind}`, from, target:raw}); return;}
    if (clickable && pages.has(file)) graph.get(from)?.add(pages.get(file).route);
    if (ref.fragment) {
      fragments++;
      const parsed = pages.get(file) ?? (extname(file) === '.svg' ? inspectMarkup(await readFile(file,'utf8')) : null);
      if (parsed && !parsed.ids.has(ref.fragment)) failures.push({kind:'missing-fragment', from, target:raw});
    }
    if (kind === 'asset' && extname(file) === '.css' && !checkedAssets.has(file)) {
      checkedAssets.add(file);
      for (const url of cssReferences(await readFile(file, 'utf8'))) await validate(url, routeOf(file), 'asset');
    }
  };
  for (const page of pages.values()) {
    for (const {name, attributes:a} of page.tags) {
      if (name === 'a' || name === 'area') {if (a.href !== undefined) await validate(a.href, page.route, 'link', true);}
      else if (name === 'link' && a.href) {
        const metadata = /(?:^|\s)(?:canonical|alternate)(?:\s|$)/.test(a.rel || '');
        await validate(a.href, page.route, metadata ? 'metadata' : 'asset');
      }
      if (name === 'use' || name === 'image') for (const key of ['href', 'xlink:href']) if (a[key]) await validate(a[key], page.route, 'asset');
      for (const key of ['src','poster']) if (a[key]) await validate(a[key], page.route, 'asset');
      for (const key of ['srcset','imagesrcset']) if (a[key]) {
        // Build-owned responsive candidates use ordinary URL + width/density,
        // never embedded data URLs with commas. Data URLs are not local assets.
        if (!/^data:/i.test(a[key])) for (const candidate of a[key].split(',')) await validate(candidate.trim().split(/\s+/)[0], page.route, 'asset');
      }
      if (name === 'object' && a.data) await validate(a.data, page.route, 'asset');
    }
    for (const css of page.styles) for (const url of cssReferences(css)) await validate(url, page.route, 'asset');
  }
  const reach = start => {
    const visited = new Set(), queue = [start];
    while(queue.length) {const current = queue.shift(); if (visited.has(current)) continue; visited.add(current); for (const next of graph.get(current) || []) queue.push(next);}
    return visited;
  };
  const fromEnglish = reach('/'), fromHindi = reach('/hi/');
  for (const home of ['/', '/hi/']) if (!fileFor(home)) failures.push({kind:'missing-home', from:home, target:home});
  const publicIds = expectedPublicIds ?? (await publicBooks()).map(book => book.id);
  const collectionRoutes = expectedCollectionRoutes ?? ['en','hi'].flatMap(lang => [collectionHome(lang), ...chapters.map(chapter => chapterRoute(chapter.id, lang))]);
  const publicRoutes = ['en','hi'].flatMap(lang => publicIds.map(id => `${lang === 'hi' ? '/hi' : ''}/books/read/${id}/`));
  const libraryRoutes = expectedLibraryRoutes ?? ['en','hi'].flatMap(lang => ['ramayana','krishna','shiva','dhruva','stories'].map(id => `${lang === 'hi' ? '/hi' : ''}/books/${id}/`));
  const expected = [...new Set([...publicRoutes, ...libraryRoutes, ...(collection ? collectionRoutes : [])])];
  for (const route of expected) {
    if (!fileFor(route)) failures.push({kind:'missing-expected-route', from:route.startsWith('/hi/') ? '/hi/' : '/', target:route});
    const reachable = route.startsWith('/hi/') ? fromHindi : fromEnglish;
    if (!reachable.has(route)) failures.push({kind:'unreachable-from-home', from:route.startsWith('/hi/') ? '/hi/' : '/', target:route});
  }
  // Public contents exist for the ten established retellings; only draft readers are forbidden.
  const draftRoutes = expectedCollectionRoutes ?? ['en','hi'].flatMap(lang => chapters.map(chapter => chapterRoute(chapter.id,lang)));
  if (!collection) for (const route of draftRoutes) if (fileFor(route)) failures.push({kind:'draft-in-public-build', from:'/', target:route});
  return {
    schemaVersion:1, generatedAt:new Date().toISOString(), root, mode:collection ? 'local-collection-preview' : 'public-build', textRevision:revision,
    limits:['Static generated HTML and referenced CSS only; no runtime JavaScript interaction or external source availability is claimed.', 'Reachability follows native anchor links. Metadata alternates and script-generated links do not create navigation edges.'],
    counts:{htmlPages:pages.size, internalLinks, fragmentReferences:fragments, assetReferences, linkedStylesheets:checkedAssets.size, metadataLinks, reachableFromEnglishHome:fromEnglish.size, reachableFromHindiHome:fromHindi.size, publicBooks:publicIds.length, expectedPublicBookRoutes:publicRoutes.length, expectedCollectionRoutes:collection ? collectionRoutes.length : 0, expectedRoutesReachable:expected.filter(route => (route.startsWith('/hi/') ? fromHindi : fromEnglish).has(route)).length, failures:failures.length},
    expectedRoutes:expected, orphanHtmlRoutes:[...pages.values()].map(p => p.route).filter(route => !fromEnglish.has(route) && !fromHindi.has(route)),
    failures
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const args = process.argv.slice(2), root = args.find(arg => !arg.startsWith('--')) || 'artifacts/welcome-site';
  const report = await auditNavigation(root, {collection:!args.includes('--public')});
  const destination = args.find(arg => arg.startsWith('--output='))?.slice('--output='.length);
  if (destination) {await mkdir(dirname(resolve(destination)), {recursive:true}); await writeFile(destination, JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify(report,null,2));
  process.exitCode = report.failures.length ? 1 : 0;
}
