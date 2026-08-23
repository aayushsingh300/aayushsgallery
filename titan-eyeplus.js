(() => {
  const progress = document.querySelector('.tep-progress span');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    progress.style.transform = `scaleX(${value})`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((node) => node.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((node) => observer.observe(node));
  }

  document.querySelectorAll('details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      const marker = detail.querySelector('summary i');
      if (marker) marker.textContent = detail.open ? '−' : '+';
    });
  });
})();
