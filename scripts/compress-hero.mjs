import { stat, mkdir } from 'node:fs/promises';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, '..', 'src', 'assets', 'img');
const outDir = join(srcDir, 'webp');

const MAX_WIDTH = Number(process.env.HERO_MAX_WIDTH || 1600);
const QUALITY = Number(process.env.HERO_QUALITY || 80);

// Los originales se eliminan tras la primera compresión; el script
// re-comprime solo los que todavía existen (p. ej. nuevas imágenes añadidas).
const HERO_FILES = ['hero1.png', 'hero2.png', 'hero3.jpeg', 'hero4.jpeg', 'hero5.png', 'hero6.jpeg'];

async function compressHeroImages() {
  await mkdir(outDir, { recursive: true });

  const inputs = HERO_FILES.map((f) => {
    const src = join(srcDir, f);
    const { name } = parse(src);
    return { src, out: join(outDir, `${name}.webp`) };
  });

  let totalBefore = 0;
  let totalAfter = 0;

  for (const { src, out } of inputs) {
    let before;
    try {
      before = (await stat(src)).size;
    } catch {
      console.log(`${parse(src).base} — omitido (no existe)`);
      continue;
    }
    await sharp(src)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(out);
    const after = (await stat(out)).size;
    totalBefore += before;
    totalAfter += after;
    const pct = (((before - after) / before) * 100).toFixed(1);
    console.log(`${parse(src).base} -> ${parse(out).base}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${pct}%)`);
  }

  console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`);
}

compressHeroImages().catch((err) => {
  console.error('Error comprimiendo imágenes:', err);
  process.exit(1);
});