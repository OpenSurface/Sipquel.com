<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DeviceArt from './DeviceArt.vue'
import BetaButton from './BetaButton.vue'
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

const compare = [
  { id: 'home', label: 'Home' },
  { id: 'brew', label: 'Brewing' },
  { id: 'done', label: 'Done' },
  { id: 'pour', label: 'Pour-over' },
]
const cmp = ref('home')
const split = ref(50)

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

const features = [
  { icon: 'journal', title: 'A journal that writes itself', text: 'Every shot and pour is saved with dose, grind, time, yield and its curve.' },
  { icon: 'replay', title: 'Pull it again', text: 'Pick a recipe or a brew you loved. The grinder and machine are set the same way.' },
  { icon: 'list', title: 'Prep, step by step', text: 'A short checklist before each brew: heat the kettle, weigh, grind, rinse, tare.' },
  { icon: 'taste', title: 'Taste, in words', text: 'Sour to bitter, acidity, sweetness, body: notes that point to the next adjustment.' },
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
let reveal: IntersectionObserver | null = null
let steps: IntersectionObserver | null = null
const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) return
  // The pinned screen follows whichever story step crosses the middle of the viewport.
  steps = new IntersectionObserver((list) => {
    for (const en of list) if (en.isIntersecting) cur.value = Number((en.target as HTMLElement).dataset.i)
  }, { rootMargin: '-45% 0px -45% 0px' })
  root.value.querySelectorAll('.sq-story-step').forEach((el) => steps!.observe(el))

  if (still()) return
  reveal = new IntersectionObserver((list) => {
    for (const en of list) if (en.isIntersecting) { en.target.classList.add('in'); reveal?.unobserve(en.target) }
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 })
  root.value.querySelectorAll('.sq-rv').forEach((el) => reveal!.observe(el))
  root.value.classList.add('sq-reveal')
})
onBeforeUnmount(() => { reveal?.disconnect(); steps?.disconnect() })
</script>

