<script setup lang="ts">
// The Sipquel Brewing screen (ESP-05), rebuilt for the web from the design's
// own demo shot: Guji Hambela, 18.2 g in, 36.4 g out, the "Turbo bloom"
// profile (3 bar soak to 7 s, ramp to 9 bar by 10 s, gentle decline), first
// drip at 6.8 s, stopped at 29.6 s. Same models, phases and instrument
// colours as the panel. Played at 2x speed, labelled as a demo.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const DOSE = 18.2, YIELD = 36.4, STOP_AT = 36.0, AIM = 28, TOL = 2
const END = 29.6, FIRST_DRIP = 6.8
const SPEED = 2, HOLD = 4200 // ms the finished shot stays on screen

const ease = (x: number) => x * x * (3 - 2 * x)
const wob = (t: number, a: number, f: number) => a * Math.sin(t * f)
// Turbo bloom target, bar over s
const target = (t: number) => t < 1 ? 3 * t : t < 7 ? 3 : t < 10 ? 3 + (t - 7) * 2 : 9 - (t - 10) * 0.15
// The measured shot (design data, shotModel(0))
const pressure = (t: number) => Math.max(0,
  t < 0.9 ? 3.1 * (t / 0.9) * (1.6 - 0.6 * t / 0.9)
  : t < 7 ? 2.9 + 0.12 * Math.sin(t * 1.3) + (t < 1.6 ? (1.6 - t) * 0.3 : 0)
  : t < 10.4 ? 3 + 6.2 * ease((t - 7) / 3.4)
  : 9.2 - (t - 10.4) * 0.135 + wob(t, 0.08, 1.9))
const flow = (t: number) =>
  t < 0.4 ? 11 * t
  : t < 7 ? 0.95 + 3.4 * Math.exp(-(t - 0.4) * 0.85) + wob(t, 0.04, 2.1)
  : t < 10 ? 0.95 + (t - 7) * 0.4 + wob(t, 0.05, 2.3)
  : 2.1 + (t - 10) * 0.012 + wob(t, 0.06, 1.7)
const weight = (t: number) => {
  if (t <= FIRST_DRIP) return 0
  const x = Math.min(1, (t - FIRST_DRIP) / (END - FIRST_DRIP))
  return YIELD * (0.55 * x + 0.45 * x * x)
}
// The yield plan: where the cup should be at t, from first drip to the aim.
const plan = (t: number) => t <= FIRST_DRIP ? 0 : Math.min(YIELD, YIELD * (t - FIRST_DRIP) / (AIM - FIRST_DRIP))
const PHASES = [{ name: 'Soak', at: 0 }, { name: 'Ramp', at: 7 }, { name: 'Decline', at: 10 }]

// ---- chart geometry: 0-12 bar and ml/s on one axis over 0-40 s, as on the panel.
// A narrower drawing on phones keeps the axis text readable.
const narrow = ref(false)
const W = computed(() => narrow.value ? 360 : 600), H = computed(() => narrow.value ? 230 : 250)
const L = 30, R = 10, T = 26, B = 24, TMAX = 40
const X = (s: number) => L + s / TMAX * (W.value - L - R)
const Y = (v: number) => T + (12 - v) / 12 * (H.value - T - B)
const line = (fn: (s: number) => number, to: number, step = 0.1) => {
  let d = ''
  for (let s = 0; s < to; s += step) d += (d ? 'L' : 'M') + X(s).toFixed(1) + ' ' + Y(fn(s)).toFixed(1)
  return d + (d ? 'L' : 'M') + X(to).toFixed(1) + ' ' + Y(fn(to)).toFixed(1)
}
const targetPath = computed(() => line(target, 30, 0.25))

// ---- yield dial: a 270 degree ring
const CX = 110, CY = 110, RAD = 92
const polar = (p: number) => { const a = (135 + 270 * p) * Math.PI / 180; return { x: CX + RAD * Math.cos(a), y: CY + RAD * Math.sin(a) } }

