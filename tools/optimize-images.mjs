/**
 * tools/optimize-images.mjs — re-encode the heaviest images and give them
 * names a search engine can read.
 *
 *   node tools/optimize-images.mjs           # convert, then report
 *   node tools/optimize-images.mjs --rewrite # …and update every reference
 *
 * Two problems, one pass.
 *
 * WEIGHT. Largest Contentful Paint is a ranking signal, and the studio was
 * shipping 1.7MB PNG screenshots (a PNG of a photograph is the worst of both
 * formats) and 6MB camera-original JPEGs straight off a phone. /about alone
 * carried about 19MB of images. Nothing here is displayed anywhere near the
 * pixel dimensions it was stored at.
 *
 * NAMES. `IMG_0077.jpeg` and `8e872aef4bda3c9c…png` tell Google Images
 * nothing. For a design studio, image search is a real way in, and the file
 * name is one of the few signals it has besides alt text. Every output is
 * named for what it shows.
 *
 * Originals are never touched or deleted — each entry writes a NEW file, so
 * dropping the `out` paths and re-running restores the previous state. Uses
 * `sips`, which ships with macOS; no dependencies to install.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, rmSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';

const REWRITE = process.argv.includes('--rewrite');

/**
 * `wide` is the longest edge to keep. The project thumbnails are shown at up
 * to ~840 CSS px and the roster portraits at ~360, so 2x of the largest real
 * display size is the honest ceiling — anything beyond it is bytes no screen
 * can use.
 */
const JOBS = [
  // ── Project thumbnails: PNG screenshots on / and /works ──────────
  { src: 'images/project-thumbnails/prahari-command.png',
    out: 'images/project-thumbnails/prahari-counter-drone-command-interface.jpg',
    wide: 1672, q: 80 },
  { src: 'images/project-thumbnails/chargeur-operations.png',
    out: 'images/project-thumbnails/chargeur-ammunition-logistics-interface.jpg',
    wide: 1672, q: 80 },
  { src: 'images/project-thumbnails/vigil-field.png',
    out: 'images/project-thumbnails/vigil-rugged-squad-wearable.jpg',
    wide: 1672, q: 80 },

  { src: 'images/klu/pos-product-grid.jpg',
    out: 'images/project-thumbnails/klu-pos-defence-canteen-point-of-sale.jpg',
    wide: 1600, q: 80 },
  { src: 'images/hero/8e872aef4bda3c9c75e58c3b6bc2fe1e348856b7.png',
    out: 'images/project-thumbnails/rojnica-drone-fleet-management.jpg',
    wide: 640, q: 82 },
  { src: 'images/hero/0f6b5d25704bdb0a6bd7a0f6bab98cbeb3b06450.png',
    out: 'images/project-thumbnails/parkbeheer-parking-operations-platform.jpg',
    wide: 640, q: 82 },
  { src: 'images/portfolio-assets/5FjWGy3WVjOTw0gnaugcHjpZJE.png',
    out: 'images/project-thumbnails/titan-eyeplus-eyewear-ecommerce.jpg',
    wide: 1600, q: 80 },
  { src: 'penknife/image 1.jpg',
    out: 'images/project-thumbnails/penknife-healthcare-staffing-platform.jpg',
    wide: 1400, q: 80 },

  // ── The roster on /about ─────────────────────────────────────────
  ...['aayush', 'sai', 'kashish', 'jovi', 'himshikha', 'prashant', 'naman'].map((n) => ({
    src: `images/team/${n}-illustration.jpg`,
    out: `images/team/${n}-rabbitsfoot-designer.jpg`,
    wide: 900, q: 80
  })),

  // ── Behind the scenes on /about, straight off a camera roll ──────
  { src: 'gallery/studio bts/IMG_0077.jpeg',
    out: 'gallery/studio-bts/rabbitsfoot-team-holi-bengaluru.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/IMG_1722.jpeg',
    out: 'gallery/studio-bts/rabbitsfoot-team-street-selfie.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/IMG_2800.jpeg',
    out: 'gallery/studio-bts/rabbitsfoot-studio-table-sketches.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/IMG_3449.JPG',
    out: 'gallery/studio-bts/rabbitsfoot-team-evening-event.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/IMG_6242.jpeg',
    out: 'gallery/studio-bts/rabbitsfoot-team-park-with-dog.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/IMG_6255.jpeg',
    out: 'gallery/studio-bts/rabbitsfoot-team-outdoor-selfie.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/5FC2402E-3620-4140-989E-9D04C4FD7442.jpg',
    out: 'gallery/studio-bts/rabbitsfoot-rooftop-hand-painted-artwork.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/34f850c2-dd99-414a-a88c-d9c49c11d1a0.jpg',
    out: 'gallery/studio-bts/rabbitsfoot-team-drawing-in-park.jpg', wide: 1400, q: 76 },
  { src: 'gallery/studio bts/edef1aea-323d-4141-8c82-5f5cf266c163.jpg',
    out: 'gallery/studio-bts/rabbitsfoot-team-selfie-in-car.jpg', wide: 1400, q: 76 },

  // ── The multidisciplinary-table poster, used as a video poster ───
  { src: 'images/studio-multidisciplinary-table.png',
    out: 'images/studio-multidisciplinary-table.jpg', wide: 1600, q: 82 }
];

