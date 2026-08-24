/**
 * build-seo.mjs — regenerates every crawlable surface of the site.
 *
 *   node build-seo.mjs
 *
 * What it does:
 *   1. Reads studio.html as the single body source for the four studio routes.
 *   2. Writes index.html / works.html / about.html / contact.html, each with a
 *      real, static <head>: unique title, description, canonical, Open Graph,
 *      Twitter card and JSON-LD. None of this is JS-applied, so crawlers and
 *      link-preview bots see it on first byte.
 *   3. Patches canonical + OG + JSON-LD into every case-study page.
 *   4. Points duplicate pages at their canonical original and noindexes them.
 *   5. Writes sitemap.xml.
 *
 * studio.html stays the file you edit by hand. The four route files are
 * generated output — do not edit them directly.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { SITE, ROUTES, CASE_STUDIES, PROTOTYPES, CANONICAL_ONLY } from './seo.config.mjs';

const abs = (p) => (p.startsWith('http') ? p : SITE.origin + p);
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── Structured data ──────────────────────────────────────────────
   One @graph per page, with stable @ids so every page reinforces the
   same entity rather than declaring a new organisation each time.
   That accumulation is what earns a knowledge panel and what answer
   engines read when deciding who to name. */

const ORG_ID = SITE.origin + '/#studio';
const SITE_ID = SITE.origin + '/#website';

function organisation() {
  return {
    '@type': ['Organization', 'ProfessionalService'],
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: ['rabbitsfoot studio', "rabbit's foot design studio", 'rabbitsfoot design'],
    url: SITE.origin + '/',
    foundingDate: SITE.founded,
    description:
      'Independent product design and UX studio in Bengaluru working on defence, healthcare, enterprise and autonomous-systems interfaces.',
    logo: { '@type': 'ImageObject', url: abs(SITE.logo) },
    image: abs(SITE.ogImage),
    email: SITE.email,
    telephone: SITE.phone,
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lon },
    areaServed: [
      { '@type': 'City', name: 'Bengaluru' },
      { '@type': 'Country', name: 'India' },
      { '@type': 'Place', name: 'Worldwide' }
    ],
    knowsAbout: SITE.knowsAbout,
    numberOfEmployees: { '@type': 'QuantitativeValue', value: SITE.team.length },
    employee: SITE.team.map(([name, role]) => ({ '@type': 'Person', name, jobTitle: role })),
    founder: { '@type': 'Person', name: 'Aayush', jobTitle: 'Founder · Product Design' },
    sameAs: SITE.sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Design services',
      itemListElement: SITE.services.map(([name, description]) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name, description, provider: { '@id': ORG_ID } }
      }))
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'New business',
      email: SITE.email,
      telephone: SITE.phone,
      areaServed: 'Worldwide',
      availableLanguage: ['en']
    }
  };
}

function website() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.origin + '/',
    name: SITE.name,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en'
  };
}

function webPage(route) {
  return {
    '@type': route.key === 'contact' ? 'ContactPage' : route.key === 'about' ? 'AboutPage' : 'WebPage',
    '@id': abs(route.path) + '#page',
    url: abs(route.path),
    name: route.title,
    description: route.description,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    primaryImageOfPage: abs(SITE.ogImage)
  };
}

function breadcrumb(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(path)
    }))
  };
}

/** The works route doubles as a browsable list — mark it up as one. */
function workList() {
  return {
    '@type': 'ItemList',
    name: 'rabbitsfoot case studies',
    itemListElement: CASE_STUDIES.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(c.path),
      name: c.name
    }))
  };
}

function routeGraph(route) {
  const graph = [organisation(), website(), webPage(route)];
  if (route.key !== 'home') {
    graph.push(breadcrumb([['Home', '/'], [route.key[0].toUpperCase() + route.key.slice(1), route.path]]));
  }
  if (route.key === 'works') graph.push(workList());
  return { '@context': 'https://schema.org', '@graph': graph };
}

function caseGraph(c) {
  const trail = [['Home', '/'], ['Work', '/works']];
  if (c.parent) trail.push(c.parent);
  trail.push([c.name, c.path]);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organisation(),
      {
        '@type': c.parent ? ['CreativeWork', 'WebApplication'] : ['CreativeWork', 'Article'],
        '@id': abs(c.path) + '#work',
        url: abs(c.path),
        name: c.name,
        headline: c.name,
        description: c.description,
        about: c.about.map((t) => ({ '@type': 'Thing', name: t })),
        keywords: c.about.join(', '),
        creator: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        author: { '@id': ORG_ID },
        inLanguage: 'en',
        isPartOf: c.parent ? { '@id': abs(c.parent[1]) + '#work' } : { '@id': SITE_ID },
        ...(c.parent ? { applicationCategory: 'DesignApplication', browserRequirements: 'Requires JavaScript' } : {})
      },
      breadcrumb(trail)
    ]
  };
}

/* ── Head assembly ───────────────────────────────────────────────── */

/** Route detection, hoisted before paint. Reads the clean path first and
 *  still understands the legacy ?p= links, so old inbound URLs keep working. */
const ROUTE_SCRIPT = `  <script>
    (function () {
      var known = { works: 1, about: 1, contact: 1 };
      var seg = location.pathname.replace(/\\/+$/, '').split('/').pop().replace(/\\.html$/, '');
      var p = known[seg] ? seg : new URLSearchParams(location.search).get('p');
      document.documentElement.dataset.route = known[p] ? p : 'home';
    })();
  </script>`;

