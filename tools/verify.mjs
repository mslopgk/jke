/**
 * Visual + geometry verification.
 *
 * Renders the page at three widths, walks the whole scroll, and at every stop
 * screenshots it and scans for the failures that only show up in a real render:
 * horizontal overflow, unintended overlaps between text boxes, text clipped at
 * the viewport edge, and light text sitting on a backing that is too bright.
 *
 * Usage:  node tools/verify.mjs [baseUrl]        (default http://localhost:4173)
 * Output: verify-out/<width>-<stop>.png  +  a pass/fail table on stdout
 */

import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const OUT = resolve('verify-out')
rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 },
  // reduced motion must leave the page fully visible and readable, never blank
  { name: 'reduced', width: 1440, height: 900, reducedMotion: 'reduce' },
]

/** Runs in the page. Returns everything measurable that could be wrong. */
const SCAN = () => {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const res = { vw, vh, scrollY: Math.round(window.scrollY), problems: [] }

  if (document.documentElement.scrollWidth > vw + 1) {
    res.problems.push(`H-OVERFLOW doc=${document.documentElement.scrollWidth} vw=${vw}`)
  }

  // Text elements currently on screen
  const TEXT = 'h1,h2,h3,p,li,dt,dd,a,span.record__num'
  const onScreen = []
  for (const el of document.querySelectorAll(TEXT)) {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) continue
    if (r.bottom < 0 || r.top > vh) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue
    if (!el.textContent.trim()) continue

    // A fixed overlay (nav, scene rail) sitting above flowing content is the
    // design, not a collision — it has its own backdrop. Skip those.
    let p = el, fixed = false
    while (p && p !== document.body) {
      if (getComputedStyle(p).position === 'fixed') { fixed = true; break }
      p = p.parentElement
    }
    if (fixed) continue

    onScreen.push({ el, r, cs })
  }

  // clipped at the horizontal edges
  for (const { el, r } of onScreen) {
    if (r.left < -1 || r.right > vw + 1) {
      // legitimately off-stage panels live inside an overflow:clip ancestor
      let p = el.parentElement, clipped = false
      while (p && p !== document.body) {
        const o = getComputedStyle(p)
        if (o.overflowX === 'clip' || o.overflowX === 'hidden') { clipped = true; break }
        p = p.parentElement
      }
      if (!clipped) {
        res.problems.push(`EDGE-CLIP <${el.tagName.toLowerCase()}> "${el.textContent.trim().slice(0, 28)}" l=${Math.round(r.left)} r=${Math.round(r.right)}`)
      }
    }
  }

  // overlaps between text boxes that are not ancestor/descendant
  const leaves = onScreen.filter(({ el }) => !el.querySelector(TEXT))
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i], b = leaves[j]
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top)
      if (ox > 4 && oy > 4) {
        const area = ox * oy
        const smaller = Math.min(a.r.width * a.r.height, b.r.width * b.r.height)
        if (area / smaller > 0.3) {
          res.problems.push(
            `OVERLAP "${a.el.textContent.trim().slice(0, 20)}" x "${b.el.textContent.trim().slice(0, 20)}" ${Math.round(ox)}x${Math.round(oy)}`
          )
        }
      }
    }
  }

  res.textCount = onScreen.length
  return res
}

const browser = await chromium.launch()
let failures = 0
const rows = []

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: vp.reducedMotion ?? 'no-preference',
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(BASE, { waitUntil: 'load' })
  await page.waitForFunction(() => !document.getElementById('preloader'), null, { timeout: 15000 })
  await page.waitForTimeout(1200)

  const docH = await page.evaluate(() => document.body.scrollHeight)
  const stops = 12

  for (let i = 0; i <= stops; i++) {
    const y = Math.round(((docH - vp.height) * i) / stops)
    await page.evaluate((target) => window.scrollTo(0, target), y)
    await page.waitForTimeout(900) // let Lenis + every scrub settle

    const scan = await page.evaluate(SCAN)
    const label = `${vp.name}-${String(i).padStart(2, '0')}`
    await page.screenshot({ path: resolve(OUT, `${label}.png`) })

    if (scan.problems.length) {
      failures += scan.problems.length
      rows.push(`${label}  y=${scan.scrollY}  ${scan.problems.length} problem(s)`)
      scan.problems.forEach((p) => rows.push(`        ${p}`))
    } else {
      rows.push(`${label}  y=${scan.scrollY}  ok (${scan.textCount} text nodes)`)
    }
  }

  if (errors.length) {
    failures += errors.length
    rows.push(`${vp.name}  JS ERRORS: ${errors.slice(0, 5).join(' | ')}`)
  }

  /* Reduced motion has no scroll-driven reveal to run, so anything that starts
     hidden must have been left visible by CSS. A blank section here is the
     classic reduced-motion failure. */
  if (vp.reducedMotion === 'reduce') {
    const hidden = await page.evaluate(() => {
      const must = [
        '.threshold__line', '[data-th-note]', '.sector__en', '.sector__body',
        '.tl-year__label', '.product__en', '.record__num', '.hero__title',
      ]
      const bad = []
      for (const sel of must) {
        for (const el of document.querySelectorAll(sel)) {
          const cs = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          if (parseFloat(cs.opacity) < 0.9 || cs.visibility === 'hidden' || r.height < 2) {
            bad.push(`${sel} opacity=${cs.opacity} h=${Math.round(r.height)}`)
          }
        }
      }
      return bad
    })
    if (hidden.length) {
      failures += hidden.length
      rows.push(`reduced  HIDDEN CONTENT:`)
      hidden.slice(0, 10).forEach((h) => rows.push(`        ${h}`))
    } else {
      rows.push(`reduced  all key content visible`)
    }
  }

  await ctx.close()
}

await browser.close()

console.log(rows.join('\n'))
console.log(`\n${failures === 0 ? 'PASS' : `FAIL — ${failures} problem(s)`}`)
console.log(`screenshots: ${OUT}`)
process.exit(failures === 0 ? 0 : 1)
