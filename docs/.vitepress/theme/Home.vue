<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DeviceArt from './DeviceArt.vue'
import BetaButton from './BetaButton.vue'
import BeanField from './BeanField.vue'
import { BETA_URL, GITHUB_URL } from './site'

// Every image on this page is a real capture of the panel's own UI.
const img = (id: string, day = false) => `/screens/${id}${day ? '-day' : ''}.webp`

const story = [
  {
    id: 'dose', n: '01', title: 'Dose', head: 'Weigh to the notch.',
    text: 'Pour beans onto your scale and watch the dial fill to the recipe\'s dose. Hold still and it locks. It also shows what is left in the bag.',
    stats: [['18.2', 'g', 'dose target'], ['142', 'g', 'left in the bag']],
    alt: 'Weighing beans: the dose dial at 14.7 g of 18.2 g with the recipe targets alongside.',
  },
  {
    id: 'grind', n: '02', title: 'Grind', head: 'Ground to the recipe.',
    text: 'Your grinder gets the recipe\'s burr speed and feeder. Sipquel times the grind and learns how long this coffee takes.',
    stats: [['465', 'µm', 'collar'], ['1000', 'rpm', 'burr speed']],
    alt: 'Grinding: a 5.1 s timer, the Motto80 collar at 465 µm, burr 1000 rpm and feeder 30 rpm.',
  },
  {
    id: 'brew', n: '03', title: 'Brew', head: 'Every second, on one chart.',
    text: 'Yield fills the dial; pressure, pump flow and boiler draw live with the targets dashed. Running slow? It says so while there is still time to act.',
    stats: [['7.5', 'bar', 'pressure'], ['2.3', 'ml/s', 'pump flow']],
    alt: 'A live shot: 22.9 g of 36.4 g, 23.2 s, 7.5 bar, 2.3 ml/s and the extraction chart.',
  },
  {
    id: 'done', n: '04', title: 'Remember', head: 'Saved before you sip.',
    text: 'Ratio, time, first drip, peak pressure and the whole curve land in your journal. Tap a star, pull it again, or keep it as a recipe.',
    stats: [['1:2.00', '', 'ratio'], ['29.6', 's', 'on time']],
    alt: 'Shot complete: ratio 1:2.00, 29.6 s, first drip 7.0 s, peak 9.2 bar and the pressure curve.',
  },
]
const cur = ref(0)

const benchSets = [
  { art: 'gaggia', name: 'Espresso machine', text: 'Gets the recipe\'s profile, brew temperature and stop weight.' },
  { art: 'motto80', name: 'Grinder', text: 'Gets the burr speed, feeder speed and preset. The burr collar is yours to turn: the target is shown and you confirm it.' },
  { art: 'themis', name: 'Scale', text: 'Checked that it is connected and reading, ready for the dose.' },
]

const manifesto = [
  ...'Weigh the beans. Set the grinder. Watch the shot.'.split(' ').map((w) => ({ w, g: false })),
  ...'Sipquel remembers the rest.'.split(' ').map((w) => ({ w, g: true })),
]
const lit = ref(manifesto.length)

const wall = [
  { id: 'recipe', title: 'Recipes that carry everything', text: 'Dose, yield, ratio, time, temperature and grind for each coffee, with the machine profile and grinder speeds that go with it.',
    alt: 'An espresso recipe for Guji Hambela: 18.2 g in, 36.4 g out, 1:2.00, 28 s, 93 °C, 465 µm, with the Turbo bloom profile.' },
  { id: 'bag', title: 'Know every bag', text: 'Roaster, origin, process, roast date and tasting notes, with the grams left counted down as you brew.',
    alt: 'Editing a coffee bag: Guji Hambela from Square Mile, washed, light roast, 142 g left of 250 g, notes of bergamot, peach and floral.' },
  { id: 'grinder', title: 'Your grinder, on screen', text: 'Grind size in microns, burr speed, feeder and presets, live from the grinder and set from the recipe.',
    alt: 'The Motto80 grinder page: grind size 110 µm, burr speed 1200 rpm, feeder 60 rpm, and 147 lifetime grinds.' },
  { id: 'steep', title: 'Immersion brews too', text: 'AeroPress and French press get their own guide: steep, swirl, settle and press, each with its time.',
    alt: 'An AeroPress steep: 0:50 left, then swirl at 2:00, with the steps Pour, Plunger in, Steep, Swirl, Settle and Press.' },
]
const zoom = ref(wall[0])
const box = ref<HTMLDialogElement | null>(null)
function openBox(w: typeof wall[number]) { zoom.value = w; box.value?.showModal() }

