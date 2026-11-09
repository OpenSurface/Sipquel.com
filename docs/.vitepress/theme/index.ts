import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import '@fontsource/hanken-grotesk/300.css'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/hanken-grotesk/600.css'
import '@fontsource/hanken-grotesk/700.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import './custom.css'
import Home from './Home.vue'
import DeviceArt from './DeviceArt.vue'
import BetaButton from './BetaButton.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Home', Home)
    app.component('DeviceArt', DeviceArt)
    app.component('BetaButton', BetaButton)
  },
} satisfies Theme