function socialTags({ url, title, description, type = 'website', image = SITE.ogImage }) {
  return `  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="rabbitsfoot">
  <meta property="og:locale" content="en_IN">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(abs(image))}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="rabbitsfoot — product design studio, Bengaluru">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(abs(image))}">`;
}

/** max-image-preview:large is what makes a portfolio eligible for big image
 *  thumbnails in Google results and AI Overviews. Worth having everywhere. */
const ROBOTS_TAG =
  '  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

function routeHead(route) {
  const url = abs(route.path);
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0a0908">
${ROBOTS_TAG}
  <title>${esc(route.title)}</title>
  <meta name="description" content="${esc(route.description)}">
  <link rel="canonical" href="${esc(url)}">
  <meta name="author" content="rabbitsfoot">
  <meta name="geo.region" content="IN-KA">
  <meta name="geo.placename" content="Bengaluru">

${socialTags({ url, title: route.title, description: route.description })}

  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/images/og/rabbitsfoot-logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="studio.css">

  <script type="application/ld+json">
${JSON.stringify(routeGraph(route), null, 2)}
  </script>

${ROUTE_SCRIPT}
</head>`;
}

/* ── Generate the four studio routes ─────────────────────────────── */

const studio = readFileSync('studio.html', 'utf8');
const headRe = /<head>[\s\S]*?<\/head>/;
if (!headRe.test(studio)) throw new Error('studio.html: could not locate <head>');

const BANNER = (file) =>
  `<!-- GENERATED by build-seo.mjs from studio.html — do not edit ${file} by hand.\n     Edit studio.html (body) or seo.config.mjs (head), then re-run: node build-seo.mjs -->\n`;

let written = [];
for (const route of ROUTES) {
  let out = studio.replace(headRe, routeHead(route));
  out = out.replace(/^<!doctype html>\s*/i, `<!doctype html>\n${BANNER(route.file)}`);
  writeFileSync(route.file, out);
  written.push(`${route.file}  →  ${route.path}`);
}

/* ── Patch the case studies ──────────────────────────────────────── */

const MARK_A = '<!-- seo:begin -->';
const MARK_B = '<!-- seo:end -->';

function patch(file, block, { title, description } = {}) {
  if (!existsSync(file)) return `skip (missing): ${file}`;
  let html = readFileSync(file, 'utf8');

  // Idempotent: drop any block we injected on a previous run.
  html = html.replace(new RegExp(`\\n?${MARK_A}[\\s\\S]*?${MARK_B}\\n?`), '\n');

  // One description tag only — replace the page's own if it has one.
  if (description) {
    const dre = /<meta\s+name=["']description["'][^>]*>/i;
    const tag = `<meta name="description" content="${esc(description)}">`;
    html = dre.test(html) ? html.replace(dre, tag) : html;
  }
  // Keep the studio's name in the SERP title.
  if (title) {
    html = html.replace(/<title>([\s\S]*?)<\/title>/i, (m, t) =>
      /rabbitsfoot/i.test(t) ? m : `<title>${t.trim()} | rabbitsfoot</title>`
    );
  }

  if (!/<\/head>/i.test(html)) return `skip (no </head>): ${file}`;
  html = html.replace(/<\/head>/i, `${MARK_A}\n${block}\n${MARK_B}\n</head>`);
  writeFileSync(file, html);
  return `patched: ${file}`;
}

const patched = [];
for (const c of [...CASE_STUDIES, ...PROTOTYPES]) {
  const url = abs(c.path);
  const block = `  <link rel="canonical" href="${esc(url)}">
${ROBOTS_TAG}
${socialTags({ url, title: c.name, description: c.description, type: 'article' })}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <script type="application/ld+json">
${JSON.stringify(caseGraph(c), null, 2)}
  </script>`;
  patched.push(patch(c.file, block, { title: true, description: c.description }));
}

/* Duplicates: point at the original, keep them out of the index. */
const deduped = [];
for (const [file, canonical] of [...new Map(CANONICAL_ONLY.map((p) => [p[0], p[1]])).entries()]) {
  const block = `  <link rel="canonical" href="${esc(abs(canonical))}">
  <meta name="robots" content="noindex, follow">`;
  deduped.push(patch(file, block));
}

/* ── sitemap.xml ─────────────────────────────────────────────────── */

const today = process.env.SEO_DATE || new Date().toISOString().slice(0, 10);
const urls = [
  ...ROUTES.map((r) => ({ loc: abs(r.path), pri: r.priority, freq: 'weekly' })),
  ...CASE_STUDIES.map((c) => ({ loc: abs(c.path), pri: c.priority, freq: 'monthly' })),
  ...PROTOTYPES.map((c) => ({ loc: abs(c.path), pri: c.priority, freq: 'monthly' }))
];

writeFileSync(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`
);

console.log('Routes generated:\n  ' + written.join('\n  '));
console.log('\nCase studies:\n  ' + patched.join('\n  '));
console.log('\nDuplicates canonicalised:\n  ' + deduped.join('\n  '));
console.log(`\nsitemap.xml: ${urls.length} URLs, lastmod ${today}`);
