<script setup lang="ts">
import { BETA_URL, betaLink } from './site'
withDefaults(defineProps<{ label?: string; ghost?: boolean }>(), { label: 'Join the beta', ghost: false })
const external = !!BETA_URL
</script>

<template>
  <a class="sq-btn" :class="ghost ? 'sq-btn-ghost' : 'sq-btn-gold'" :href="betaLink()"
     :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined">
    <span>{{ label }}</span>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>
</template>
