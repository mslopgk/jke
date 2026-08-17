/**
 * Section-anchored screenshots — frames each scene at the scroll position where
 * it is actually composed, which the evenly-spaced walk in verify.mjs cannot do.
 *
 * Usage:  node tools/shots.mjs [baseUrl] [width] [height]
 * Output: shots-out/<label>.png
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = process.argv[2] ?? 'http://localhost:4173'
const W = Number(process.argv[3] ?? 1440)
const H = Number(process.argv[4] ?? 900)
// Filenames are width-prefixed, so runs at different widths accumulate side by
// side instead of clobbering each other.
const OUT = resolve('shots-out')
mkdirSync(OUT, { recursive: true })

/** [label, section selector, fraction through that section] */
const SHOTS = [
  ['01-hero', '#hero', 0],
  ['02a-threshold-start', '#threshold', 0.06],
  ['02b-threshold-mid', '#threshold', 0.4],
  ['02c-threshold-end', '#threshold', 0.62],
  ['03a-sector-1', '#business', 0.07],
  ['03b-sector-2', '#business', 0.36],
  ['03c-sector-3', '#business', 0.67],
  ['04a-products-top', '#products', 0.04],
  ['04b-products-mid', '#products', 0.45],
  ['05-record', '#numbers', 0.32],
  ['06a-timeline-start', '#timeline', 0.04],
  ['06b-timeline-mid', '#timeline', 0.5],
  ['06c-timeline-end', '#timeline', 0.95],
  ['07-contact', '#contact', 0.5],
]

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
const page = await ctx.newPage()

await page.goto(BASE, { waitUntil: 'load' })
await page.waitForFunction(() => !document.getElementById('preloader'), null, { timeout: 15000 })
await page.waitForTimeout(1500)

for (const [label, sel, frac] of SHOTS) {
  const y = await page.evaluate(
    ([s, f]) => {
      const el = document.querySelector(s)
      if (!el) return 0
      return Math.round(el.offsetTop + el.offsetHeight * f)
    },
    [sel, frac]
  )
  await page.evaluate((t) => window.scrollTo(0, t), y)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: resolve(OUT, `${W}-${label}.png`) })
  console.log(`${W}-${label}  y=${y}`)
}

await browser.close()
console.log(`\nshots: ${OUT}`)
