# HolyMarket 🎯

A prediction market application built as a Farcaster Mini App on Base Sepolia testnet.

## Features

- 🎲 **Prediction Markets** - Bet YES or NO on various outcomes
- 💰 **Points System** - Earn points for participation
- 👥 **Referral Program** - Invite friends and earn bonus points
- 📊 **Leaderboard** - Compete with other predictors
- 🔔 **Notifications** - Get notified about market results

## Tech Stack

- **Frontend:** Next.js 14, React 19, TailwindCSS 4
- **Blockchain:** Base Sepolia, Viem, Wagmi
- **Wallet:** RainbowKit, WalletConnect
- **Platform:** Farcaster Mini App SDK

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
# See ENV_TEMPLATE.md for all available variables
```

### Environment Variables

Create a `.env.local` file with the following required variables:

```bash
# WalletConnect Project ID (Required for wallet connections)
# Get yours at: https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# App URL
NEXT_PUBLIC_MINIAPP_URL=https://www.baseappholymarket.xyz
```

See `ENV_TEMPLATE.md` for the complete list of environment variables.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Farcaster Integration

The app includes full Farcaster Mini App integration:

- **Manifest:** `/.well-known/farcaster.json`
- **Webhook:** `/api/farcaster/webhook`
- **Notifications:** Push notifications for market updates

## Smart Contract

The prediction market smart contract is deployed on Base Sepolia:

```
Address: 0xd2424429bd9b9254b99b81a651c582b9897be880
```

## License

MIT
