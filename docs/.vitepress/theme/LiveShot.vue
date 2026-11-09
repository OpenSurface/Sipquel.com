<script setup lang="ts">
// A simulated espresso shot, drawn the way the panel draws it: pressure and
// pump flow over time, cup weight, a timer. It is labelled as a simulation;
// with reduced motion it shows the finished shot without animating.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const SHOT = 30          // seconds of shot
const PLAY = 9000        // ms to play it
const W = 560, H = 230, L = 34, R = 40, T = 26, B = 26

// Smooth, realistic-looking profile: pre-infusion, ramp, hold, gentle decline.
const ease = (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)
const pressure = (t: number) => 0.4 + 2.2 * ease(t / 6) + 6.4 * ease((t - 6) / 3.5) - 0.9 * ease((t - 17) / 13)
const flow = (t: number) => t < 6 ? 4.2 - 2.4 * t / 6 : t < 10 ? 1.8 + 0.2 * (t - 6) / 4 : 2 + 0.25 * Math.sin((t - 10) / 3)
const weight = (t: number) => t < 8 ? 0 : Math.min(36.4, (t - 8) * 1.3 + 0.0161 * (t - 8) ** 2)

const t = ref(SHOT)
let raf = 0, start = 0
const X = (s: number) => L + s / SHOT * (W - L - R)
const Yp = (v: number) => T + (12 - v) / 12 * (H - T - B)
const Yf = (v: number) => T + (8 - v) / 8 * (H - T - B)
const Yw = (v: number) => T + (40 - v) / 40 * (H - T - B)
const path = (fn: (s: number) => number, Y: (v: number) => number) => computed(() => {
  let d = ''
  for (let s = 0; s <= t.value + 1e-6; s += 0.25) d += (d ? 'L' : 'M') + X(s).toFixed(1) + ',' + Y(fn(s)).toFixed(1)
  return d
})
const dP = path(pressure, Yp), dF = path(flow, Yf), dW = path(weight, Yw)
const now = computed(() => ({
  time: t.value.toFixed(1), p: pressure(t.value).toFixed(1), f: flow(t.value).toFixed(1), w: weight(t.value).toFixed(1),
  ratio: weight(t.value) > 0 ? (weight(t.value) / 18.2).toFixed(2) : '–',
}))
const done = computed(() => t.value >= SHOT - 0.01)

function frame(ts: number) {
  if (!start) start = ts
  const k = ((ts - start) % (PLAY + 2600)) / PLAY
  t.value = Math.min(SHOT, k * SHOT)
  raf = requestAnimationFrame(frame)
}
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  t.value = 0; raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <figure class="sq-live" aria-label="A simulated espresso shot: pressure and pump flow over 30 seconds, ending at 36.4 g in the cup.">
    <div class="sq-live-head">
      <span class="sq-live-tag"><i :class="{ on: !done }" />{{ done ? 'Shot finished' : 'Brewing' }}</span>
      <span class="sq-live-note">Simulated shot · drawn like the panel draws it</span>
    </div>
    <div class="sq-live-body">
      <svg :viewBox="`0 0 ${W} ${H}`" role="img" aria-hidden="true">
        <g class="grid">
          <line v-for="v in [0, 3, 6, 9, 12]" :key="v" :x1="L" :x2="W - R" :y1="Yp(v)" :y2="Yp(v)" />
          <text v-for="v in [0, 3, 6, 9, 12]" :key="'l' + v" :x="L - 8" :y="Yp(v) + 4" text-anchor="end">{{ v }}</text>
          <text v-for="s in [0, 10, 20, 30]" :key="'s' + s" :x="X(s)" :y="H - 6" text-anchor="middle">{{ s }} s</text>
          <text :x="L - 8" :y="T - 14" text-anchor="end" class="u">bar</text>
          <text v-for="v in [0, 20, 40]" :key="'w' + v" :x="W - R + 8" :y="Yw(v) + 4" text-anchor="start">{{ v }}</text>
          <text :x="W - R + 8" :y="T - 14" text-anchor="start" class="u">g</text>
        </g>
        <path :d="dW" class="cup" />
        <path :d="dF" class="flow" />
        <path :d="dP" class="press" />
        <circle :cx="X(t)" :cy="Yp(pressure(t))" r="5" class="dot" />
      </svg>
      <dl class="sq-live-read">
        <div><dt>Time</dt><dd>{{ now.time }}<small>s</small></dd></div>
        <div><dt>Pressure</dt><dd class="gold">{{ now.p }}<small>bar</small></dd></div>
        <div><dt>Pump flow</dt><dd class="blue">{{ now.f }}<small>ml/s</small></dd></div>
        <div><dt>In the cup</dt><dd>{{ now.w }}<small>g</small></dd></div>
        <div><dt>Ratio</dt><dd>{{ now.ratio === '–' ? '––' : '1:' + now.ratio }}</dd></div>
      </dl>
    </div>
  </figure>
</template>
