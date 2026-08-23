(function () {
  'use strict';

  var progress = document.querySelector('.reading-progress span');
  var revealEls = document.querySelectorAll('.reveal');
  var chapters = document.querySelectorAll('[data-chapter]');
  var railLinks = document.querySelectorAll('.chapter-rail a');
  var motionButton = document.querySelector('.motion-toggle');
  var motionMedia = document.querySelectorAll('.motion-media');

  function updateProgress() {
    if (!progress) return;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var value = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progress.style.transform = 'scaleX(' + value + ')';
  }

  function pauseMotion() {
    motionMedia.forEach(function (img) {
      if (img.dataset.paused === 'true') return;
      var canvas = document.createElement('canvas');
      var width = img.naturalWidth || img.clientWidth;
      var height = img.naturalHeight || img.clientHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.className = img.className + ' motion-still';
      canvas.setAttribute('aria-hidden', 'true');
      var context = canvas.getContext('2d');
      if (context) context.drawImage(img, 0, 0, width, height);
      img.insertAdjacentElement('afterend', canvas);
      img.hidden = true;
      img.dataset.paused = 'true';
    });
    if (motionButton) {
      motionButton.textContent = 'Play motion';
      motionButton.setAttribute('aria-pressed', 'true');
    }
  }

  function playMotion() {
    motionMedia.forEach(function (img) {
      var still = img.nextElementSibling;
      if (still && still.classList.contains('motion-still')) still.remove();
      img.hidden = false;
      img.dataset.paused = 'false';
      var source = img.getAttribute('src');
      img.setAttribute('src', '');
      img.setAttribute('src', source);
    });
    if (motionButton) {
      motionButton.textContent = 'Pause motion';
      motionButton.setAttribute('aria-pressed', 'false');
    }
  }

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var chapterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        railLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-25% 0px -62%', threshold: 0 });

    chapters.forEach(function (chapter) { chapterObserver.observe(chapter); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  if (motionButton) {
    motionButton.addEventListener('click', function () {
      if (motionButton.getAttribute('aria-pressed') === 'true') playMotion();
      else pauseMotion();
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('load', pauseMotion, { once: true });
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}());
