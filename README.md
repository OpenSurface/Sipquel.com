# sipquel.com

The public website for **Sipquel**, a touchscreen that runs your coffee bar: scale, grinder and espresso machine, live brews and an automatic journal.

The site is built with [VitePress](https://vitepress.dev) and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`. It is served at **https://sipquel.com** (see `docs/public/CNAME`).

## Work on it locally

```bash
npm install
npm run docs:dev      # http://localhost:5173
npm run docs:build    # output in docs/.vitepress/dist
```

## Where things are

| Path | What |
|---|---|
| `docs/index.md` | The home page; it renders `theme/Home.vue` |
| `docs/guide/` | The guide pages |
| `docs/.vitepress/config.mts` | Navigation, sidebar, share card and meta tags |
| `docs/.vitepress/theme/site.ts` | **`BETA_URL`**: the Discord invite every beta button opens |
| `docs/.vitepress/theme/custom.css` | The Sipquel look (colours, type, layout) |
| `docs/public/` | Images, logo, favicon, share card, CNAME |

The Sipquel firmware itself lives in a separate, private repository.
