# SajuChain (사주체인) 🐉

**AI-Powered Saju (Four Pillars) Analysis & NFT Minting on Solana**

SajuChain provides modern interpretation of traditional Korean Saju (Four Pillars of Destiny) using AI and permanently records your destiny on the Solana Blockchain as an NFT.

## Features

- **🔮 AI Interpretation**: Generates personalized fortune analysis based on birth data using GPT-4o.
- **⚡ Solana Wallet Integration**: Supports Phantom, Solflare, etc., via Solana Wallet Adapter.
- **🎨 Dynamic NFT**: Mints a unique NFT card with visuals based on your Dominant Element (Wood, Fire, Earth, Metal, Water).
- **🪙 Compressed NFT (cNFT)**: Optimized for low cost using Metaplex & Irys (formerly Bundlr).
- **🌓 Lunar Calendar Support**: Accurate calculation for Lunar birthdates using `lunar-javascript`.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Blockchain**: Solana Web3.js, Metaplex SDK
- **AI**: OpenAI API

## Getting Started

### 1. Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Solana Wallet (e.g., Phantom)
- OpenAI API Key

### 2. Installation

```bash
git clone https://github.com/yourusername/sajuchain.git
cd sajuchain
pnpm install
```

### 3. Environment Setup

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

**Required Variables in `.env.local`**:
- `OPENAI_API_KEY`: Your OpenAI API Key.
- `NEXT_PUBLIC_SOLANA_RPC_URL`: https://api.devnet.solana.com
- `NEXT_PUBLIC_MOCK_MINT`: Set to `true` to test minting without a wallet/funds.
- `NEXT_PUBLIC_TREASURY_WALLET`: Real treasury wallet address for SOL payment settlement.
- `STRIPE_SECRET_KEY`: Stripe secret key for server-side checkout session creation.
- `NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID`: Stripe Price ID for premium report checkout.
- `NEXT_PUBLIC_SITE_URL` (optional): Base URL used for checkout success/cancel redirects.

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy easily on Vercel:

1. Push code to GitHub.
2. Import project in Vercel.
3. Add **Environment Variables** in Vercel Project Settings.
4. Deploy!

## License

MIT