const compare = [
  { id: 'home', label: 'Home' },
  { id: 'brew', label: 'Brewing' },
  { id: 'done', label: 'Done' },
  { id: 'pour', label: 'Pour-over' },
]
const cmp = ref('home')
const split = ref(50)
const touched = ref(false)
const cmpEl = ref<HTMLElement | null>(null)

const svg = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
const ICON: Record<string, string> = {
  journal: svg('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>'),
  replay: svg('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/><path d="M10 9l5 3-5 3z"/>'),
  taste: svg('<path d="M12 3c3.5 4.2 6 7.4 6 10.5A6 6 0 0 1 6 13.5C6 10.4 8.5 7.2 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
  phone: svg('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>'),
  list: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
  lock: svg('<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
}

// Close-ups cut from the real screens, shown at their native size.
const tiles = [
  { img: 'c-last', w: 248, h: 144, wide: false, title: 'A journal that writes itself', text: 'Every shot and pour is saved with its ratio, time and curve the moment it ends.' },
  { img: 'c-rate', w: 584, h: 104, wide: true, title: 'Rate it with one tap', text: 'Tap a star and it is saved. Add taste notes if you want: sour to bitter, acidity, sweetness, body.' },
  { img: 'c-slow', w: 600, h: 64, wide: true, title: 'It speaks up while there is still time', text: 'If a shot is running past the recipe\'s time, the screen says so during the shot, not after.' },
  { img: 'c-fresh', w: 248, h: 144, wide: false, title: 'Knows how fresh your coffee is', text: 'Days since roast against the rest, best and past windows, and the grams left in the bag.' },
  { img: 'c-grind', w: 248, h: 144, wide: false, title: 'The grinder, against the recipe', text: 'The current grind size sits on Home, with how far it is from the recipe.' },
  { img: 'c-week', w: 248, h: 144, wide: false, title: 'Your week at a glance', text: 'Brews, grams of coffee and your average rating for the week.' },
  { img: 'c-again', w: 360, h: 56, wide: false, title: 'Pull it again', text: 'Repeat a brew you loved, or keep it as a recipe. The grinder and machine are set the same way.' },
]
const extras = [
  { icon: 'list', title: 'Prep, step by step', text: 'A short checklist before each brew: heat the kettle, weigh, grind, rinse, tare.' },
  { icon: 'phone', title: 'On your phone too', text: 'Open sipquel.local on the same Wi-Fi for the same bench and journal from the sofa.' },
  { icon: 'lock', title: 'Yours, on your counter', text: 'No account, no cloud, no subscription. Your coffees and journal stay on the panel.' },
]

const devices = [
  { art: 'themis', name: 'BOOKOO Themis', kind: 'Scale', status: 'Supported' },
  { art: 'motto80', name: 'BOOKOO Motto80', kind: 'Grinder', status: 'Supported' },
  { art: 'gaggia', name: 'Gaggiuino', kind: 'Espresso machine', status: 'Supported' },
  { art: 'kettle', name: 'Fellow Stagg EKG', kind: 'Kettle', status: 'Experimental' },
  { art: 'gaggia', name: 'GaggiMate', kind: 'Espresso machine', status: 'Coming' },
  { art: 'decent', name: 'Decent Espresso', kind: 'Espresso machine', status: 'Coming' },
]

const faq = [
  { q: 'When can I get it?', a: 'The beta opens soon. Join the Sipquel Discord to be among the first: builds, release notes and help all live there.' },
  { q: 'What hardware do I need?', a: 'A 7-inch ESP32-P4 touchscreen panel (1024 × 600) and at least one supported scale, grinder or machine. The exact panel and where to buy it will be posted in the beta.' },
  { q: 'Do I need a phone or an account?', a: 'No. Sipquel works on its own screen. Your phone is optional: open sipquel.local on the same Wi-Fi to use it as a second screen. There is no account and no subscription.' },
  { q: 'Does it control my machine?', a: 'Sipquel reads your machine live and prepares it from a recipe or a past brew. Brewing itself stays in your hands: it never pulls a shot or heats water on its own.' },
  { q: 'Where is my data kept?', a: 'On the panel, optionally on its SD card. Nothing is sent to a cloud.' },
]

const root = ref<HTMLElement | null>(null)

function goStep(i: number) {
  root.value?.querySelector(`.sq-story-step[data-i="${i}"]`)?.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'center' })
}

