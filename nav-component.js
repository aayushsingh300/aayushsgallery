/**
 * nav-component.js
 * Injects the PERSONAL PORTFOLIO navigation bar into every page.
 * Include this script in every HTML file; it auto-detects the active page.
 *
 * Case-study pages are shared with the studio face, which brings its own
 * header (studio-nav.js / .rf-pnav). studio-nav.js decides which face is
 * being read and stamps it on <html data-face>; when it says studio, this
 * nav stands down so the page carries one identity, not two.
 *
 * The reverse also has to hold: a project opened from the portfolio must
 * keep Aayush's header, not the studio's. So every link out to a shared
 * case study leaves here stamped `?face=personal` — the mirror of what
 * studio-render.js does with `?face=studio` — and the face survives a
 * copied URL, a new tab, or storage being unavailable.
 */
(function () {
  'use strict';

  if (document.documentElement.dataset.face === 'studio') return;

  /* Reaching any page wearing the portfolio nav ends the studio flow, so a
     project opened from here later does not inherit the studio header. */
  try { sessionStorage.setItem('rf-face', 'personal'); } catch (e) { /* private mode */ }

  var LINKS = [
    { href: 'index.html',      label: 'Home' },
    { href: 'all-works.html',  label: 'All Works' },
    { href: 'blogs.html',      label: 'Blogs' },
    { href: 'about.html',      label: 'About & Resume' },
  ];

  /* Detect current page filename */
  var page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === '') page = 'index.html';

  /* Build link items */
  var linksHTML = LINKS.map(function (l) {
    var active = (l.href === page) ? ' class="active"' : '';
    return '<li><a href="' + l.href + '"' + active + '>' + l.label + '</a></li>';
  }).join('');

  /* Build drawer link items (same set) */
  var drawerLinksHTML = LINKS.map(function (l) {
    var active = (l.href === page) ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
  }).join('');

  /* Build nav element */
  var nav = document.createElement('nav');
  nav.id  = 'gNav';
  nav.className = 'g-nav';
  nav.innerHTML =
    '<a href="index.html" class="g-nav-logo">' +
      '<img src="images/hero/Aayushsign.svg" alt="Aayush">' +
    '</a>' +
    '<ul class="g-nav-links">' + linksHTML + '</ul>' +
    '<div class="g-nav-actions">' +
      '<button class="g-theme-toggle" id="gThemeToggle" aria-label="Toggle theme" title="Toggle light / dark">' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
        '<svg class="icon-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
      '</button>' +
      '<button class="g-hamburger" id="gHamburger" aria-label="Open menu" aria-expanded="false">' +
        '<span></span><span></span><span></span>' +
      '</button>' +
    '</div>';

  /* Build mobile drawer */
  var drawer = document.createElement('div');
  drawer.id = 'gDrawer';
  drawer.className = 'g-nav-drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = drawerLinksHTML;

  /* Insert nav + drawer as first children of body */
  document.body.insertAdjacentElement('afterbegin', drawer);

  /* Insert as first child of body */
  document.body.insertAdjacentElement('afterbegin', nav);

  /* ── Theme persistence ── */
  var saved = localStorage.getItem('portfolio-theme');
  if (saved === 'light') document.body.classList.add('light');

  document.getElementById('gThemeToggle').addEventListener('click', function () {
    var isLight = document.body.classList.toggle('light');
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  });

  /* ── Hamburger toggle ── */
  var hamburger = document.getElementById('gHamburger');
  hamburger.addEventListener('click', function () {
    var isOpen = drawer.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  /* Close drawer on link click */
  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  /* Close drawer on outside tap */
  document.addEventListener('click', function (e) {
    if (drawer.classList.contains('open') && !nav.contains(e.target) && !drawer.contains(e.target)) {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  });

  /* ── Carry the personal face onto the shared case studies ── */

  /* The portfolio's own pages need no stamp — reaching one runs this file,
     which sets the face again. Only the shared project pages do, and the
     app prototypes carry no header at all, so they are left clean. */
  var SHELL = {
    'index.html': true, 'all-works.html': true, 'blogs.html': true,
    'about.html': true, 'resume.html': true, 'studio.html': true
  };

  function fileOf(href) {
    return String(href).split('#')[0].split('?')[0].split('/').pop();
  }

  /* site-data.js is the truth where it is loaded (all-works, the case studies
     themselves). index.html and about.html do not load it, so fall back to
     "a local page that is neither shell nor prototype". */
  var works = (window.SITE_DATA && window.SITE_DATA.works) || null;
  var PROJECTS = null;
  if (works) {
    PROJECTS = {};
    works.forEach(function (work) {
      if (work.href) PROJECTS[fileOf(work.href)] = true;
    });
  }

  function isProject(file) {
    if (!/\.html$/.test(file)) return false;
    if (PROJECTS) return Boolean(PROJECTS[file]);
    return !SHELL[file] && !/-app\.html$/.test(file);
  }

  /* Idempotent: a link that already names a face is left as it is, so this can
     run again after late-rendered rows arrive without doubling the query. */
  function stampFace() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      if (link.closest('.g-nav, .g-nav-drawer')) return;

      var href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#)/i.test(href)) return;
      if (href.indexOf('face=') !== -1) return;
      if (!isProject(fileOf(href))) return;

      var hash = '';
      var hashAt = href.indexOf('#');
      if (hashAt !== -1) {
        hash = href.slice(hashAt);
        href = href.slice(0, hashAt);
      }
      link.setAttribute('href',
        href + (href.indexOf('?') === -1 ? '?' : '&') + 'face=personal' + hash);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stampFace);
  } else {
    stampFace();
  }
  window.addEventListener('load', stampFace);

  /* ── Hide nav on scroll down, show on scroll up ── */
  var lastY   = window.scrollY;
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (y > lastY && y > 80) nav.classList.add('g-nav-hidden');
      else nav.classList.remove('g-nav-hidden');
      nav.classList.toggle('g-nav-scrolled', y > 40);
      lastY   = y;
      ticking = false;
    });
  }, { passive: true });
})();
