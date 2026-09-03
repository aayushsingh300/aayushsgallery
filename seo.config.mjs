/**
 * Single source of truth for everything a crawler reads.
 *
 * Edit this file, then run `node build-seo.mjs`. That regenerates
 * index/works/about/contact .html, patches the case-study heads, rewrites
 * sitemap.xml and llms.txt.
 *
 * ── What is NOT configured here ────────────────────────────────
 * The roster and the project list are read from site-data.js, which is what
 * the page itself renders. They used to be typed out a second time in this
 * file and had already drifted: the schema claimed nine designers including
 * two people the site has never listed. Structured data that contradicts the
 * visible page is a manual-action risk, not a rich result — so anything a
 * visitor can see is derived, never restated.
 *
 * The FAQ is read the same way, straight out of studio.html's .faq__item
 * blocks, so the FAQPage schema is the page copy by construction.
 */

import { createRequire } from 'node:module';
const DATA = createRequire(import.meta.url)('./site-data.js');

export { DATA };

export const SITE = {
  origin: 'https://www.rabbitsfoot.in',
  name: 'rabbitsfoot',
  legalName: 'rabbitsfoot®',
  founded: '2017',
  email: 'studio@rabbitsfoot.in',
  phone: '+91-93982-25962',
  city: 'Bengaluru',
  region: 'Karnataka',
  country: 'IN',
  // Approximate Bengaluru centroid. Replace with the studio's real
  // coordinates once a Google Business Profile is live.
  geo: { lat: 12.9716, lon: 77.5946 },
  ogImage: '/images/og/rabbitsfoot-og.jpg',
  logo: '/images/og/rabbitsfoot-logo.png',
  booking: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2FssCYTwsJpfsqzieRw1N_hdniZm1YsRg4kS8m1nfhvwExD3rL6XVSRggkpJmAC0TLajuHXp-j?gv=true',
  sameAs: [
    'https://www.linkedin.com/company/rabbitsfoot-studio/',
    'https://www.instagram.com/aayushrajputt__',
    'https://medium.com/@aayushux'
  ],
  /**
   * `knowsAbout` is how an entity tells Google and the answer engines what
   * it is an authority on. These are deliberately the narrow, winnable
   * terms — not "UI UX design", which is owned by 10-year-old agencies.
   */
  knowsAbout: [
    'Product design',
    'User experience design',
    'Defence and mission-critical interface design',
    'Counter-drone command and control interfaces',
    'Drone fleet management software design',
    'Military logistics and ammunition management systems',
    'Healthcare and clinical data interface design',
    'Enterprise operations software design',
    'Industrial design',
    'Spatial and retail experience design',
    'Design systems',
    'Wearable and smart eyewear interface design',
    'Design research and prototyping'
  ],
  services: [
    ['Product & UX design', 'End-to-end digital product design, from research through shipped interface.'],
    ['Mission-critical systems design', 'Interfaces for defence, operations and safety-critical environments.'],
    ['Design research', 'Field research, usability testing and domain immersion.'],
    ['Industrial design', 'Physical products, hardware and device interaction.'],
    ['Spatial & retail experience', 'Physical environments, retail and exhibition design.'],
    ['Design systems', 'Component libraries, patterns and governance for scaling teams.']
  ],
  /** Derived — see the note at the top of this file. */
  team: DATA.team.map((m) => [m.name, m.role, m.specialty]),

  /**
   * The founder is a separate entity from the studio. Google reconciles a
   * Person and an Organization through their own sameAs sets, so the personal
   * profiles hang off the Person and the studio points at the Person as its
   * founder rather than impersonating them.
   */
  founder: {
    name: 'Aayush',
    jobTitle: 'Founder · Product Design',
    sameAs: [
      'https://www.linkedin.com/in/aayushran/',
      'https://www.instagram.com/aayushrajputt__',
      'https://medium.com/@aayushux'
    ]
  },

  slogan: 'Product design for the real world.'
};

/** Spelled-out counts, so the copy can never contradict the roster length. */
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const TEAM_COUNT = SITE.team.length;
export const TEAM_WORD = WORDS[TEAM_COUNT] || String(TEAM_COUNT);
const Team_Word = TEAM_WORD.charAt(0).toUpperCase() + TEAM_WORD.slice(1);

/**
 * The four studio routes. `path` is the clean URL; the generator writes the
 * matching .html file and Vercel's cleanUrls serves it without the extension.
 */
