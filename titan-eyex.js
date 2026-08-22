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
