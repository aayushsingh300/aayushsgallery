/* ─── CURSOR-EFFECTS.JS ──────────────────────────────────────────────────────
   Shared across all pages:
   1. Cursor fire particles on clickable hover
   2. Procedural flame sound via Web Audio API on clickable hover

   GRAIN STRATEGY (not handled here — see site-globals.css):
   · CSS body::after  z-index 9500, opacity 0.038, mix-blend-mode overlay
     → Ultra-subtle top-level pass. At 3.8% opacity this is imperceptible
       on images/text but adds atmospheric film grain to dark backgrounds.
   · #grainCanvas (index.html only)  z-index 0, mix-blend-mode soft-light
     → Lives at background level, never above content. Richly textured
       background; all content (z-index ≥ 1) sits cleanly on top of it.
   · No canvas grain injected here — secondary pages rely on CSS grain only.
────────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────
     1. CURSOR FIRE PARTICLES
     Creates canvas dynamically; skip if already present so
     index.html's existing element keeps working.
  ──────────────────────────────────────────────────────── */
  var fireCanvas = document.getElementById('cursorFire');
  if (!fireCanvas) {
    fireCanvas = document.createElement('canvas');
    fireCanvas.id = 'cursorFire';
    fireCanvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(fireCanvas);
  }

  var fCtx = fireCanvas.getContext('2d');
  var FW, FH;
  function resizeFire() { FW = fireCanvas.width = window.innerWidth; FH = fireCanvas.height = window.innerHeight; }
  resizeFire();
  window.addEventListener('resize', resizeFire, { passive: true });

  var mx = -999, my = -999;
  var isOnClickable = false;
  var particles = [];

  window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

  function checkClickable(e) {
    var el = e.target;
    while (el && el !== document.body) {
      var tag  = el.tagName  ? el.tagName.toLowerCase() : '';
      var role = el.getAttribute ? el.getAttribute('role') : '';
      if (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'select' ||
          role === 'button' || role === 'link' ||
          (el.style && el.style.cursor === 'pointer') ||
          (el.getAttribute && el.getAttribute('onclick'))) {
        isOnClickable = true; return;
      }
      el = el.parentElement;
    }
    isOnClickable = false;
  }
  document.addEventListener('mouseover',  checkClickable);
  document.addEventListener('mouseout',   function () { isOnClickable = false; });

  function spawnParticle() {
    particles.push({
      x: mx + (Math.random() - 0.5) * 6,
      y: my + 22,
      vx: (Math.random() - 0.5) * 1.0,
      vy: Math.random() * 1.8 + 0.6,
      life: 1.0,
      decay: Math.random() * 0.04 + 0.03,
      r: Math.random() * 3 + 1.5,
      hue: Math.random() * 30 + 10
    });
  }

  function drawFire() {
    if (document.hidden) { requestAnimationFrame(drawFire); return; }
    fCtx.clearRect(0, 0, FW, FH);
    if (isOnClickable && mx > 0) {
      for (var i = 0; i < 4; i++) spawnParticle();
    }
    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.vx *= 0.97;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(j, 1); continue; }
      var grd = fCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
      grd.addColorStop(0,   'hsla(' + p.hue + ',100%,80%,' + p.life + ')');
      grd.addColorStop(0.5, 'hsla(' + (p.hue + 15) + ',100%,55%,' + (p.life * 0.7) + ')');
      grd.addColorStop(1,   'hsla(0,100%,30%,0)');
      fCtx.beginPath();
      fCtx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      fCtx.fillStyle = grd;
      fCtx.fill();
    }
    requestAnimationFrame(drawFire);
  }

  // Guard against duplicate rAF loops if index.html already runs this
  if (!window.__cursorFireRunning) {
    window.__cursorFireRunning = true;
    drawFire();
  }

  /* ────────────────────────────────────────────────────────
     3. FLAME SOUND — procedural Web Audio API
     Warm crackling fire hiss; fades in/out with hover state.
  ──────────────────────────────────────────────────────── */
  var audioCtx    = null;
  var masterGain  = null;
  var noiseSource = null;
  var soundActive = false;
  var targetGain  = 0;
  var currentGain = 0;

  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // ── Noise buffer (2 s white noise) ──────────────────
      var bufLen  = audioCtx.sampleRate * 2;
      var buffer  = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
      var data    = buffer.getChannelData(0);
      // Brown-ish noise: integrate white noise for warmer colour
      var last = 0;
      for (var k = 0; k < bufLen; k++) {
        var white = Math.random() * 2 - 1;
        data[k]   = (last = (last + 0.02 * white) / 1.02);
      }
      // Normalise
      var peak = 0;
      for (var n = 0; n < bufLen; n++) if (Math.abs(data[n]) > peak) peak = Math.abs(data[n]);
      for (var m = 0; m < bufLen; m++) data[m] /= peak;

      noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop   = true;

      // ── Bandpass → gives crackling fire "body" ───────────
      var bandpass       = audioCtx.createBiquadFilter();
      bandpass.type      = 'bandpass';
      bandpass.frequency.value = 480;
      bandpass.Q.value   = 0.8;

      // ── Low-shelf boost for warmth ───────────────────────
      var shelf           = audioCtx.createBiquadFilter();
      shelf.type          = 'lowshelf';
      shelf.frequency.value = 200;
      shelf.gain.value    = 8;

      // ── Master gain (faded by JS each frame) ─────────────
      masterGain      = audioCtx.createGain();
      masterGain.gain.value = 0;

      noiseSource.connect(bandpass);
      bandpass.connect(shelf);
      shelf.connect(masterGain);
      masterGain.connect(audioCtx.destination);
      noiseSource.start();
    } catch (e) { audioCtx = null; }
  }

  // Smooth gain ramp — only spins an rAF loop while audio is active,
  // then idles via setTimeout to avoid burning CPU when silent.
  var soundRafId = null;
  function updateSound() {
    soundRafId = null;
    if (audioCtx && masterGain) {
      var diff = targetGain - currentGain;
      // fast fade-in (0.04), slow fade-out (0.012)
      var step = diff > 0 ? 0.04 : 0.012;
      currentGain += diff * step * 4;
      masterGain.gain.setTargetAtTime(currentGain, audioCtx.currentTime, 0.02);
    }
    // Keep looping only while there is audible gain or a target to reach
    if (Math.abs(targetGain - currentGain) > 0.0005 || currentGain > 0.001) {
      soundRafId = requestAnimationFrame(updateSound);
    }
  }
  function kickSoundLoop() {
    if (!soundRafId) soundRafId = requestAnimationFrame(updateSound);
  }

  // Hook into the same isOnClickable state the fire uses
  var _origCheckClickable = checkClickable;
  document.addEventListener('mouseover', function (e) {
    _origCheckClickable(e);
    if (isOnClickable) {
      initAudio();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      targetGain = 0.18;   // subtle – not blasting
      kickSoundLoop();
    }
  });
  document.addEventListener('mouseout', function () {
    isOnClickable = false;
    targetGain = 0;
    kickSoundLoop(); // let the loop run to fade out, then it self-suspends
  });

})();
