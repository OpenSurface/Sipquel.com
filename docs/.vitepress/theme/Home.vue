<script setup lang="ts">
import { ref } from 'vue'
import DeviceArt from './DeviceArt.vue'
import BetaButton from './BetaButton.vue'

const steps = [
  { n: '01', title: 'Dose', art: 'themis', text: 'Weigh the beans on your scale. Sipquel reads the weight live and settles on the dose.' },
  { n: '02', title: 'Grind', art: 'motto80', text: 'Your grinder is set to the recipe. Sipquel times the grind and records the setting it used.' },
  { n: '03', title: 'Brew', art: 'gaggia', text: 'Pressure, pump flow and weight are drawn as the shot runs, or each pour is guided step by step.' },
  { n: '04', title: 'Remember', art: 'v60', text: 'The brew lands in your journal with every number. Rate it, add a note, pull it again.' },
]

const screens = [
  { id: 'home', label: 'Home', src: '/screens/home.webp', alt: 'Sipquel Home: the boiler gauge at 88.5 °C heading for 93, the next shot, the grinder and coffee tiles, and this week\'s brews.' },
  { id: 'pour', label: 'Pour guide', src: '/screens/pour.webp', alt: 'A guided V60 pour: the bloom dial at 50 g, the brew time, the planned and measured water curves, and the next step.' },
  { id: 'prep', label: 'Prep', src: '/screens/prep.webp', alt: 'The pour-over prep checklist: kettle to 94 °C, weigh 15.4 g, grind, rinse, then tare.' },
  { id: 'graph', label: 'Shot graph', src: '/screens/graph.webp', alt: 'The espresso graph details with pressure, pump flow and cup weight, and a pinned reading.' },
]
const active = ref('home')
// Line icons in the same stroke language as the device drawings.
const svg = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
const ICON: Record<string, string> = {
  journal: svg('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11M9 8h6"/>'),
  replay: svg('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4h4"/><path d="M10 9l5 3-5 3z"/>'),
  taste: svg('<path d="M12 3c3.5 4.2 6 7.4 6 10.5A6 6 0 0 1 6 13.5C6 10.4 8.5 7.2 12 3z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
  phone: svg('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z"/>'),
  lock: svg('<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
}


const devices = [
  { art: 'themis', name: 'BOOKOO Themis', kind: 'Scale', status: 'Supported' },
  { art: 'motto80', name: 'BOOKOO Motto80', kind: 'Grinder', status: 'Supported' },
  { art: 'gaggia', name: 'Gaggiuino', kind: 'Espresso machine', status: 'Supported' },
  { art: 'kettle', name: 'Fellow Stagg EKG', kind: 'Kettle', status: 'Experimental' },
  { art: 'gaggia', name: 'GaggiMate', kind: 'Espresso machine', status: 'Coming' },
  { art: 'decent', name: 'Decent Espresso', kind: 'Espresso machine', status: 'Coming' },
]
</script>

<template>
  <div class="sq">
    <!-- Hero -->
    <section class="sq-hero">
      <div class="sq-glow" aria-hidden="true" />
      <div class="sq-hero-copy">
        <p class="sq-pill"><span class="sq-dot" />Beta coming soon · ESP32-P4</p>
        <h1><span class="nw">Your coffee bar,</span><br><em>orchestrated.</em></h1>
        <p class="sq-lead">
          Sipquel is a small touchscreen that lives on your counter. It runs your scale, grinder and
          espresso machine, follows every brew live, and keeps a journal you never have to write.
        </p>
        <div class="sq-cta">
          <BetaButton />
          <a class="sq-btn sq-btn-ghost" href="/guide/how-it-works">See how it works</a>
        </div>
        <p class="sq-trust">Works with <b>BOOKOO</b> · <b>Gaggiuino</b> · <b>Fellow</b> <span>(experimental)</span></p>
      </div>

      <div class="sq-hero-device">
        <svg class="sq-curve" viewBox="0 0 600 220" aria-hidden="true">
          <path class="sq-curve-p" d="M0 200 C60 200 80 60 150 52 S260 48 330 50 S470 60 600 58" />
          <path class="sq-curve-f" d="M0 210 C70 210 90 140 160 132 S290 150 360 128 S500 120 600 126" />
        </svg>
        <div class="sq-device">
          <div class="sq-bezel"><img src="/screens/home.webp" width="1024" height="600" alt="The Sipquel touchscreen on its Home page." fetchpriority="high"></div>
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
      <header class="sq-head">
        <p class="sq-kicker">One bench, one flow</p>
        <h2>From beans to a better next cup.</h2>
      </header>
      <ol class="sq-steps">
        <li v-for="s in steps" :key="s.n" class="sq-step">
          <DeviceArt :name="s.art" />
          <span class="sq-step-n">{{ s.n }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
    </section>

    <!-- Features -->
    <section id="features" class="sq-section">
      <header class="sq-head">
        <p class="sq-kicker">Features</p>
        <h2>Everything you used to write down, written down for you.</h2>
      </header>
      <div class="sq-bento">
        <article class="sq-card sq-card-wide">
          <div class="sq-card-copy">
            <h3>The shot, as it happens</h3>
            <p>Pressure, pump flow and cup weight drawn live from your machine. Open the details, pin any second and read it exactly. If the graph ever goes quiet, it says so instead of pretending.</p>
          </div>
          <img src="/screens/graph.webp" width="1024" height="600" loading="lazy" alt="The live espresso graph with pressure, pump flow and cup weight.">
        </article>
        <article class="sq-card">
          <span class="sq-ico" v-html="ICON.journal" />
          <h3>A journal that writes itself</h3>
          <p>Every shot and pour is saved with dose, grind, time, yield and its curve. Rate it and add a note in seconds.</p>
        </article>
        <article class="sq-card">
          <span class="sq-ico" v-html="ICON.replay" />
          <h3>Pull it again</h3>
          <p>Pick a recipe or a brew you loved. Sipquel sets the grinder and gets the machine ready the same way.</p>
        </article>
        <article class="sq-card sq-card-tall">
          <div class="sq-card-copy">
            <h3>Pour-over, guided</h3>
            <p>Bloom, pour, swirl: each step with its target water, the weight live from your scale and the time it should take.</p>
          </div>
          <img src="/screens/pour.webp" width="1024" height="600" loading="lazy" alt="The guided pour-over screen during the bloom.">
        </article>
        <article class="sq-card">
          <span class="sq-ico" v-html="ICON.taste" />
          <h3>Taste, in words</h3>
          <p>Sour to bitter, acidity, sweetness, body. Simple notes that tell you which way to dial in next.</p>
        </article>
        <article class="sq-card">
          <span class="sq-ico" v-html="ICON.phone" />
          <h3>On your phone too</h3>
          <p>Open sipquel.local on the same Wi-Fi: the same bench, the same journal, from the sofa.</p>
        </article>
        <article class="sq-card">
          <span class="sq-ico" v-html="ICON.moon" />
          <h3>Night and Day</h3>
          <p>A calm dark theme for early mornings, a bright one for the afternoon.</p>
        </article>
        <article class="sq-card">
          <span class="sq-ico" v-html="ICON.lock" />
          <h3>Yours, on your counter</h3>
          <p>No account, no cloud, no subscription. Your coffees and your journal stay on the panel.</p>
        </article>
      </div>
    </section>

    <!-- Real screens -->
    <section class="sq-section">
      <header class="sq-head">
        <p class="sq-kicker">The real thing</p>
        <h2>Designed for wet hands and early mornings.</h2>
      </header>
      <div class="sq-tabs" role="tablist" aria-label="Sipquel screens">
        <button v-for="s in screens" :key="s.id" role="tab" :aria-selected="active === s.id" :class="{ on: active === s.id }" @click="active = s.id">{{ s.label }}</button>
      </div>
      <div class="sq-gallery">
        <template v-for="s in screens" :key="s.id">
          <img v-show="active === s.id" :src="s.src" width="1024" height="600" loading="lazy" :alt="s.alt" role="tabpanel">
        </template>
      </div>
    </section>

    <!-- Devices -->
    <section class="sq-section">
      <header class="sq-head">
        <p class="sq-kicker">Devices</p>
        <h2>Brings your gear together.</h2>
        <p class="sq-sub">Sipquel connects over Bluetooth and Wi-Fi to the coffee gear you already own.</p>
      </header>
      <div class="sq-devices">
        <article v-for="d in devices" :key="d.name" class="sq-device-card">
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
      <div>
        <p class="sq-kicker">Why Sipquel</p>
        <h2>A dedicated instrument, not another app.</h2>
        <p class="sq-sub">
          Phones lock, apps get buried, notebooks get wet. Sipquel is one screen that wakes up ready
          next to the grinder, talks to every device on the bench, and remembers what made the good
          cup good.
        </p>
      </div>
      <ul class="sq-specs">
        <li><b>ESP32-P4</b><span>touchscreen panel</span></li>
        <li><b>7″ · 4″</b><span>1024×600 or 800×480</span></li>
        <li><b>BLE · Wi-Fi</b><span>scale, grinder, kettle and machine</span></li>
        <li><b>0</b><span>accounts, clouds or subscriptions</span></li>
      </ul>
    </section>

    <!-- CTA -->
    <section class="sq-final">
      <div class="sq-glow sq-glow-2" aria-hidden="true" />
      <img src="/brand/sipquel-logo-night.svg" width="176" height="147" alt="Sipquel">
      <h2>Be one of the first to brew with it.</h2>
      <p class="sq-sub">The beta is almost ready. Join and help shape what Sipquel becomes.</p>
      <div class="sq-cta sq-cta-center">
        <BetaButton />
        <a class="sq-btn sq-btn-ghost" href="/guide/faq">Read the FAQ</a>
      </div>
    </section>
  </div>
</template>
