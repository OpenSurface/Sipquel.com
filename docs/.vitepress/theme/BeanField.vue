<script setup lang="ts">
// Coffee beans drifting down behind the hero. They scatter and spin when the
// pointer passes through them. Not drawn at all with reduced motion.
import { ref, onMounted, onBeforeUnmount } from 'vue'

const cv = ref<HTMLCanvasElement | null>(null)
let stop = () => {}

type Bean = { x: number; y: number; z: number; r: number; a: number; va: number; vx: number; vy: number; fall: number; sway: number; ph: number }

function sprite(size: number, dpr: number) {
  const c = document.createElement('canvas')
  const pad = 4, w = (size * 2 + pad * 2) * dpr
  c.width = c.height = w
  const g = c.getContext('2d')!
  g.scale(dpr, dpr)
  g.translate(size + pad, size + pad)
  const rx = size, ry = size * .66
  const fill = g.createRadialGradient(-rx * .35, -ry * .45, ry * .1, 0, 0, rx * 1.1)
  fill.addColorStop(0, '#a47a4e'); fill.addColorStop(.45, '#6a4628'); fill.addColorStop(1, '#2c1b0f')
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill()
  // The crease down the middle of the bean.
  g.beginPath(); g.moveTo(-rx * .82, ry * .06)
  g.bezierCurveTo(-rx * .3, -ry * .5, rx * .3, ry * .5, rx * .82, -ry * .06)
  g.strokeStyle = 'rgba(20, 11, 5, .9)'; g.lineWidth = Math.max(1, size * .16); g.lineCap = 'round'; g.stroke()
  g.beginPath(); g.ellipse(-rx * .25, -ry * .42, rx * .42, ry * .16, -.25, 0, Math.PI * 2)
  g.fillStyle = 'rgba(255, 226, 180, .13)'; g.fill()
  return c
}

onMounted(() => {
  const el = cv.value
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const SIZES = [6, 9, 13, 18]
  const sprites = SIZES.map((s) => sprite(s, dpr))
  let W = 0, H = 0, beans: Bean[] = [], raf = 0, last = 0, visible = true
  const mouse = { x: -9999, y: -9999, on: false }
  const rnd = (a: number, b: number) => a + Math.random() * (b - a)

  const make = (top: boolean): Bean => {
    const z = Math.random()
    return { x: rnd(0, W), y: top ? rnd(-80, -20) : rnd(0, H), z, r: 0, a: rnd(0, 6.28), va: rnd(-.6, .6), vx: 0, vy: 0,
      fall: 16 + z * 42, sway: rnd(6, 20), ph: rnd(0, 6.28) }
  }
  const resize = () => {
    const r = el.getBoundingClientRect()
    W = r.width; H = r.height
    el.width = W * dpr; el.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const n = Math.round(Math.min(64, Math.max(16, W / 24)))
    beans = Array.from({ length: n }, () => make(false))
  }
  const frame = (t: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(.05, (t - last) / 1000 || 0); last = t
    ctx.clearRect(0, 0, W, H)
    for (const b of beans) {
      if (mouse.on) {
        const dx = b.x - mouse.x, dy = b.y - mouse.y, d2 = dx * dx + dy * dy, R = 150
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 900 * (.4 + b.z * .6)
          b.vx += (dx / d) * f * dt; b.vy += (dy / d) * f * dt
          b.va += (dx > 0 ? 1 : -1) * f * .012 * dt
        }
      }
      b.vx *= 1 - 2.2 * dt; b.vy *= 1 - 2.2 * dt
      b.va += (Math.sign(b.va || 1) * .4 - b.va) * .6 * dt
      b.ph += dt
      b.x += (b.vx + Math.sin(b.ph * .8) * b.sway) * dt
      b.y += (b.vy + b.fall) * dt
      b.a += b.va * dt
      if (b.y > H + 30) Object.assign(b, make(true))
      if (b.x < -30) b.x = W + 30; else if (b.x > W + 30) b.x = -30
      const i = Math.min(SIZES.length - 1, Math.floor(b.z * SIZES.length)), s = sprites[i], half = s.width / dpr / 2
      ctx.globalAlpha = .28 + b.z * .6
      ctx.setTransform(dpr, 0, 0, dpr, b.x * dpr, b.y * dpr)
      ctx.rotate(b.a)
      ctx.drawImage(s, -half, -half, half * 2, half * 2)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top
    mouse.on = e.pointerType !== 'touch' && mouse.y > -50 && mouse.y < H + 50
  }
  const io = new IntersectionObserver((l) => { visible = l[0].isIntersecting; run() })
  const ro = new ResizeObserver(resize)
  io.observe(el); ro.observe(el)
  window.addEventListener('pointermove', move, { passive: true })
  document.addEventListener('visibilitychange', run)
  resize(); run()
  stop = () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); window.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', run) }
})
onBeforeUnmount(() => stop())
</script>

<template>
  <canvas ref="cv" class="sq-beans" aria-hidden="true" />
</template>
