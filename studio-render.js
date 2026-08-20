/**
 * studio-render.js
 * ─────────────────────────────────────────────────────────────
 * The studio face's routing, shared chrome and renderers.
 *
 * The entire studio lives in ONE document, studio.html, holding four routes:
 *
 *   studio.html            home
 *   studio.html?p=works    works
 *   studio.html?p=about    about
 *   studio.html?p=contact  contact
 *
 * An inline script in studio.html's <head> validates ?p= and stamps it on
 * <html data-route>; CSS hides every section group that is not the active
 * route. This file reads that same attribute to pick the title, description
 * and contact copy, and to mark the active nav tab. Nav links are ordinary
 * <a href>, so each tab is a real document load — identical behaviour to when
 * these were four separate HTML files.
 *
 * Every list of work is drawn from site-data.js, so a project is added in
 * exactly one place and both faces stay in step.
 *
 * Load order matters:  site-data.js → studio-render.js → studio.js
 * (all with `defer`, which preserves document order). Rendering must finish
 * before studio.js wires up observers against the resulting DOM.
 *
 * Hooks, placed as empty elements in the HTML:
 *   data-render="chrome"          header + menu + progress + overlays
 *   data-render="featured-works"  the home route's large alternating cards
 *   data-render="works-index"     the full visual work index + filters
 *   data-render="team"            the studio roster
 *   data-render="contact"         the coral contact block + footer
 *   data-stamp="TEXT · "          a circular rotating type stamp
 */
