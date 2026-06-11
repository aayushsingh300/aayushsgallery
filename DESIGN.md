---
name: Aayush R Portfolio
description: A warm-cosmic Mission Control portfolio for a senior product designer
colors:
  signal-orange: "#ff8e00"
  terminal-green: "#4ade80"
  space-black: "#04060e"
  hud-black: "#0a0e14"
  warm-black: "#221616"
  ember-black: "#1a1010"
  coal: "#0d0808"
  terracotta: "#a47864"
  umber: "#775445"
  dark-umber: "#442f26"
  ink-cream: "#d6d0c4"
  ice-white: "#edf0f4"
  slate-muted: "#bcc4d0"
  space-navy: "#101f2c"
typography:
  headline:
    fontFamily: "Inter, IBM Plex Sans, sans-serif"
    fontSize: "clamp(80px, 10.6vw, 153px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-1px"
  display:
    fontFamily: "Questrial, Inter, sans-serif"
    fontSize: "29px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.575
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "15.2px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0.4px"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  gutter: "60px"
components:
  nav-glass:
    backgroundColor: "{colors.space-black}"
    textColor: "{colors.slate-muted}"
    padding: "20px 60px"
  cta-link:
    textColor: "{colors.signal-orange}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.signal-orange}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 16px"
  proj-card:
    backgroundColor: "{colors.warm-black}"
    textColor: "{colors.ink-cream}"
    rounded: "{rounded.xs}"
    height: "480px"
  input-glass:
    backgroundColor: "{colors.hud-black}"
    textColor: "{colors.ink-cream}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: Aayush R Portfolio

## 1. Overview

**Creative North Star: "Mission Control"**

This is a designer's flight deck. The portfolio reads like an instrument panel for ambitious work: a near-black void (`#04060e`) holds the content the way a HUD holds telemetry, signal orange (`#ff8e00`) marks the one thing worth acting on, and terminal green (`#4ade80`) is reserved for live, instrumented readouts. But this is not cold sci-fi. The void is warmed from below by an earth band of terracotta, umber, and ember-brown (`#221616` → `#775445`), so the cosmos feels watched from a lived-in place, not a sterile bridge. Film grain at 1.6% opacity and a spaceship cursor make the whole surface feel like a physical instrument, not a webpage.

The components are tactile and confident, not thin HUD chrome. Surfaces have weight, buttons fill solidly, cards lift a full 8px on hover with a long cubic-bezier ease. The cosmic frame sets the ambition; the work inside the project cards stays the hero. Every effect has to earn its place against that rule: the medium proves the craft, but it never out-shouts the case study it's framing.

This system explicitly rejects two things. It is **not a generic template portfolio** — no interchangeable Webflow hero, no uniform card grid with a point of view borrowed from a marketplace. And it is **not a corporate SaaS landing** — no navy-and-blue gradient wash, no hero-metric blocks, no buzzword copy. The warmth, the grain, the spaceship cursor, and the committed dark palette are the anti-template.

**Key Characteristics:**
- Near-black space body warmed by an earth band (terracotta/umber/ember)
- Signal orange as the single action color; terminal green as the live-data color
- Glassmorphic navigation and overlays (backdrop-blur), used purposefully, not decoratively
- Film grain + spaceship cursor as ambient instrument texture
- Tactile components with real weight and long-eased motion
- Inter for structure, Questrial for display warmth, monospace for telemetry

## 2. Colors

A warm-dark cosmic palette: a near-black void, an earth band of browns that grounds it, and two electric signals (orange to act, green to read).

### Primary
- **Signal Orange** (`#ff8e00`): The one action color. CTA text (with a `0 0 3px` glow), the chatbot FAB and send button, primary arrows and links. Its scarcity is the point — it means "this is the thing to do." Light mode deepens it to `#c46a00` for contrast.

### Secondary
- **Terminal Green** (`#4ade80`): Reserved for *live, instrumented* states only — status dots, telemetry readouts, liquid-ripple click feedback, monospace data in case-study mockups. Never decorative; it always means "this is live / this is a measurement."

