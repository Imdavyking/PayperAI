# 🤖 PayperAI

**Your AI Agent for Movement Blockchain. Chat to Execute Transactions.**

PayperAI lets you interact with Movement blockchain using natural language. No need to understand complex interfaces—just tell the AI what you want to do, and it handles the rest.

---

## 💡 What It Does

Talk to an AI agent that understands blockchain operations:

**User:** "Send 10 MOVE to 0x123..."  
**AI:** Executes the transfer ✅

**User:** "Create a meme coin called DogeCoin with symbol DOGE and 1 million supply"  
**AI:** Deploys the token contract ✅

**User:** "Transfer 500 of my token at 0xabc... to 0x456..."  
**AI:** Completes the transfer ✅

---

## 🚀 Why PayperAI?

- 🧠 **Natural Language Interface** - No blockchain expertise needed
- 💬 **Conversational Memory** - AI remembers your previous transactions
- ⚡ **Multi-Function** - Send tokens, deploy coins, transfer assets
- 🔐 **Secure** - All transactions require wallet approval
- 🎯 **Built on Movement** - Fast and cheap transactions

---

## 🏗 Architecture

```
User Input → AI Agent (GPT-4 + LangChain) → Tool Selection → Smart Contract → Transaction
                                ↓
                         Conversation Memory
```

### Components:

1. **AI Agent (Backend)**

   - LangChain + OpenAI GPT-4o-mini
   - Tool calling for transaction intent parsing
   - Session-based conversation memory

2. **Smart Contracts (Movement)**

   - Meme Coin Factory: `f4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f`
   - Native MOVE transfers
   - Fungible Asset transfers

3. **Frontend**
   - React chat interface
   - Wallet integration (Nightly, Pontem)
   - Real-time transaction status

---

## 🎯 Available Commands

The AI understands these intents:

| Command Type     | Example                                              |
| ---------------- | ---------------------------------------------------- |
| **Send MOVE**    | "Send 5 MOVE tokens to alice.move"                   |
| **Deploy Token** | "Create a token called MyToken (MTK) with 1M supply" |
| **Transfer FA**  | "Send 100 tokens from contract 0x... to bob.move"    |

The AI uses context from your conversation to fill in missing details!

---

## 🔥 Key Features

### 1. Conversational Context

```
You: "Create a coin called CatCoin"
AI: "Sure! What symbol and supply?"
You: "CAT with 1 million"
AI: ✅ Deploys token
```

### 2. Intent Recognition

The AI understands various phrasings:

- "Send X tokens to Y"
- "Transfer X to Y"
- "Pay Y with X tokens"

### 3. Transaction Verification

Before executing, AI shows:

- What action will be taken
- Transaction parameters
- Estimated cost

---

## 🛠 Tech Stack

- **AI Layer:** LangChain + OpenAI GPT-4o-mini
- **Blockchain:** Movement Labs (Aptos/Move)
- **Smart Contracts:** Move language
- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React.js + TypeScript
- **Wallet:** Nightly, Pontem

---

## 🚀 Getting Started

### Prerequisites

```bash
# You need:
- Node.js 18+
- OpenAI API key
- Movement wallet (Nightly/Pontem)
```

### 1. Clone & Install

```bash
git clone https://github.com/Imdavyking/PayperAI.git
cd PayperAI

# Backend
cd backend
yarn install
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Frontend
cd ../frontend
yarn install

# Contracts (already deployed)
# Address: f4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f
```

### 2. Run Locally

```bash
# Terminal 1 - Backend
cd backend
yarn dev

# Terminal 2 - Frontend
cd frontend
yarn dev
```

### 3. Try It Out

1. Open http://localhost:3000
2. Connect your Movement wallet
3. Start chatting: "Send 1 MOVE to [address]"

---

## 📋 How It Works

```typescript
// User types: "Create a meme coin called PepeCoin"

1. AI Agent receives message
2. LangChain parses intent → deployMemeCoin tool
3. AI asks for missing details (symbol, supply)
4. User provides details
5. Backend prepares transaction
6. Frontend prompts wallet approval
7. Transaction executes on Movement
8. AI confirms: "✅ PepeCoin (PEPE) deployed at 0x..."
```

---

## 🎬 Demo

[INSERT VIDEO/GIF HERE]

- Show chat interface
- Execute a transaction
- Show on-chain confirmation

**Live Demo:** [your-demo-url.com]  
**Contract Explorer:** [Movement Explorer Link]

---

## 🔐 Security

- All transactions require wallet signature
- AI cannot execute without user approval
- Private keys never touch the backend
- OpenAI API calls are stateless

---

## 🌟 Future Roadmap

- [ ] Multi-chain support (Aptos, Sui)
- [ ] NFT minting via chat
- [ ] DeFi operations (swap, stake)
- [ ] Voice commands
- [ ] Transaction simulation preview

---

## 📊 Smart Contract

**Deployed on Movement Testnet**

```move
module meme_coin_factory::message {
    // Creates fungible assets (tokens) with customizable:
    // - Name, Symbol, Supply
    // - Automatically mints to creator
    // - Primary store enabled
}
```

**Address:** `f4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f`

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch
3. Make your changes
4. Submit a PR

---

## 📬 Contact

Questions? Reach out or open an issue!

---
