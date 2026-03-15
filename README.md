# DataMesh

A decentralized file storage marketplace built on the [Shelby Protocol](https://shelby.xyz) — co-developed by Aptos Labs and Jump Crypto, running on the DoubleZero fiber network.

## What it does

DataMesh lets users browse, download, and manage files stored on Shelby's decentralized network. Think of it as a decentralized marketplace for data — where anyone can upload files and make them available to the world.

## Features

- 🌐 **Explore** — Browse real files stored on the Shelby testnet network with search and download
- 📁 **My Files** — View your uploaded files (pending or written) with direct links to Shelby Explorer
- 💾 **Drive** — Personal storage dashboard with CLI upload guide
- 📈 **Earnings** — Track your uploaded files and storage usage
- 🔗 **Wallet Connect** — Petra wallet integration via Aptos wallet adapter

## Tech Stack

- **Frontend** — Vite + React + TypeScript
- **Storage Protocol** — Shelby Protocol SDK (`@shelby-protocol/sdk`)
- **Blockchain** — Aptos (Shelbynet + Testnet)
- **Wallet** — Petra via `@aptos-labs/wallet-adapter-react`
- **API** — Geomi RPC for authenticated Shelby indexer access

## Current Limitations

- Browser wallet signing for uploads is not yet supported by the Shelby SDK — uploads are done via CLI
- Paid file access requires Shelby payment channels which are coming in a future release
- Files uploaded via CLI appear as "Pending" until storage nodes fully write the data to the network

## How to Upload Files (CLI)
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
shelby upload ./yourfile.png yourfile.png --context shelbynet --expiration 2026-12-31
```

## Getting Started (Local Development)
```bash
git clone https://github.com/YOUR_USERNAME/datamesh
cd datamesh
pnpm install
pnpm dev
```

## Built on

- [Shelby Protocol](https://shelby.xyz) — Decentralized hot storage
- [Aptos Labs](https://aptoslabs.com)
- [DoubleZero](https://doublezero.xyz)
- [Jump Crypto](https://jumpcrypto.com)
