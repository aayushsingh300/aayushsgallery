(function () {
  'use strict';

  var progress = document.querySelector('.eyex-progress span');
  var ticking = false;

  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var amount = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, amount)) + ')';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (element) { element.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    reveals.forEach(function (element) { revealObserver.observe(element); });
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.feature-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.feature-panel'));

  function selectFeature(name) {
    tabs.forEach(function (tab) {
      var selected = tab.dataset.feature === name;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(function (panel) {
      panel.classList.toggle('is-active', panel.dataset.panel === name);
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectFeature(tab.dataset.feature); });
    tab.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      var direction = event.key === 'ArrowRight' ? 1 : -1;
      var next = (index + direction + tabs.length) % tabs.length;
      tabs[next].focus();
      selectFeature(tabs[next].dataset.feature);
    });
  });

  var hero = document.querySelector('.hero-product');
  if (hero && !reduced) {
    window.addEventListener('pointermove', function (event) {
      if (window.innerWidth < 900) return;
      var x = (event.clientX / window.innerWidth - .5) * 8;
      var y = (event.clientY / window.innerHeight - .5) * 6;
      hero.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }, { passive: true });
  }
})();
