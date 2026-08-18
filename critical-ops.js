(function () {
  var progress = document.querySelector('.case-progress');
  if (!progress) return;

  function updateProgress() {
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var value = height > 0 ? (window.scrollY / height) * 100 : 0;
    progress.style.width = Math.min(100, Math.max(0, value)) + '%';
  }

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
})();