### Tertiary (the earth band)
- **Terracotta** (`#a47864`): Warm mid-tone for secondary accents and warm UI moments.
- **Umber** (`#775445`): Brown structural tone bridging the void and the earth.
- **Dark Umber** (`#442f26`): The deepest earth tone, for warm shadow and grounding.

### Neutral
- **Space Black** (`#04060e`): The true body void. Everything floats on this.
- **HUD Black** (`#0a0e14`): Panel and card backgrounds, the instrument-surface black.
- **Warm Black** (`#221616`) / **Ember Black** (`#1a1010`) / **Coal** (`#0d0808`): The warm section gradient stack — sections drift between these to give the long page a living, shifting floor.
- **Ink Cream** (`#d6d0c4`): Primary body and heading text. Warm off-white, never pure white — the warmth ties text to the earth band.
- **Ice White** (`#edf0f4`): Reserved for the brightest active/hover state on nav links only.
- **Slate Muted** (`#bcc4d0`): Cool muted text for nav and secondary labels (used at ~62% opacity).
- **Space Navy** (`#101f2c`): A cool deep-space accent surface, the one cool note in a warm system.

### Named Rules
**The Single Signal Rule.** Signal orange is an action color, not a brand wash. It appears on the one thing the user should do next and nowhere else. If two oranges compete on a screen, one of them is wrong.

**The Live-Green Rule.** Terminal green is forbidden as decoration. It is permitted only where something is genuinely live or measured: a status, a readout, a real-time response. Green used for "looks techy" is a tell.

## 3. Typography

**Display Font:** Questrial (with Inter, sans-serif fallback)
**Body / UI Font:** Inter (with IBM Plex Sans, system fallback)
**Telemetry Font:** monospace (`ui-monospace`, SFMono-Regular)

**Character:** Inter does the structural heavy lifting — UI, navigation, the giant uppercase hero. Questrial adds a single geometric-humanist warmth note for display moments so the page isn't all one voice. Monospace is the instrument typeface: data, readouts, and case-study telemetry only. Three families, each with a clear job.

### Hierarchy
- **Headline** (Inter 600, `clamp(80px, 10.6vw, 153px)`, line-height 1, tracking `-1px`, UPPERCASE): The hero tagline. Cinematic, room-filling, the first proof of confidence.
- **Display** (Questrial 400, ~29px, line-height 1.3): Project card titles and feature headings; the warm voice.
- **Body** (Inter 500, ~16px, line-height 1.575): Reading copy and descriptions. Cap measure at 65–75ch.
- **Label** (Inter 400, ~15px, tracking 0.4px, UPPERCASE): CTA text, card subtitles, eyebrow micro-labels. Short only.
- **Telemetry** (monospace, ~12px): Data points, readouts, and HUD numerics in mockups — almost always paired with terminal green.

### Named Rules
**The One Shout Rule.** Only the hero headline is allowed to fill the viewport. Below the fold, scale steps down hard; nothing else competes with the opening shout.

## 4. Elevation

A hybrid system. The page floor is **tonal** — sections drift between warm-black tones (`#221616` / `#1a1010` / `#0d0808`) rather than using borders to separate. Lift is reserved for **interactive** elements and rendered with long, warm shadows plus motion, never a flat default drop-shadow.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 45px 55px -20px #0d0600`): The deep, warm, far-thrown shadow under project cards — long and brown-tinted, not gray. This is what makes a card feel like it's floating in warm space.
- **Glow accent** (`box-shadow: 0 4px 20px rgba(255,142,0,0.4)`): Signal-orange glow under the chatbot FAB and active orange elements. The only colored shadow in the system.
- **Glass overlay** (`box-shadow: 0 10px 40px rgba(0,0,0,0.5)` + `backdrop-filter: blur(20px)`): Floating panels (chatbot window, nav) sit on blurred glass, not opaque fills.

### Named Rules
**The Warm-Shadow Rule.** Shadows are brown-black (`#0d0600` / `#0d0808`), never neutral gray. A gray drop-shadow on this palette reads as a 2014 app card and is forbidden.

