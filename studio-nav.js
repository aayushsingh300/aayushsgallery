/**
 * studio-nav.js
 * Navigation component for rabbitsfoot studio pages.
 * mix-blend-mode: difference header, mobile drawer, scroll hide/show.
 */
(function () {
  'use strict';

  var LINKS = [
    { href: 'studio.html',       label: 'Work' },
    { href: 'studio-about.html', label: 'About' },
    { href: '#rf-services',      label: 'Services', scroll: true },
    { href: '#rf-contact',       label: 'Contact',  scroll: true },
  ];

  var page = window.location.pathname.split('/').pop() || 'studio.html';
  if (page === '') page = 'studio.html';

  /* Build nav links */
  var linksHTML = LINKS.map(function (l) {
    var active = (l.href === page) ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
  }).join('');

  /* Build header */
  var header = document.createElement('header');
  header.className = 'rf-header';
  header.id = 'rfHeader';
  header.innerHTML =
    '<a href="studio.html" class="rf-header-logo">rabbitsfoot</a>' +
    '<nav class="rf-header-nav">' + linksHTML + '</nav>' +
    '<button class="rf-hamburger" id="rfHamburger" aria-label="Open menu" aria-expanded="false">' +
      '<span></span><span></span><span></span>' +
    '</button>';

  /* Build mobile drawer */
  var overlay = document.createElement('div');
  overlay.className = 'rf-drawer-overlay';
  overlay.id = 'rfDrawerOverlay';

  var drawer = document.createElement('div');
  drawer.className = 'rf-drawer';
  drawer.id = 'rfDrawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = LINKS.map(function (l) {
    var active = (l.href === page) ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
  }).join('');

  /* Insert into DOM */
  document.body.insertAdjacentElement('afterbegin', overlay);
  document.body.insertAdjacentElement('afterbegin', drawer);
  document.body.insertAdjacentElement('afterbegin', header);

  /* Hamburger toggle */
  var hamburger = document.getElementById('rfHamburger');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (drawer.classList.contains('open')) closeDrawer();
    else openDrawer();
  });

  overlay.addEventListener('click', closeDrawer);

  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeDrawer();
  });

  /* Scroll-based smooth navigation for hash links */
  header.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  drawer.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    closeDrawer();
    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  });

  /* Hide nav on scroll down, show on scroll up */
  var lastY = window.scrollY;
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      if (y > lastY && y > 100) header.classList.add('hidden');
      else header.classList.remove('hidden');
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
})();
