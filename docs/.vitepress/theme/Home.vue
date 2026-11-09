<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import DeviceArt from './DeviceArt.vue'
import BetaButton from './BetaButton.vue'
import LiveShot from './LiveShot.vue'
import { BETA_URL, GITHUB_URL } from './site'

const steps = [
  { n: '01', title: 'Dose', art: 'themis', text: 'Weigh the beans on your scale. Sipquel reads the weight live and settles on the dose.' },
  { n: '02', title: 'Grind', art: 'motto80', text: 'Your grinder is set to the recipe. Sipquel times the grind and records the setting it used.' },
  { n: '03', title: 'Brew', art: 'gaggia', text: 'Pressure, pump flow and weight are drawn as the shot runs, or each pour is guided step by step.' },
  { n: '04', title: 'Remember', art: 'v60', text: 'The brew lands in your journal with every number. Rate it, add a note, pull it again.' },
]

const screens = [
  { id: 'home', label: 'Home', alt: 'Sipquel Home: the boiler gauge heading for 93 °C, the next shot, the grinder and coffee tiles, and this week\'s brews.' },
  { id: 'pour', label: 'Pour guide', alt: 'A guided V60 pour: the bloom dial at 50 g, the brew time, the planned and measured water curves, and the next step.' },
  { id: 'prep', label: 'Prep', alt: 'The pour-over prep checklist: kettle to 94 °C, weigh 15.4 g, grind, rinse, then tare.' },
]
const active = ref('home')
const theme = ref<'night' | 'day'>('night')
const shot = (id: string, t: string) => `/screens/${id}${t === 'day' ? '-day' : ''}.webp`