// ---- time
const t = ref(END)            // smooth shot time, drives the lines and the ring
const s = ref(END)            // the 4 Hz sample time, drives the numbers
const done = computed(() => t.value >= END)
let raf = 0, start = 0, io: IntersectionObserver | null = null, running = false

const pPath = computed(() => line(pressure, t.value))
const fPath = computed(() => line(flow, t.value))
const head = computed(() => ({ x: X(t.value), y: Y(pressure(t.value)) }))
const fmt = (v: number, d = 1) => v.toFixed(d)
const phase = computed(() => done.value ? 'Done' : [...PHASES].reverse().find(p => s.value >= p.at)!.name)

const y = computed(() => weight(s.value))
const ring = computed(() => Math.min(1, weight(t.value) / YIELD))
const pacer = computed(() => polar(plan(t.value) / YIELD))
const comet = computed(() => polar(ring.value))
const ratio = computed(() => y.value > 0 ? '1:' + fmt(y.value / DOSE, 2) : '––')

// Where the shot will finish, from the cup weight's own pace (speed and
// acceleration over the last two seconds), against the stop at 36.0 g.
const pace = computed(() => {
  const now = s.value
  if (done.value) return { word: `Stopped at ${fmt(END)} s`, detail: `1:${fmt(YIELD / DOSE, 2)}, inside ${AIM} ± ${TOL} s` }
  if (now < 10) return { word: now < 7 ? 'Pre-infusion' : 'Ramping up', detail: `aim ${AIM} ± ${TOL} s` }
  const w0 = weight(now), w1 = weight(now - 1), w2 = weight(now - 2)
  const v = w0 - w1, a = w0 - 2 * w1 + w2
  const left = STOP_AT - w0
  const d = a > 1e-6 ? (-v + Math.sqrt(v * v + 2 * a * left)) / a : left / Math.max(v, 0.01)
  return { word: `On pace for ${fmt(now + d)} s`, detail: `aim ${AIM} ± ${TOL} s` }
})

function frame(ts: number) {
  if (!start) start = ts
  const ms = ts - start
  const shot = ms * SPEED / 1000
  if (shot >= END) {
    t.value = END; s.value = END
    if (ms > END * 1000 / SPEED + HOLD) start = ts
  } else {
    t.value = shot
    s.value = Math.floor(shot * 4) / 4
  }
  raf = requestAnimationFrame(frame)
}
function play() { if (running) return; running = true; start = 0; t.value = 0; s.value = 0; raf = requestAnimationFrame(frame) }
function pause() { running = false; cancelAnimationFrame(raf) }

const root = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null
onMounted(() => {
  const chart = root.value?.querySelector('.sq-live-main')
  if (chart && 'ResizeObserver' in window) {
    ro = new ResizeObserver(([e]) => { narrow.value = e.contentRect.width < 480 })
    ro.observe(chart)
  }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!('IntersectionObserver' in window) || !root.value) return play()
  // Start from the first second when it comes into view; rest when it leaves.
  io = new IntersectionObserver(([e]) => e.isIntersecting ? play() : pause(), { threshold: 0.35 })
  io.observe(root.value)
})
onBeforeUnmount(() => { pause(); io?.disconnect(); ro?.disconnect() })
</script>