export const ROUTES = [
  {
    key: 'home',
    file: 'index.html',
    path: '/',
    title: 'rabbitsfoot — Product Design & UX Studio in Bengaluru',
    description:
      `rabbitsfoot is an independent product design and UX studio in Bengaluru. ${Team_Word} senior designers working on defence, healthcare, enterprise and autonomous-systems interfaces — no hand-offs in thinking.`,
    /* The hero video's poster frame, and therefore this page's Largest
       Contentful Paint. Preloaded so it is not queued behind the stylesheet. */
    preload: '/images/hero/rabbitsfoot-studio-hero-poster.jpg',
    priority: '1.0'
  },
  {
    key: 'works',
    file: 'works.html',
    path: '/works',
    title: 'Work — Defence & Enterprise UX Case Studies | rabbitsfoot',
    description:
      'Case studies from rabbitsfoot: counter-drone command interfaces, drone fleet management, ammunition logistics, clinical data platforms and national-scale parking operations.',
    priority: '0.9'
  },
  {
    key: 'about',
    file: 'about.html',
    path: '/about',
    title: `About — ${Team_Word} Senior Designers in Bengaluru | rabbitsfoot`,
    description:
      `rabbitsfoot is ${TEAM_WORD} senior specialists spanning product, spatial, industrial, creative, technology and business design. The people you meet are the people who do the work.`,
    priority: '0.8'
  },
  {
    key: 'contact',
    file: 'contact.html',
    path: '/contact',
    title: 'Contact — Start a Design Project | rabbitsfoot, Bengaluru',
    description:
      'Start a project with rabbitsfoot. Book a 30-minute call, email studio@rabbitsfoot.in or call +91 93982 25962. Bengaluru-based, working worldwide.',
    /* The FAQ block lives on this route; build-seo.mjs lifts the visible
       questions into FAQPage structured data for this URL only. */
    faq: true,
    priority: '0.7'
  }
];

/**
 * Case studies. These pages are the studio's real SEO asset: almost nobody
 * publishes design work on counter-drone C2 or ammunition logistics, so the
 * competition for those terms is close to zero and the intent is high-value.
 */
export const CASE_STUDIES = [
  {
    file: 'prahari.html',
    path: '/prahari',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'PRAHARI — Counter-Drone Command & Control UX Case Study',
    published: '2023',
    name: 'PRAHARI — Counter-Drone Command Interface',
    description:
      'Designing a counter-drone command and control interface: threat classification, engagement decisions and operator load under time pressure. A rabbitsfoot defence design case study.',
    about: ['Counter-drone systems', 'Command and control interface design', 'Defence technology'],
    priority: '0.8'
  },
  {
    file: 'rojnica.html',
    path: '/rojnica',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Rojnica — Drone Fleet Management Software Case Study',
    published: '2025',
    name: 'Rojnica — Drone Fleet Management',
    description:
      'A fleet management interface for autonomous drones: mission planning, live telemetry and fleet health across many aircraft. A rabbitsfoot case study in autonomous-systems design.',
    about: ['Drone fleet management', 'Autonomous systems', 'Operations software design'],
    priority: '0.8'
  },
  {
    file: 'chargeur.html',
    path: '/chargeur',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Chargeur — Ammunition Logistics System Case Study',
    published: '2024',
    name: 'Chargeur — Ammunition Load Management',
    description:
      'Ammunition load management for defence logistics: tracking, allocation and accountability of ordnance across units. A rabbitsfoot mission-critical design case study.',
    about: ['Military logistics', 'Defence supply chain software', 'Inventory systems design'],
    priority: '0.8'
  },
  {
    file: 'vigil.html',
    path: '/vigil',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'VIGIL — Rugged Military Wearable Design Case Study',
    published: '2025',
    name: 'VIGIL — A Rugged Squad Wearable',
    description:
      'A rugged smartwatch and companion system for soldiers in darkness, rain and poor connectivity. Physical controls, haptics and glanceable alerts usable with gloves on.',
    about: ['Wearable design', 'Rugged hardware interface design', 'Defence technology'],
    priority: '0.8'
  },
  {
    file: 'muspell.html',
    path: '/muspell',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Muspell — Clinical Data Platform UX Case Study',
    published: '2023',
    name: 'Muspell — Clinical Intelligence Platform',
    description:
      'Turning long, fragmented patient records into a clear view of what changed and what care teams should do next. A rabbitsfoot healthcare product design case study.',
    about: ['Clinical data platforms', 'Healthcare UX', 'Health informatics'],
    priority: '0.8'
  },
  {
    file: 'penknife.html',
    path: '/penknife',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Penknife — Healthcare Staffing Platform Case Study',
    published: '2021',
    name: 'Penknife — Healthcare Staffing Platform',
    description:
      'One hiring platform replacing four disconnected tools, so recruiters, managers and candidates move from an open role to a filled shift without losing context.',
    about: ['Recruitment software', 'Healthcare staffing', 'Enterprise product design', 'Browser extension design'],
    priority: '0.7'
  },
  {
    file: 'parkbeheer.html',
    path: '/parkbeheer',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Parkbeheer NL — Parking Operations Software Case Study',
    published: '2025',
    name: 'Parkbeheer NL — National Parking Operations',
    description:
      'An operations platform for teams managing 923,000 parking spaces across the Netherlands, replacing spreadsheets with one shared workflow for patrols and field work.',
    about: ['Operations software', 'Municipal technology', 'Field service management'],
    priority: '0.7'
  },
  {
    file: 'klu-pos.html',
    path: '/klu-pos',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'KLu POS — Point of Sale for Defence Canteens',
    published: '2024',
    name: 'KLu POS — Point of Sale for Defence Canteens',
    description:
      'A point-of-sale system built for military canteens rather than restaurants: different stock, different rules, different people behind the counter.',
    about: ['Point of sale software', 'Defence services', 'Retail systems design'],
    priority: '0.7'
  },
  {
    file: 'titan-eyex.html',
    path: '/titan-eyex',
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Titan EyeX — Smart Eyewear Product Design Case Study',
    published: '2020',
    name: 'Titan EyeX — Smart Eyewear Ecosystem',
    description:
      'Designing a smart-eyewear ecosystem for Titan: hardware interaction, companion app and the system connecting them. A rabbitsfoot wearable design case study.',
    about: ['Smart eyewear', 'Wearable technology', 'Consumer hardware design'],
    priority: '0.7'
  },
  {
    file: "titan-eyeplus.html",
    path: "/titan-eyeplus",
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Titan Eyeplus — Eyewear E-commerce UX Case Study',
    published: '2021',
    name: "Titan Eyeplus — Designing Confidence into Eyewear Commerce",
    description:
      "End-to-end e-commerce redesign for Titan’s optical brand: product discovery, virtual try-on, checkout and repeat purchase. A rabbitsfoot commerce design case study.",
    about: ["E-commerce user experience", "Virtual try-on", "Retail commerce design"],
    priority: "0.7"
  }
];

