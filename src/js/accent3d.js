/**
 * The one small 3D accent on the page: a wireframe of an enclosure frame,
 * rotating slowly. Sits in the corner of the RECORD section — never at the
 * hero, never full-bleed.
 *
 * The render loop is gated on visibility: when the canvas is offscreen the
 * rAF is cancelled outright, so it costs nothing for the rest of the page.
 */

import {
  Scene, PerspectiveCamera, WebGLRenderer, Group,
  BoxGeometry, EdgesGeometry, LineSegments, LineBasicMaterial,
} from 'three'

export function initAccent3d(canvas, { reduced }) {
  if (!canvas) return () => {}

  let renderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  } catch {
    // No WebGL: drop the whole block, caption included, so nothing labels an
    // empty box. The page loses one decorative corner and nothing else.
    ;(canvas.closest('.record__accent') ?? canvas).remove()
    return () => {}
  }

  renderer.setClearAlpha(0)

  const scene = new Scene()
  const camera = new PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(2.6, 1.9, 3.4)
  camera.lookAt(0, 0, 0)

  const rig = new Group()
  scene.add(rig)

  const shell = new LineBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.55 })
  const inner = new LineBasicMaterial({ color: 0x7b8794, transparent: true, opacity: 0.42 })

  // outer cabinet shell
  rig.add(new LineSegments(new EdgesGeometry(new BoxGeometry(1.25, 2, 0.85)), shell))

  // four stacked internal module trays
  for (let i = 0; i < 4; i++) {
    const tray = new LineSegments(
      new EdgesGeometry(new BoxGeometry(1.02, 0.34, 0.62)),
      inner
    )
    tray.position.y = 0.7 - i * 0.46
    rig.add(tray)
  }

  const resize = () => {
    const w = canvas.clientWidth || 200
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, w, false)
    camera.aspect = 1
    camera.updateProjectionMatrix()
  }
  resize()

  let raf = 0
  let last = 0
  let visible = false

  const frame = (t) => {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0
    last = t
    rig.rotation.y += dt * 0.28
    rig.rotation.x = Math.sin(t / 4200) * 0.12
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    if (raf || reduced) return
    last = 0
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    if (!raf) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  // visibility gate
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting
      if (visible && !document.hidden) start()
      else stop()
    },
    { rootMargin: '120px' }
  )
  io.observe(canvas)

  const onVis = () => {
    if (document.hidden) stop()
    else if (visible) start()
  }
  document.addEventListener('visibilitychange', onVis)

  const onResize = () => { resize(); renderer.render(scene, camera) }
  window.addEventListener('resize', onResize)

  // one frame so it is never an empty box, even under reduced motion
  renderer.render(scene, camera)

  return () => {
    stop()
    io.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
  }
}
