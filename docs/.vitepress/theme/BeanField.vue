<script setup lang="ts">
// Coffee beans falling behind a section, in three depth layers. They tumble,
// get swept along by the pointer, burst out on a click, and the sharp middle
// layer bounces and rolls off the top edge of the `collide` element.
// Nothing is drawn with reduced motion.
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{ collide?: string }>()
const cv = ref<HTMLCanvasElement | null>(null)
let stop = () => {}

type Bean = {
  x: number; y: number; z: number; r: number; a: number; va: number; vx: number; vy: number
  fall: number; sway: number; ph: number; flip: number; vflip: number; alpha: number
  blur: number; hit: boolean; roll: number; hops: number; temp: boolean
}

const cache = new Map<string, HTMLCanvasElement>()
function sprite(size: number, blur: number, back: boolean, dpr: number) {
  const key = `${size}|${blur}|${back}|${dpr}`
  const had = cache.get(key)
  if (had) return had
  const c = document.createElement('canvas')
  const pad = 4 + blur * 3, w = Math.ceil((size * 2 + pad * 2) * dpr)
  c.width = c.height = w
  const g = c.getContext('2d')!
  g.scale(dpr, dpr)
  g.translate(size + pad, size + pad)
  if (blur) g.filter = `blur(${blur}px)`
  const rx = size, ry = size * .66
  // Soft contact shadow, then the bean body lit from the top left.
  g.beginPath(); g.ellipse(rx * .08, ry * .16, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(0, 0, 0, .35)'; g.fill()
  const fill = g.createRadialGradient(-rx * .4, -ry * .5, ry * .05, 0, 0, rx * 1.15)
  fill.addColorStop(0, '#c08f5c'); fill.addColorStop(.3, '#845a35'); fill.addColorStop(.7, '#4f321c'); fill.addColorStop(1, '#22140a')
  g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = fill; g.fill()
  if (!back) {
    // The crease: a dark S-curve with a thin lit lip beside it.
    g.lineCap = 'round'
    g.beginPath(); g.moveTo(-rx * .84, ry * .08)
    g.bezierCurveTo(-rx * .3, -ry * .55, rx * .3, ry * .55, rx * .84, -ry * .08)
    g.strokeStyle = 'rgba(16, 8, 3, .95)'; g.lineWidth = Math.max(1, size * .17); g.stroke()
    g.beginPath(); g.moveTo(-rx * .78, -ry * .06)
    g.bezierCurveTo(-rx * .3, -ry * .66, rx * .3, ry * .42, rx * .8, -ry * .2)
    g.strokeStyle = 'rgba(255, 220, 170, .16)'; g.lineWidth = Math.max(.6, size * .05); g.stroke()
  }
  g.beginPath(); g.ellipse(-rx * .3, -ry * .46, rx * .4, ry * .14, -.28, 0, Math.PI * 2)
  g.fillStyle = 'rgba(255, 232, 196, .2)'; g.fill()
  cache.set(key, c)
  return c
}

onMounted(() => {
  const el = cv.value
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const target = props.collide ? document.querySelector<HTMLElement>(props.collide) : null
  let W = 0, H = 0, beans: Bean[] = [], raf = 0, last = 0, visible = true
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, on: false, t: 0 }
  const rnd = (a: number, b: number) => a + Math.random() * (b - a)

  // Three layers: far (small, soft, slow), middle (sharp, collides), near (large, very soft, fast).
  const make = (top: boolean, layer?: 0 | 1 | 2): Bean => {
    const l = layer ?? (Math.random() < .42 ? 0 : 1)
    const r = l === 0 ? rnd(4, 6.5) : l === 1 ? rnd(8, 15) : rnd(30, 44)
    const z = l === 0 ? rnd(0, .3) : l === 1 ? rnd(.4, .8) : 1
    return {
      x: rnd(0, W), y: top ? rnd(-140, -40) : rnd(-40, H), z, r: Math.round(r), a: rnd(0, 6.28), va: rnd(-1.2, 1.2), vx: 0, vy: 0,
      fall: l === 0 ? rnd(14, 26) : l === 1 ? rnd(46, 84) : rnd(110, 150), sway: rnd(4, 16), ph: rnd(0, 6.28),
      flip: rnd(0, 6.28), vflip: rnd(.5, 1.8) * (Math.random() < .5 ? -1 : 1),
      alpha: l === 0 ? rnd(.3, .5) : l === 1 ? rnd(.8, 1) : rnd(.3, .42), blur: l === 0 ? 1 : l === 2 ? 6 : 0,
      hit: l === 1, roll: 0, hops: 0, temp: false,
    }
  }
  const resize = () => {
    const r = el.getBoundingClientRect()
    W = r.width; H = r.height
    el.width = W * dpr; el.height = H * dpr
    const n = Math.round(Math.min(70, Math.max(18, W / 22)))
    beans = Array.from({ length: n }, () => make(false))
    if (W > 700) for (let i = 0; i < 5; i++) beans.push(make(false, 2))
    beans.sort((a, b) => a.z - b.z)
  }
  const frame = (t: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(.05, (t - last) / 1000 || 0); last = t
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    // Where the top edge of the panel is, in canvas coordinates.
    let top = Infinity, L = 0, R = 0
    if (target) {
      const c = el.getBoundingClientRect(), p = target.getBoundingClientRect()
      top = p.top - c.top; L = p.left - c.left + 14; R = p.right - c.left - 14
    }
    if (t - mouse.t > 120) { mouse.vx *= .8; mouse.vy *= .8 }
    for (let i = beans.length - 1; i >= 0; i--) {
      const b = beans[i]
      if (mouse.on && b.blur < 6) {
        const dx = b.x - mouse.x, dy = b.y - mouse.y, d2 = dx * dx + dy * dy, RR = 170
        if (d2 < RR * RR) {
          const d = Math.sqrt(d2) || 1, k = (1 - d / RR) * (.35 + b.z)
          // Swept along with the pointer's own motion, plus a gentle push away.
          b.vx += (mouse.vx * 5.5 + (dx / d) * 520) * k * dt
          b.vy += (mouse.vy * 5.5 + (dy / d) * 520) * k * dt
          b.va += ((mouse.vx * dy - mouse.vy * dx) / (d * 60) + (dx > 0 ? 2 : -2)) * k * dt * 4
          b.vflip += k * dt * 8 * Math.sign(b.vflip)
        }
      }
      const drag = b.temp ? .9 : 2.2
      b.vx *= 1 - drag * dt; b.vy *= 1 - drag * dt
      if (b.temp) b.vy += 620 * dt
      b.va += (Math.sign(b.va || 1) * .7 - b.va) * .5 * dt
      b.vflip += (Math.sign(b.vflip) * 1.1 - b.vflip) * .5 * dt
      b.ph += dt; b.flip += b.vflip * dt
      b.x += (b.vx + b.roll + Math.sin(b.ph * .8) * b.sway) * dt
      const vyTotal = b.vy + (b.temp ? 0 : b.fall)
      b.y += vyTotal * dt
      // Bounce on the panel's top edge, hopping lower each time, and roll off the nearer side.
      if (b.hit && vyTotal > 0 && b.x > L && b.x < R && b.y + b.r * .6 > top && b.y < top + 34) {
        b.y = top - b.r * .6
        if (!b.roll) b.roll = (b.x < (L + R) / 2 ? -1 : 1) * rnd(70, 150)
        const up = Math.max(26, 190 * Math.pow(.55, b.hops++))
        b.vy = -(up + (b.temp ? 0 : b.fall)); if (b.temp) { b.temp = false; b.vx *= .4 }
        b.va = b.roll / b.r * .9
      } else if (b.roll && (b.x <= L || b.x >= R)) { b.vx += b.roll * .6; b.roll = 0; b.hops = 0 }
      if (b.y > H + 60) { if (b.temp) { beans.splice(i, 1); continue } Object.assign(b, make(true, b.blur === 6 ? 2 : b.hit ? 1 : 0)) }
      if (b.x < -60) b.x = W + 60; else if (b.x > W + 60) b.x = -60
      // Tumbling: squash on one axis, and show the smooth back when turned over.
      const c = Math.cos(b.flip), s = sprite(b.r, b.blur, c < 0, dpr), half = s.width / dpr / 2
      ctx.globalAlpha = b.alpha
      ctx.setTransform(dpr, 0, 0, dpr, b.x * dpr, b.y * dpr)
      ctx.rotate(b.a)
      ctx.scale(1, .34 + .66 * Math.abs(c))
      ctx.drawImage(s, -half, -half, half * 2, half * 2)
    }
  }
  const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now()
    const dt = Math.max(8, now - mouse.t) / 1000
    if (mouse.on) { mouse.vx = mouse.vx * .6 + ((x - mouse.x) / dt) * .4; mouse.vy = mouse.vy * .6 + ((y - mouse.y) / dt) * .4 }
    mouse.x = x; mouse.y = y; mouse.t = now
    mouse.on = e.pointerType !== 'touch' && y > -60 && y < H + 60
  }
  // A click or tap on empty space pours a handful of beans from that point.
  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest?.('a, button, input, summary, dialog, .VPNav')) return
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top
    if (y < 0 || y > H || beans.length > 160) return
    for (let i = 0; i < 16; i++) {
      const b = make(true, 1), ang = rnd(-Math.PI, 0) + rnd(-.3, .3), sp = rnd(180, 520)
      Object.assign(b, { x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 120, temp: true, va: rnd(-9, 9), vflip: rnd(-7, 7), alpha: 1 })
      beans.push(b)
    }
  }
  const io = new IntersectionObserver((l) => { visible = l[0].isIntersecting; run() })
  const ro = new ResizeObserver(resize)
  io.observe(el); ro.observe(el)
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerdown', down, { passive: true })
  document.addEventListener('visibilitychange', run)
  resize(); run()
  stop = () => {
    cancelAnimationFrame(raf); io.disconnect(); ro.disconnect()
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', down); document.removeEventListener('visibilitychange', run)
  }
})
onBeforeUnmount(() => stop())
</script>

<template>
  <canvas ref="cv" class="sq-beans" aria-hidden="true" />
</template>
