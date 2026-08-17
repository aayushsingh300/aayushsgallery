/**
 * site-data.js
 * ─────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for both faces of the same body of work.
 *
 *   Face A — personal portfolio   (index.html, all-works.html)    → aayushsgallery.vercel.app
 *   Face B — studio               (studio.html, all four routes)  → studio domain, TBD
 *
 * Same projects. Same links. Two voices, two visual languages.
 * Add a project ONCE here and it appears on both faces.
 *
 * Each work has:
 *   shared identity  — id, title, href, image, tags, status
 *   .personal        — "I" voice, portfolio framing (client + year)
 *   .studio          — "we" voice, studio framing (discipline + region)
 *
 * ⚠ DIVERGENCE NOTE: personal.meta and studio.meta currently disagree on
 * the year for parkbeheer / rojnica / muspell (they were authored separately).
 * Both strings are preserved verbatim below so nothing changed under you —
 * but two public sites quoting different years for the same project is a
 * trust problem. Reconcile the ones marked `⚠ year mismatch`.
 */
(function (global) {
  'use strict';

  /* Studio filter lenses — order defines chip order on studio.html?p=works */
  var DISCIPLINES = [
    'Enterprise operations',
    'Mission-critical',
    'Clinical intelligence',
    'Autonomous systems',
    'Workforce systems',
    'Consumer & commerce',
    'Design systems'
  ];

  var WORKS = [
    {
      id: 'muspell',
      title: 'Muspell',
      href: 'muspell.html',
      image: 'gallery/muspell images/hero-mockup.png',
      imageAlt: 'Muspell clinical intelligence platform',
      tags: ['healthcare', 'b2b', 'saas'],
      status: 'live',
      personal: {
        subtitle: 'Clinical Health Data Platform',
        tagLabels: ['Healthcare', 'B2B'],
        blurb: 'A clinical data platform relied on by thousands of clinicians: turning dense patient records into interfaces care teams can act on.',
        meta: '314e Corporation · 2022',
        thumb: 'images/portfolio-assets/2uJ7RgaBPFgwEOtqN8tkdt0bYcM.png'
      },
      studio: {
        discipline: 'Clinical intelligence',
        blurb: 'Patient complexity made clear enough to act on.',
        meta: 'Europe · 2023', /* ⚠ year mismatch vs personal (2022) */
        accent: '#c6ff54',
        accentClass: 'project--green',
        featured: 3
      }
    },

    {
      id: 'penknife',
      title: 'Penknife',
      href: 'penknife.html',
      image: 'penknife/image%201.jpg',
      imageAlt: 'Penknife white-label healthcare staffing platform',
      tags: ['saas', 'b2b', 'healthcare'],
      status: 'live',
      personal: {
        subtitle: 'ATS + CRM · White-Label Healthcare Staffing',
        tagLabels: ['Healthcare', 'SaaS', 'Service Design'],
        blurb: 'Unifying a fragmented four-tool recruitment stack into one white-label platform for US hospital networks. Live at UCLA Health. ATS + CRM collapsed into a single recruiter workflow.',
        meta: '314e Corporation · Healthcare · 2021'
      },
      studio: {
        discipline: 'Workforce systems',
        blurb: 'Four tools, five roles, one recruiter workflow.',
        meta: 'United States · 2021',
        accent: '#f0b429',
        accentClass: 'project--amber'
      }
    },

    {
      id: 'chargeur',
      title: 'Chargeur',
      href: 'chargeur.html',
      image: 'images/hero/f61d554ae36d575b1da2095e5f27f4f1cbe9268e.png',
      imageAlt: 'Chargeur armoured vehicle load management interface',
      tags: ['defence', 'b2b', 'concept'],
      status: 'live',
      personal: {
        title: 'CHARGEUR',
        subtitle: 'Ammunition Management System',
        tagLabels: ['Under NDA', 'Defence', 'B2B'],
        blurb: 'Redesigning ammunition load management for the ALT-3 armored vehicle fleet. 0 mismatch errors and 41% faster type-switching in evaluation.',
        meta: 'Defence · Under NDA · 2024'
      },
      studio: {
        discipline: 'Mission-critical',
        blurb: 'Zero-mismatch load management for an armoured fleet.',
        meta: 'Europe · 2024',
        accent: '#6d8fff',
        accentClass: 'project--blue',
        featured: 2
      }
    },

    {
      id: 'vigil',
      title: 'Vigil',
      href: 'vigil.html',
      image: null,
      imageAlt: 'Vigil tactical wearable system',
      tags: ['defence', 'b2b', 'concept'],
      status: 'live',
      /* No hero photograph — the artwork is drawn inline. */
      artwork: 'vigil',
      personal: {
        title: 'VIGIL',
        subtitle: 'Tactical Wearable System',
        tagLabels: ['Under NDA', 'Defence', 'Wearable'],
        blurb: 'Designing a tactical wearable for NATO infantry who cannot touch a screen, in darkness, under fire, with gloves on. 67 screens. Wear OS 4 + iOS/Android.',
        meta: 'Defence · Under NDA · 2025'
      },
      studio: {
        discipline: 'Mission-critical',
        blurb: 'A wrist you can read in the dark, with gloves on, under fire.',
        meta: 'NATO programme · 2025',
        accent: '#4ade80',
        accentClass: 'project--green'
      }
    },

    {
      id: 'prahari',
      title: 'Prahari',
      href: 'prahari.html',
      image: 'images/hero/3258a21f2393a8a7a121be48522e00f1763cc596.png',
      imageAlt: 'Prahari counter-UAS command and control',
      tags: ['defence', 'b2b', 'concept'],
      status: 'live',
      personal: {
        title: 'PRAHARI',
        subtitle: 'C-UAS Command & Control',
        tagLabels: ['Under NDA', 'Defence', 'B2B'],
        blurb: 'Designing the single surface that tells a duty officer whether to act on a drone threat in under five seconds. Client withheld under NDA.',
        meta: 'Defence · Under NDA · 2023'
      },
      studio: {
        discipline: 'Mission-critical',
        blurb: 'Act or hold — decided in under five seconds.',
        meta: 'India · 2023',
        accent: '#ff5c3f',
        accentClass: 'project--amber'
      }
    },

    {
      id: 'rojnica',
      title: 'Rojnica',
      href: 'rojnica.html',
      image: 'images/hero/8e872aef4bda3c9c75e58c3b6bc2fe1e348856b7.png',
      imageAlt: 'Rojnica agricultural drone fleet system',
      tags: ['b2b', 'enterprise', 'concept'],
      status: 'live',
      personal: {
        title: 'ROJNICA',
        subtitle: 'Swarm Fleet Management',
        tagLabels: ['Under NDA', 'B2B', 'Agriculture'],
        blurb: 'Coordinating 12 agricultural drones across 2,760 hectares within a 48-hour treatment window. Three interfaces, one system.',
        meta: 'Agriculture · Under NDA · 2024'
      },
      studio: {
        discipline: 'Autonomous systems',
        blurb: 'Twelve drones. One narrow window. No room for confusion.',
        meta: 'India · 2025', /* ⚠ year mismatch vs personal (2024) */
        accent: '#c59aff',
        accentClass: 'project--violet',
        featured: 4
      }
    },

    {
      id: 'parkbeheer',
      title: 'Parkbeheer',
      href: 'parkbeheer.html',
      image: 'images/hero/0f6b5d25704bdb0a6bd7a0f6bab98cbeb3b06450.png',
      imageAlt: 'Parkbeheer enforcement operations platform',
      tags: ['b2b', 'enterprise', 'concept'],
      status: 'live',
      personal: {
        title: 'Parkbeheer NL',
        subtitle: 'Enterprise B2G Platform',
        tagLabels: ['Under NDA', 'B2B', 'Enterprise', 'Government'],
        blurb: 'Replacing a 20-year-old spreadsheet system with an enterprise platform for 120+ parking officers managing 923K spaces across the Netherlands.',
        meta: 'Government · Under NDA · 2018'
      },
      studio: {
        discipline: 'Enterprise operations',
        blurb: '923,000 parking spaces. One coherent operating system.',
        meta: 'Netherlands · 2025', /* ⚠ year mismatch vs personal (2018) */
        accent: '#ff663d',
        accentClass: 'project--amber',
        featured: 1
      }
    },

    {
      id: 'titan-eyex',
      title: 'Titan EYEx',
      href: 'titaneyeplus_casestudy.html',
      image: 'images/portfolio-assets/eAP1hftLsiBHkOmZfM0MSnB3QRc.webp',
      imageAlt: 'Titan EYEx eyewear product experience',
      tags: ['b2c', 'ecommerce'],
      status: 'live',
      personal: {
        subtitle: 'Eyewear Product Experience',
        tagLabels: ['B2C', 'Retail'],
        blurb: "Redesigning the eyewear browsing and selection experience for Titan's optical retail brand, combining prescription management with style discovery.",
        meta: 'Titan Company · 2020'
      },
      studio: {
        discipline: 'Consumer & commerce',
        blurb: 'Prescription complexity, hidden behind a shopping experience.',
        meta: 'India · 2020',
        accent: '#dfff45',
        accentClass: 'project--green'
      }
    },

    {
      id: 'titan-eyeplus',
      title: 'Titan Eyeplus',
      href: 'titaneyeplus_casestudy.html',
      image: 'images/portfolio-assets/5FjWGy3WVjOTw0gnaugcHjpZJE.png',
      imageAlt: 'Titan Eyeplus e-commerce experience',
      tags: ['b2c', 'ecommerce'],
      status: 'live',
      personal: {
        subtitle: 'E-commerce Experiences',
        tagLabels: ['B2C', 'E-commerce'],
        blurb: "End-to-end e-commerce redesign for Titan's optical brand: from product discovery and virtual try-on to checkout and repeat purchase flows.",
        meta: 'Titan Company · 2021'
      },
      studio: {
        discipline: 'Consumer & commerce',
        blurb: 'Discovery to checkout, rebuilt around the repeat buyer.',
        meta: 'India · 2021',
        accent: '#6d8fff',
        accentClass: 'project--blue'
      }
    },

    {
      id: 'lego-ds',
      title: 'Lego Design System',
      href: null,
      image: 'images/portfolio-assets/DTDT1mezgd4M2D43u4CrreaHo4U.webp',
      imageAlt: 'Lego design system components',
      tags: ['design-system', 'b2b'],
      status: 'wip',
      personal: {
        subtitle: 'UI Architecture & Components',
        tagLabels: ['Design System', 'B2B'],
        blurb: 'Building a scalable, component-driven design system for modular product experiences. Consistency at every brick.',
        meta: 'Design System · 2022'
      },
      studio: {
        discipline: 'Design systems',
        blurb: 'One component library holding a modular product family together.',
        meta: 'In progress · 2022',
        accent: '#dfff45',
        accentClass: 'project--green'
      }
    },

    {
      id: 'klu-pos',
      title: 'Klu POS',
      href: null,
      image: 'images/portfolio-assets/KDIsBR1Oo8sHA7wHGqSwpY6or4.webp',
      imageAlt: 'Klu point of sale interface',
      tags: ['b2b', 'saas'],
      status: 'wip',
      personal: {
        subtitle: 'Point of Sale System',
        tagLabels: ['B2B', 'FinTech', 'Retail'],
        blurb: 'A fast, touch-first point-of-sale interface for F&B and retail, designed for speed, error recovery, and end-of-day clarity.',
        meta: 'FinTech · 2022'
      },
      studio: {
        discipline: 'Consumer & commerce',
        blurb: 'Touch-first tills built for speed and for the moment it goes wrong.',
        meta: 'In progress · 2022',
        accent: '#ff5c3f',
        accentClass: 'project--amber'
      }
    },

    {
      id: 'healthcare-web',
      title: 'Healthcare Web Conversion',
      href: null,
      image: 'images/portfolio-assets/ud9KeBMYBcqOvOmbmecKrZcxo.webp',
      imageAlt: 'Healthcare product web UI',
      tags: ['b2c'],
      status: 'wip',
      personal: {
        title: 'Increasing conversions by just upgrading Healthcare product web UI',
        subtitle: 'Healthcare · Web · Conversion',
        tagLabels: ['B2C', 'Healthcare', 'Web'],
        blurb: 'Revamping healthcare product landing pages with a focus on conversion uplift, clarity of clinical claims, and brand alignment across digital touchpoints.',
        meta: 'Healthcare · Web · Conversion'
      },
      studio: {
        discipline: 'Consumer & commerce',
        blurb: 'Clinical claims made legible enough to convert on.',
        meta: 'In progress',
        accent: '#c59aff',
        accentClass: 'project--violet'
      }
    }
  ];

  /**
   * TEAM — studio face only.
   *
   * ⚠ TODO for Aayush: `role`, `specialty` and `note` below are PLACEHOLDERS
   * written to give the page shape — confirm or rewrite each one.
   * `linkedin: null` means "no verified profile URL yet" and the UI simply
   * omits the link. Never guess a LinkedIn URL: it can land on a stranger.
   *
   * Photos: drop a square-ish portrait at images/team/<id>.jpg and it appears.
   * Until then the roster falls back to a drawn monogram, so nothing breaks.
   */
  var TEAM = [
    {
      id: 'aayush',
      name: 'Aayush',
      role: 'Founder · Product Design',
      specialty: 'Systems design & mission-critical interfaces',
      note: 'Starts every project in the field, ends it beside the engineers.',
      photo: 'images/portfolio-assets/Aayush profile picture.png',
      linkedin: 'https://www.linkedin.com/in/aayushran/',
      accent: '#ff5c3f'
    },
    {
      id: 'kashish',
      name: 'Kashish',
      role: 'Design Research',
      specialty: 'Field research & behavioural insight',
      note: 'Turns messy observation into the constraint everyone designs against.',
      photo: 'images/team/kashish.jpg',
      linkedin: null,
      accent: '#dfff45'
    },
    {
      id: 'alok',
      name: 'Alok',
      role: 'Interaction Design',
      specialty: 'Complex flows, state & edge cases',
      note: 'Obsessed with the screens that only appear when something goes wrong.',
      photo: 'images/team/alok.jpg',
      linkedin: null,
      accent: '#6d8fff'
    },
    {
      id: 'jovi',
      name: 'Jovi',
      role: 'Visual Systems',
      specialty: 'Design systems, typography & brand',
      note: 'Keeps a hundred screens looking like they came from one hand.',
      photo: 'images/team/jovi.jpg',
      linkedin: null,
      accent: '#c59aff'
    },
    {
      id: 'himshikha',
      name: 'Himshikha',
      role: 'Product Design',
      specialty: 'Service design & clinical workflows',
      note: 'Maps the whole service, then designs the three screens that matter.',
      photo: 'images/team/himshikha.jpg',
      linkedin: null,
      accent: '#f1ede4'
    },
    {
      id: 'prashant',
      name: 'Prashant',
      role: 'Prototyping & Front-end',
      specialty: 'Motion, prototypes & build support',
      note: 'Makes the idea real early enough to be argued with.',
      photo: 'images/team/prashant.jpg',
      linkedin: null
    }
  ];

  /**
   * A couple of works have no hero photograph — their artwork is drawn.
   * Kept here so both faces render the same mark.
   */
  var ARTWORK = {
    vigil:
      '<svg class="work-drawn" viewBox="0 0 80 80" aria-hidden="true">' +
        '<rect x="22" y="8" width="36" height="64" rx="12" fill="#111827" stroke="#4ADE80" stroke-width="1"/>' +
        '<rect x="29" y="16" width="22" height="30" rx="3" fill="#0A0E14"/>' +
        '<circle cx="40" cy="31" r="9" fill="none" stroke="#4ADE80" stroke-width=".7" stroke-opacity=".5"/>' +
        '<polygon points="40,23 42,29 40,28 38,29" fill="#4ADE80"/>' +
        '<text x="40" y="50" font-family="monospace" font-size="3.5" fill="#4ADE80" text-anchor="middle">VIGIL</text>' +
        '<circle cx="40" cy="60" r="2" fill="#4ADE80"/>' +
      '</svg>'
  };

  /* ── Shared contact / identity facts, used by both faces ────────── */
  var CONTACT = {
    studioName: 'rabbitsfoot',
    email: 'hello@rabbitsfoot.studio',
    personalEmail: 'aayushsingh300@gmail.com',
    location: 'Bengaluru, India',
    reach: 'Working worldwide',
    linkedin: 'https://www.linkedin.com/in/aayushran/',
    instagram: 'https://www.instagram.com/aayushrajputt__',
    medium: 'https://medium.com/@aayushux',
    /* Same booking surface both faces use */
    booking: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2FssCYTwsJpfsqzieRw1N_hdniZm1YsRg4kS8m1nfhvwExD3rL6XVSRggkpJmAC0TLajuHXp-j?gv=true'
  };

  /* ── Helpers ────────────────────────────────────────────────────── */

  /** Works in the order the studio home page features them. */
  function featured() {
    return WORKS
      .filter(function (w) { return w.studio && w.studio.featured; })
      .sort(function (a, b) { return a.studio.featured - b.studio.featured; });
  }

  /** Disciplines that actually have at least one work behind them. */
  function activeDisciplines() {
    return DISCIPLINES.filter(function (d) {
      return WORKS.some(function (w) { return w.studio.discipline === d; });
    });
  }

  /** Face-aware view of one work: merges shared identity + one voice. */
  function view(work, face) {
    var voice = work[face] || {};
    return {
      id: work.id,
      title: voice.title || work.title,
      href: work.href,
      image: voice.thumb || work.image,
      imageAlt: work.imageAlt,
      artwork: work.artwork,
      tags: work.tags,
      status: work.status,
      subtitle: voice.subtitle,
      tagLabels: voice.tagLabels,
      blurb: voice.blurb,
      meta: voice.meta,
      discipline: voice.discipline,
      accent: voice.accent,
      accentClass: voice.accentClass
    };
  }

  global.SITE_DATA = {
    works: WORKS,
    team: TEAM,
    contact: CONTACT,
    artwork: ARTWORK,
    disciplines: DISCIPLINES,
    featured: featured,
    activeDisciplines: activeDisciplines,
    view: view
  };
})(window);