(function (global) {
  'use strict';

  var DATA = global.SITE_DATA;
  if (!DATA) return;

  var C = DATA.contact;

  /* ── Small helpers ─────────────────────────────────────────────── */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /**
   * Is this element on the route being shown?
   *
   * Elements outside any [data-page] group (the contact block) are on every
   * route. A group may name MORE THAN ONE route — data-page="contact home"
   * puts the same section on both, matching the CSS gate's ~= word test — so
   * a block that belongs in two places is authored once.
   */
  function onRoute(element) {
    var group = element.closest('[data-page]');
    if (!group) return true;
    return group.dataset.page.split(/\s+/).indexOf(route) !== -1;
  }

  /**
   * A render hook, but only if it belongs to the route being shown, so we
   * never build a work index or roster into sections nobody is looking at.
   */
  function slot(name) {
    var host = document.querySelector('[data-render="' + name + '"]');
    if (!host) return null;
    return onRoute(host) ? host : null;
  }

  /* ── Routes ────────────────────────────────────────────────────── */

  /* The <head> script already validated ?p= and fell back to home. */
  var route = document.documentElement.dataset.route || 'home';

  /**
   * Per-route head copy and contact-block wording. The contact block itself
   * is defined once (renderContact) and appears on all four routes — only
   * these four strings change with the route.
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
      description: 'rabbitsfoot is nine senior specialists spanning product, spatial, industrial, creative, technology and business design.',
      contact: {
        lead: 'Want the whole team on it?',
        reply: 'That’s the only way we work.',
        lineOne: 'Meet the',
        lineTwo: 'nine of us.'
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

  var ORDER = ['home', 'works', 'about', 'contact'];
  var HERE = ROUTES[route];

  /** Home is the bare file; every other route carries ?p=. */
  function href(name) {
    return name === 'home' ? 'studio.html' : 'studio.html?p=' + name;
  }

  /**
   * Case-study pages are shared with the personal portfolio, so a link out of
   * the studio says which face it is leaving from: studio-nav.js reads
   * ?face=studio and dresses the page in the studio's header instead of the
   * portfolio's. See studio-nav.js for the full detection order.
   */
  function projectHref(href) {
    if (!href) return href;
    return href + (href.indexOf('?') === -1 ? '?' : '&') + 'face=studio';
  }

  function applyHead() {
    document.title = HERE.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', HERE.description);
  }

  /**
   * Home deliberately ends with the practical invitation after the coral
   * sign-off. On the dedicated contact route, keep the more natural reading
   * order: page introduction, ways to start, then the final sign-off/footer.
   * The loader covers this pre-render move, so it never creates layout shift.
   */
  function orderClosingSections() {
    if (route !== 'contact') return;
    var engage = document.querySelector('.engage[data-page~="contact"]');
    var contact = document.querySelector('[data-render="contact"]');
    if (engage && contact && engage.parentNode === contact.parentNode) {
      contact.parentNode.insertBefore(engage, contact);
    }
  }

  /* ── Chrome: header, mobile menu, progress bar, overlays ───────── */

  function renderChrome() {
    var host = slot('chrome');
    if (!host) return;

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

    /* The overlay is built wherever a "Book 30 minutes" button is actually
       reachable — the contact page and, since it repeats there, the end of
       home — and left out of the document on the routes that never open it. */
    var wantsBooking = [].slice.call(document.querySelectorAll('[data-booking-open]')).some(onRoute);

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

    host.outerHTML =
      /* Grain + custom cursor are pure overlay, so JS may own them.
         The loader stays in the page's HTML: it must paint before parse ends. */
      signal +
      '<div class="noise" aria-hidden="true"></div>' +
      '<div class="cursor" aria-hidden="true"><i></i><span>View</span></div>' +
      '<header class="nav" id="nav">' +
        '<a class="nav__brand" href="studio.html" aria-label="' + esc(C.studioName) + ' home">' +
          '<svg viewBox="0 0 56 24" aria-hidden="true">' +
            '<path d="M2 21C12 20 17 14 17 4c7 1 10 7 9 16M16 9C11 2 5 3 2 6c1 7 6 11 14 11M27 19c9 4 19 1 26-9"/>' +
          '</svg>' +
          '<b>' + esc(C.studioName) + '</b>' +
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

  /* ── Deferred media ────────────────────────────────────────────── */

  /* Markup parked in a <template> so it fetches nothing until its route is
     the active one — a hidden <video> or <img> downloads regardless of
     display:none, which on one file would mean paying for every route. */
  function inflateMedia() {
    document.querySelectorAll('template[data-media]').forEach(function (tpl) {
      if (!onRoute(tpl)) return;
      tpl.parentNode.replaceChild(tpl.content.cloneNode(true), tpl);
    });
  }

  /* ── Circular type stamps ──────────────────────────────────────── */

  /* One definition for every stamp on the site. Each gets its own path id —
     two stamps sharing an id would silently make the second render the
     first one's arc. */
  function renderStamps() {
    document.querySelectorAll('[data-stamp]').forEach(function (host, index) {
      var id = 'stamp-path-' + index;
      host.innerHTML =
        '<svg viewBox="0 0 120 120">' +
          '<defs><path id="' + id + '"' +
          ' d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"/></defs>' +
          '<text><textPath href="#' + id + '">' + esc(host.dataset.stamp) + '</textPath></text>' +
        '</svg>' +
        '<span>✦</span>';
    });
  }

  /* ── Artwork: a couple of works have no photograph ─────────────── */

  var ARTWORK = DATA.artwork;

  function media(work) {
    if (work.image) {
      return '<img src="' + esc(work.image) + '" alt="' + esc(work.imageAlt) + '"' +
        ' loading="lazy" decoding="async">';
    }
    return '<span class="project__art">' + (ARTWORK[work.artwork] || '') + '</span>';
  }

  /* ── Home route: large alternating project cards ───────────────── */

  function renderFeatured() {
    var host = slot('featured-works');
    if (!host) return;

    host.className = 'projects';
    host.removeAttribute('data-render');
    host.innerHTML = DATA.featured().map(function (work, index) {
      var w = DATA.view(work, 'studio');
      return '<a class="project ' + esc(w.accentClass) + ' cursor-view reveal" href="' + esc(projectHref(w.href)) + '"' +
        ' data-accent="' + esc(w.accent) + '">' +
        '<div class="project__media">' + media(w) +
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

  function renderWorksIndex() {
    var host = slot('works-index');
    if (!host) return;

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
        '<span class="index-row__thumb" aria-hidden="true">' + media(w) + '</span>' +
        '<h3 class="index-row__title">' + esc(w.title) + '</h3>' +
        '<span class="index-row__disc">' + esc(w.discipline) + '</span>' +
        '<p class="index-row__blurb">' + esc(w.blurb) + '</p>' +
        '<span class="index-row__meta">' + esc(w.meta) + '</span>' +
        '<span class="index-row__mark">' + (live ? '↗' : 'In progress') + '</span>' +
      '</' + tag + '>';
    }).join('');

    host.className = 'index';
    host.removeAttribute('data-render');
    host.innerHTML =
      '<div class="index__filters" role="group" aria-label="Filter work by discipline">' + chips + '</div>' +
      '<div class="index__rows">' + rows + '</div>' +
      '<p class="index__empty" hidden>Nothing in that lens yet.</p>';

    wireFilters(host);
  }

  function wireFilters(host) {
    var chips = [].slice.call(host.querySelectorAll('.chip'));
    var rows = [].slice.call(host.querySelectorAll('.index-row'));
    var empty = host.querySelector('.index__empty');

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.dataset.filter;
        chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });

        var shown = 0;
        rows.forEach(function (row) {
          var match = filter === 'all' || row.dataset.discipline === filter;
          row.classList.toggle('is-hidden', !match);
          if (match) shown += 1;
        });
        empty.hidden = shown > 0;
      });
    });
  }

  /* ── Studio roster ─────────────────────────────────────────────── */

  function monogram(member) {
    return '<span class="member__mono" aria-hidden="true">' + esc(member.name.charAt(0)) + '</span>';
  }

  function renderTeam() {
    var host = slot('team');
    if (!host) return;

    host.className = 'roster';
    host.removeAttribute('data-render');
    host.innerHTML = DATA.team.map(function (member, index) {
      var accent = member.accent || '#f1ede4';
      var link = member.linkedin
        ? '<a class="member__link" href="' + esc(member.linkedin) + '" target="_blank" rel="noopener noreferrer">' +
          'LinkedIn<b>↗</b></a>'
        : '<span class="member__link member__link--none">LinkedIn soon</span>';

      return '<article class="member reveal" style="--member-accent:' + esc(accent) + '">' +
        '<div class="member__frame">' +
          monogram(member) +
          (member.photo
            ? '<img src="' + esc(member.photo) + '" alt="' + esc(member.name) + '"' +
              ' loading="lazy" decoding="async" onerror="this.remove()">'
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

  function renderContact() {
    var host = slot('contact');
    if (!host) return;

    var copy = HERE.contact;
    var contactHref = route === 'about' ? href('contact') : 'mailto:' + C.email;

    host.className = 'contact';
    host.id = host.id || 'contact';
    host.setAttribute('data-theme', 'coral');
    host.removeAttribute('data-render');
    host.innerHTML =
      '<div class="contact__top"><span>' + esc(copy.lead) + '</span><span>' + esc(copy.reply) + '</span></div>' +
      '<a class="contact__link" href="' + esc(contactHref) + '">' +
        '<span>' + esc(copy.lineOne) + '</span>' +
        '<span>' + esc(copy.lineTwo) + '<b>↗</b></span>' +
      '</a>' +
      '<footer class="contact__foot">' +
        '<div><span>New business</span><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' +
          '<br><a href="tel:' + esc(C.phoneHref) + '">' + esc(C.phone) + '</a></div>' +
        '<div><span>Based in</span><p>' + esc(C.location) + '<br>' + esc(C.reach) + '</p></div>' +
        '<div><span>Elsewhere</span><p>' +
          '<a href="' + esc(C.linkedin) + '" target="_blank" rel="noopener noreferrer">LinkedIn</a><br>' +
          '<a href="index.html">Personal portfolio ↗</a></p></div>' +
        '<p>© 2026 ' + esc(C.studioName) + ' studio</p>' +
      '</footer>';
  }

  /* ── Booking overlay ───────────────────────────────────────────── */

  function wireBooking() {
    var overlay = document.querySelector('[data-booking]');
    if (!overlay) return;

    var frame = overlay.querySelector('.booking__frame');
    var loaded = false;

    function open() {
      if (!loaded) {
        /* Deferred until first open — the embed is ~1MB of third-party JS. */
        frame.innerHTML = '<iframe src="' + esc(C.booking) + '" title="Booking calendar"' +
          ' loading="lazy" frameborder="0"></iframe>';
        loaded = true;
      }
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('is-open'); });
      document.body.classList.add('menu-open');
    }

    function close() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      setTimeout(function () { overlay.hidden = true; }, 320);
    }

    document.querySelectorAll('[data-booking-open]').forEach(function (button) {
      button.addEventListener('click', open);
    });
    overlay.querySelector('[data-booking-close]').addEventListener('click', close);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) close();
    });
    addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !overlay.hidden) close();
    });
  }

  /* ── Go ────────────────────────────────────────────────────────── */

  applyHead();
  orderClosingSections();
  renderChrome();
  inflateMedia();
  renderStamps();
  renderFeatured();
  renderWorksIndex();
  renderTeam();
  renderContact();
  wireBooking();
})(window);
