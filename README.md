# DataMesh

A decentralized file storage marketplace built on the [Shelby Protocol](https://shelby.xyz), co-developed by Aptos Labs and Jump Crypto, running on the DoubleZero fiber network.

## What it does

DataMesh lets users browse, download, upload, and manage files stored on Shelby's decentralized network. Think of it as a decentralized marketplace for data, where anyone can upload files and make them available to the world.

## Features

- Explore: Browse real files stored on the Shelby testnet network with search and download
- My Files: View your uploaded files (pending or written) with direct links to Shelby Explorer
- Drive: Personal storage dashboard with upload guide
- Earnings: Coming soon
- Wallet Connect: Petra wallet integration via Aptos wallet adapter
- Browser Uploads: Upload files directly from the browser using the Shelby React SDK and a connected Petra wallet

## Tech Stack

- Frontend: Vite + React + TypeScript
- Storage Protocol: Shelby Protocol SDK (`@shelby-protocol/sdk`)
- React Integration: `@shelby-protocol/react` with `@tanstack/react-query`
- Blockchain: Aptos (Shelbynet)
- Wallet: Petra via `@aptos-labs/wallet-adapter-react`
- API: Geomi RPC for authenticated Shelby indexer access

## How to Upload Files

### Browser

Browser uploads are now supported directly in the app. Connect your Petra wallet, click Upload, select your files, and they will be uploaded to Shelbynet.

### CLI

```bash
# 1. Set up pnpm globals (first time only)
pnpm setup && source ~/.zshrc

# 2. Install Shelby CLI
pnpm add -g @shelby-protocol/cli

# 3. Initialize Shelby
shelby init

# 4. Fund your account (opens browser)
shelby faucet

# 5. Upload a file
shelby upload ~/path/to/file.png images/file.png -e "in 30 days" --assume-yes
```

## Environment Variables

- `VITE_SHELBY_SHELBYNET_KEY`: API key for Shelbynet access via the Aptos indexer and Shelby RPC. A missing key still allows anonymous reads, which are rate-limited.

## Getting Started (Local Development)

```bash
git clone https://github.com/YOUR_USERNAME/datamesh
cd datamesh
pnpm install
pnpm dev
```

## Built on

- [Shelby Protocol](https://shelby.xyz): Decentralized hot storage
- [Aptos Labs](https://aptoslabs.com)
- [DoubleZero](https://doublezero.xyz)
- [Jump Crypto](https://jumpcrypto.com)