<template>
  <figure ref="root" class="sq-live" :class="{ 'is-done': done }"
          aria-label="A demo espresso shot on the Sipquel Brewing screen: 18.2 g in, 36.4 g out in 29.6 seconds on the Turbo bloom profile.">
    <header class="sq-live-head">
      <span class="sq-live-title"><b>Guji Hambela</b> · Turbo bloom · 93 °C</span>
      <span class="sq-live-phase"><i :class="{ on: !done }" />{{ phase }}</span>
    </header>

    <div class="sq-live-body">
      <!-- Yield dial: the ring is the cup weight, the hollow pacer is where the plan says it should be -->
      <div class="sq-live-dial">
        <svg viewBox="0 0 220 220" aria-hidden="true">
          <defs>
            <linearGradient id="sqArc" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stop-color="#b8944f" /><stop offset=".6" stop-color="#e0c088" /><stop offset="1" stop-color="#f6e2b6" />
            </linearGradient>
          </defs>
          <circle :cx="CX" :cy="CY" :r="RAD" pathLength="100" class="trk" :transform="`rotate(135 ${CX} ${CY})`" />
          <circle v-if="ring > 0" :cx="CX" :cy="CY" :r="RAD" pathLength="100" class="arc" :transform="`rotate(135 ${CX} ${CY})`"
                  :style="{ strokeDasharray: `${(ring * 75).toFixed(2)} 100` }" />
          <circle v-if="!done && t > FIRST_DRIP" :cx="pacer.x" :cy="pacer.y" r="7" class="pacer" />
          <circle v-if="ring > 0" :cx="comet.x" :cy="comet.y" r="6.5" class="comet" />
        </svg>
        <div class="sq-live-dial-c">
          <span class="k">Yield</span>
          <b>{{ fmt(y) }}<small>g</small></b>
          <span class="of">of {{ fmt(YIELD) }} g</span>
          <span class="ratio">ratio now {{ ratio }}</span>
        </div>
      </div>

      <div class="sq-live-main">
        <dl class="sq-live-read">
          <div class="time"><dt>Time</dt><dd>{{ fmt(s) }}<small>s</small></dd></div>
          <div><dt><i class="sw p" />Pressure</dt><dd>{{ fmt(pressure(s)) }}<small>bar</small></dd></div>
          <div><dt><i class="sw f" />Flow</dt><dd>{{ fmt(flow(s)) }}<small>ml/s</small></dd></div>
          <div><dt>First drip</dt><dd>{{ s >= FIRST_DRIP ? fmt(FIRST_DRIP) : '––' }}<small v-if="s >= FIRST_DRIP">s</small></dd></div>
        </dl>

        <svg class="sq-live-chart" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
          <g class="grid">
            <line v-for="v in [0, 3, 6, 9, 12]" :key="v" :x1="L" :x2="W - R" :y1="Y(v)" :y2="Y(v)" />
            <text v-for="v in [0, 3, 6, 9, 12]" :key="'l' + v" :x="L - 8" :y="Y(v) + 4" text-anchor="end">{{ v }}</text>
            <text v-for="x in [0, 10, 20, 30, 40]" :key="'x' + x" :x="X(x)" :y="H - 5" text-anchor="middle">{{ x }}</text>
          </g>
          <g class="phases">
            <line v-for="p in PHASES.slice(1)" :key="p.name" :x1="X(p.at)" :x2="X(p.at)" :y1="T - 4" :y2="H - B" />
            <text v-for="p in PHASES.filter(q => !narrow || q.name === 'Soak' || (phase === 'Ramp') === (q.name === 'Ramp'))" :key="'n' + p.name" :x="X(p.at) + 5" :y="T - 10" :class="{ now: phase === p.name }">{{ p.name }}</text>
          </g>
          <path :d="targetPath" class="target" />
          <path :d="fPath" class="flow" />
          <path :d="pPath" class="press" />
          <g v-if="!done" :transform="`translate(${head.x} ${head.y})`">
            <circle r="7" class="halo" />
            <circle r="5" class="head" />
          </g>
          <circle v-else :cx="head.x" :cy="head.y" r="4.5" class="end" />
        </svg>

        <div class="sq-live-foot">
          <span class="legend"><span><i class="p" />Pressure</span><span><i class="f" />Flow</span><span><i class="tg" />Target</span></span>
          <span class="pace"><b>{{ pace.word }}</b> · {{ pace.detail }}</span>
        </div>
      </div>
    </div>
    <figcaption>Demo shot from Sipquel's design data, played at 2× speed. On your bench, every number comes from your own machine and scale.</figcaption>
  </figure>
</template>