// The first time the comparison comes into view, the handle sweeps once so it reads as draggable.
let hint: IntersectionObserver | null = null
let raf = 0
function sweep() {
  const t0 = performance.now(), dur = 2200
  const ease = (x: number) => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2
  const tick = (now: number) => {
    if (touched.value) return
    const p = Math.min(1, (now - t0) / dur)
    // 50 -> 28 -> 72 -> 50
    const k = p < 1 / 3 ? 50 - 22 * ease(p * 3) : p < 2 / 3 ? 28 + 44 * ease((p - 1 / 3) * 3) : 72 - 22 * ease((p - 2 / 3) * 3)
    split.value = Math.round(k * 10) / 10
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}
let reveal: IntersectionObserver | null = null
let steps: IntersectionObserver | null = null
const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// Scroll-linked: the hero panel tilts up to face you, and the manifesto lights word by word.
const stage = ref<HTMLElement | null>(null)
const words = ref<HTMLElement | null>(null)
let ticking = false
const clamp = (x: number) => Math.max(0, Math.min(1, x))
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    const vh = window.innerHeight
    if (stage.value) stage.value.style.setProperty('--t', clamp((vh - stage.value.getBoundingClientRect().top) / (vh * .72)).toFixed(3))
    if (words.value) {
      const r = words.value.getBoundingClientRect()
      lit.value = Math.round(clamp((vh * .82 - r.top) / (vh * .42 + r.height)) * manifesto.length)
    }
  })
}

onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) return
  // The pinned screen follows whichever story step crosses the middle of the viewport.
  steps = new IntersectionObserver((list) => {
    for (const en of list) if (en.isIntersecting) cur.value = Number((en.target as HTMLElement).dataset.i)
  }, { rootMargin: '-45% 0px -45% 0px' })
  root.value.querySelectorAll('.sq-story-step').forEach((el) => steps!.observe(el))

  if (still()) return
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  onScroll()
  if (cmpEl.value) {
    hint = new IntersectionObserver((list) => {
      if (list.some((en) => en.isIntersecting)) { hint?.disconnect(); setTimeout(() => { if (!touched.value) sweep() }, 500) }
    }, { threshold: .6 })
    hint.observe(cmpEl.value)
  }
  reveal = new IntersectionObserver((list) => {
    for (const en of list) if (en.isIntersecting) { en.target.classList.add('in'); reveal?.unobserve(en.target) }
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 })
  root.value.querySelectorAll('.sq-rv').forEach((el) => reveal!.observe(el))
  root.value.classList.add('sq-reveal')
})
onBeforeUnmount(() => { reveal?.disconnect(); steps?.disconnect(); hint?.disconnect(); cancelAnimationFrame(raf)
  window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <div ref="root" class="sq">
    <!-- Hero -->
    <section class="sq-hero">
      <div class="sq-lamp" aria-hidden="true" />
      <ClientOnly><BeanField collide=".sq-tilt" /></ClientOnly>
      <a class="sq-pill" :href="BETA_URL" target="_blank" rel="noopener">
        <span class="sq-dot" />Beta opening soon<span class="sq-pill-sep" />Join us on Discord<span class="sq-pill-arrow" aria-hidden="true">→</span>
      </a>
      <h1><span class="ln">Your coffee bar,</span><em class="ln">orchestrated.</em></h1>
      <p class="sq-lead">
        A 7-inch touchscreen for your counter. It runs your scale, grinder and espresso machine,
        follows every brew live, and keeps a journal you never have to write.
      </p>
      <div class="sq-cta">
        <BetaButton />
        <a class="sq-btn sq-btn-ghost" href="#bench">See how it works</a>
      </div>

      <div ref="stage" class="sq-hero-stage">
        <div class="sq-frame sq-frame-xl sq-tilt">
          <img class="sq-ambient" src="/screens/bench.webp" alt="" aria-hidden="true">
          <img src="/screens/bench.webp" width="1024" height="600" alt="The Sipquel Home screen: the boiler at 88.5 °C heading for 93, the next shot at 18.2 g in and 36 g out, the grinder at 472 µm, the coffee on day 12 with 142 g left, and the last brew rated four stars." fetchpriority="high">
        </div>
        <div class="sq-counter" aria-hidden="true" />
      </div>
      <p class="sq-trust">Works with <b>BOOKOO</b><i /><b>Gaggiuino</b><i /><b>Fellow</b> <span>experimental</span></p>
    </section>

    <!-- Manifesto -->
    <section class="sq-manifesto">
      <p ref="words"><template v-for="(m, i) in manifesto" :key="i"><span :class="{ lit: i < lit, g: m.g }">{{ m.w }}</span>{{ ' ' }}</template></p>
    </section>

    <!-- Set the bench -->
    <section id="bench" class="sq-section">
      <header class="sq-head sq-head-c sq-rv">
        <p class="sq-kicker">Set the bench</p>
        <h2>One tap. <em>Every device ready.</em></h2>
        <p class="sq-sub">Choose a coffee and tap Set the bench. Sipquel sends the recipe to your machine and grinder, then checks that each one really took it.</p>
      </header>
      <div class="sq-bench">
        <figure class="sq-rv">
          <div class="sq-frame"><img src="/screens/setbench.webp" width="880" height="528" loading="lazy" alt="The Set the bench sheet: machine profile Turbo bloom, brew temperature 93.0 °C, stop weight 36.0 g, grinder targets 465 µm at 1000 / 30 rpm, and the Set it up button."></div>
          <figcaption><span>1</span><div><b>Review the targets</b>Profile, temperature, stop weight and grinder settings come from the recipe. Adjust them here, then tap Set it up.</div></figcaption>
        </figure>
        <figure class="sq-rv" style="--d: 120ms">
          <div class="sq-frame"><img src="/screens/benchcheck.webp" width="584" height="444" loading="lazy" alt="The bench checklist: machine profile Match, brew temperature and stop weight Confirmed, Motto80 speeds Match, collar Checked, boiler still heating, scale Match."></div>
          <figcaption><span>2</span><div><b>See it confirmed</b>Each device reports back, line by line: match, confirmed, or still different. No guessing whether it took.</div></figcaption>
        </figure>
      </div>
      <div class="sq-bench-sets">
        <article v-for="(b, i) in benchSets" :key="b.name" class="sq-rv" :style="{ '--d': i * 70 + 'ms' }">
          <DeviceArt :name="b.art" />
          <div><h3>{{ b.name }}</h3><p>{{ b.text }}</p></div>
        </article>
      </div>
      <p class="sq-bench-note sq-rv">Nothing is sent until you tap Set it up, and Sipquel never starts a shot or heats water on its own.</p>
    </section>

    <!-- Story: one espresso, start to finish -->
    <section id="story" class="sq-section sq-story">
      <header class="sq-head sq-head-c sq-rv">
        <p class="sq-kicker">Espresso, start to finish</p>
        <h2>One shot. Four steps.<br><em>Nothing to write down.</em></h2>
      </header>

      <div class="sq-story-grid">
        <div class="sq-story-steps">
          <article v-for="(s, i) in story" :key="s.id" class="sq-story-step" :class="{ on: cur === i }" :data-i="i">
            <div class="sq-frame sq-story-inline"><img :src="img(s.id)" width="1024" height="600" loading="lazy" :alt="s.alt"></div>
            <p class="sq-story-n"><span>{{ s.n }}</span>{{ s.title }}</p>
            <h3>{{ s.head }}</h3>
            <p class="sq-story-text">{{ s.text }}</p>
            <dl class="sq-stats">
              <div v-for="st in s.stats" :key="st[2]"><dt>{{ st[2] }}</dt><dd>{{ st[0] }}<small v-if="st[1]">{{ st[1] }}</small></dd></div>
            </dl>
          </article>
        </div>

        <div class="sq-story-pin">
          <div class="sq-story-sticky">
            <div class="sq-frame sq-frame-lg">
              <img v-for="(s, i) in story" :key="'a' + s.id" class="sq-ambient" :class="{ show: cur === i }" :src="img(s.id)" alt="" aria-hidden="true" loading="lazy">
              <div class="sq-stage">
                <img v-for="(s, i) in story" :key="s.id" :src="img(s.id)" width="1024" height="600" loading="lazy" :alt="s.alt" :aria-hidden="cur !== i" :class="{ show: cur === i }">
              </div>
            </div>
            <ol class="sq-story-rail" aria-label="Steps">
              <li v-for="(s, i) in story" :key="s.id" :class="{ on: cur === i, past: i < cur }">
                <button type="button" :aria-current="cur === i ? 'step' : undefined" @click="goStep(i)"><i />{{ s.title }}</button>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- Pour-over -->
    <section class="sq-section sq-pour">
      <div class="sq-pour-copy sq-rv">
        <p class="sq-kicker">Pour-over</p>
        <h2>Every pour,<br><em>against the plan.</em></h2>
        <p class="sq-sub">
          Bloom, pour, swirl, drawdown. Each step shows its target water and time while your scale
          fills the dial. When it is done, the brew is laid over the plan so you can see where it drifted.
        </p>
        <ul class="sq-checks">
          <li><span v-html="ICON.check" />Guided steps with target water and time</li>
          <li><span v-html="ICON.check" />Live weight and pace from your scale</li>
          <li><span v-html="ICON.check" />This brew against the plan, pour by pour</li>
          <li><span v-html="ICON.check" />A grind hint for next time</li>
        </ul>
      </div>
      <div class="sq-duo sq-rv" style="--d: 120ms">
        <div class="sq-frame sq-duo-a"><img class="sq-ambient" src="/screens/pour.webp" alt="" aria-hidden="true" loading="lazy"><img src="/screens/pour.webp" width="1024" height="600" loading="lazy" alt="A guided V60 pour: the bloom dial at 50 g, the brew time and the planned and measured water."></div>
        <div class="sq-frame sq-duo-b"><img src="/screens/pourdone.webp" width="1024" height="600" loading="lazy" alt="Brew complete: 3:04 total, 251 g of water at 1:16.7, plotted against the plan, with a star rating."></div>
      </div>
    </section>

    <!-- Read any shot back -->
    <section class="sq-section sq-traces">
      <header class="sq-head sq-head-c sq-rv">
        <p class="sq-kicker">The journal</p>
        <h2>Read any shot <em>back.</em></h2>
        <p class="sq-sub">Open a brew and its whole extraction is there: pressure, pump flow, yield, boiler and weight flow on one chart, the targets dashed, every reading alongside.</p>
      </header>
      <div class="sq-rv"><div class="sq-frame sq-frame-xl">
        <img class="sq-ambient" src="/screens/traces.webp" alt="" aria-hidden="true" loading="lazy">
        <img src="/screens/traces.webp" width="1024" height="600" loading="lazy" alt="The extraction detail: pressure, pump flow, yield, boiler and weight-flow traces with dashed targets and the readings at 23.2 s.">
      </div></div>
    </section>

    <!-- The rest of the bench -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">The whole bench</p>
        <h2>Coffee, recipe, grinder. <em>Each has its screen.</em></h2>
        <p class="sq-sub">Tap a screen to see it full size.</p>
      </header>
      <div class="sq-wall">
        <article v-for="(w, i) in wall" :key="w.id" class="sq-wall-card sq-rv" :style="{ '--d': (i % 2) * 90 + 'ms' }">
          <button type="button" class="sq-frame sq-wall-shot" :aria-label="'Enlarge: ' + w.title" @click="openBox(w)">
            <img :src="img(w.id)" width="1024" height="600" loading="lazy" :alt="w.alt">
          </button>
          <h3>{{ w.title }}</h3>
          <p>{{ w.text }}</p>
        </article>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Up close</p>
        <h2>Small things that add up to <em>a better cup.</em></h2>
      </header>
      <div class="sq-tiles">
        <article v-for="(t, i) in tiles" :key="t.img" class="sq-tile sq-rv" :class="{ wide: t.wide }" :style="{ '--d': (i % 3) * 70 + 'ms' }">
          <div class="sq-tile-art"><img :src="'/screens/' + t.img + '.webp'" :width="t.w" :height="t.h" loading="lazy" alt=""></div>
          <h3>{{ t.title }}</h3>
          <p>{{ t.text }}</p>
        </article>
      </div>
      <div class="sq-extras">
        <article v-for="(f, i) in extras" :key="f.title" class="sq-rv" :style="{ '--d': i * 70 + 'ms' }">
          <span class="sq-ico" v-html="ICON[f.icon]" />
          <h3>{{ f.title }}</h3>
          <p>{{ f.text }}</p>
        </article>
      </div>
    </section>

    <!-- Night / Day -->
    <section class="sq-section">
      <header class="sq-head sq-head-c sq-rv">
        <p class="sq-kicker">Night &amp; Day</p>
        <h2>Dark at dawn. <em>Bright by noon.</em></h2>
        <p class="sq-sub">Two themes, the same layout. Drag across the screen to compare.</p>
      </header>
      <div class="sq-tabs sq-rv" role="tablist" aria-label="Screen to compare">
        <button v-for="c in compare" :key="c.id" role="tab" :aria-selected="cmp === c.id" :class="{ on: cmp === c.id }" @click="cmp = c.id">{{ c.label }}</button>
      </div>
      <div class="sq-frame sq-frame-xl sq-rv">
        <div ref="cmpEl" class="sq-compare" :style="{ '--x': split + '%' }">
          <img :src="img(cmp)" width="1024" height="600" loading="lazy" :alt="'Night theme: ' + compare.find(c => c.id === cmp)!.label">
          <img class="sq-compare-day" :src="img(cmp, true)" width="1024" height="600" loading="lazy" :alt="'Day theme: ' + compare.find(c => c.id === cmp)!.label">
          <div class="sq-compare-line" aria-hidden="true"><span>‹ ›</span></div>
          <span class="sq-compare-tag l" aria-hidden="true">Night</span>
          <span class="sq-compare-tag r" aria-hidden="true">Day</span>
          <input v-model.number="split" type="range" @pointerdown="touched = true" @keydown="touched = true" min="0" max="100" step="1" aria-label="Compare the Night and Day themes">
        </div>
      </div>
    </section>

    <!-- Devices -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Devices</p>
        <h2>Brings your gear <em>together.</em></h2>
        <p class="sq-sub">Over Bluetooth and Wi-Fi, with the coffee gear you already own.</p>
      </header>
      <div class="sq-devices">
        <article v-for="(d, i) in devices" :key="d.name" class="sq-device-card sq-rv" :style="{ '--d': (i % 3) * 70 + 'ms' }">
          <DeviceArt :name="d.art" />
          <div>
            <span class="sq-badge" :class="'is-' + d.status.toLowerCase()">{{ d.status }}</span>
            <h3>{{ d.name }}</h3>
            <p>{{ d.kind }}</p>
          </div>
        </article>
      </div>
      <p class="sq-note"><a href="/guide/devices">What each device does with Sipquel →</a></p>
    </section>

    <!-- Specs -->
    <section class="sq-section">
      <div class="sq-band sq-rv">
        <div><b>7″</b><span>1024 × 600 touchscreen</span></div>
        <div><b>ESP32-P4</b><span>everything runs on the panel</span></div>
        <div><b>BLE + Wi-Fi</b><span>scale, grinder, kettle, machine</span></div>
        <div><b>0</b><span>accounts, clouds or subscriptions</span></div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="sq-section sq-faq-wrap">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Questions</p>
        <h2>Good to <em>know.</em></h2>
        <p class="sq-sub">More in the <a href="/guide/faq">full FAQ</a>, or ask on Discord.</p>
      </header>
      <div class="sq-faq">
        <details v-for="(f, i) in faq" :key="f.q" class="sq-rv" :open="i === 0" :style="{ '--d': i * 50 + 'ms' }">
          <summary>{{ f.q }}<span class="sq-faq-x" aria-hidden="true" /></summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </section>

    <!-- CTA -->
    <section class="sq-final sq-rv">
      <div class="sq-lamp sq-lamp-2" aria-hidden="true" />
      <ClientOnly><BeanField /></ClientOnly>
      <img src="/brand/sipquel-logo-night.svg" width="176" height="147" alt="Sipquel">
      <h2>Be one of the first<br><em>to brew with it.</em></h2>
      <p class="sq-sub">The beta is almost ready. Join the Discord, tell us what is on your bench, and help shape what Sipquel becomes.</p>
      <div class="sq-cta">
        <BetaButton label="Join the beta on Discord" />
        <a class="sq-btn sq-btn-ghost" href="/guide/what-is-sipquel">Read the guide</a>
      </div>
    </section>

    <dialog ref="box" class="sq-box" :aria-label="zoom.title" @click="box?.close()">
      <img :src="img(zoom.id)" width="1024" height="600" :alt="zoom.alt">
      <p>{{ zoom.title }}<span>Click anywhere to close</span></p>
    </dialog>

    <!-- Footer -->
    <footer class="sq-foot">
      <div class="sq-foot-brand">
        <img src="/brand/sipquel-icon-night.svg" width="36" height="36" alt="">
        <div><b>sipquel</b><span>Dose. Grind. Brew. Remember.</span></div>
      </div>
      <nav class="sq-foot-cols" aria-label="Footer">
        <div>
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="/guide/how-it-works">How it works</a>
          <a href="/guide/devices">Devices</a>
          <a href="/guide/hardware">Hardware</a>
        </div>
        <div>
          <h4>Beta</h4>
          <a href="/guide/beta">Join the beta</a>
          <a href="/guide/faq">FAQ</a>
        </div>
        <div>
          <h4>Community</h4>
          <a :href="BETA_URL" target="_blank" rel="noopener">Discord</a>
          <a :href="GITHUB_URL" target="_blank" rel="noopener">GitHub</a>
        </div>
      </nav>
      <p class="sq-foot-copy">© {{ new Date().getFullYear() }} Sipquel. Made for people who weigh their beans.</p>
    </footer>
  </div>
</template>
