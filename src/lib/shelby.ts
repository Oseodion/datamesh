import { Network } from '@aptos-labs/ts-sdk'
import { ShelbyClient, type ShelbyObjectSummary } from '@shelby-protocol/sdk/browser'

export const shelbynetClient = new ShelbyClient({
  network: Network.SHELBYNET,
  apiKey: import.meta.env.VITE_SHELBY_SHELBYNET_KEY,
})

// The UI was written against the pre-0.9 blob rows (`blobNameSuffix`, `size`,
// `creationMicros`). The indexer now returns committed objects; map them back
// onto that shape so the pages can keep reading the same fields.
export type ShelbyFile = {
  name: string
  key: string
  blobNameSuffix: string
  size: number
  plaintextSize: number
  storedSize: number
  isWritten: true
  isDeleted: false
  owner: ShelbyObjectSummary['owner']
  creationMicros: number
  committedAtMicros: number
  locationName: string
}

export function toShelbyFile(object: ShelbyObjectSummary): ShelbyFile {
  return {
    name: object.name,
    key: object.key,
    blobNameSuffix: object.key,
    size: object.plaintextSize,
    plaintextSize: object.plaintextSize,
    storedSize: object.storedSize,
    isWritten: true,
    isDeleted: false,
    owner: object.owner,
    creationMicros: object.committedAtMicros,
    committedAtMicros: object.committedAtMicros,
    locationName: object.locationName,
  }
}

export async function listAccountFiles(account: string): Promise<ShelbyFile[]> {
  const objects = await shelbynetClient.index.listObjectsByPrefix({ owner: account })
  return objects.map(toShelbyFile)
}
