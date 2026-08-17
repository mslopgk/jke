/**
 * Re-encodes the generated hero clip into a web-weight loop, in two codecs.
 *
 * Usage:  node tools/build-video.mjs <source.mp4>
 *
 * Output: public/assets/ai/hero-loop.webm  (VP9, offered first)
 *         public/assets/ai/hero-loop.mp4   (H.264, universal fallback)
 *
 * Both are 1600px wide with no audio track. H.264 is a licensed codec that
 * Chromium builds without proprietary codecs cannot decode, so the WebM is what
 * makes the hero reliable — and testable in headless Chromium.
 */

import { execFileSync } from 'node:child_process'
import { statSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import ffmpeg from 'ffmpeg-static'

const src = resolve(process.argv[2] ?? 'hero-src.mp4')
mkdirSync(resolve('public/assets/ai'), { recursive: true })

const COMMON = ['-y', '-i', src, '-an', '-vf', 'scale=1600:-2:flags=lanczos']

const TARGETS = [
  {
    file: 'hero-loop.mp4',
    args: [
      '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.1',
      '-preset', 'slower', '-crf', '30', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
    ],
  },
  {
    file: 'hero-loop.webm',
    args: [
      '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0',
      '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
      '-pix_fmt', 'yuv420p',
    ],
  },
]

const before = statSync(src).size
for (const t of TARGETS) {
  const out = resolve('public/assets/ai', t.file)
  execFileSync(ffmpeg, [...COMMON, ...t.args, out], { stdio: ['ignore', 'ignore', 'pipe'] })
  const after = statSync(out).size
  console.log(
    `${t.file.padEnd(16)} ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(2)} MB ` +
    `(${Math.round((1 - after / before) * 100)}% smaller)`
  )
}
