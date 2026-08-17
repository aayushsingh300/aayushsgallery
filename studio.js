(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const lerp = (from, to, amount) => from + (to - from) * amount;

  const loaderCount = document.querySelector('.loader__count');
  const progressBar = document.querySelector('.progress i');
  const menu = document.getElementById('menu');
  const menuButton = document.querySelector('.nav__menu');
  const menuClose = document.querySelector('.menu__close');
  const cursor = document.querySelector('.cursor');
  const previewMode = new URLSearchParams(location.search).has('preview');

  const start = performance.now();
  function loadFrame(now) {
    const progress = reduced || previewMode ? 1 : clamp((now - start) / 920);
    if (loaderCount) loaderCount.textContent = String(Math.round(progress * 100)).padStart(2, '0');
    if (progress < 1) {
      requestAnimationFrame(loadFrame);
    } else {
      document.body.classList.add('is-ready');
    }
  }
  requestAnimationFrame(loadFrame);

  if (previewMode) document.body.classList.add('is-ready', 'preview');
  const loaderFallback = setTimeout(() => {
    if (loaderCount) loaderCount.textContent = '100';
    document.body.classList.add('is-ready');
  }, 1250);
  setTimeout(() => {
    clearTimeout(loaderFallback);
    document.querySelector('.loader')?.remove();
  }, previewMode ? 0 : 2500);

  function splitWords(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      if (!node.nodeValue.trim()) return;
      const fragment = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(part => {
        if (/\s+/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else if (part) {
          const word = document.createElement('span');
          word.className = 'word';
          word.textContent = part;
          fragment.appendChild(word);
        }
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  const wordBlocks = [...document.querySelectorAll('.word-reveal')];
  wordBlocks.forEach(splitWords);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menuButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  if (menu && menuButton && menuClose) {
    menuButton.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const pointer = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
  addEventListener('pointermove', event => {
    pointer.tx = event.clientX;
    pointer.ty = event.clientY;
    if (cursor) cursor.classList.add('is-visible');
  }, { passive: true });

  if (cursor) {
    addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));

    document.querySelectorAll('.cursor-view').forEach(project => {
      project.addEventListener('pointerenter', () => {
        cursor.classList.add('is-view');
        cursor.style.setProperty('--accent', project.dataset.accent);
      });
      project.addEventListener('pointerleave', () => cursor.classList.remove('is-view'));
    });
  }

  const canvas = document.getElementById('signal');
  const ctx = canvas ? canvas.getContext('2d', { alpha: true }) : null;
  let width = innerWidth;
  let height = innerHeight;
  let dpr = 1;
  let scrollCurrent = scrollY;
  let scrollTarget = scrollY;

  if (previewMode && location.hash) {
    document.documentElement.style.scrollBehavior = 'auto';
    const previewSection = document.querySelector(location.hash);
    if (previewSection) scrollTo(0, previewSection.offsetTop);
    scrollCurrent = scrollY;
    scrollTarget = scrollY;
  }

  function resizeCanvas() {
    width = innerWidth;
    height = innerHeight;
    if (!canvas) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  addEventListener('resize', resizeCanvas, { passive: true });
  addEventListener('scroll', () => { scrollTarget = scrollY; }, { passive: true });

  function rotatePoint(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos - y * sin, x * sin + y * cos];
  }

  function drawSignal(time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const heroFade = 1 - clamp(scrollCurrent / (height * .82));
    if (heroFade <= .002) return;

    const compact = width < 900;
    const px = (pointer.x / width - .5);
    const py = (pointer.y / height - .5);
    const centerX = width * (compact ? .63 : .68) + px * 20;
    const centerY = height * (compact ? .39 : .43) + py * 14;
    const radius = Math.min(width, height) * (compact ? .29 : .42);
    const scrollPhase = scrollCurrent / Math.max(height, 1);
    const rotation = -.28 + time * .000035 + scrollPhase * .7;

    ctx.save();
    ctx.globalAlpha = heroFade;
    ctx.globalCompositeOperation = 'screen';

    const halo = ctx.createRadialGradient(centerX - radius * .18, centerY - radius * .2, 0, centerX, centerY, radius * 1.15);
    halo.addColorStop(0, 'rgba(234,255,102,.31)');
    halo.addColorStop(.18, 'rgba(169,194,61,.12)');
    halo.addColorStop(.52, 'rgba(87,74,42,.045)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(centerX - radius * 1.35, centerY - radius * 1.35, radius * 2.7, radius * 2.7);

    const core = ctx.createRadialGradient(centerX - radius * .08, centerY - radius * .13, 0, centerX, centerY, radius * .26);
    core.addColorStop(0, 'rgba(244,255,173,.9)');
    core.addColorStop(.1, 'rgba(211,255,70,.38)');
    core.addColorStop(.46, 'rgba(108,111,47,.13)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * .28, 0, Math.PI * 2);
    ctx.fill();

    const rings = compact ? 27 : 42;
    const points = compact ? 110 : 160;
    for (let ring = 0; ring < rings; ring += 1) {
      const ratio = ring / (rings - 1);
      const rx = radius * (.12 + ratio * .92);
      const ry = rx * (.38 + Math.sin(ratio * Math.PI) * .23);
      const ringPhase = time * .00024 * (ring % 2 ? -1 : 1) + ratio * 5.4;
      ctx.beginPath();

      for (let point = 0; point <= points; point += 1) {
        const angle = point / points * Math.PI * 2;
        const wave = Math.sin(angle * 3 + ringPhase) * radius * (.008 + ratio * .018);
        const micro = Math.sin(angle * 7 - time * .0004 + ring) * radius * .004 * ratio;
        const x = Math.cos(angle) * (rx + wave + micro);
        const y = Math.sin(angle) * (ry + wave * .35) + Math.sin(angle * 2 + ratio * 3) * radius * .018 * ratio;
        const [turnedX, turnedY] = rotatePoint(x, y, rotation + Math.sin(ratio * 4 + time * .0001) * .08);
        const finalX = centerX + turnedX + Math.sin(angle + ratio * 7) * px * 7;
        const finalY = centerY + turnedY + Math.cos(angle * 2 - ratio * 4) * py * 6;
        if (point === 0) ctx.moveTo(finalX, finalY);
        else ctx.lineTo(finalX, finalY);
      }

      const light = Math.round(132 + ratio * 92);
      const alpha = .08 + (1 - Math.abs(ratio - .64)) * .19;
      ctx.strokeStyle = `rgba(${light}, ${Math.min(255, light + 24)}, ${Math.max(55, light - 68)}, ${alpha})`;
      ctx.lineWidth = ring % 7 === 0 ? 1.25 : .56;
      ctx.stroke();
    }

    ctx.setLineDash([2, 8]);
    ctx.lineWidth = .8;
    ctx.strokeStyle = 'rgba(229,255,100,.4)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius * 1.06, radius * .28, rotation + .82, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let node = 0; node < 7; node += 1) {
      const angle = time * .00012 * (node % 2 ? -1 : 1) + node * .91;
      const distance = radius * (.42 + (node % 3) * .24);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance * .52;
      ctx.fillStyle = node === 2 ? 'rgba(255,255,255,.95)' : 'rgba(217,255,76,.68)';
      ctx.beginPath();
      ctx.arc(x, y, node === 2 ? 2.6 : 1.25, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function updateWords() {
    wordBlocks.forEach(block => {
      const rect = block.getBoundingClientRect();
      const progress = clamp((innerHeight * .83 - rect.top) / (rect.height + innerHeight * .36));
      const words = block.querySelectorAll('.word');
      const lit = Math.ceil(progress * (words.length + 5));
      words.forEach((word, index) => word.classList.toggle('is-lit', index < lit));
    });
  }

  const projectImages = [...document.querySelectorAll('.project__media img')];
  function updateProjects() {
    projectImages.forEach(image => {
      const rect = image.closest('.project').getBoundingClientRect();
      const relative = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
      image.style.setProperty('--parallax', `${(relative - .5) * 42}px`);
    });
  }

  const heroVideoWrap = document.querySelector('.hero__video-wrap');
  function updateHeroVideo() {
    if (!heroVideoWrap) return;
    const progress = clamp(scrollCurrent / Math.max(innerHeight, 1));
    heroVideoWrap.style.transform = `translate3d(0, ${scrollCurrent * 0.3}px, 0)`;
    heroVideoWrap.style.opacity = `${Math.max(0, 1 - progress * 1.25)}`;
  }

  function frame(time) {
    scrollCurrent = lerp(scrollCurrent, scrollTarget, reduced ? 1 : .095);
    pointer.x = lerp(pointer.x, pointer.tx, .14);
    pointer.y = lerp(pointer.y, pointer.ty, .14);

    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${maxScroll > 0 ? scrollCurrent / maxScroll : 0})`;
    }
    if (cursor) {
      cursor.style.transform = `translate3d(${pointer.x - 36}px, ${pointer.y - 36}px, 0)`;
    }

    updateWords();
    if (!reduced) {
      drawSignal(time);
      updateHeroVideo();
      updateProjects();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
