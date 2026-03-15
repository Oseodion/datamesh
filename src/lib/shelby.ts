import { ShelbyClient } from '@shelby-protocol/sdk/browser'

export const shelbyClient = new ShelbyClient({
  network: 'testnet' as any,
  apiKey: import.meta.env.VITE_SHELBY_TESTNET_KEY,
})

export const shelbynetClient = new ShelbyClient({
  network: 'shelbynet' as any,
  apiKey: import.meta.env.VITE_SHELBY_SHELBYNET_KEY,
})