<template>
  <div ref="root" class="sq">
    <!-- Hero -->
    <section class="sq-hero">
      <div class="sq-lamp" aria-hidden="true" />
      <a class="sq-pill" :href="BETA_URL" target="_blank" rel="noopener">
        <span class="sq-dot" />Beta opening soon<span class="sq-pill-sep" />Join us on Discord<span class="sq-pill-arrow" aria-hidden="true">→</span>
      </a>
      <h1>Your coffee bar,<br><em>orchestrated.</em></h1>
      <p class="sq-lead">
        A 7-inch touchscreen for your counter. It runs your scale, grinder and espresso machine,
        follows every brew live, and keeps a journal you never have to write.
      </p>
      <div class="sq-cta">
        <BetaButton />
        <a class="sq-btn sq-btn-ghost" href="#story">See a shot</a>
      </div>

      <div class="sq-hero-stage">
        <div class="sq-frame sq-frame-xl">
          <img src="/screens/home.webp" width="1024" height="600" alt="The Sipquel touchscreen on its Home page: the boiler gauge heading for 93 °C, the next shot, the grinder and this week's brews." fetchpriority="high">
        </div>
        <div class="sq-counter" aria-hidden="true" />
      </div>
      <p class="sq-trust">Works with <b>BOOKOO</b><i /><b>Gaggiuino</b><i /><b>Fellow</b> <span>experimental</span></p>
    </section>

    <!-- Story: one espresso, start to finish -->
    <section id="story" class="sq-section sq-story">
      <header class="sq-head sq-head-c sq-rv">
        <p class="sq-kicker">Espresso, start to finish</p>
        <h2>One shot. Four steps.<br><span class="sq-dim">Nothing to write down.</span></h2>
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

        <div class="sq-story-pin" aria-hidden="true">
          <div class="sq-story-sticky">
            <div class="sq-frame sq-frame-lg">
              <div class="sq-stage">
                <img v-for="(s, i) in story" :key="s.id" :src="img(s.id)" width="1024" height="600" loading="lazy" alt="" :class="{ show: cur === i }">
              </div>
            </div>
            <ol class="sq-story-rail">
              <li v-for="(s, i) in story" :key="s.id" :class="{ on: cur === i, past: i < cur }"><i />{{ s.title }}</li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- Pour-over -->
    <section class="sq-section sq-pour">
      <div class="sq-pour-copy sq-rv">
        <p class="sq-kicker">Pour-over</p>
        <h2>Every pour,<br>against the plan.</h2>
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
        <div class="sq-frame sq-duo-a"><img src="/screens/pour.webp" width="1024" height="600" loading="lazy" alt="A guided V60 pour: the bloom dial at 50 g, the brew time and the planned and measured water."></div>
        <div class="sq-frame sq-duo-b"><img src="/screens/pourdone.webp" width="1024" height="600" loading="lazy" alt="Brew complete: 3:04 total, 251 g of water at 1:16.7, plotted against the plan, with a star rating."></div>
      </div>
    </section>

    <!-- Read any shot back -->
    <section class="sq-section sq-traces">
      <header class="sq-head sq-head-c sq-rv">
        <p class="sq-kicker">The journal</p>
        <h2>Read any shot back.</h2>
        <p class="sq-sub">Open a brew and its whole extraction is there: pressure, pump flow, yield, boiler and weight flow on one chart, the targets dashed, every reading alongside.</p>
      </header>
      <div class="sq-frame sq-frame-xl sq-rv">
        <img src="/screens/traces.webp" width="1024" height="600" loading="lazy" alt="The extraction detail: pressure, pump flow, yield, boiler and weight-flow traces with dashed targets and the readings at 23.2 s.">
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">And the rest</p>
        <h2>Small things that add up to a better cup.</h2>
      </header>
      <div class="sq-features">
        <article v-for="(f, i) in features" :key="f.title" class="sq-feature sq-rv" :style="{ '--d': (i % 3) * 70 + 'ms' }">
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
        <h2>Dark at dawn. Bright by noon.</h2>
        <p class="sq-sub">Two themes, the same layout. Drag across the screen to compare.</p>
      </header>
      <div class="sq-tabs sq-rv" role="tablist" aria-label="Screen to compare">
        <button v-for="c in compare" :key="c.id" role="tab" :aria-selected="cmp === c.id" :class="{ on: cmp === c.id }" @click="cmp = c.id">{{ c.label }}</button>
      </div>
      <div class="sq-frame sq-frame-xl sq-rv">
        <div class="sq-compare" :style="{ '--x': split + '%' }">
          <img :src="img(cmp)" width="1024" height="600" loading="lazy" :alt="'Night theme: ' + compare.find(c => c.id === cmp)!.label">
          <img class="sq-compare-day" :src="img(cmp, true)" width="1024" height="600" loading="lazy" :alt="'Day theme: ' + compare.find(c => c.id === cmp)!.label">
          <div class="sq-compare-line" aria-hidden="true"><span>‹ ›</span></div>
          <span class="sq-compare-tag l" aria-hidden="true">Night</span>
          <span class="sq-compare-tag r" aria-hidden="true">Day</span>
          <input v-model.number="split" type="range" min="0" max="100" step="1" aria-label="Compare the Night and Day themes">
        </div>
      </div>
    </section>

    <!-- Devices -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Devices</p>
        <h2>Brings your gear together.</h2>
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
        <h2>Good to know.</h2>
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
      <img src="/brand/sipquel-logo-night.svg" width="176" height="147" alt="Sipquel">
      <h2>Be one of the first to brew with it.</h2>
      <p class="sq-sub">The beta is almost ready. Join the Discord, tell us what is on your bench, and help shape what Sipquel becomes.</p>
      <div class="sq-cta">
        <BetaButton label="Join the beta on Discord" />
        <a class="sq-btn sq-btn-ghost" href="/guide/what-is-sipquel">Read the guide</a>
      </div>
    </section>

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
