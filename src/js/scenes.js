/**
 * Every scroll-choreographed scene. One module so the ordering of
 * ScrollTrigger creation (and therefore refresh order) stays obvious.
 *
 * Contract honoured throughout:
 *  - each pinned stage uses position:sticky with an opaque background, so no
 *    neighbouring section can bleed through during the pin
 *  - every video and every rAF loop is gated on visibility
 *  - under reduced motion nothing here runs; CSS leaves the page readable
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCENES, SECTORS, PRODUCTS, HISTORY } from './data.js'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP = '(min-width: 861px)'
const q = (s, r = document) => r.querySelector(s)
const qq = (s, r = document) => Array.from(r.querySelectorAll(s))

/* ── helpers ─────────────────────────────────────────────────────── */

/** Splits an element's text into per-character spans. */
function splitChars(el) {
  const text = el.textContent
  el.textContent = ''
  const chars = []
  for (const ch of text) {
    const span = document.createElement('span')
    span.className = 'char'
    span.textContent = ch === ' ' ? ' ' : ch
    el.appendChild(span)
    chars.push(span)
  }
  return chars
}

/* ── NAV + scene rail ────────────────────────────────────────────── */

export function initChrome() {
  const nav = q('#nav')
  ScrollTrigger.create({
    start: 'top -48',
    end: 99999,
    onToggle: (self) => nav.classList.toggle('is-stuck', self.isActive),
  })

  const links = new Map(SCENES.map((s) => [s.id, q(`[data-rail="${s.id}"]`)]))
  SCENES.forEach((s) => {
    const section = q(`[data-scene="${s.id}"]`)
    if (!section) return
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => links.get(s.id)?.classList.toggle('is-active', self.isActive),
    })
  })

  // mobile menu
  const burger = q('#navBurger')
  const menu = q('#navLinks')
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open')
    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기')
  })
  menu?.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      menu.classList.remove('is-open')
      burger.setAttribute('aria-expanded', 'false')
    }
  })
}

/* ── 01 HERO ─────────────────────────────────────────────────────── */

export function initHero() {
  const chars = qq('.hero__title [data-split]').flatMap(splitChars)

  const tl = gsap.timeline({ delay: 0.15 })
  tl.from(chars, {
    yPercent: 118,
    duration: 1.15,
    ease: 'expo.out',
    stagger: { each: 0.028, from: 'start' },
  })
    .from('[data-hero-underline]', { scaleX: 0, duration: 1, ease: 'expo.out' }, 0.45)
    .from('[data-hero-fade]', { y: 22, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0.5)
    .from('.hero__scroll', { opacity: 0, duration: 0.8 }, 0.9)

  // scrubbed reframe: the media pushes and drifts 1:1 with the finger
  gsap.to('.hero__media', {
    yPercent: 14,
    scale: 1.14,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  })
  gsap.to('.hero__body', {
    yPercent: -22,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '70% top', scrub: true },
  })

  return tl
}

/** Loads and gates the hero video. Skipped on small screens / reduced motion. */
export function initHeroVideo({ reduced }) {
  const video = q('#heroVideo')
  if (!video) return
  if (reduced || window.matchMedia('(max-width: 767px)').matches) {
    video.remove()
    return
  }

  // H.264 first — it is both smaller here and universally supported. The WebM is
  // for Chromium builds shipped without proprietary codecs.
  for (const [src, type] of [
    ['/assets/ai/hero-loop.mp4', 'video/mp4; codecs="avc1.640029"'],
    ['/assets/ai/hero-loop.webm', 'video/webm; codecs="vp9"'],
  ]) {
    const s = document.createElement('source')
    s.src = src
    s.type = type
    video.appendChild(s)
  }

  video.addEventListener('loadeddata', () => video.classList.add('is-ready'), { once: true })

  let inView = false
  let started = false
  const sync = () => {
    if (inView && !document.hidden) video.play().catch(() => {})
    else if (started) video.pause()
  }

  new IntersectionObserver(
    ([e]) => { inView = e.isIntersecting; if (started) sync() },
    { threshold: 0.01 }
  ).observe(video)
  document.addEventListener('visibilitychange', () => { if (started) sync() })

  /* The poster is already on screen, so the clip is pure enhancement — let the
     fonts, CSS and hero image finish before spending a megabyte on it. */
  const begin = () => {
    if (started) return
    started = true
    video.load()
    sync()
  }
  if ('requestIdleCallback' in window) requestIdleCallback(begin, { timeout: 2500 })
  else setTimeout(begin, 1200)
}

/* ── 02 THRESHOLD ────────────────────────────────────────────────── */

