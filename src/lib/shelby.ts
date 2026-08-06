import { Network } from '@aptos-labs/ts-sdk'
import { ShelbyClient } from '@shelby-protocol/sdk/browser'

export const shelbynetClient = new ShelbyClient({
  network: Network.SHELBYNET,
  apiKey: import.meta.env.VITE_SHELBY_SHELBYNET_KEY,
})
