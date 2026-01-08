# 🤖 PayperAI

**Your AI Agent for the Movement Blockchain. Chat to Execute Transactions.**

PayperAI is a natural-language AI agent that lets anyone interact with the Movement Network using simple chat commands. Send tokens, deploy meme coins, transfer assets — all without touching complex wallets or writing code.

Built for the **Movement M1 Hackathon** by Encode Club.

---

## 💡 What It Does

Just chat with the AI:

**You:** "Send 10 MOVE to 0x123..."  
**AI:** Prepares and executes the transfer ✅

**You:** "Create a meme coin called DogeCoin with symbol DOGE and 1 million supply"  
**AI:** Deploys the token contract on Movement ✅

**You:** "Transfer 500 DOGE to 0x456..."  
**AI:** Completes the fungible asset transfer ✅

---

## 🚀 Why PayperAI?

- 🧠 **Natural Language Interface** – No blockchain knowledge required
- 💬 **Conversational Memory** – Remembers context across messages
- ⚡ **Multi-Function** – Native MOVE transfers, meme coin deployment, FA transfers
- 🔐 **Secure** – Every transaction requires explicit wallet approval
- 💸 **Monetized with x402** – Pay-per-use micropayments for AI access (novel revenue model)
- 🎯 **Built on Movement** – Leverages fast, low-cost MoveVM transactions

---

## 🏆 Hackathon Tracks

PayperAI targets the following **Movement M1 Hackathon** tracks:

- **Best x402 App on Movement** (Primary) – Uses x402 payment rails for pay-per-query access to the AI agent
- **Best Consumer App Built on Movement** – Exceptional UX and onboarding for everyday users
- **Best New Devex Tool on Movement** – Simplifies blockchain interactions for developers and users
- **The People's Choice** – Innovative AI + blockchain combo with viral potential

---

## 🛠 Architecture

```
User Chat → Frontend → x402 Paywall → AI Agent (GPT-4o-mini + LangChain) → Tool Selection → Smart Contract → Movement Testnet
                                          ↓
                                   Conversation Memory
```

### Core Components

1. **AI Agent (Backend)**

   - LangChain + OpenAI GPT-4o-mini
   - Tool calling for intent parsing
   - Session-based memory

2. **x402 Paywall**

   - Protects AI endpoint with micropayments in MOVE
   - Uses `x402plus` library + Stableyard facilitator
   - Pay-per-use model for sustainable revenue

3. **Smart Contracts (Movement Testnet)**

   - Meme Coin Factory module
   - Native MOVE transfers
   - Fungible Asset operations

4. **Frontend**
   - React chat UI
   - Wallet integration (Nightly / Pontem)
   - Real-time transaction feedback

---

## 🎯 Supported Commands

| Command Type       | Example Input                                                        |
| ------------------ | -------------------------------------------------------------------- |
| **Send MOVE**      | "Send 5 MOVE to alice.move"                                          |
| **Deploy Token**   | "Create a token called MyToken with symbol MTK and 1 million supply" |
| **Transfer Token** | "Send 100 of my DOGE token to bob.move"                              |

The AI uses conversation context to auto-fill details when possible.

---

## 🔥 Key Features

### Conversational Flow

```
You: Create a coin called CatCoin
AI: Got it! What symbol and supply would you like?
You: Symbol CAT, 1 million supply
AI: Deploying... ✅ CatCoin (CAT) created!
```

### Intent Flexibility

Understands variations like:

- "Transfer X to Y"
- "Pay Y with X tokens"
- "Deploy a meme coin named Pepe"

### Transaction Safety

- Preview of action, parameters, and cost
- Wallet signature required for every tx
- No private key exposure

### x402 Monetization

- Users pay a small MOVE fee (~0.01) to access the AI agent
- Enables sustainable pay-per-use model
- Demonstrates real-world x402 utility beyond basic paywalls

---

## 🛠 Tech Stack

- **AI:** LangChain, OpenAI GPT-4o-mini
- **Blockchain:** Movement Network (MoveVM)
- **Smart Contracts:** Move language
- **Payments:** x402 protocol (`x402plus` library)
- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, TypeScript
- **Wallets:** Nightly, Pontem

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key
- Movement wallet (Nightly or Pontem recommended)

### Installation

```bash
git clone https://github.com/Imdavyking/PayperAI.git
cd PayperAI

# Backend
cd backend
yarn install
cp .env.example .env
# Add your OPENAI_API_KEY and MOVEMENT_PAY_TO address

# Frontend
cd ../frontend
yarn install
```

### Run Locally

```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

Open http://localhost:3000 → Connect wallet → Start chatting!

---

## 📹 Demo

[Insert your demo video link here – strongly recommended for submission!]

Show:

1. x402 payment flow (unpaid → pay MOVE → access granted)
2. Natural language interaction
3. Successful on-chain transaction (e.g., meme coin deploy)
4. Explorer confirmation

**Live Demo:** [Add deployed URL if available]  
**Contract Address:** `f4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f`

---

## 🔐 Security

- All transactions require user wallet signature
- Private keys never leave the browser
- AI cannot execute actions without approval
- x402 payments handled via trusted facilitator

---

## 🌟 Future Ideas

- Multi-chain support (Aptos, Sui)
- NFT minting via chat
- DeFi actions (swap, stake, lend)
- Voice input
- Advanced transaction simulation

---

## 📜 Smart Contract

**Meme Coin Factory** – Deployed on Movement Testnet

```move
module meme_coin_factory::message {
    // Creates customizable fungible assets
    // Auto-mints supply to creator
    // Enables primary stores
}
```

**Address:** `f4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f`

---

## 🤝 Contributing

Feel free to fork, improve, and submit PRs!

---

Built with ❤️ for the Movement ecosystem.
