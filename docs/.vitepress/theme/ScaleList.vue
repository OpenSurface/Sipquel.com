<script setup lang="ts">
import { computed, ref } from 'vue'

// Shared by the homepage and guide so model names and support labels stay together.
const scales = [
  { brand: 'BOOKOO', models: ['Themis Mini', 'Themis Ultra'], aliases: '', tested: true },
  { brand: 'Acaia', models: ['Lunar', 'Pearl', 'Pyxis', 'Umbra Lunar'], aliases: 'ACAIA, PROCH', tested: false },
  { brand: 'Decent', models: ['Decent Scale', 'EspressiScale'], aliases: '', tested: false },
  { brand: 'DiFluid', models: ['Microbalance', 'Microbalance Ti'], aliases: '', tested: false },
  { brand: 'Eclair', models: ['Eclair'], aliases: 'ECLAIR-', tested: false },
  { brand: 'Eureka', models: ['Precisa'], aliases: 'CFS-9002, LSJ-001', tested: false },
  { brand: 'Felicita', models: ['Arc'], aliases: 'FELICITA', tested: false },
  { brand: 'Timemore Black Mirror', models: ['DUO'], aliases: 'TIMEMORE SCALE', tested: false },
  { brand: 'Timemore Dot', models: ['Dot'], aliases: 'TIMEMORE_DOT', tested: false },
  { brand: 'Varia', models: ['AKU', 'AKU Mini', 'AKU Pro'], aliases: '', tested: false },
  { brand: 'WeighMyBru', models: ['WeighMyBru'], aliases: 'WEIGHMYBRU', tested: false },
  { brand: 'MyScale', models: ['KP2048B'], aliases: 'blackcoffee, my_scale', tested: false },
]
const query = ref('')
const filtered = computed(() => {
  const words = query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return scales.filter(scale => {
    const text = [scale.brand, ...scale.models, scale.aliases].join(' ').toLocaleLowerCase()
    return words.every(word => text.includes(word))
  })
})
</script>

<template>
  <div class="sq-scale-catalogue">
    <div class="sq-scale-toolbar">
      <label class="sq-scale-search">
        <span>Search scales</span>
        <input v-model="query" type="search" placeholder="Brand or model, e.g. Acaia Lunar" autocomplete="off" spellcheck="false">
      </label>
      <p class="sq-scale-count" role="status" aria-live="polite">{{ filtered.length }} of {{ scales.length }} families</p>
    </div>
    <div v-if="filtered.length" class="sq-scale-grid">
      <article v-for="scale in filtered" :key="scale.brand" class="sq-scale-card">
        <span class="sq-scale-status" :class="{ 'is-tested': scale.tested }">{{ scale.tested ? 'Hardware tested' : 'Experimental' }}</span>
        <h4 class="sq-scale-brand">{{ scale.brand }}</h4>
        <ul class="sq-scale-models" aria-label="Scale models">
          <li v-for="model in scale.models" :key="model">{{ model }}</li>
        </ul>
        <p v-if="scale.aliases" class="sq-scale-alias">Bluetooth: {{ scale.aliases }}</p>
      </article>
    </div>
    <div v-else class="sq-scale-empty">
      <p>No scales match your search. Try a brand or model name.</p>
      <button type="button" @click="query = ''">Show all scales</button>
    </div>
  </div>
</template>

<style scoped>
.sq-scale-catalogue { container-type: inline-size; min-width: 0; color: var(--sq-ink); }
.sq-scale-toolbar { display: flex; align-items: end; gap: 16px; flex-wrap: wrap; margin: 20px 0; }
.sq-scale-search { display: grid; gap: 8px; flex: 1 1 240px; max-width: 460px; min-width: 0; font-size: 14px; color: var(--sq-ink-2); }
.sq-scale-search input { width: 100%; min-width: 0; box-sizing: border-box; border: 1px solid var(--sq-line-2); border-radius: 12px; background: var(--sq-surface); color: var(--sq-ink); padding: 13px 15px; font: inherit; font-size: 16px; line-height: 1.4; }
.sq-scale-search input::placeholder { color: var(--sq-ink-3); }
.sq-scale-search input:focus-visible, .sq-scale-empty button:focus-visible { outline: 2px solid var(--sq-gold); outline-offset: 3px; }
.sq-scale-catalogue .sq-scale-count { margin: 0 0 12px; color: var(--sq-ink-3); font-size: 14px; }
.sq-scale-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.sq-scale-card { min-width: 0; padding: 18px; border: 1px solid var(--sq-line); border-radius: 16px; background: var(--sq-surface); }
.sq-scale-status { display: inline-block; padding: 3px 8px; border-radius: 6px; background: rgba(224,192,136,.08); color: var(--sq-gold); font-size: 12px; line-height: 1.5; }
.sq-scale-status.is-tested { color: #b9dfb0; background: rgba(185,223,176,.08); }
.sq-scale-catalogue .sq-scale-brand { margin: 10px 0 12px; padding: 0; border: 0; color: var(--sq-ink); font-size: 18px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.sq-scale-catalogue .sq-scale-models { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.sq-scale-catalogue .sq-scale-models li { margin: 0; padding: 4px 8px; border-radius: 7px; background: var(--sq-surface-2); color: var(--sq-ink-2); font-size: 13px; line-height: 1.5; overflow-wrap: anywhere; }
.sq-scale-catalogue .sq-scale-alias { margin: 12px 0 0; color: var(--sq-ink-3); font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.sq-scale-empty { padding: 24px; border-radius: 16px; background: var(--sq-surface); }
.sq-scale-catalogue .sq-scale-empty p { margin: 0 0 14px; color: var(--sq-ink-2); }
.sq-scale-empty button { min-height: 44px; padding: 8px 14px; border: 1px solid var(--sq-line-2); border-radius: 10px; color: var(--sq-gold); font: inherit; cursor: pointer; }
@container (max-width: 720px) { .sq-scale-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (max-width: 420px) { .sq-scale-grid { grid-template-columns: minmax(0, 1fr); } }
</style>
