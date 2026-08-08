/* ═══════════════════════════════════════════════════════════════════════
   RABBITSFOOT STUDIO — SCROLL-FLOWN DRONE
   A single aircraft flies one continuous descent down the page.
   Position is driven entirely by scroll; everything else is physics.
   ═══════════════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('rfDroneStage');
if (canvas) boot();

function boot() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── palette (mirrors studio.css tokens) ─── */
  const BG = 0x0c0c0c;
  const BRASS = 0xc4956a;
  const OXBLOOD = 0x8b3a3a;
  const GRAPHITE = 0x1c1b1a;

  /* ─── renderer ─── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 12);

  /* ─── image-based lighting: gives the metal something to reflect ─── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* ─── keys: warm brass key, oxblood fill, cold rim for the silhouette ─── */
  const key = new THREE.DirectionalLight(0xffd9ac, 2.6);
  key.position.set(5, 6, 7);
  scene.add(key);

  const fill = new THREE.DirectionalLight(OXBLOOD, 1.1);
  fill.position.set(-7, -2, 4);
  scene.add(fill);

  // Two rims: the aircraft has to separate from a near-black page even
  // in the sections that have no vignette behind it.
  const rim = new THREE.DirectionalLight(0xfff4e6, 2.9);
  rim.position.set(-4, 5, -8);
  scene.add(rim);

  const rimWarm = new THREE.DirectionalLight(0xc4956a, 1.5);
  rimWarm.position.set(6, -3, -6);
  scene.add(rimWarm);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  /* ═══ MATERIALS ═══════════════════════════════════════════════════════
     The model ships untextured and pure white, so every surface is ours
     to author. Mapped by the source material names.
     ═══════════════════════════════════════════════════════════════════ */
  const anodised = new THREE.MeshStandardMaterial({
    color: GRAPHITE, metalness: 0.85, roughness: 0.42,
  });
  const brass = new THREE.MeshStandardMaterial({
    color: BRASS, metalness: 1.0, roughness: 0.24,
  });
  const brassDark = new THREE.MeshStandardMaterial({
    color: 0x8a6647, metalness: 1.0, roughness: 0.38,
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x0e0e0d, metalness: 0.0, roughness: 0.9,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x05070a, metalness: 1.0, roughness: 0.06,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: OXBLOOD, metalness: 0.6, roughness: 0.35,
  });
  // Spinning blades read as a translucent disc, not solid plastic.
  const blade = new THREE.MeshStandardMaterial({
    color: 0xb98f68, metalness: 0.9, roughness: 0.3,
    transparent: true, opacity: 0.42, depthWrite: false,
    side: THREE.DoubleSide,
  });

  const MATERIAL_MAP = {
    korpus: anodised, korpus2: anodised, korpus3: anodised, korpus4: anodised,
    z: anodised, stolbiki: anodised, nadpis: brass,
    motor1: brass, motor2: brassDark, vtulka: brass, katushki: brassDark,
    propeller: blade, z_propelleri: blade, vintiki: brass,
    rezina: rubber, provoda: rubber, cabels: rubber, cabels2: rubber,
    linza1: glass, linza2: glass, linza3: glass, diafragma: glass,
    photo2: glass, photo3: glass,
    f1: accent, f2: accent,
  };

  /* ═══ FLIGHT PATH ═════════════════════════════════════════════════════
     Waypoints are anchored to real sections, so the path re-derives
     itself when content or viewport height changes.
       xf / yf : fraction of the visible half-extent (-1..1), so the
                 framing holds at any aspect ratio
       at      : scroll progress, filled in by measure()
     ═══════════════════════════════════════════════════════════════════ */
  const FLIGHT = [
    // Hero: big, close, hanging in the upper right of the headline.
    { sel: '#rf-hero', align: 0.0, xf: 0.46, yf: 0.30, z: 1.2, scale: 1.32, pitch: -12, yaw: -38, roll: 6 },
    { sel: '#rf-hero', align: 1.0, xf: 0.60, yf: -0.16, z: 0.4, scale: 1.06, pitch: 10, yaw: -14, roll: -10 },

    // Thesis: banks across to the right margin and drops away.
    { sel: '#rf-thesis', align: 0.55, xf: 0.68, yf: 0.16, z: -1.6, scale: 0.80, pitch: 16, yaw: 24, roll: -16 },

    // Facts: levels out, small, watching from above the counters.
    { sel: '#rf-facts', align: 0.5, xf: -0.66, yf: 0.34, z: -2.2, scale: 0.66, pitch: 4, yaw: 52, roll: 8 },

    // Work: a survey pass. The drone rides the open air above each meta
    // column and swaps sides with the layout, so it never covers a
    // project image or its copy. The work stays the hero.
    { sel: '.rf-work-header', align: 0.9, xf: 0.66, yf: 0.30, z: -0.8, scale: 0.92, pitch: 14, yaw: -26, roll: -12 },
    { sel: '.rf-project:nth-child(1)', align: 0.5, xf: 0.74, yf: 0.33, z: -0.6, scale: 1.00, pitch: 16, yaw: -30, roll: -10 },
    { sel: '.rf-project:nth-child(2)', align: 0.5, xf: -0.60, yf: 0.31, z: -0.6, scale: 1.00, pitch: 14, yaw: 30, roll: 12 },
    { sel: '.rf-project:nth-child(3)', align: 0.5, xf: 0.68, yf: 0.35, z: -0.6, scale: 0.94, pitch: 18, yaw: -34, roll: -12 },
    { sel: '.rf-project:nth-child(4)', align: 0.5, xf: -0.52, yf: 0.33, z: -0.6, scale: 0.94, pitch: 12, yaw: 32, roll: 10 },
    { sel: '.rf-project:nth-child(5)', align: 0.5, xf: 0.74, yf: 0.33, z: -0.6, scale: 1.00, pitch: 16, yaw: -28, roll: -10 },
    { sel: '.rf-project:nth-child(6)', align: 0.5, xf: -0.52, yf: 0.33, z: -0.6, scale: 0.94, pitch: 14, yaw: 28, roll: 10 },

    // Services: rotates toward a plan view, like a schematic.
    { sel: '#rf-services', align: 0.5, xf: 0.66, yf: 0.26, z: -1.8, scale: 0.78, pitch: 62, yaw: 8, roll: 0 },

    // Testimonials: the quote is centred and wide, so the drone holds
    // the far-left margin and stays small.
    { sel: '#rf-testimonials', align: 0.5, xf: -0.82, yf: 0.42, z: -2.0, scale: 0.62, pitch: 8, yaw: -58, roll: -6 },

    // Contact: descends to a hover over the CTA and settles level.
    { sel: '#rf-contact', align: 0.85, xf: 0.0, yf: 0.44, z: 0.6, scale: 0.92, pitch: 0, yaw: 0, roll: 0 },
  ];

  function measure() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    for (const wp of FLIGHT) {
      const el = document.querySelector(wp.sel);
      if (!el) { wp.at = null; continue; }
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      // scroll position at which this point of the section sits mid-viewport
      const target = top + wp.align * rect.height - window.innerHeight / 2;
      wp.at = THREE.MathUtils.clamp(target / scrollable, 0, 1);
    }
    // guarantee monotonic progress so interpolation never runs backwards
    const live = FLIGHT.filter((w) => w.at !== null);
    for (let i = 1; i < live.length; i++) {
      if (live[i].at <= live[i - 1].at) live[i].at = live[i - 1].at + 0.0005;
    }
  }

  /* Narrow viewports get a different flight profile (see samplePath). */
  let compact = window.innerWidth < 900;

  /* visible world extent at the drone's working plane */
  function extent(z) {
    const dist = camera.position.z - z;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    return { h, w: h * camera.aspect };
  }

  const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);

  /* Sample the path at a scroll progress, writing into `out`. */
  const out = {
    x: 0, y: 0, z: 0, scale: 1, pitch: 0, yaw: 0, roll: 0,
  };
  function samplePath(p) {
    const live = FLIGHT.filter((w) => w.at !== null);
    if (!live.length) return out;

    let a = live[0];
    let b = live[live.length - 1];
    let t = 0;

    if (p <= live[0].at) { a = b = live[0]; t = 0; }
    else if (p >= live[live.length - 1].at) { a = b = live[live.length - 1]; t = 0; }
    else {
      for (let i = 0; i < live.length - 1; i++) {
        if (p >= live[i].at && p <= live[i + 1].at) {
          a = live[i]; b = live[i + 1];
          t = smootherstep((p - a.at) / (b.at - a.at));
          break;
        }
      }
    }

    const lerp = THREE.MathUtils.lerp;
    const z = lerp(a.z, b.z, t);
    const ext = extent(z);
    out.x = lerp(a.xf, b.xf, t) * ext.w * 0.5;
    out.y = lerp(a.yf, b.yf, t) * ext.h * 0.5;
    out.z = z;
    out.scale = lerp(a.scale, b.scale, t);
    out.pitch = lerp(a.pitch, b.pitch, t);
    out.yaw = lerp(a.yaw, b.yaw, t);
    out.roll = lerp(a.roll, b.roll, t);

    // Single-column layouts have no free gutter, so the aircraft flies
    // smaller and sits higher, clear of the copy.
    if (compact) {
      out.scale *= 0.58;
      out.y += ext.h * 0.15;
    }
    return out;
  }

  /* ═══ LOAD ════════════════════════════════════════════════════════════ */
  const rig = new THREE.Group();       // flight transform
  const body = new THREE.Group();      // idle bob / mouse tilt, kept separate
  rig.add(body);
  scene.add(rig);
  rig.visible = false;

  const props = [];

  const draco = new DRACOLoader().setDecoderPath(
    'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/draco/'
  );
  const loader = new GLTFLoader().setDRACOLoader(draco);

  loader.load(
    'models/drone.glb',
    (gltf) => {
      const model = gltf.scene;

      model.traverse((o) => {
        if (!o.isMesh) return;
        o.frustumCulled = false;
        const name = o.material?.name || '';
        const mapped = MATERIAL_MAP[name];
        o.material = mapped || anodised;
        if (o.material === blade) o.renderOrder = 2;
      });

      // normalise: centre on the rig origin, ~2.4 units across
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const centre = box.getCenter(new THREE.Vector3());
      const s = 2.4 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(s);
      model.position.copy(centre).multiplyScalar(-s);

      body.add(model);

      // the four re-pivoted rotors
      for (let i = 0; i < 4; i++) {
        const p = model.getObjectByName(`PROP_${i}`);
        if (p) props.push(p);
      }

      rig.visible = true;
      measure();
      canvas.classList.add('is-ready');
      document.documentElement.classList.add('rf-drone-ready');
      draco.dispose();
    },
    undefined,
    (err) => {
      console.error('[rf-drone] model failed to load', err);
      document.documentElement.classList.add('rf-drone-failed');
    }
  );

  /* ═══ INPUT ═══════════════════════════════════════════════════════════ */
  let pointerX = 0, pointerY = 0, pX = 0, pY = 0;
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  let scrollProgress = 0;
  let smoothedProgress = 0;
  function readScroll() {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollProgress = THREE.MathUtils.clamp(window.scrollY / scrollable, 0, 1);
  }
  readScroll();
  smoothedProgress = scrollProgress;
  window.addEventListener('scroll', readScroll, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    compact = window.innerWidth < 900;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { measure(); readScroll(); }, 150);
  }, { passive: true });

  // Content reveals change document height; re-measure when they settle.
  window.addEventListener('load', () => { measure(); readScroll(); });

  /* ═══ FRAME ═══════════════════════════════════════════════════════════ */
  const clock = new THREE.Clock();
  let lastProgress = 0;
  let spin = 0;
  const DEG = THREE.MathUtils.degToRad;

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden || !rig.visible) return;

    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // Damping is what makes it feel flown rather than scrubbed.
    smoothedProgress += (scrollProgress - smoothedProgress) * (reduced ? 1 : 1 - Math.pow(0.0016, dt));
    const velocity = (smoothedProgress - lastProgress) / Math.max(dt, 0.0001);
    lastProgress = smoothedProgress;

    const pose = samplePath(smoothedProgress);

    rig.position.set(pose.x, pose.y, pose.z);
    rig.scale.setScalar(pose.scale);

    // On narrow screens the drone owns the hero, then hands the page
    // back to the content rather than flying over the copy.
    if (compact) {
      const vh = window.innerHeight;
      const fade = 1 - THREE.MathUtils.clamp((window.scrollY - vh * 0.2) / (vh * 0.55), 0, 1);
      canvas.style.opacity = String(fade);
    } else if (canvas.style.opacity) {
      canvas.style.opacity = '';
    }

    if (reduced) {
      rig.rotation.set(DEG(pose.pitch), DEG(pose.yaw), DEG(pose.roll));
      body.position.set(0, 0, 0);
    } else {
      pX += (pointerX - pX) * 0.045;
      pY += (pointerY - pY) * 0.045;

      // Bank into the direction of travel, the way a real airframe would.
      const bank = THREE.MathUtils.clamp(velocity * 26, -0.5, 0.5);

      rig.rotation.set(
        DEG(pose.pitch) + pY * 0.16 + Math.sin(t * 0.9) * 0.02,
        DEG(pose.yaw) + pX * 0.22 + Math.sin(t * 0.6) * 0.03,
        DEG(pose.roll) - bank + Math.sin(t * 1.3) * 0.015
      );

      // idle hover bob
      body.position.y = Math.sin(t * 1.6) * 0.05;
      body.position.x = Math.sin(t * 0.7) * 0.03;
    }

    // Rotors: fast idle, spun up further by scroll speed.
    const rpm = reduced ? 0 : 16 + Math.min(Math.abs(velocity) * 90, 34);
    spin += rpm * dt;
    for (let i = 0; i < props.length; i++) {
      props[i].rotation.y = i % 2 ? -spin : spin;
    }

    renderer.render(scene, camera);
  }
  frame();
}
