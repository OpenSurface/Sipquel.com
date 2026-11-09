import { defineConfig } from 'vitepress'
// The beta link lives in theme/site.ts, shared with the pages.
import { betaLink, BETA_URL } from './theme/site.ts'

const SITE = 'https://sipquel.com'
const DESCRIPTION =
  'Sipquel is a 7-inch touchscreen for your coffee bar. It runs your scale, grinder and espresso machine, follows every brew live and keeps a journal you never have to write.'

export default defineConfig({
  title: 'Sipquel',
  description: DESCRIPTION,
  lang: 'en',
  // Served from the custom domain root (docs/public/CNAME = sipquel.com).
  base: '/',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'force-dark',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#0e0b08' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Sipquel' }],
    ['meta', { property: 'og:url', content: SITE + '/' }],
    ['meta', { property: 'og:title', content: 'Sipquel - your coffee bar, orchestrated' }],
    ['meta', { property: 'og:description', content: DESCRIPTION }],
    ['meta', { property: 'og:image', content: SITE + '/og-card.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'The Sipquel touchscreen during a shot: 22.9 g of 36.4 g, 7.5 bar and the live extraction chart.' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Sipquel - your coffee bar, orchestrated' }],
    ['meta', { name: 'twitter:description', content: DESCRIPTION }],
    ['meta', { name: 'twitter:image', content: SITE + '/og-card.png' }],
  ],

  themeConfig: {
    // The approved cup-and-steam mark, then the lowercase wordmark.
    logo: { src: '/brand/sipquel-icon-night.svg', alt: '' },
    siteTitle: 'sipquel',

    nav: [
      { text: 'Features', link: '/#features' },
      { text: 'Devices', link: '/guide/devices' },
      { text: 'How it works', link: '/guide/how-it-works' },
      { text: 'FAQ', link: '/guide/faq' },
      { text: 'Join the beta', link: betaLink(), target: '_blank', rel: 'noopener' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Sipquel',
          items: [
            { text: 'What it is', link: '/guide/what-is-sipquel' },
            { text: 'How it works', link: '/guide/how-it-works' },
            { text: 'Supported devices', link: '/guide/devices' },
            { text: 'Hardware', link: '/guide/hardware' },
          ],
        },
        {
          text: 'Beta',
          items: [
            { text: 'Join the beta', link: '/guide/beta' },
            { text: 'FAQ', link: '/guide/faq' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'discord', link: BETA_URL, ariaLabel: 'Sipquel on Discord' },
      { icon: 'github', link: 'https://github.com/OpenSurface', ariaLabel: 'OpenSurface on GitHub' },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },

    footer: {
      message: 'Dose. Grind. Brew. Remember.',
      copyright: `© ${new Date().getFullYear()} Sipquel`,
    },
  },
})
