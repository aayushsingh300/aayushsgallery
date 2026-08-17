/**
 * studio-render.js
 * ─────────────────────────────────────────────────────────────
 * The studio face's shared chrome and renderers.
 *
 * Every studio page ships the same header, menu, contact block and footer,
 * and every list of work is drawn from site-data.js — so a project is added
 * in exactly one place and both faces stay in step.
 *
 * Load order matters:  site-data.js → studio-render.js → studio-pear.js
 * (all with `defer`, which preserves document order). Rendering must finish
 * before studio-pear.js wires up observers against the resulting DOM.
 *
 * Hooks, placed as empty elements in the HTML:
 *   data-render="chrome"          header + mobile menu + scroll progress
 *   data-render="featured-works"  the home page's large alternating cards
 *   data-render="works-index"     the full typographic work index + filters
 *   data-render="team"            the studio roster
 *   data-render="contact"         the coral contact block + footer
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

  function slot(name) {
    return document.querySelector('[data-render="' + name + '"]');
  }

  /* Which studio page are we on? Drives nav active state. */
  var page = (location.pathname.split('/').pop() || 'studio-pear.html');
  if (page === '' || page === 'studio') page = 'studio-pear.html';

  var NAV = [
    { href: 'studio-works.html', label: 'Work' },
    { href: 'studio-pear.html#method', label: 'Method', home: 'studio-pear.html' },
    { href: 'studio-team.html', label: 'Studio' },
    { href: 'studio-contact.html', label: 'Contact' }
  ];

  /* On the home page, Method is an in-page anchor; elsewhere it is a jump. */
  function navHref(item) {
    if (item.home && page === item.home) return item.href.slice(item.href.indexOf('#'));
    return item.href;
  }

  function isActive(item) {
    return item.href.split('#')[0] === page && !(item.home && page === item.home);
  }

  /* ── Chrome: header, mobile menu, progress bar ─────────────────── */

  function renderChrome() {
    var host = slot('chrome');
    if (!host) return;

    var links = NAV.filter(function (i) { return i.label !== 'Contact'; })
      .map(function (i) {
        return '<a href="' + esc(navHref(i)) + '"' +
          (isActive(i) ? ' aria-current="page"' : '') + '>' + esc(i.label) + '</a>';
      }).join('');

    var menuLinks = NAV.map(function (i, index) {
      return '<a href="' + esc(navHref(i)) + '"' + (isActive(i) ? ' aria-current="page"' : '') +
        '><small>' + pad(index + 1) + '</small>' + esc(i.label) + '</a>';
    }).join('');

    host.outerHTML =
      /* Grain + custom cursor are pure overlay, so JS may own them.
         The loader stays in each page's HTML: it must paint before parse ends. */
      '<div class="noise" aria-hidden="true"></div>' +
      '<div class="cursor" aria-hidden="true"><i></i><span>View</span></div>' +
      '<header class="nav" id="nav">' +
        '<a class="nav__brand" href="studio-pear.html" aria-label="' + esc(C.studioName) + ' home">' +
          '<svg viewBox="0 0 56 24" aria-hidden="true">' +
            '<path d="M2 21C12 20 17 14 17 4c7 1 10 7 9 16M16 9C11 2 5 3 2 6c1 7 6 11 14 11M27 19c9 4 19 1 26-9"/>' +
          '</svg>' +
          '<b>' + esc(C.studioName) + '</b>' +
        '</a>' +
        '<nav class="nav__links" aria-label="Primary navigation">' + links + '</nav>' +
        '<a class="nav__contact" href="studio-contact.html"><span>Start something</span><b>↗</b></a>' +
        '<button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu">' +
          '<span></span><span></span></button>' +
      '</header>' +
      '<aside class="menu" id="menu" aria-hidden="true">' +
        '<button class="menu__close" type="button" aria-label="Close menu">Close</button>' +
        '<nav>' + menuLinks + '</nav>' +
        '<p>' + esc(C.location) + '<br><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></p>' +
      '</aside>' +
      '<div class="progress" aria-hidden="true"><i></i></div>';
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

  /* ── Home page: large alternating project cards ────────────────── */

  function renderFeatured() {
    var host = slot('featured-works');
    if (!host) return;

    host.className = 'projects';
    host.removeAttribute('data-render');
    host.innerHTML = DATA.featured().map(function (work, index) {
      var w = DATA.view(work, 'studio');
      return '<a class="project ' + esc(w.accentClass) + ' cursor-view reveal" href="' + esc(w.href) + '"' +
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

  /* ── Work index page: filters + typographic rows + hover preview ─ */

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
        ? ' href="' + esc(w.href) + '" class="index-row cursor-view"'
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
      '<p class="index__empty" hidden>Nothing in that lens yet.</p>' +
      '<figure class="index-preview" aria-hidden="true"><img alt=""></figure>';

    wireFilters(host);
    wirePreview(host);
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

  /* Large preview that trails the pointer while hovering a row. */
  function wirePreview(host) {
    var figure = host.querySelector('.index-preview');
    var image = figure.querySelector('img');
    if (matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches) {
      figure.remove();
      return;
    }

    var target = { x: 0, y: 0 };
    var current = { x: 0, y: 0 };
    var active = false;

    host.querySelectorAll('.index-row').forEach(function (row) {
      var src = row.dataset.preview;
      if (!src) return;
      row.addEventListener('pointerenter', function () {
        image.src = src;
        figure.style.setProperty('--row-accent', row.dataset.accent);
        figure.classList.add('is-on');
        active = true;
      });
      row.addEventListener('pointerleave', function () {
        figure.classList.remove('is-on');
        active = false;
      });
    });

    addEventListener('pointermove', function (event) {
      target.x = event.clientX;
      target.y = event.clientY;
    }, { passive: true });

    (function follow() {
      requestAnimationFrame(follow);
      if (!active) return;
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;
      figure.style.transform = 'translate3d(' + (current.x + 28) + 'px,' + (current.y - 130) + 'px,0)';
    })();
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
        ? '<a class="member__link" href="' + esc(member.linkedin) + '" target="_blank" rel="noopener">' +
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

  /* ── Contact block + footer, identical on every studio page ────── */

  function renderContact() {
    var host = slot('contact');
    if (!host) return;

    var lead = host.dataset.lead || 'Have a difficult product?';
    var reply = host.dataset.reply || 'Good. We should talk.';
    var lineOne = host.dataset.lineOne || 'Bring us the';
    var lineTwo = host.dataset.lineTwo || 'difficult bit.';

    host.className = 'contact';
    host.id = host.id || 'contact';
    host.setAttribute('data-theme', 'coral');
    host.removeAttribute('data-render');
    host.innerHTML =
      '<div class="contact__top"><span>' + esc(lead) + '</span><span>' + esc(reply) + '</span></div>' +
      '<a class="contact__link" href="mailto:' + esc(C.email) + '">' +
        '<span>' + esc(lineOne) + '</span>' +
        '<span>' + esc(lineTwo) + '<b>↗</b></span>' +
      '</a>' +
      '<footer class="contact__foot">' +
        '<div><span>New business</span><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></div>' +
        '<div><span>Based in</span><p>' + esc(C.location) + '<br>' + esc(C.reach) + '</p></div>' +
        '<div><span>Elsewhere</span><p>' +
          '<a href="' + esc(C.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a><br>' +
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

  renderChrome();
  renderFeatured();
  renderWorksIndex();
  renderTeam();
  renderContact();
  wireBooking();
})(window);
