<script setup lang="ts">
import { BETA_URL, betaLink } from './site'
withDefaults(defineProps<{ label?: string; ghost?: boolean; discord?: boolean }>(), { label: 'Join the beta', ghost: false, discord: true })
const external = !!BETA_URL
</script>

<template>
  <a class="sq-btn" :class="ghost ? 'sq-btn-ghost' : 'sq-btn-gold'" :href="betaLink()"
     :target="external ? '_blank' : undefined" :rel="external ? 'noopener' : undefined">
    <svg v-if="discord && external" class="sq-btn-dc" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.3 5.3A17 17 0 0 0 15.1 4l-.5 1a15.7 15.7 0 0 0-5.2 0L8.9 4a17 17 0 0 0-4.2 1.3C2 9.3 1.3 13.2 1.6 17a17.2 17.2 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a12.2 12.2 0 0 0 10.8 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17.1 17.1 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7zM8.7 14.7c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1zm6.6 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1z"/></svg>
    <span>{{ label }}</span>
    <svg class="sq-btn-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </a>
</template>
