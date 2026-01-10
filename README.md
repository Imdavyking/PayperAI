# 🤖 PayperAI

**Your AI Agent for the Movement Blockchain — No Crypto Experience Required**

Login with **email or social media**, chat with AI, and execute real blockchain transactions.
No wallets to install. No seed phrases. No Web3 knowledge.

---

## 💡 What Makes PayperAI Special

### 🌐 True Web2 UX for Web3

- **Login with Email / Google / Twitter / GitHub / Discord** (Privy)
- **Auto-created Movement wallet**
- **Embedded wallet** (no browser extensions)
- **Zero blockchain learning curve**

---

### 🧠 Natural Language Blockchain

Just talk to the AI:

```
You: "Send 10 MOVE to 0x123..."
AI: ✅ Transfer complete!

You: "Create a meme coin called DogeCoin"
AI: ✅ Token deployed!

You: "Transfer 500 DOGE to my friend"
AI: ✅ Sent!
```

---

### 📚 Movement Docs AI Search (RAG)

PayperAI is **not just transactional** — it’s also a **Movement knowledge assistant**.

You can ask questions like:

```
"How does Movement differ from Aptos?"
"What is a primary store in Move?"
"Explain Movement's object model"
"How do I deploy a Move contract on Movement?"
```

**How it works:**

- 🔍 Scrapes & indexes **Movement official docs**

  - [https://docs.movementnetwork.xyz](https://docs.movementnetwork.xyz)

- 🧠 Uses **Retrieval-Augmented Generation (RAG)**
- 📄 Semantic vector search with embeddings
- 💬 Answers grounded in **official documentation**
- ❌ No hallucinations
- ✅ Source-aware responses

This allows:

- Developers to learn Movement faster
- Non-crypto users to ask questions in plain English
- A unified **Learn + Execute** experience in one chat

---

### 💸 Powered by x402 Micropayments

- Pay **0.01 MOVE per AI query** with **GPT‑4o‑mini**
- Pay **0.02 MOVE per AI query** with **GPT‑4o**
- No subscriptions
- No lock-in
- Sustainable AI-as-a-Service
- First **real x402 monetization** on Movement

---

### 🔐 Secure & Simple

- Social login via **Privy**
- Embedded wallet per user
- Explicit transaction approvals
- No private key exposure

---

## 🎯 Why This Matters

### For Non-Crypto Users

No need to:

- ❌ Install wallets
- ❌ Save seed phrases
- ❌ Understand gas
- ❌ Learn blockchain jargon

Just:

- ✅ Login
- ✅ Chat
- ✅ Approve actions

---

### For the Movement Ecosystem

- Massive onboarding unlock
- Web2 → Web3 bridge
- Real-time AI + blockchain use case
- Docs become interactive & conversational
- First x402-powered AI agent on Movement

---

### For Developers

- AI agent framework for Move chains
- **Privy + x402 + LangChain + RAG**
- Conversational memory
- Tool-based execution
- Reusable architecture

---

## 🚀 How It Works

```
User Login (Privy)
   ↓
Embedded Movement Wallet
   ↓
Chat Interface
   ↓
x402 Micropayment
   ↓
AI Agent (LangChain + GPT-4o-mini)
   ↓
┌───────────────┬────────────────────┐
│ Tool Execution│ Docs RAG Search     │
│ (Transfers,  │ (Movement Docs)     │
│ Tokens, etc) │                      │
└───────────────┴────────────────────┘
   ↓
Movement Testnet
```

Conversation memory is preserved across turns.

---

## 🧩 Core Components

### 1️⃣ Authentication & Wallets (Privy)

- Email & social login
- Embedded wallet
- Auto-created Movement (Aptos-based) wallet
- No extensions

---

### 2️⃣ AI Agent (Backend)

- **LangChain**
- **GPT-4o**
- **GPT-4o-mini**
- Tool calling for intent detection
- Session-based memory
- Smart routing between:
  - Blockchain tools
  - Docs RAG search
---

### 3️⃣ Movement Docs RAG Engine

- Scraped from:

  - [https://docs.movementnetwork.xyz](https://docs.movementnetwork.xyz)

- Vector embeddings
- Semantic search
- Context injection into LLM
- Accurate, source-grounded answers

---

### 4️⃣ x402 Paywall

- Pay per query
- MOVE token micropayments
- `x402plus` + Stableyard facilitator
- Sustainable AI revenue model

---

### 5️⃣ Smart Contracts (Movement Testnet)

- Meme Coin Factory
- MOVE transfers
- Fungible asset operations

---

### 6️⃣ Frontend

- React + TypeScript
- ChatGPT-style UI
- Real-time tx feedback
- Responsive design

---

## 🎯 Supported Commands

| Category       | Example                                                              |
| -------------- | -------------------------------------------------------------------- |
| Send MOVE      | “Send 5 MOVE to 0x123…”                                              |
| Deploy Token   | “Create a token called MyToken with symbol MTK and 1 million supply” |
| Transfer Token | “Transfer 100 DOGE to 0x456…”                                        |
| Docs Search    | “Explain Movement object model”                                      |
| Docs Search    | “How does Movement handle parallel execution?”                       |

---

## 🔥 Key Features

### ⚡ Seamless Onboarding

```
Traditional dApp: 10–15 minutes
PayperAI: 30 seconds
```

---

### 💬 Conversational Flow

```
You: Create a coin called CatCoin
AI: What symbol and supply?
You: CAT, 1 million
AI: ✅ CatCoin deployed
```

---

### 📚 Learn + Execute in One Place

- Ask how something works
- Deploy it immediately
- No tab switching
- No docs hunting

---

## 🛠 Tech Stack

**Auth & Wallets**

- Privy

**AI**

- LangChain
- OpenAI GPT-4o-mini
- OpenAI GPT-4o (advanced)
- RAG (vector search)

**Payments**

- x402
- MOVE token

**Blockchain**

- Movement Network
- MoveVM
- Move smart contracts

**Frontend**

- React
- TypeScript

---

## 🚀 Quick Start (Developers)

```bash
git clone https://github.com/Imdavyking/PayperAI.git
cd PayperAI

# Backend
cd backend
yarn install
cp .env.example .env
yarn dev

# Frontend
cd ../frontend
yarn install
cp .env.example .env
yarn dev
```

Open:
👉 [http://localhost:3000](http://localhost:3000)

---

## 📜 Smart Contract

**Meme Coin Factory (Movement Testnet)**

```move
public entry fun create_meme_coin(
    creator: &signer,
    name: vector<u8>,
    symbol: vector<u8>,
    initial_supply: u64,
) { ... }
```

**Address:**

```
0xf4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f
```

---

## 🔮 Roadmap

- 🎤 Voice commands
- 🌐 Multi-chain (Aptos, Sui)
- 💱 DeFi via chat
- 🖼 NFT minting
- 📊 Simulations & previews
- 📱 Mobile app
- 🔔 Notifications
- 🤖 Proactive AI suggestions

---

## 🏆 Why PayperAI Wins

| Feature      | Traditional dApps | PayperAI     |
| ------------ | ----------------- | ------------ |
| Login        | Wallet install    | Social login |
| Docs         | Read manually     | Ask AI       |
| Interaction  | Forms & clicks    | Chat         |
| Monetization | Subscriptions     | x402         |
| Audience     | Crypto-native     | Everyone     |

---

## 🙏 Built With

- Movement Network
- Privy
- x402 Protocol
- LangChain
- OpenAI

---

## 📧 Contact

Built with ❤️ for **Movement M1 Hackathon**

---

_Making blockchain usable, learnable, and executable — one conversation at a time._ 💬⚡

---
