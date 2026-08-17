/**
 * Downloads the generated Higgsfield stills and re-encodes them to WebP at the
 * sizes the page actually uses.
 *
 * Usage:  node tools/build-assets.mjs <dir-of-higgsfield-job-json>
 *
 * Each input file is the `--json` output of `higgsfield generate create`, named
 * after the asset it produced (e.g. `offshore.json` -> `offshore.webp`).
 * `hero-video.json` is handled by fetch-video.mjs instead.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const RAW = resolve(process.argv[2] ?? 'raw')
const OUT = resolve('public/assets/ai')
mkdirSync(OUT, { recursive: true })

/** name -> [max width, webp quality] */
const RECIPE = {
  'hero-poster': [2200, 70],
  offshore: [1920, 70],
  shipbuilding: [1920, 70],
  building: [1920, 70],
  'cabinet-macro': [1920, 70],
  assembly: [1920, 70],
  testing: [1920, 70],
  texture: [1600, 66],
}
const PRODUCT_DEFAULT = [1200, 76]

const files = readdirSync(RAW).filter((f) => f.endsWith('.json') && f !== 'hero-video.json')
const report = []

for (const f of files) {
  const name = f.replace(/\.json$/, '')
  let job
  try {
    job = JSON.parse(readFileSync(join(RAW, f), 'utf8'))
  } catch {
    report.push([name, 'BAD JSON', '-'])
    continue
  }

  const url = job?.[0]?.result_url
  if (!url) { report.push([name, 'NO URL', '-']); continue }

  const res = await fetch(url)
  if (!res.ok) { report.push([name, `HTTP ${res.status}`, '-']); continue }

  const [w, q] = RECIPE[name] ?? PRODUCT_DEFAULT
  const out = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: q, effort: 6 })
    .toBuffer()

  writeFileSync(join(OUT, `${name}.webp`), out)
  const meta = await sharp(out).metadata()
  report.push([name.padEnd(16), `${meta.width}x${meta.height}`.padEnd(11), `${(out.length / 1024).toFixed(0)} KB`])
}

console.log(report.map((r) => r.join('  ')).join('\n'))
const total = report.reduce((a, r) => a + (parseInt(r[2]) || 0), 0)
console.log(`\nTOTAL ${total} KB across ${report.length} files`)
