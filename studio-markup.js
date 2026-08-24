/**
 * studio-markup.js
 * ─────────────────────────────────────────────────────────────
 * Pure HTML-string builders for every region of the studio face.
 *
 * These used to live inside studio-render.js, which meant they only ever ran
 * in a browser — so the header, the work grid, the roster, the contact block
 * and the footer did not exist in the HTML a crawler is served. Google renders
 * JavaScript eventually; GPTBot, ClaudeBot, PerplexityBot and Applebot do not.
 * robots.txt invites all of them in, and they were arriving at four pages with
 * no navigation and no links to any case study.
 *
 * Nothing here touches the DOM. build-seo.mjs calls the same functions in Node
 * and bakes the result into the generated route files; studio-render.js calls
 * them in the browser only when a slot was left unrendered (i.e. when
 * studio.html is opened directly rather than through a built route).
 *
 * One definition, two consumers, byte-identical output.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.STUDIO_MARKUP = api;
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  var ORDER = ['home', 'works', 'about', 'contact'];

  /**
   * Per-route head copy and contact-block wording. `lineTwo` on about is a
   * function of the roster so the sign-off can never drift out of step with
   * the number of people actually listed on the page.
   */
  var ROUTES = {
    home: {
      label: 'Home',
      title: 'rabbitsfoot — Product design for the real world',
      description: 'rabbitsfoot is an independent design studio rooted in product design and UX, bringing product rigour to ambitious design problems in every form.',
      contact: {
        lead: 'Have a design problem worth solving?',
        reply: 'Good. We should talk.',
        lineOne: 'Bring us the',
        lineTwo: 'difficult bit.'
      }
    },
    works: {
      label: 'All works',
      title: 'All works — rabbitsfoot',
      description: 'Every project rabbitsfoot has shipped — enterprise operations, mission-critical systems, clinical intelligence and autonomous fleets.',
      contact: {
        lead: 'Seen something close to your problem?',
        reply: 'Let’s talk about yours.',
        lineOne: 'Start the',
        lineTwo: 'next one.'
      }
    },
    about: {
      label: 'About us',
      title: 'About us — rabbitsfoot',
      description: 'rabbitsfoot is a senior studio spanning product, spatial, industrial, creative, technology, marketing and strategy.',
      contact: {
        lead: 'Want the whole team on it?',
        reply: 'That’s the only way we work.',
        lineOne: 'Meet the',
        lineTwo: function (DATA) { return NUMBER[DATA.team.length] || DATA.team.length; }
      }
    },
    contact: {
      label: 'Contact us',
      title: 'Contact us — rabbitsfoot',
      description: 'Start a project with rabbitsfoot — book a 30-minute call, email rabbitsfootep@gmail.com or call +91 93982 25962.',
      contact: {
        lead: 'Prefer the direct route?',
        reply: 'It lands in a real inbox.',
        lineOne: 'Say the',
        lineTwo: 'first thing.'
      }
    }
  };

  var NUMBER = {
    5: 'five of us.', 6: 'six of us.', 7: 'seven of us.', 8: 'eight of us.',
    9: 'nine of us.', 10: 'ten of us.', 11: 'eleven of us.', 12: 'twelve of us.'
  };

  /** Clean URLs. Vercel serves works.html at /works, etc. */
  function href(name) {
    return name === 'home' ? '/' : '/' + name;
  }

  /**
   * Case-study pages are shared with the personal portfolio, so a link out of
   * the studio says which face it is leaving from: studio-nav.js reads
   * ?face=studio and dresses the page in the studio's header instead of the
   * portfolio's. Every such page carries a self-canonical without the query,
   * so the parameter never splits a URL in the index.
   */
  function projectHref(target) {
    if (!target) return target;
    return target + (target.indexOf('?') === -1 ? '?' : '&') + 'face=studio';
  }

  /* ── Chrome: header, mobile menu, progress bar, overlays ───────── */

  function chrome(DATA, route, wantsBooking) {
    var C = DATA.contact;

    var links = ORDER.map(function (name) {
      return '<a href="' + esc(href(name)) + '"' +
        (name === route ? ' aria-current="page"' : '') + '>' +
        esc(ROUTES[name].label) + '</a>';
    }).join('');

    var menuLinks = ORDER.map(function (name, index) {
      return '<a href="' + esc(href(name)) + '"' +
        (name === route ? ' aria-current="page"' : '') +
        '><small>' + pad(index + 1) + '</small>' + esc(ROUTES[name].label) + '</a>';
    }).join('');

    /* The signal canvas is drawn only behind the home hero, and the booking
       overlay is only reachable from the contact route — so neither is put in
       the document at all on the routes that never use them. */
    var signal = route === 'home'
      ? '<canvas class="signal" id="signal" aria-hidden="true"></canvas>'
      : '';

    var booking = wantsBooking
      ? '<div class="booking" data-booking hidden>' +
          '<div class="booking__panel" role="dialog" aria-modal="true"' +
          ' aria-label="Book a 30 minute call">' +
            '<button class="booking__close" type="button" data-booking-close' +
            ' aria-label="Close">Close ✕</button>' +
            '<div class="booking__frame"></div>' +
          '</div>' +
        '</div>'
      : '';

    /* Grain + custom cursor are pure overlay, so JS may own them.
       The loader stays in the page's HTML: it must paint before parse ends. */
    return signal +
      '<div class="noise" aria-hidden="true"></div>' +
      '<div class="cursor" aria-hidden="true"><i></i><span>View</span></div>' +
      '<header class="nav" id="nav">' +
        '<a class="nav__brand" href="/" aria-label="' + esc(C.studioName) + ' home">' +
          '<span class="brand-wordmark">' + esc(C.studioName) + '</span>' +
        '</a>' +
        '<nav class="nav__links" aria-label="Primary navigation">' + links + '</nav>' +
        '<button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu">' +
          '<span></span><span></span></button>' +
      '</header>' +
      '<aside class="menu" id="menu" aria-hidden="true">' +
        '<button class="menu__close" type="button" aria-label="Close menu">Close</button>' +
        '<nav>' + menuLinks + '</nav>' +
        '<p>' + esc(C.location) + '<br><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' +
          '<br><a href="tel:' + esc(C.phoneHref) + '">' + esc(C.phone) + '</a></p>' +
      '</aside>' +
      '<div class="progress" aria-hidden="true"><i></i></div>' +
      booking;
  }

  /* ── Circular type stamps ──────────────────────────────────────── */

  /* Each gets its own path id — two stamps sharing an id would silently make
     the second render the first one's arc. */
  function stamp(text, index) {
    var id = 'stamp-path-' + index;
    return '<svg viewBox="0 0 120 120">' +
        '<defs><path id="' + id + '"' +
        ' d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>' +
        '<text><textPath href="#' + id + '">' + esc(text) + '</textPath></text>' +
      '</svg>' +
      '<span>✦</span>';
  }

  /* ── Artwork: a couple of works have no photograph ─────────────── */

  /**
   * The first two cards on home are the largest thing above the fold, so they
   * load eagerly and carry a fetch priority; everything below stays lazy.
   * A stated width/height on every thumbnail reserves its box, which is what
   * keeps Cumulative Layout Shift at zero while the images arrive.
   */
  function media(DATA, work, eager) {
    if (work.image) {
      return '<img src="' + esc(work.image) + '" alt="' + esc(work.imageAlt) + '"' +
        ' width="1200" height="900"' +
        (eager
          ? ' loading="eager" fetchpriority="high" decoding="async">'
          : ' loading="lazy" decoding="async">');
    }
    return '<span class="project__art">' + (DATA.artwork[work.artwork] || '') + '</span>';
  }

  /* ── Home route: large alternating project cards ───────────────── */

  function featured(DATA) {
    return DATA.featured().map(function (work, index) {
      var w = DATA.view(work, 'studio');
      return '<a class="project ' + esc(w.accentClass) + ' cursor-view reveal" href="' + esc(projectHref(w.href)) + '"' +
        ' data-accent="' + esc(w.accent) + '">' +
        '<div class="project__media">' + media(DATA, w, index === 0) +
          '<span class="project__wash"></span><span class="project__arrow">↗</span>' +
        '</div>' +
        '<div class="project__body">' +
          '<div class="project__top"><span>' + pad(index + 1) + ' / ' + esc(w.discipline) + '</span>' +
            '<span>' + esc(w.meta) + '</span></div>' +
          '<h3>' + esc(w.title) + '</h3>' +
          '<p>' + esc(w.blurb) + '</p>' +
          '<span class="project__cta">View case study</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  /* ── Works route: filters + persistent visual project atlas ───── */

  function worksIndex(DATA) {
    var disciplines = DATA.activeDisciplines();

    var chips = '<button class="chip is-active" type="button" data-filter="all">' +
      'Everything<i>' + DATA.works.length + '</i></button>' +
      disciplines.map(function (d) {
        var count = DATA.works.filter(function (w) { return w.studio.discipline === d; }).length;
        return '<button class="chip" type="button" data-filter="' + esc(d) + '">' +
          esc(d) + '<i>' + count + '</i></button>';
      }).join('');

    var rows = DATA.works.map(function (work, index) {
      var w = DATA.view(work, 'studio');
      var live = Boolean(w.href);
      var tag = live ? 'a' : 'div';
      var attrs = live
        ? ' href="' + esc(projectHref(w.href)) + '" class="index-row cursor-view"'
        : ' class="index-row index-row--soon"';

      return '<' + tag + attrs +
        ' data-discipline="' + esc(w.discipline) + '"' +
        ' data-accent="' + esc(w.accent) + '"' +
        ' data-preview="' + esc(w.image || '') + '"' +
        ' style="--row-accent:' + esc(w.accent) + '">' +
        '<span class="index-row__num">' + pad(index + 1) + '</span>' +
        '<span class="index-row__thumb" aria-hidden="true">' + media(DATA, w, false) + '</span>' +
        '<h3 class="index-row__title">' + esc(w.title) + '</h3>' +
        '<span class="index-row__disc">' + esc(w.discipline) + '</span>' +
        '<p class="index-row__blurb">' + esc(w.blurb) + '</p>' +
        '<span class="index-row__meta">' + esc(w.meta) + '</span>' +
        '<span class="index-row__mark">' + (live ? '↗' : 'In progress') + '</span>' +
      '</' + tag + '>';
    }).join('');

    return '<div class="index__filters" role="group" aria-label="Filter work by discipline">' + chips + '</div>' +
      '<div class="index__rows">' + rows + '</div>' +
      '<p class="index__empty" hidden>Nothing in that lens yet.</p>';
  }

  /* ── Studio roster ─────────────────────────────────────────────── */

  function team(DATA) {
    return DATA.team.map(function (member, index) {
      var accent = member.accent || '#f1ede4';
      var link = member.linkedin
        ? '<a class="member__link" href="' + esc(member.linkedin) + '" target="_blank" rel="noopener noreferrer">' +
          'LinkedIn<b>↗</b></a>'
        : '';

      return '<article class="member reveal" style="--member-accent:' + esc(accent) + '">' +
        '<div class="member__frame">' +
          '<span class="member__mono" aria-hidden="true">' + esc(member.name.charAt(0)) + '</span>' +
          (member.photo
            ? '<img src="' + esc(member.photo) + '" alt="' + esc(member.name) + ' — ' + esc(member.role) +
              ' at rabbitsfoot" width="600" height="750" loading="lazy" decoding="async" onerror="this.remove()">'
            : '') +
          '<span class="member__index">' + pad(index + 1) + '</span>' +
        '</div>' +
        '<h3 class="member__name">' + esc(member.name) + '</h3>' +
        '<p class="member__role">' + esc(member.role) + '</p>' +
        '<p class="member__spec">' + esc(member.specialty) + '</p>' +
        '<p class="member__note">' + esc(member.note) + '</p>' +
        link +
      '</article>';
    }).join('');
  }

  /* ── Contact block + footer, on every route ────────────────────── */

  function contact(DATA, route) {
    var C = DATA.contact;
    var copy = ROUTES[route].contact;
    var lineTwo = typeof copy.lineTwo === 'function' ? copy.lineTwo(DATA) : copy.lineTwo;
    var contactHref = route === 'about' ? href('contact') : 'mailto:' + C.email;
    var elsewhere = route === 'about'
      ? '<div><span>Studio</span><p>Independent by design</p></div>'
      : '<div><span>Elsewhere</span><p>' +
          '<a href="' + esc(C.linkedin) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a></p></div>';

    return '<div class="contact__top"><span>' + esc(copy.lead) + '</span><span>' + esc(copy.reply) + '</span></div>' +
      '<a class="contact__link" href="' + esc(contactHref) + '">' +
        '<span>' + esc(copy.lineOne) + '</span>' +
        '<span>' + esc(lineTwo) + '<b>↗</b></span>' +
      '</a>' +
      '<footer class="contact__foot">' +
        '<div><span>New business</span><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' +
          '<br><a href="tel:' + esc(C.phoneHref) + '">' + esc(C.phone) + '</a></div>' +
        '<div><span>Based in</span><p>' + esc(C.location) + '<br>' + esc(C.reach) + '</p></div>' +
        elsewhere +
        '<p>© 2026 ' + esc(C.studioName) + ' studio</p>' +
      '</footer>';
  }

  return {
    esc: esc,
    pad: pad,
    ORDER: ORDER,
    ROUTES: ROUTES,
    href: href,
    projectHref: projectHref,
    chrome: chrome,
    stamp: stamp,
    featured: featured,
    worksIndex: worksIndex,
    team: team,
    contact: contact
  };
});
