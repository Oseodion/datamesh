#!/usr/bin/env node
// Uploads local files to Shelby shelbynet using an Account (private key) signer.
// Requires @shelby-protocol/sdk >=0.6.0 and @aptos-labs/ts-sdk (already in package.json).
//
// Usage:
//   SHELBY_PRIVATE_KEY=0x... node scripts/upload-to-shelbynet.mjs <file> [file2 ...] [--expires <days>] [--fund]
//
// or, with Node 20.6+, keep the key in a local .env (already gitignored):
//   node --env-file=.env scripts/upload-to-shelbynet.mjs ./photo.png --expires 30
//
// Env vars:
//   SHELBY_PRIVATE_KEY   (required) Ed25519 private key, hex, with or without 0x prefix
//   SHELBY_API_KEY       (optional) API key for the shelbynet RPC/indexer.
//                         Note: this script does NOT read `shelby init`'s
//                         ~/.shelby/config.yaml — that key only configures the
//                         `shelby` CLI. Export SHELBY_API_KEY separately (or
//                         copy the same key value into it) for this script.

import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { Account, Ed25519PrivateKey, Network } from '@aptos-labs/ts-sdk'
import { ShelbyClient } from '@shelby-protocol/sdk/node'

const DEFAULT_EXPIRATION_DAYS = 30
// Matches the amounts used in the SDK's own fundAccountWith* examples.
const FUND_APT_OCTAS = 100_000_000
const FUND_SHELBYUSD_AMOUNT = 100_000_000

function printUsage() {
  console.log(`
Usage: node scripts/upload-to-shelbynet.mjs <file> [file2 ...] [options]

Options:
  --expires <days>   Expiration in days from now (default: ${DEFAULT_EXPIRATION_DAYS})
  --fund              Fund the account with APT + ShelbyUSD from the shelbynet faucet before uploading
  -h, --help          Show this help

Required environment variable:
  SHELBY_PRIVATE_KEY  Ed25519 private key (hex, with or without 0x prefix)

Optional environment variable:
  SHELBY_API_KEY      API key for the shelbynet RPC/indexer (not read from
                      ~/.shelby/config.yaml — that's the shelby CLI's own
                      config; export SHELBY_API_KEY separately for this script)

Example:
  SHELBY_PRIVATE_KEY=0xabc... node scripts/upload-to-shelbynet.mjs ./photo.png ./notes.txt --expires 30 --fund
`)
}

function parseArgs(argv) {
  const files = []
  let expirationDays = DEFAULT_EXPIRATION_DAYS
  let fund = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--expires') {
      const value = Number(argv[++i])
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`Invalid --expires value: ${argv[i]}`)
      }
      expirationDays = value
    } else if (arg === '--fund') {
      fund = true
    } else if (arg === '-h' || arg === '--help') {
      printUsage()
      process.exit(0)
    } else {
      files.push(arg)
    }
  }

  return { files, expirationDays, fund }
}

async function main() {
  const { files, expirationDays, fund } = parseArgs(process.argv.slice(2))

  if (files.length === 0) {
    printUsage()
    process.exit(1)
  }

  const privateKeyHex = process.env.SHELBY_PRIVATE_KEY
  if (!privateKeyHex) {
    console.error('Missing SHELBY_PRIVATE_KEY environment variable. Run with --help for usage.')
    process.exit(1)
  }

  const account = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(privateKeyHex),
  })
  const address = account.accountAddress.toString()
  console.log(`Signing as ${address}`)

  const apiKey = process.env.SHELBY_API_KEY
  if (!apiKey) {
    console.warn('Warning: SHELBY_API_KEY is not set — requests will be anonymous and may be rate-limited.')
  }

  // 0.6.0 requires writes to resolve a location (region) hint, or the on-chain
  // commit aborts with "No write location could be resolved". Shelbynet
  // currently only advertises one location, but we resolve it dynamically
  // (same approach as `shelby locations`) rather than hardcoding the name.
  // This lookup client must carry the same apiKey as the main client below —
  // otherwise it goes out unauthenticated and hits anonymous rate limits.
  const bootstrapClient = new ShelbyClient({ network: Network.SHELBYNET, apiKey })
  const locations = await bootstrapClient.metadata.getLocationNames()
  if (locations.length === 0) {
    console.error('No Shelby write locations are currently available on shelbynet.')
    process.exit(1)
  }
  const locationHint = locations[0]
  console.log(`Using write location: ${locationHint}`)

  const client = new ShelbyClient({
    network: Network.SHELBYNET,
    apiKey,
    locationHint,
  })

  if (fund) {
    console.log('Funding account from the shelbynet faucet...')
    await client.fundAccountWithAPT({ address: account.accountAddress, amount: FUND_APT_OCTAS })
    await client.fundAccountWithShelbyUSD({ address: account.accountAddress, amount: FUND_SHELBYUSD_AMOUNT })
    console.log('Funding complete.')
  }

  const blobs = await Promise.all(
    files.map(async (path) => {
      const data = await readFile(path)
      return { blobName: basename(path), blobData: new Uint8Array(data) }
    })
  )

  const expirationMicros = Date.now() * 1000 + expirationDays * 24 * 60 * 60 * 1_000_000

  console.log(`Uploading ${blobs.length} file(s), expiring in ${expirationDays} day(s):`)
  for (const blob of blobs) console.log(`  - ${blob.blobName} (${blob.blobData.byteLength} bytes)`)

  await client.batchUpload({
    blobs,
    expirationMicros,
    signer: account,
  })

  console.log('\nUpload complete.')
  console.log(`View your wallet activity: https://explorer.shelby.xyz/shelbynet/account/${address}`)
}

main().catch((err) => {
  console.error('\nUpload failed:', err?.message || err)
  process.exit(1)
})