## 5. Components

### Navigation
- **Style:** Fixed glass bar — `rgba(8,10,14,0.72)` with `backdrop-filter: blur(22px) saturate(140%)`, hairline bottom border `rgba(255,255,255,0.07)`. Densifies to `0.92` opacity on scroll and hides on scroll-down via `translateY(-100%)`.
- **Typography:** Inter 500, 13px, tracking 0.04em. Links rest at slate-muted ~62%, brighten to **Ice White** (`#edf0f4`) on hover/active.
- **Mobile:** Hamburger → full-width glass drawer (`rgba(8,10,14,0.97)`, blur 24px) sliding from top, 18px links.

### Primary CTA (signal link)
- **Style:** Not a filled button — a glowing text link. Inter 400 UPPERCASE, signal orange with `text-shadow: 0 0 3px` orange glow, paired with a 28px orange arrow icon, 17px gap.
- **Behavior:** The arrow is the affordance; the glow signals interactivity. This is the portfolio's signature action treatment.

### Solid Button (FAB / send)
- **Shape:** Circular (`border-radius: 50%`) for floating actions; pill for inline.
- **Primary:** Signal orange fill, white icon, orange glow shadow `0 4px 20px rgba(255,142,0,0.4)`.
- **Hover:** `scale(1.1)` with a spring ease (`cubic-bezier(0.175,0.885,0.32,1.275)`), shadow intensifies. Tactile and confident.

### Project Cards
- **Corner Style:** Tight 4px radius — almost square, instrument-like, not soft.
- **Background:** Full-bleed project image under a warm gradient scrim (`rgba(22,14,14,0.97)` → transparent from the bottom 360px). Title (Questrial 29px) and uppercase subtitle sit centered at the base.
- **Shadow Strategy:** Deep warm rest shadow (see Elevation).
- **Hover:** Lifts `translateY(-8px) scale(1.01)` over 0.35s on a long cubic-bezier — the signature card motion.

### Inputs / Fields
- **Style:** Glass — `rgba(255,255,255,0.05)` fill, `rgba(255,255,255,0.1)` hairline border, 20px radius, ink-cream text.
- **Focus:** Border shifts to `rgba(255,142,0,0.5)` (orange) and fill lifts to `0.08`. No hard ring; a warm glow shift.

### Signature Atmosphere (custom)
- **Spaceship cursor:** `cursor-spaceship.svg` replaces the pointer site-wide; text fields keep a text variant.
- **Film grain:** Animated SVG fractal-noise overlay at 1.6% opacity, drifting on an 8s step loop — felt, not seen.
- **Liquid ripple:** Terminal-green concentric rings on click, expanding to 320px over 0.85s.

## 6. Do's and Don'ts

### Do:
- **Do** keep signal orange (`#ff8e00`) as the single action color — one obvious next move per screen.
- **Do** reserve terminal green (`#4ade80`) for genuinely live or measured states only.
- **Do** warm every shadow toward brown-black (`#0d0600`), never neutral gray.
- **Do** keep text on **Ink Cream** (`#d6d0c4`), warm and never pure white, to tie type to the earth band.
- **Do** give interactive elements real weight and long-eased motion — tactile and confident, per the brand.
- **Do** let only the hero headline fill the viewport; step scale down hard below it.

### Don't:
- **Don't** ship the **generic template portfolio** look — no interchangeable Webflow hero, no uniform card grid without a point of view. (PRODUCT.md anti-reference.)
- **Don't** drift toward a **corporate SaaS landing** — no navy-and-blue gradient wash, no hero-metric blocks, no buzzword copy ("seamless", "enterprise-grade"). (PRODUCT.md anti-reference.)
- **Don't** use terminal green decoratively to "look techy" — it must mean live or measured.
- **Don't** let a second orange compete with the primary action on any screen.
- **Don't** use a neutral gray drop-shadow; on this warm palette it reads as a 2014 app card.
- **Don't** let cosmic effects out-shout the work — the project is always the hero.