/**
 * Already compressed about as far as they go, but sitting under a path with a
 * space in it and a UUID for a name. Copied, not re-encoded — a second JPEG
 * generation would cost quality for nothing. They just get a readable URL.
 */
const RENAMES = [
  { src: 'gallery/studio bts/5FC2402E-3620-4140-989E-9D04C4FD7442.jpg',
    out: 'gallery/studio-bts/rabbitsfoot-rooftop-hand-painted-artwork.jpg' },
  { src: 'gallery/studio bts/34f850c2-dd99-414a-a88c-d9c49c11d1a0.jpg',
    out: 'gallery/studio-bts/rabbitsfoot-team-drawing-in-park.jpg' },
  { src: 'gallery/muspell-motion/patient-view-poster.jpg',
    out: 'images/project-thumbnails/muspell-clinical-intelligence-platform.jpg' }
];

/** Files whose references need updating once the new images exist. */
const REFERENCED_IN = [
  'studio.html', 'site-data.js', 'seo.config.mjs',
  'prahari.html', 'chargeur.html', 'vigil.html', 'muspell.html', 'penknife.html',
  'klu-pos.html', 'rojnica.html', 'parkbeheer.html', 'titan-eyeplus.html',
  'about.html', 'index.html', 'works.html'
];

const kb = (p) => Math.round(statSync(p).size / 1024);

/** sips -Z resamples in both directions, so a source already under the
 *  ceiling would be enlarged — which is how a 384K photo became 890K on the
 *  first run. Never ask for more pixels than the file already has. */
function longestEdge(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8'
  });
  const nums = [...out.matchAll(/pixel(?:Width|Height):\s*(\d+)/g)].map((m) => Number(m[1]));
  return nums.length ? Math.max(...nums) : Infinity;
}

let before = 0;
let after = 0;
const done = [];
const missing = [];
const kept = [];

for (const job of JOBS) {
  if (!existsSync(job.src)) { missing.push(job.src); continue; }
  mkdirSync(dirname(job.out), { recursive: true });
  execFileSync('sips', [
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(job.q),
    '-Z', String(Math.min(job.wide, longestEdge(job.src))),
    job.src, '--out', job.out
  ], { stdio: 'ignore' });

  const b = kb(job.src);
  const a = kb(job.out);

  /* A few of these were already compressed harder than this pass manages.
     Re-encoding them would cost bytes AND a generation of quality, so the
     original stays and nothing is rewritten to point at a worse file. */
  if (a >= b * 0.95) {
    rmSync(job.out, { force: true });
    kept.push(`${job.src} (${b}K — already smaller than a re-encode)`);
    before += b;
    after += b;
    continue;
  }

  before += b;
  after += a;
  done.push({ ...job, b, a });
}

for (const r of RENAMES) {
  if (!existsSync(r.src)) { missing.push(r.src); continue; }
  mkdirSync(dirname(r.out), { recursive: true });
  copyFileSync(r.src, r.out);
  const b = kb(r.src);
  before += b;
  after += b;
  done.push({ ...r, b, a: b });
}

for (const d of done.sort((x, y) => y.b - x.b)) {
  const saved = Math.round((1 - d.a / d.b) * 100);
  console.log(`${String(d.b).padStart(5)}K → ${String(d.a).padStart(4)}K  −${String(saved).padStart(2)}%  ${d.out}`);
}
if (kept.length) console.log('\nleft as they were:\n  ' + kept.join('\n  '));
if (missing.length) console.log('\nnot found (skipped):\n  ' + missing.join('\n  '));
console.log(`\nTotal: ${(before / 1024).toFixed(1)}MB → ${(after / 1024).toFixed(1)}MB  (−${Math.round((1 - after / before) * 100)}%)`);

/* ── Rewrite references ──────────────────────────────────────────── */

if (!REWRITE) {
  console.log('\nRun again with --rewrite to point the site at the new files.');
} else {
  const map = new Map();
  for (const d of done) {
    map.set(d.src, d.out);
    /* Spaces are percent-encoded in the markup that already ships. */
    map.set(d.src.replace(/ /g, '%20'), d.out);
  }

  const touched = [];
  for (const file of REFERENCED_IN) {
    if (!existsSync(file)) continue;
    const original = readFileSync(file, 'utf8');
    let next = original;
    for (const [from, to] of map) next = next.split(from).join(to);
    if (next !== original) {
      writeFileSync(file, next);
      touched.push(file);
    }
  }
  console.log('\nReferences updated in:\n  ' + (touched.join('\n  ') || '(nothing to change)'));
  console.log('\nRe-run `node build-seo.mjs` so the generated routes pick it up.');
}
