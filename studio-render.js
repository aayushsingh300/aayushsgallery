/**
 * studio-render.js
 * ─────────────────────────────────────────────────────────────
 * The studio face's routing, shared chrome and renderers.
 *
 * The entire studio lives in ONE document, studio.html, holding four routes:
 *
 *   /            home        (built to index.html)
 *   /works       works       (built to works.html)
 *   /about       about       (built to about.html)
 *   /contact     contact     (built to contact.html)
 *
 * An inline script in the <head> stamps the active route on <html data-route>;
 * CSS hides every section group that is not the active route. This file reads
 * that same attribute to mark the active nav tab and pick the contact copy.
 * Nav links are ordinary <a href>, so each tab is a real document load.
 *
 * ── Pre-rendering ──────────────────────────────────────────────
 * The markup itself now lives in studio-markup.js, which build-seo.mjs also
 * runs in Node. The four generated route files therefore ship the header, the
 * work grid, the roster and the footer as real HTML — crawlers that do not
 * execute JavaScript (GPTBot, ClaudeBot, PerplexityBot, Applebot) see the
 * whole page and every internal link on first byte.
 *
 * So each renderer below is written to do one of two things:
 *   • the slot is still an empty [data-render] placeholder → build it
 *     (this is what happens when studio.html is opened directly), or
 *   • the build already filled it → adopt it and only wire behaviour.
 *
 * Either way the DOM ends up identical, and no work is done twice.
 *
 * Load order matters:  site-data.js → studio-markup.js → studio-render.js
 * → studio.js (all `defer`, which preserves document order).
 *
 * Hooks, placed as empty elements in studio.html:
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
  var M = global.STUDIO_MARKUP;
  if (!DATA || !M) return;

  var C = DATA.contact;

  /* The <head> script already validated the route and fell back to home. */
  var route = document.documentElement.dataset.route || 'home';
  var HERE = M.ROUTES[route];

  /* Case studies are shared with the personal portfolio and studio-nav.js
     picks a header from the face remembered for this visit. Recording it here
     is what lets every link out of the studio stay a clean, canonical URL
     instead of carrying ?face=studio — see projectHref in studio-markup.js.
     nav-component.js writes 'personal' the same way on the portfolio pages. */
  try { sessionStorage.setItem('rf-face', 'studio'); } catch (e) { /* private mode */ }

  /* Clean URLs such as /works need a web server. When a page is opened from
     Finder, translate them to the real sibling files instead of accidentally
     pointing at the Mac's filesystem root. HTTP(S) output stays unchanged. */
  function localHref(value) {
    if (location.protocol !== 'file:' || !value || value.charAt(0) !== '/' || value.slice(0, 2) === '//') {
      return value;
    }

    var match = value.match(/^([^?#]*)([?#][\s\S]*)?$/);
    var path = match[1].replace(/^\/+|\/+$/g, '');
    var suffix = match[2] || '';
    if (!path) return 'index.html' + suffix;
    return path + (/\.html$/i.test(path) ? '' : '.html') + suffix;
  }

  function rewriteLocalLinks() {
    if (location.protocol !== 'file:') return;
    document.querySelectorAll('a[href]').forEach(function (link) {
      link.setAttribute('href', localHref(link.getAttribute('href')));
    });
  }

  /**
   * Is this element on the route being shown?
   *
   * Elements outside any [data-page] group (the contact block) are on every
   * route. A group may name MORE THAN ONE route — data-page="contact home" —
   * matching the CSS gate's ~= word test, so a block that belongs in two
   * places is authored once.
   */
  function onRoute(element) {
    var group = element.closest('[data-page]');
    if (!group) return true;
    return group.dataset.page.split(/\s+/).indexOf(route) !== -1;
  }

  /**
   * Find a region either as an unrendered [data-render] slot or as the markup
   * the build already put there. Returns { host, filled } — `filled` true
   * means only behaviour still needs wiring.
   */
  function region(name, builtClass) {
    var slot = document.querySelector('[data-render="' + name + '"]');
    if (slot) return onRoute(slot) ? { host: slot, filled: false } : null;
    var built = builtClass && document.querySelector('.' + builtClass);
    return built ? { host: built, filled: true } : null;
  }

  function applyHead() {
    /* The generated route files already ship the correct title, description
       and canonical in the HTML source, where crawlers and link-preview bots
       read them without running JS. Rewriting them here would silently undo
       that, so only script the head when this file is opened directly as
       studio.html, which carries no canonical. */
    if (document.querySelector('link[rel="canonical"]')) return;
    document.title = HERE.title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', HERE.description);
  }

  /**
   * Home deliberately ends with the practical invitation after the coral
   * sign-off. On the dedicated contact route, keep the more natural reading
   * order: page introduction, ways to start, then the final sign-off/footer.
   * The build performs this move statically; this is the fallback for
   * studio.html opened directly.
   */
  function orderClosingSections() {
    if (route !== 'contact') return;
    var engage = document.querySelector('.engage[data-page~="contact"]');
    var contact = document.querySelector('.contact, [data-render="contact"]');
    if (engage && contact && engage.parentNode === contact.parentNode &&
        contact.compareDocumentPosition(engage) & Node.DOCUMENT_POSITION_FOLLOWING) {
      contact.parentNode.insertBefore(engage, contact);
    }
  }

  /* ── Chrome: header, mobile menu, progress bar, overlays ───────── */

  function renderChrome() {
    var slot = document.querySelector('[data-render="chrome"]');
    if (!slot) return; /* already built into the page */

    /* The booking overlay is built only where a "Book 30 minutes" button is
       actually reachable, and left out of the document everywhere else. */
    var wantsBooking = [].slice.call(document.querySelectorAll('[data-booking-open]')).some(onRoute);
    slot.outerHTML = M.chrome(DATA, route, wantsBooking);
  }

  /* ── Deferred media ────────────────────────────────────────────── */

  /* Markup parked in a <template> so it fetches nothing until its route is
     the active one — a hidden <video> or <img> downloads regardless of
     display:none. The build inflates the active route's templates already;
     this handles studio.html opened directly. */
  function inflateMedia() {
    document.querySelectorAll('template[data-media]').forEach(function (tpl) {
      if (!onRoute(tpl)) return;
      tpl.parentNode.replaceChild(tpl.content.cloneNode(true), tpl);
    });
  }

  /* ── Circular type stamps ──────────────────────────────────────── */

  function renderStamps() {
    document.querySelectorAll('[data-stamp]').forEach(function (host, index) {
      if (host.firstElementChild) return; /* built already */
      host.innerHTML = M.stamp(host.dataset.stamp, index);
    });
  }

  /* ── Home route: large alternating project cards ───────────────── */

  function renderFeatured() {
    var r = region('featured-works', 'projects');
    if (!r || r.filled) return;
    r.host.className = 'projects';
    r.host.removeAttribute('data-render');
    r.host.innerHTML = M.featured(DATA);
  }

  /* ── Works route: filters + persistent visual project atlas ───── */

  function renderWorksIndex() {
    var r = region('works-index', 'index');
    if (!r) return;
    if (!r.filled) {
      r.host.className = 'index';
      r.host.removeAttribute('data-render');
      r.host.innerHTML = M.worksIndex(DATA);
    }
    wireFilters(r.host);
  }

  function wireFilters(host) {
    var chips = [].slice.call(host.querySelectorAll('.chip'));
    var rows = [].slice.call(host.querySelectorAll('.index-row'));
    var empty = host.querySelector('.index__empty');
    if (!chips.length || !empty) return;

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

  function renderTeam() {
    var r = region('team', 'roster');
    if (!r || r.filled) return;
    r.host.className = 'roster';
    r.host.dataset.count = DATA.team.length;
    r.host.removeAttribute('data-render');
    r.host.innerHTML = M.team(DATA);
  }

  /* ── Contact block + footer, on every route ────────────────────── */

  function renderContact() {
    var r = region('contact', 'contact');
    if (!r || r.filled) return;
    r.host.className = 'contact';
    r.host.id = r.host.id || 'contact';
    r.host.setAttribute('data-theme', 'coral');
    r.host.removeAttribute('data-render');
    r.host.innerHTML = M.contact(DATA, route);
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
        frame.innerHTML = '<iframe src="' + M.esc(C.booking) + '" title="Booking calendar"' +
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
  renderChrome();
  orderClosingSections();
  inflateMedia();
  renderStamps();
  renderFeatured();
  renderWorksIndex();
  renderTeam();
  renderContact();
  rewriteLocalLinks();
  wireBooking();
})(window);