export function initThreshold() {
  const out = q('.threshold__layer[data-layer="out"]')
  const inn = q('.threshold__layer[data-layer="in"]')
  const l0 = q('[data-th="0"]')
  const l1 = q('[data-th="1"]')
  const note = q('[data-th-note]')

  gsap.set(inn, { scale: 1.34, opacity: 0 })
  gsap.set([l0, l1], { opacity: 0, y: 26 })
  gsap.set(note, { opacity: 0, y: 18 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.threshold',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
    },
    defaults: { ease: 'none' },
  })

  // camera pushes through the shipyard and lands inside the cabinet
  tl.to(out, { scale: 1.42, duration: 0.62 }, 0)
    .to(out, { opacity: 0, duration: 0.22 }, 0.4)
    .to(inn, { opacity: 1, duration: 0.22 }, 0.42)
    .to(inn, { scale: 1, duration: 0.5 }, 0.42)
    .to(inn, { scale: 1.08, duration: 0.08 }, 0.92)

  // first line in, out; second line in and stays
  tl.to(l0, { opacity: 1, y: 0, duration: 0.1 }, 0.05)
    .to(l0, { opacity: 0, y: -26, duration: 0.1 }, 0.32)
    .to(l1, { opacity: 1, y: 0, duration: 0.1 }, 0.54)
    .to(note, { opacity: 1, y: 0, duration: 0.08 }, 0.7)
}

/* ── 03 SECTORS (horizontal on desktop, stacked below) ───────────── */

/* Dwell/slide budget as fractions of the scene's scroll. A panel has to sit
   still long enough to be read before it slides away — a purely linear track
   means panel 01 starts leaving the moment the section pins, and its copy gets
   clipped at the left edge before anyone can read it. */
const S_HOLD = 0.18
const S_SLIDE = 0.2
/** Progress at the middle of each panel's dwell. */
const S_DWELL = [
  S_HOLD / 2,
  S_HOLD + S_SLIDE + S_HOLD / 2,
  2 * S_HOLD + 2 * S_SLIDE + S_HOLD / 2,
]

export function initSectors() {
  const copyOf = (sec) =>
    sec.querySelectorAll(
      '.sector__index, .sector__en, .sector__ko, .sector__body, .sector__specs li'
    )

  ScrollTrigger.matchMedia({
    [DESKTOP]: () => {
      const track = q('#sectorsTrack')
      const bars = qq('#sectorsProgress i')
      const panels = qq('.sector')
      const n = SECTORS.length
      const step = 100 / n

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.sectors',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate: (self) => {
            let active = 0
            for (let i = 1; i < n; i++) if (self.progress >= S_DWELL[i] - S_SLIDE / 2) active = i
            bars.forEach((b, i) => b.classList.toggle('is-on', i <= active))
          },
        },
        defaults: { ease: 'none' },
      })

      // hold · slide · hold · slide · hold
      tl.to(track, { xPercent: 0, duration: S_HOLD })
        .to(track, { xPercent: -step, duration: S_SLIDE })
        .to(track, { xPercent: -step, duration: S_HOLD })
        .to(track, { xPercent: -step * 2, duration: S_SLIDE })
        .to(track, { xPercent: -step * 2, duration: 1 - 2 * S_HOLD - 2 * S_SLIDE })

      // backgrounds drift against the text the whole way — two decoupled tracks
      tl.fromTo('[data-sector-bg]', { xPercent: 5 }, { xPercent: -5, duration: 1 }, 0)

      // copy arrives as its panel slides in, and reverses on the way back
      panels.forEach((sec, i) => {
        tl.from(
          copyOf(sec),
          { y: 26, opacity: 0, duration: 0.11, stagger: 0.013, ease: 'power2.out' },
          i === 0 ? 0 : S_DWELL[i] - S_SLIDE * 0.55
        )
      })

      bars[0]?.classList.add('is-on')
    },

    '(max-width: 860px)': () => {
      // stacked layout: each panel reveals on its own as it scrolls up
      qq('.sector').forEach((sec) => {
        gsap.from(copyOf(sec), {
          y: 26, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.07,
          scrollTrigger: { trigger: sec, start: 'top 78%', once: true },
        })
      })
    },
  })
}

/* ── 04 PRODUCTS ─────────────────────────────────────────────────── */

export function initProducts() {
  const imgs = qq('[data-pimg]')
  const items = qq('[data-product]')
  const caption = q('#productCaption')
  let current = 0

  const setActive = (i) => {
    if (i === current) return
    current = i
    imgs.forEach((im, k) => im.classList.toggle('is-on', k === i))
    items.forEach((it, k) => it.classList.toggle('is-active', k === i))
    caption.textContent = `${PRODUCTS[i].en} · ${PRODUCTS[i].ko}`
  }

  items.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 62%',
      end: 'bottom 38%',
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    })
    // hover is a shortcut, not the only way in
    item.addEventListener('mouseenter', () => setActive(i))
  })

  gsap.from('.products__intro > *', {
    y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '.products__intro', start: 'top 78%', once: true },
  })
}

