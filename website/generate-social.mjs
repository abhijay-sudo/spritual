// Development-only export. Requires the existing repository's sharp package.
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
const artwork=await sharp(await readFile(new URL('./assets/landscape.svg',import.meta.url))).resize(425,550,{fit:'cover'}).png().toBuffer();
const svg=`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#f6f3eb"/><text x="75" y="102" fill="#243d32" font-family="Georgia" font-size="37">Spritual.</text><text x="75" y="245" fill="#243d32" font-family="Georgia" font-size="63">Ancient wisdom.</text><text x="75" y="326" fill="#243d32" font-family="Georgia" font-size="63">Everyday life.</text><text x="75" y="403" fill="#975536" font-family="Georgia" font-style="italic" font-size="34">A little closer to yourself.</text><text x="75" y="534" fill="#5c6559" font-family="Arial" font-size="21">spritual.co.in</text></svg>`;
await sharp(Buffer.from(svg)).composite([{input:artwork,left:735,top:40}]).png().toFile(new URL('./assets/social.png',import.meta.url).pathname);
