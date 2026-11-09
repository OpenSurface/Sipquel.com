// Settings shared by the config and the pages.
//
// BETA_URL: the Sipquel Discord invite. Every "Join the beta" button and the
// navigation link open it in a new tab. If it is ever emptied, the buttons
// fall back to /guide/beta.
export const BETA_URL = 'https://discord.gg/mCAuV6bRP'
export const betaLink = () => BETA_URL || '/guide/beta'
export const GITHUB_URL = 'https://github.com/OpenSurface'
