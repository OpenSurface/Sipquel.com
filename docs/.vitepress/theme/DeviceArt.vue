<script setup lang="ts">
// The approved Sipquel line drawings (280x200, stroke currentColor),
// inlined so they take the page's colours: main line, secondary (.s)
// and the crema accent (.lit / .litf).
import themis from './art/themis-ultra.svg?raw'
import motto80 from './art/motto80.svg?raw'
import gaggia from './art/gaggia.svg?raw'
import kettle from './art/kettle.svg?raw'
import decent from './art/decent.svg?raw'
import v60 from './art/v60-server.svg?raw'
import basket from './art/basket.svg?raw'
import aeropress from './art/aeropress.svg?raw'

const ART: Record<string, string> = { themis, motto80, gaggia, kettle, decent, v60, basket, aeropress }
defineProps<{ name: string; label?: string }>()
</script>

<template>
  <span class="sq-art" role="img" :aria-label="label || ''" :aria-hidden="label ? undefined : 'true'" v-html="ART[name] || ''" />
</template>
