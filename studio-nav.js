/**
 * studio-nav.js
 * ─────────────────────────────────────────────────────────────
 * The studio face's global header for PROJECT DETAIL pages.
 *
 * Every case study (vigil.html, chargeur.html, klu-pos.html, …) is shared by
 * both faces of the same body of work:
 *
 *   personal portfolio → g-nav, Aayush's signature (nav-component.js)
 *   studio             → the header built here: rabbitsfoot, the project's
 *                        place in the index, and the way on to the next one
 *
 * WHICH FACE AM I IN?
 *   1. `?face=personal` remains available as an explicit preview escape hatch.
 *   2. Every other visit uses the studio identity. Case studies therefore
 *      keep the same global header whether reached from either portfolio,
 *      from the studio index, or from a direct/shared URL.
 *
 * nav-component.js reads the same decision off <html data-face> and stands
 * down when this header is up, so a case study never wears two identities.
 *
 * Requires site-data.js (loaded just before this file) for the project's
 * title, discipline, index position and next project — one source of truth,
 * shared with both faces.
 */
(function (global) {
  'use strict';

  var FACE_KEY = 'rf-face';
  var STUDIO = 'studio.html';

  /* ── Which face ────────────────────────────────────────────────── */

  function remember(face) {
    try { sessionStorage.setItem(FACE_KEY, face); } catch (e) { /* private mode */ }
  }

  function detectFace() {
    var asked = new URLSearchParams(location.search).get('face');
    if (asked === 'studio' || asked === 'personal') {
      remember(asked);
      return asked;
    }
    return 'studio';
  }

  var face = detectFace();
  document.documentElement.dataset.face = face;
  if (face !== 'studio') return;

  /* ── Helpers ───────────────────────────────────────────────────── */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  /** Keep the studio face on every hop, the same way ?p= keeps the route. */
  function studioHref(href) {
    if (!href) return href;
    var hash = '';
    var hashAt = href.indexOf('#');
    if (hashAt !== -1) {
      hash = href.slice(hashAt);
      href = href.slice(0, hashAt);
    }
    return href + (href.indexOf('?') === -1 ? '?' : '&') + 'face=studio' + hash;
  }

  function fileOf(href) {
    return String(href).split('#')[0].split('?')[0].split('/').pop();
  }

  /* ── Where in the work are we ───────────────────────────────────── */

  var DATA = global.SITE_DATA;
  var page = fileOf(location.pathname) || 'index.html';
  var works = DATA ? DATA.works : [];

  /* Numbered by position in the full index, so the header agrees with the row
     number this project carries on studio.html?p=works. */
  var here = -1;
  works.some(function (work, i) {
    if (!work.href || fileOf(work.href) !== page) return false;
    here = i;
    return true;
  });

  /* The walk skips what cannot be walked to: work still in progress has no
     page, and two entries share the Titan case study — so "next" steps past
     anything that would land back here. */
  function nextWalkable(from) {
    for (var step = 1; step <= works.length; step += 1) {
      var work = works[(from + step) % works.length];
      if (work.href && fileOf(work.href) !== page) return work;
    }
    return null;
  }

  var current = here === -1 ? null : DATA.view(works[here], 'studio');
  var nextWork = here === -1 ? null : nextWalkable(here);
  var next = nextWork ? DATA.view(nextWork, 'studio') : null;
  var C = DATA ? DATA.contact : { studioName: 'rabbitsfoot', email: '', location: '', reach: '' };

  var ROUTES = [
    { label: 'Home', href: STUDIO },
    { label: 'All works', href: STUDIO + '?p=works' },
    { label: 'About us', href: STUDIO + '?p=about' },
    { label: 'Contact us', href: STUDIO + '?p=contact' }
  ];

  /* ── Markup ─────────────────────────────────────────────────────── */

  var MARK =
    '<svg viewBox="0 0 56 24" aria-hidden="true">' +
      '<path d="M2 21C12 20 17 14 17 4c7 1 10 7 9 16M16 9C11 2 5 3 2 6c1 7 6 11 14 11M27 19c9 4 19 1 26-9"/>' +
    '</svg>';

  /* The header names the project you are in, not just the studio you are on:
     its number in the index, its title, and the lens it was filed under. */
  var projectHTML = current
    ? '<p class="rf-pnav__project">' +
        '<span class="rf-pnav__num">' + pad(here + 1) + '/' + pad(works.length) + '</span>' +
        '<span class="rf-pnav__name">' + esc(current.title) + '</span>' +
        '<span class="rf-pnav__disc">' + esc(current.discipline || '') + '</span>' +
      '</p>'
    : '<p class="rf-pnav__project"><span class="rf-pnav__name">Case study</span></p>';

  var nextHTML = next
    ? '<a class="rf-pnav__next" href="' + esc(studioHref(next.href)) + '">' +
        '<small>Next</small><b>' + esc(next.title) + '</b><i>↗</i>' +
      '</a>'
    : '';

  var header = document.createElement('header');
  header.className = 'rf-pnav';
  header.id = 'rfPnav';
  /* The project's own accent carries the progress line and the index number,
     so the chrome belongs to this case study and not to a generic template. */
  if (current && current.accent) header.style.setProperty('--rf-acid', current.accent);
  header.innerHTML =
    '<div class="rf-pnav__bar">' +
      '<a class="rf-pnav__brand" href="' + esc(studioHref(STUDIO)) + '"' +
        ' aria-label="' + esc(C.studioName) + ' home">' + MARK +
        '<b>' + esc(C.studioName) + '</b>' +
      '</a>' +
      projectHTML +
      '<div class="rf-pnav__actions">' +
        '<a class="rf-pnav__link" href="' + esc(studioHref(STUDIO + '?p=works')) + '">All works</a>' +
        '<a class="rf-pnav__link" href="' + esc(studioHref(STUDIO + '?p=contact')) + '">Contact</a>' +
        nextHTML +
        '<button class="rf-pnav__menu" type="button" id="rfPnavMenu"' +
          ' aria-expanded="false" aria-controls="rfMenu" aria-label="Open menu">' +
          '<span></span><span></span>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="rf-pnav__progress" aria-hidden="true"><i></i></div>';

  var menu = document.createElement('aside');
  menu.className = 'rf-menu';
  menu.id = 'rfMenu';
  menu.setAttribute('aria-hidden', 'true');
  menu.innerHTML =
    '<button class="rf-menu__close" type="button" aria-label="Close menu">Close ✕</button>' +
    '<nav class="rf-menu__routes" aria-label="Studio navigation">' +
      ROUTES.map(function (route, i) {
        return '<a href="' + esc(studioHref(route.href)) + '">' +
          '<small>' + pad(i + 1) + '</small>' + esc(route.label) + '</a>';
      }).join('') +
    '</nav>' +
    '<div class="rf-menu__foot">' +
      '<span>' + esc(C.location) + ' — ' + esc(C.reach) + '</span>' +
      (C.email ? '<a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' : '') +
      (next ? '<a href="' + esc(studioHref(next.href)) + '">Next project — ' + esc(next.title) + ' ↗</a>' : '') +
      '<a href="index.html?face=personal">Personal portfolio ↗</a>' +
    '</div>';

  document.body.insertAdjacentElement('afterbegin', menu);
  document.body.insertAdjacentElement('afterbegin', header);

  /* ── Menu ───────────────────────────────────────────────────────── */

  var menuButton = header.querySelector('.rf-pnav__menu');
  var closeButton = menu.querySelector('.rf-menu__close');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  menuButton.addEventListener('click', function () { setMenu(true); });
  closeButton.addEventListener('click', function () { setMenu(false); });
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });
  addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenu(false);
  });

  /* ── Scroll: hide going down, reading progress on the bottom edge ── */

  var fill = header.querySelector('.rf-pnav__progress i');
  var lastY = scrollY;
  var ticking = false;

  addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = scrollY;
      header.classList.toggle('is-hidden', y > lastY && y > 90 && !menu.classList.contains('is-open'));
      header.classList.toggle('is-solid', y > 40);

      var max = document.documentElement.scrollHeight - innerHeight;
      fill.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';

      lastY = y;
      ticking = false;
    });
  }, { passive: true });

  /* ── Keep the flow inside the studio ────────────────────────────── */

  /* Case studies were written for the portfolio, so a few of them link back
     to index.html / all-works.html in their own copy. Inside the studio flow
     those are dead ends onto the other face — point them at the studio's own
     equivalents, and carry the face onto sibling case studies. */
  function rerouteLinks() {
    var projects = {};
    works.forEach(function (work) {
      if (work.href) projects[fileOf(work.href)] = true;
    });

    document.querySelectorAll('a[href]').forEach(function (link) {
      if (link.closest('.rf-pnav, .rf-menu')) return;

      var href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return;

      var file = fileOf(href);
      var hash = href.indexOf('#') === -1 ? '' : href.slice(href.indexOf('#'));

      if (file === 'index.html') link.setAttribute('href', studioHref(STUDIO + hash));
      else if (file === 'all-works.html') link.setAttribute('href', studioHref(STUDIO + '?p=works'));
      else if (projects[file] && href.indexOf('face=') === -1) link.setAttribute('href', studioHref(href));
    });
  }

  /* The personal nav must not also be in the page. nav-component.js checks
     <html data-face> and stands down, but a page that loads it first is
     cleaned up here rather than left showing two headers. */
  function dropPersonalNav() {
    ['gNav', 'gDrawer'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.remove();
    });
  }

  function settle() {
    dropPersonalNav();
    rerouteLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', settle);
  } else {
    settle();
  }
  addEventListener('load', dropPersonalNav);
})(window);
