// Settings shared by the config and the pages.
//
// BETA_URL: the Slack invite for the beta. While it is empty, every
// "Join the beta" button opens /guide/beta instead.
export const BETA_URL = ''
export const betaLink = () => BETA_URL || '/guide/beta'
