import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const srcSvg = path.join(root, 'assets', 'icon.svg');

const outDir = path.join(root, 'public');
const iconsDir = path.join(outDir, 'icons');

/** Ensure directories exist */
async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function generate() {
  const svg = await fs.readFile(srcSvg);
  await ensureDir(iconsDir);

  // Core PWA icon sizes
  const core = [192, 512];
  // Favicon sizes
  const fav = [16, 32];
  // Apple touch icon
  const apple = 180;

  // Generate base icons (any)
  for (const size of core) {
    const out = path.join(iconsDir, `icon-${size}.png`);
    await sharp(svg).resize(size, size, { fit: 'cover' }).png().toFile(out);
  }

  // Generate maskable icons (use same art; full-bleed works with safe area in design)
  for (const size of core) {
    const out = path.join(iconsDir, `icon-${size}-maskable.png`);
    await sharp(svg).resize(size, size, { fit: 'cover' }).png().toFile(out);
  }

  // Apple touch icon
  await sharp(svg).resize(apple, apple, { fit: 'cover' }).png().toFile(path.join(outDir, 'apple-touch-icon.png'));

  // Favicons
  for (const size of fav) {
    await sharp(svg).resize(size, size, { fit: 'cover' }).png().toFile(path.join(iconsDir, `icon-${size}.png`));
  }

  console.log('✅ Icons generated in public/icons and apple-touch-icon.png');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