/* ── 05 RECORD ───────────────────────────────────────────────────── */

export function initRecord() {
  gsap.from('[data-gl]', {
    opacity: 0,
    duration: 1.1,
    ease: 'power2.out',
    stagger: { each: 0.018, from: 'random' },
    scrollTrigger: { trigger: '.record', start: 'top 82%', once: true },
  })

  gsap.from('.record__head > *, .record__stat, .record__certs', {
    y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.record', start: 'top 72%', once: true },
  })

  const fmt = new Intl.NumberFormat('ko-KR')
  qq('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count)
    // A year is not a quantity — 2,002 would be wrong.
    const grouped = el.dataset.countGroup === 'true'
    const obj = { v: 0 }
    gsap.to(obj, {
      v: target,
      duration: 1.9,
      ease: 'power2.out',
      snap: { v: 1 },
      onUpdate: () => {
        const n = Math.round(obj.v)
        el.textContent = grouped ? fmt.format(n) : String(n)
      },
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    })
  })
}

/* ── 06 TIMELINE ─────────────────────────────────────────────────── */

export function initTimeline() {
  const years = qq('[data-tl-year]')
  const fill = q('#timelineFill')
  if (!years.length) return

  const light = (activeIdx) => {
    years.forEach((y, i) => y.classList.toggle('is-on', i <= activeIdx))
  }

  ScrollTrigger.matchMedia({
    [DESKTOP]: () => {
      const rail = q('#timelineRail')
      const viewport = q('.timeline__viewport')

      /* scrollWidth is unreliable here: the rail is not a scroll container (its
         ancestor uses overflow:clip), so browsers report clientWidth instead.
         Measure the panels directly. */
      const distance = () => {
        const cs = getComputedStyle(rail)
        const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
        const content = years.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
        return Math.max(0, content + pad - viewport.clientWidth)
      }

      // A beat on 2002 before the rail starts moving, and one on 2020 after it
      // stops — otherwise the first and last years flash past.
      const LEAD = 0.08
      const TRAVEL = 1 - LEAD * 2

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.timeline',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = Math.min(1, Math.max(0, (self.progress - LEAD) / TRAVEL))
            fill.style.width = `${(t * 100).toFixed(2)}%`
            light(Math.round(t * (years.length - 1)))
          },
        },
        defaults: { ease: 'none' },
      })

      tl.to(rail, { x: 0, duration: LEAD })
        .to(rail, { x: () => -distance(), duration: TRAVEL })
        .to(rail, { x: () => -distance(), duration: LEAD })

      light(0)
    },
    '(max-width: 860px)': () => {
      // vertical list: light each year as it scrolls in
      years.forEach((y, i) => {
        ScrollTrigger.create({
          trigger: y,
          start: 'top 78%',
          onEnter: () => y.classList.add('is-on'),
          onLeaveBack: () => { if (i > 0) y.classList.remove('is-on') },
        })
      })
      gsap.to(fill, {
        height: '100%',
        ease: 'none',
        scrollTrigger: { trigger: '#timelineRail', start: 'top 70%', end: 'bottom 70%', scrub: 0.4 },
      })
    },
  })

  gsap.from('.timeline__head > *', {
    y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
    scrollTrigger: { trigger: '.timeline', start: 'top 72%', once: true },
  })
}

/* ── PARTNERS marquee ────────────────────────────────────────────── */

export function initPartners() {
  const row = q('#partnersRow')
  if (!row) return

  const anim = gsap.to(row, {
    xPercent: -50,
    duration: 46,
    ease: 'none',
    repeat: -1,
  })
  anim.pause()

  // gate: no ticker work while the strip is offscreen
  ScrollTrigger.create({
    trigger: '.partners',
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive && !document.hidden ? anim.play() : anim.pause()),
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) anim.pause()
  })
}

/* ── 07 CONTACT ──────────────────────────────────────────────────── */

export function initContact() {
  gsap.from('.contact__inner > *', {
    y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.contact', start: 'top 76%', once: true },
  })

  gsap.fromTo(
    '#footMark',
    { xPercent: -4 },
    {
      xPercent: 4,
      ease: 'none',
      scrollTrigger: { trigger: '.contact__wordmark', start: 'top bottom', end: 'bottom bottom', scrub: true },
    }
  )
}

/* ── boot ────────────────────────────────────────────────────────── */

export function initScenes({ reduced }) {
  initChrome()
  if (reduced) return
  initThreshold()
  initSectors()
  initProducts()
  initRecord()
  initTimeline()
  initPartners()
  initContact()
}