// Line icons in the same stroke language as the device drawings.
const svg = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
const ICON: Record<string, string> = {
  journal: svg('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>'),
  replay: svg('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/><path d="M10 9l5 3-5 3z"/>'),
  taste: svg('<path d="M12 3c3.5 4.2 6 7.4 6 10.5A6 6 0 0 1 6 13.5C6 10.4 8.5 7.2 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
  phone: svg('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  lock: svg('<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
}

const devices = [
  { art: 'themis', name: 'BOOKOO Themis', kind: 'Scale', status: 'Supported' },
  { art: 'motto80', name: 'BOOKOO Motto80', kind: 'Grinder', status: 'Supported' },
  { art: 'gaggia', name: 'Gaggiuino', kind: 'Espresso machine', status: 'Supported' },
  { art: 'kettle', name: 'Fellow Stagg EKG', kind: 'Kettle', status: 'Experimental' },
  { art: 'gaggia', name: 'GaggiMate', kind: 'Espresso machine', status: 'Coming' },
  { art: 'decent', name: 'Decent Espresso', kind: 'Espresso machine', status: 'Coming' },
]

const roadmap = [
  { when: 'Now', tag: 'In the beta', icon: 'check', items: ['Live espresso graph and shot details', 'Guided pour-over with live weight', 'A journal that saves every brew', 'BOOKOO Themis and Motto80', 'Gaggiuino machines', 'The phone companion at sipquel.local'] },
  { when: 'Next', tag: 'Being built', icon: 'spark', items: ['GaggiMate machines', 'Decent Espresso', 'Fellow Stagg EKG, out of experimental', 'Coffee and recipe editing from the phone'] },
  { when: 'Later', tag: 'You decide', icon: 'plus', items: ['More scales and grinders', 'Whatever the beta asks for most'] },
]

const faq = [
  { q: 'When can I get it?', a: 'The beta opens soon. Join the Sipquel Discord to be among the first: builds, release notes and help all live there.' },
  { q: 'What hardware do I need?', a: 'A 7-inch ESP32-P4 touchscreen panel (1024 × 600) and at least one supported scale, grinder or machine. The exact panel and where to buy it will be posted in the beta.' },
  { q: 'Do I need a phone or an account?', a: 'No. Sipquel works on its own screen. Your phone is optional: open sipquel.local on the same Wi-Fi to use it as a second screen. There is no account and no subscription.' },
  { q: 'Does it control my machine?', a: 'Sipquel reads your machine live and prepares it from a recipe or a past brew. Brewing itself stays in your hands: it never pulls a shot or heats water on its own.' },
  { q: 'Where is my data kept?', a: 'On the panel, optionally on its SD card. Nothing is sent to a cloud.' },
]

// Hero device follows the pointer a little; feature cards get a soft
// spotlight under the cursor; sections fade in once as they scroll into view.
// All three are skipped when the reader prefers reduced motion.
const root = ref<HTMLElement | null>(null)
const device = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null
const still = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function tilt(e: PointerEvent) {
  const el = device.value
  if (!el || still() || e.pointerType !== 'mouse') return
  const b = el.getBoundingClientRect()
  el.style.setProperty('--ry', `${((e.clientX - b.left) / b.width - .5) * 14 - 8}deg`)
  el.style.setProperty('--rx', `${(.5 - (e.clientY - b.top) / b.height) * 10 + 3}deg`)
}
function untilt() { device.value?.style.removeProperty('--ry'); device.value?.style.removeProperty('--rx') }
function spot(e: PointerEvent) {
  const card = (e.target as HTMLElement).closest<HTMLElement>('.sq-spot')
  if (!card) return
  const b = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - b.left}px`)
  card.style.setProperty('--my', `${e.clientY - b.top}px`)
}

onMounted(() => {
  if (still() || !('IntersectionObserver' in window) || !root.value) return
  io = new IntersectionObserver((list) => {
    for (const en of list) if (en.isIntersecting) { en.target.classList.add('in'); io?.unobserve(en.target) }
  }, { rootMargin: '0px 0px -8% 0px', threshold: .08 })
  root.value.querySelectorAll('.sq-rv').forEach((el) => io!.observe(el))
  root.value.classList.add('sq-reveal')
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <div ref="root" class="sq">
    <!-- Hero -->
    <section class="sq-hero">
      <div class="sq-grid-bg" aria-hidden="true" />
      <div class="sq-glow" aria-hidden="true" />
      <div class="sq-hero-copy">
        <a class="sq-pill" :href="BETA_URL" target="_blank" rel="noopener">
          <span class="sq-dot" />Beta opening soon<span class="sq-pill-sep" />Join us on Discord<span class="sq-pill-arrow" aria-hidden="true">→</span>
        </a>
        <h1><span class="nw">Your coffee bar,</span><br><em>orchestrated.</em></h1>
        <p class="sq-lead">
          Sipquel is a 7-inch touchscreen that lives on your counter. It runs your scale, grinder and
          espresso machine, follows every brew live, and keeps a journal you never have to write.
        </p>
        <div class="sq-cta">
          <BetaButton />
          <a class="sq-btn sq-btn-ghost" href="#shot">Watch a shot</a>
        </div>
        <p class="sq-trust">Works with <b>BOOKOO</b> · <b>Gaggiuino</b> · <b>Fellow</b> <span>(experimental)</span></p>
      </div>

      <div class="sq-hero-device" @pointermove="tilt" @pointerleave="untilt">
        <svg class="sq-curve" viewBox="0 0 600 220" aria-hidden="true">
          <path class="sq-curve-p" d="M0 200 C60 200 80 60 150 52 S260 48 330 50 S470 60 600 58" />
          <path class="sq-curve-f" d="M0 210 C70 210 90 140 160 132 S290 150 360 128 S500 120 600 126" />
        </svg>
        <div ref="device" class="sq-device">
          <div class="sq-bezel">
            <img src="/screens/home.webp" width="1024" height="600" alt="The Sipquel touchscreen on its Home page." fetchpriority="high">
            <span class="sq-glare" aria-hidden="true" />
          </div>
        </div>
        <div class="sq-chip sq-chip-a"><small>Dose</small><b>18.2</b><i>g</i></div>
        <div class="sq-chip sq-chip-b"><small>Grind</small><b>465</b><i>µm</i></div>
        <div class="sq-chip sq-chip-c"><small>Pressure</small><b>9.0</b><i>bar</i></div>
      </div>
    </section>

    <div class="sq-marquee" aria-hidden="true">
      <div class="sq-marquee-track">
        <span v-for="i in 2" :key="i">Dose<i>·</i>Grind<i>·</i>Brew<i>·</i>Taste<i>·</i>Remember<i>·</i>Repeat<i>·</i></span>
      </div>
    </div>

    <!-- The workflow -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">One bench, one flow</p>
        <h2>From beans to a better next cup.</h2>
      </header>
      <ol class="sq-steps">
        <li v-for="(s, i) in steps" :key="s.n" class="sq-step sq-rv" :style="{ '--d': i * 90 + 'ms' }">
          <DeviceArt :name="s.art" />
          <span class="sq-step-n">{{ s.n }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </section>

    <!-- Live shot -->
    <section id="shot" class="sq-section sq-shot">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Watch a shot</p>
        <h2>Know how the shot is going while it pours.</h2>
        <p class="sq-sub">This is the Brewing screen. The machine sends pressure and flow, the scale sends the cup weight, and Sipquel puts them together against your recipe: 18.2 g in, 36.4 g out, in 28 ± 2 s.</p>
      </header>
      <div class="sq-rv"><LiveShot /></div>
      <ul class="sq-shot-explain">
        <li class="sq-rv"><h3>The ring is your cup</h3><p>It fills with the weight from the scale. The hollow marker is where the recipe says the cup should be right now, so you see at a glance if the shot runs fast or slow.</p></li>
        <li class="sq-rv" style="--d: 80ms"><h3>The dashed line is the plan</h3><p>Your machine profile: a 3 bar soak, a ramp to 9 bar, then a gentle decline. The live pressure is drawn over it, phase by phase.</p></li>
        <li class="sq-rv" style="--d: 160ms"><h3>The pace tells you the finish</h3><p>From the cup's own speed, Sipquel says when the shot will reach its stop weight, and whether that lands inside your aim.</p></li>
      </ul>
    </section>

    <!-- Features -->
    <section id="features" class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Features</p>
        <h2>Everything you used to write down, written down for you.</h2>
      </header>
      <div class="sq-bento" @pointermove="spot">
        <article class="sq-card sq-card-wide sq-spot sq-rv">
          <div class="sq-card-copy">
            <h3>Prep, step by step</h3>
            <p>Before the brew, a short checklist from your recipe: heat the kettle, weigh the dose, grind, rinse, tare.</p>
          </div>
          <img src="/screens/prep.webp" width="1024" height="600" loading="lazy" alt="The pour-over prep checklist: kettle to 94 °C, weigh 15.4 g, grind, rinse, then tare.">
        </article>
        <article class="sq-card sq-spot sq-rv" style="--d: 60ms">
          <span class="sq-ico" v-html="ICON.journal" />
          <h3>A journal that writes itself</h3>
          <p>Every shot and pour is saved with dose, grind, time, yield and its curve. Rate it and add a note in seconds.</p>
        </article>
        <article class="sq-card sq-spot sq-rv" style="--d: 120ms">
          <span class="sq-ico" v-html="ICON.replay" />
          <h3>Pull it again</h3>
          <p>Pick a recipe or a brew you loved. Sipquel sets the grinder and gets the machine ready the same way.</p>
        </article>
        <article class="sq-card sq-card-tall sq-spot sq-rv">
          <div class="sq-card-copy">
            <h3>Pour-over, guided</h3>
            <p>Bloom, pour, swirl: each step with its target water, the weight live from your scale and the time it should take.</p>
          </div>
          <img src="/screens/pour.webp" width="1024" height="600" loading="lazy" alt="The guided pour-over screen during the bloom.">
        </article>
        <article class="sq-card sq-spot sq-rv" style="--d: 60ms">
          <span class="sq-ico" v-html="ICON.taste" />
          <h3>Taste, in words</h3>
          <p>Sour to bitter, acidity, sweetness, body. Simple notes that tell you which way to dial in next.</p>
        </article>
        <article class="sq-card sq-spot sq-rv" style="--d: 120ms">
          <span class="sq-ico" v-html="ICON.phone" />
          <h3>On your phone too</h3>
          <p>Open sipquel.local on the same Wi-Fi: the same bench, the same journal, from the sofa.</p>
        </article>
        <article class="sq-card sq-spot sq-rv" style="--d: 60ms">
          <span class="sq-ico" v-html="ICON.moon" />
          <h3>Night and Day</h3>
          <p>A calm dark theme for early mornings, a bright one for the afternoon.</p>
        </article>
        <article class="sq-card sq-spot sq-rv" style="--d: 120ms">
          <span class="sq-ico" v-html="ICON.lock" />
          <h3>Yours, on your counter</h3>
          <p>No account, no cloud, no subscription. Your coffees and your journal stay on the panel.</p>
        </article>
      </div>
    </section>

    <!-- Real screens -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">The real thing</p>
        <h2>Designed for wet hands and early mornings.</h2>
        <p class="sq-sub">Real captures from the panel. Switch between the Night and Day themes.</p>
      </header>
      <div class="sq-gallery-bar sq-rv">
        <div class="sq-tabs" role="tablist" aria-label="Sipquel screens">
          <button v-for="s in screens" :key="s.id" role="tab" :aria-selected="active === s.id" :class="{ on: active === s.id }" @click="active = s.id">{{ s.label }}</button>
        </div>
        <div class="sq-theme" role="group" aria-label="Theme">
          <button :class="{ on: theme === 'night' }" :aria-pressed="theme === 'night'" @click="theme = 'night'"><span v-html="ICON.moon" />Night</button>
          <button :class="{ on: theme === 'day' }" :aria-pressed="theme === 'day'" @click="theme = 'day'"><span v-html="ICON.sun" />Day</button>
        </div>
      </div>
      <div class="sq-gallery sq-rv" :class="'is-' + theme">
        <div class="sq-gallery-stage">
          <template v-for="s in screens" :key="s.id">
            <img v-for="t in ['night', 'day']" :key="t" :class="{ show: active === s.id && theme === t }"
                 :src="shot(s.id, t)" width="1024" height="600" loading="lazy"
                 :alt="s.alt + (t === 'day' ? ' Day theme.' : ' Night theme.')" :aria-hidden="!(active === s.id && theme === t)" role="tabpanel">
          </template>
        </div>
      </div>
    </section>

    <!-- Devices -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Devices</p>
        <h2>Brings your gear together.</h2>
        <p class="sq-sub">Sipquel connects over Bluetooth and Wi-Fi to the coffee gear you already own.</p>
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

    <!-- Hardware + story -->
    <section class="sq-section sq-split">
      <div class="sq-rv">
        <p class="sq-kicker">Why Sipquel</p>
        <h2>A dedicated instrument, not another app.</h2>
        <p class="sq-sub">
          Phones lock, apps get buried, notebooks get wet. Sipquel is one screen that wakes up ready
          next to the grinder, talks to every device on the bench, and remembers what made the good
          cup good.
        </p>
      </div>
      <ul class="sq-specs">
        <li class="sq-rv"><b>7″</b><span>1024 × 600 touchscreen</span></li>
        <li class="sq-rv" style="--d: 70ms"><b>ESP32-P4</b><span>fast, quiet, always on</span></li>
        <li class="sq-rv" style="--d: 140ms"><b>BLE · Wi-Fi</b><span>scale, grinder, kettle and machine</span></li>
        <li class="sq-rv" style="--d: 210ms"><b>0</b><span>accounts, clouds or subscriptions</span></li>
      </ul>
    </section>

    <!-- Roadmap -->
    <section class="sq-section">
      <header class="sq-head sq-rv">
        <p class="sq-kicker">Roadmap</p>
        <h2>Where Sipquel is going.</h2>
        <p class="sq-sub">What works in the beta today, what is being built, and what the beta testers will decide.</p>
      </header>
      <div class="sq-road">
        <article v-for="(r, i) in roadmap" :key="r.when" class="sq-road-col sq-rv" :class="'is-' + r.when.toLowerCase()" :style="{ '--d': i * 90 + 'ms' }">
          <header>
            <span class="sq-road-ico" v-html="ICON[r.icon]" />
            <h3>{{ r.when }}</h3>
            <span class="sq-road-tag">{{ r.tag }}</span>
          </header>
          <ul><li v-for="it in r.items" :key="it">{{ it }}</li></ul>
        </article>
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
      <div class="sq-glow sq-glow-2" aria-hidden="true" />
      <img src="/brand/sipquel-logo-night.svg" width="176" height="147" alt="Sipquel">
      <h2>Be one of the first to brew with it.</h2>
      <p class="sq-sub">The beta is almost ready. Join the Discord, tell us what is on your bench, and help shape what Sipquel becomes.</p>
      <div class="sq-cta sq-cta-center">
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