/**
 * Interactive prototype demos. Each is a live, playable artefact that no
 * competitor has an equivalent of, so they stay indexable — but they sit
 * below their parent case study in the breadcrumb and the sitemap.
 */
export const PROTOTYPES = [
  {
    file: "prahari-app.html",
    path: "/prahari-app",
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'PRAHARI Interactive Demo — C-UAS Command Interface',
    published: '2023',
    name: "PRAHARI — C-UAS Command & Control (Interactive Demo)",
    description:
      "A playable demo of the PRAHARI counter-drone command and control interface: track classification, threat prioritisation and engagement flow.",
    about: ["Counter-drone systems", "Command and control interface design"],
    parent: ["PRAHARI", "/prahari"],
    priority: "0.5"
  },
  {
    file: "rojnica-app.html",
    path: "/rojnica-app",
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Rojnica Interactive Demo — Swarm Mission Planner',
    published: '2025',
    name: "Rojnica — Swarm Mission Planner (Interactive Demo)",
    description:
      "A playable demo of the Rojnica swarm mission planner: routing, deconfliction and live fleet telemetry across many drones.",
    about: ["Drone fleet management", "Swarm mission planning"],
    parent: ["Rojnica", "/rojnica"],
    priority: "0.5"
  },
  {
    file: "chargeur-app.html",
    path: "/chargeur-app",
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Chargeur Interactive Demo — Ammunition State',
    published: '2024',
    name: "Chargeur — Ammunition State (Interactive Demo)",
    description:
      "A playable demo of the Chargeur ammunition state interface: what is in the breech, what the fire order asked for, and how the mismatch is caught.",
    about: ["Military logistics", "Ammunition management systems"],
    parent: ["Chargeur", "/chargeur"],
    priority: "0.5"
  },
  {
    file: "parkbeheer-app.html",
    path: "/parkbeheer-app",
    /* Keyword-first for the SERP; the page's own H1 keeps the line with
       the personality in it. */
    title: 'Parkbeheer Interactive Demo — Parking Operations',
    published: '2025',
    name: "Parkbeheer NL — Car Park Management (Interactive Demo)",
    description:
      "A playable demo of the Parkbeheer operations interface: patrol planning, field records and mismatch resolution across national parking stock.",
    about: ["Operations software", "Field service management"],
    parent: ["Parkbeheer NL", "/parkbeheer"],
    priority: "0.5"
  }
];

/**
 * A genuine near-duplicate: an older cut of the Chargeur story. Points at the
 * canonical version and stays out of the index.
 */
export const CANONICAL_ONLY = [
  ["case-study.html", "/chargeur"]
];
