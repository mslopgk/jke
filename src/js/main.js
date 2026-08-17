import '../styles/main.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import { buildAll } from './dom.js'
import { initScenes, initHero, initHeroVideo } from './scenes.js'

gsap.registerPlugin(ScrollTrigger)

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const reduced = reducedQuery.matches

/* ── smooth scroll ──────────────────────────────────────────────────
   Skipped entirely under reduced motion: native scrolling is what the
   user asked for.                                                     */

let lenis = null

function initSmoothScroll() {
  if (reduced) return

  lenis = new Lenis({
    lerp: 0.11,
    wheelMultiplier: 1,
    smoothWheel: true,
    // never hijack touch scrolling
    syncTouch: false,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href')
    if (id === '#') return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.25 })
    else target.scrollIntoView({ behavior: 'auto', block: 'start' })
  })
}

/* ── preloader ──────────────────────────────────────────────────────
   Waits on the hero poster specifically (the only thing that must be
   there before the curtain lifts), with a hard 4s ceiling so a slow
   network can never trap the visitor behind the overlay.              */

function waitForHero() {
  const img = document.getElementById('heroPoster')
  const ready = img?.complete
    ? Promise.resolve()
    : new Promise((res) => {
        if (!img) return res()
        img.addEventListener('load', res, { once: true })
        img.addEventListener('error', res, { once: true })
      })

  const fontsReady = document.fonts?.ready ?? Promise.resolve()
  const ceiling = new Promise((res) => setTimeout(res, 4000))

  return Promise.race([Promise.all([ready, fontsReady]), ceiling])
}

function runPreloader(onDone) {
  const root = document.getElementById('preloader')
  const count = document.getElementById('plCount')
  const rail = document.getElementById('plRail')
  const word = document.querySelector('.pl-word')

  document.body.classList.add('is-loading')

  if (reduced) {
    root.remove()
    document.body.classList.remove('is-loading')
    onDone()
    return
  }

  const progress = { v: 0 }
  const tl = gsap.timeline()

  tl.to(word, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, 0)
    .to(
      progress,
      {
        v: 100,
        duration: 1.5,
        ease: 'power1.inOut',
        onUpdate: () => {
          const n = Math.round(progress.v)
          count.textContent = String(n).padStart(2, '0')
          rail.style.width = `${n}%`
        },
      },
      0
    )

  // Idempotent — whichever of the two paths below gets here first wins.
  let finished = false
  const clear = () => {
    if (!root.isConnected) return
    root.remove()
    document.body.classList.remove('is-loading')
    ScrollTrigger.refresh()
  }

  const finish = ({ animate }) => {
    if (finished) return
    finished = true
    clearTimeout(bail)
    root.classList.add('is-done')

    if (!animate) {
      clear()
    } else {
      gsap
        .timeline({ onComplete: clear })
        .to('.preloader__meter, .preloader__rail', { opacity: 0, duration: 0.3 })
        .to(word, { yPercent: -110, opacity: 0, duration: 0.7, ease: 'expo.inOut' }, 0.1)
        .to(root, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.25)
    }

    onDone()
  }

  /* Hard bail-out. In a backgrounded tab Chrome suspends requestAnimationFrame,
     which stalls the GSAP timeline this promise waits on — without this the
     curtain would never lift for someone who opened the page in a new tab and
     came back to it. setTimeout keeps running (throttled) while rAF does not. */
  const bail = setTimeout(() => finish({ animate: false }), 6000)

  Promise.all([waitForHero(), tl.then()]).then(() => finish({ animate: true }))
}

/* ── 3D accent, loaded only when it is nearly on screen ─────────────
   three.js is ~120 kB gzipped — far too much to put on the critical path
   for one decorative corner. It arrives when the RECORD section does.  */

function lazyAccent3d() {
  const canvas = document.getElementById('accent3d')
  if (!canvas) return

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return
      io.disconnect()
      import('./accent3d.js')
        .then((m) => m.initAccent3d(canvas, { reduced }))
        .catch(() => document.getElementById('accentWrap')?.remove())
    },
    { rootMargin: '600px' }
  )
  io.observe(canvas)
}

/* ── boot ───────────────────────────────────────────────────────── */

function boot() {
  buildAll()
  initSmoothScroll()
  initAnchors()
  initScenes({ reduced })
  lazyAccent3d()

  runPreloader(() => {
    if (!reduced) initHero()
    initHeroVideo({ reduced })
  })

  // late-arriving webfonts change every measurement
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}

/* Dev-only handle. A backgrounded tab has requestAnimationFrame suspended, so
   scroll-scrubbed states cannot be inspected without forcing ticks by hand.
   Stripped from production builds. */
if (import.meta.env.DEV) {
  window.__jke = {
    gsap,
    ScrollTrigger,
    get lenis() { return lenis },
    /** Jump to an absolute scroll position and settle every scrub. */
    seek(y, ticks = 90) {
      window.scrollTo(0, y)
      lenis?.scrollTo(y, { immediate: true })
      for (let i = 0; i < ticks; i++) gsap.ticker.tick()
      ScrollTrigger.update()
      for (let i = 0; i < ticks; i++) gsap.ticker.tick()
      return Math.round(window.scrollY)
    },
  }
}

// switching the OS setting mid-visit should not leave a half-animated page
reducedQuery.addEventListener?.('change', () => window.location.reload())
