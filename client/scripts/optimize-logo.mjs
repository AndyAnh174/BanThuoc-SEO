// One-shot script: resize /public/2.png logo down to a sane size for web.
// Original: 1700x1237 ~438KB. Target: 512x372 webp + optimized png fallback.
// Run: pnpm run optimize:logo

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const SRC = path.join(PUBLIC_DIR, '2.png');

async function main() {
  const input = await fs.readFile(SRC);
  const meta = await sharp(input).metadata();
  console.log(`Input: ${meta.width}x${meta.height} (${(input.length / 1024).toFixed(1)} KB)`);

  // Back up original just in case
  const backup = path.join(PUBLIC_DIR, '2.original.png');
  try {
    await fs.access(backup);
    console.log('Backup already exists at 2.original.png — skip backup step');
  } catch {
    await fs.writeFile(backup, input);
    console.log('Saved backup to 2.original.png');
  }

  // Resize main logo — 512px max dimension, PNG optimized (for compat w/ existing <img src="/2.png">)
  const optimized = await sharp(input)
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 90, palette: true })
    .toBuffer();
  await fs.writeFile(SRC, optimized);
  console.log(`Wrote 2.png: ${(optimized.length / 1024).toFixed(1)} KB`);

  // WebP variant (for future use in next/image)
  const webp = await sharp(input)
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
  await fs.writeFile(path.join(PUBLIC_DIR, '2.webp'), webp);
  console.log(`Wrote 2.webp: ${(webp.length / 1024).toFixed(1)} KB`);

  // OG image — social cards want 1200x630, extend on transparent white background
  const og = await sharp(input)
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .extend({
      top: 0,
      bottom: 0,
      left: 200,
      right: 200,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .resize(1200, 630, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png({ compressionLevel: 9, quality: 90 })
    .toBuffer();
  await fs.writeFile(path.join(PUBLIC_DIR, 'og-image.png'), og);
  console.log(`Wrote og-image.png: ${(og.length / 1024).toFixed(1)} KB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
