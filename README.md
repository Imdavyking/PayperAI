# 🤖 PayperAI

**Your AI Agent for Movement Blockchain - No Crypto Experience Required**

Just login with **email or social media**, chat with AI, and execute blockchain transactions. No wallets to install. No seed phrases to remember. No Web3 knowledge needed.

---

## 💡 What Makes PayperAI Special

### 🌐 **True Web2 UX for Web3**

- **Login with Email/Google/Twitter** - Powered by Privy
- **Auto-created Movement wallet** - No setup required
- **Embedded wallet** - No browser extensions needed
- **Zero blockchain knowledge** - Just chat naturally

### 🧠 **Natural Language Blockchain**

Just talk to the AI:

```
You: "Send 10 MOVE to 0x123..."
AI: ✅ Transfer complete!

You: "Create a meme coin called DogeCoin"
AI: ✅ Token deployed!

You: "Transfer 500 DOGE to my friend"
AI: ✅ Sent!
```

### 💸 **Powered by x402 Micropayments**

- Pay **0.01 MOVE per AI query**
- No subscriptions or signups
- Sustainable AI-as-a-Service model
- First practical x402 monetization on Movement

### 🔐 **Secure & Simple**

- Social login via **Privy** (email, Google, Twitter, GitHub, Discord)
- Automatic Movement wallet creation
- Every transaction requires approval
- No private key exposure

---

## 🎯 Why This Matters

### **For Non-Crypto Users:**

No need to:

- ❌ Install wallet extensions
- ❌ Remember seed phrases
- ❌ Understand gas fees
- ❌ Learn blockchain terminology

Just:

- ✅ Login with email/social
- ✅ Chat with AI
- ✅ Execute transactions

### **For the Movement Ecosystem:**

- Lowers adoption barrier drastically
- Onboards Web2 users to Web3 seamlessly
- Showcases Movement's speed for real-time AI interactions
- Demonstrates practical x402 use cases

### **For Developers:**

- First **AI agent framework** on Movement
- **Privy + x402 + LangChain** integration template
- Reusable conversation memory system
- Multi-tool execution pipeline

---

## 🚀 How It Works

```
User Login (Privy) → Auto-create Movement Wallet → Chat Interface →
x402 Payment → AI Agent (GPT-4o-mini + LangChain) →
Tool Selection → Smart Contract → Movement Testnet
         ↓
  Conversation Memory
```

### Core Components

1. **Authentication & Wallets (Privy)**

   - Social login (email, Google, Twitter, GitHub, Discord)
   - Embedded wallet creation
   - Automatic Movement (Aptos) wallet setup
   - No browser extensions required

2. **AI Agent (Backend)**

   - LangChain + OpenAI GPT-4o-mini
   - Tool calling for intent parsing
   - Session-based conversation memory

3. **x402 Paywall**

   - Micropayments in MOVE tokens
   - `x402plus` library + Stableyard facilitator
   - Pay-per-query revenue model

4. **Smart Contracts (Movement Testnet)**

   - Meme Coin Factory module
   - Native MOVE transfers
   - Fungible Asset operations

5. **Frontend**
   - ChatGPT-style interface
   - Real-time transaction feedback
   - Responsive design

---

## 🎯 Supported Commands

| Command Type       | Example Input                                                        |
| ------------------ | -------------------------------------------------------------------- |
| **Send MOVE**      | "Send 5 MOVE to 0x123..."                                            |
| **Deploy Token**   | "Create a token called MyToken with symbol MTK and 1 million supply" |
| **Transfer Token** | "Transfer 100 DOGE to 0x456..."                                      |

The AI uses conversation context to auto-fill details when possible.

---

## 🔥 Key Features

### **1. Seamless Onboarding**

```
Traditional dApp:
1. Install wallet extension (5 min)
2. Create wallet (2 min)
3. Save seed phrase (3 min)
4. Fund wallet (varies)
5. Connect to dApp (1 min)
Total: 11+ minutes ⏱️

PayperAI:
1. Login with email/social (30 sec)
2. Start chatting
Total: 30 seconds ✨
```

### **2. Conversational Flow**

```
You: "Create a coin called CatCoin"
AI: "Got it! What symbol and supply would you like?"
You: "Symbol CAT, 1 million supply"
AI: "Deploying... ✅ CatCoin (CAT) created at 0x..."
```

### **3. x402 Monetization**

- Pay per query, not subscription
- Sustainable AI agent revenue model
- First practical x402 implementation
- Demonstrates micropayment viability for AI services

### **4. Multi-Function AI**

- 💰 Send MOVE tokens
- 🪙 Deploy meme coins
- 🔄 Transfer fungible assets
- 📊 Check balances (coming soon)
- 💱 Swap tokens (coming soon)

---

## 🛠 Tech Stack

**Authentication & Wallets:**

- 🔐 **Privy** - Social login & embedded wallets
- 🌐 Email, Google, Twitter, GitHub, Discord login
- 💼 Auto-created Movement (Aptos) wallets

**AI & Backend:**

- 🤖 LangChain - Tool orchestration
- 🧠 OpenAI GPT-4o-mini - Intent parsing
- 💬 Session-based conversation memory
- 💸 x402plus - Micropayment integration

**Blockchain:**

- ⚡ Movement Network (MoveVM)
- 📝 Move language smart contracts
- 🪙 Meme Coin Factory module
- 🔄 Fungible Asset transfers

**Frontend:**

- ⚛️ React + TypeScript
- 🎨 ChatGPT-style interface
- 📱 Responsive design

---

## 🚀 Quick Start

### For Users (No Setup Required)

1. Visit **[PayperAI](#)** (your deployed link)
2. Click **"Login with Privy"**
3. Choose email or social login (Google, Twitter, GitHub)
4. Start chatting! Your Movement wallet is auto-created in the background

### For Developers

```bash
git clone https://github.com/Imdavyking/PayperAI.git
cd PayperAI

# Backend
cd backend
yarn install
cp .env.example .env
# Add: OPENAI_API_KEY, MOVEMENT_PAY_TO, PRIVY_APP_SECRET

# Frontend
cd ../frontend
yarn install
# Add PRIVY_APP_ID to .env

# Run
yarn dev
```

Open http://localhost:3000 → Login with Privy → Start chatting!

---

## 🏆 What Makes This Unique

| Feature             | Traditional dApps           | PayperAI              |
| ------------------- | --------------------------- | --------------------- |
| **Login**           | Install wallet extension    | Email/social login    |
| **Wallet Setup**    | Manual + seed phrase        | Auto-created          |
| **Interaction**     | Click buttons, fill forms   | Natural language chat |
| **Learning Curve**  | High (gas, addresses, ABIs) | Zero                  |
| **Onboarding Time** | 10+ minutes                 | 30 seconds            |
| **Target Audience** | Crypto-native users         | Everyone              |
| **Monetization**    | Subscriptions/ads           | x402 micropayments    |

---

## 📸 Demo Flow

### 1. Login (Privy Integration)

```
Click "Connect Wallet" → Choose login method:
- 📧 Email (passwordless)
- 🔵 Google
- 🐦 Twitter
- 🐙 GitHub
- 🎮 Discord

→ Privy creates embedded Movement wallet automatically
→ No wallet installation required
```

### 2. Chat & Execute

```
You: "Send 5 MOVE to 0xabc123..."
AI: "I'll send 5 MOVE to 0xabc123... Please approve the transaction."

[Wallet approval popup appears]
✅ Approved

AI: "✅ Transaction complete! Hash: 0xdef456..."
```

### 3. Deploy Tokens

```
You: "Create a meme coin called MoonDoge"
AI: "What symbol and initial supply?"
You: "Symbol MDOGE, 10 million supply"
AI: "Deploying MoonDoge (MDOGE)... ✅ Deployed at 0x789xyz..."
```

---

## 🌟 Innovation Highlights

### **1. First AI Agent Monetized via x402 on Movement** 💸

- Demonstrates practical micropayment use case
- Sustainable pay-per-query model
- Novel revenue mechanism for AI services

### **2. Web2 UX Meets Web3 Functionality** 🌉

- Privy social login removes crypto barriers
- No wallet installation required
- Onboards non-crypto users seamlessly

### **3. Natural Language Blockchain Interface** 🗣️

- LangChain tool orchestration
- GPT-4 intent parsing
- Conversation memory for multi-turn dialogues

### **4. Production-Ready Implementation** ✅

- Deployed on Movement testnet
- Working smart contracts
- End-to-end transaction flow
- Real x402 payment integration

---

## 📜 Smart Contract

**Meme Coin Factory** – Deployed on Movement Testnet

```move
module meme_coin_factory::message {
    // Creates customizable fungible assets
    // Auto-mints initial supply to creator
    // Enables primary stores for transfers

    public entry fun create_meme_coin(
        creator: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        initial_supply: u64,
    ) { ... }
}
```

**Contract Address:** `0xf4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f`

**Verified on:** Movement Testnet Explorer

---

## 🔮 Future Roadmap

- [ ] 🎤 Voice input ("Hey PayperAI, send 10 MOVE to Alice")
- [ ] 🌐 Multi-chain support (Aptos, Sui)
- [ ] 💱 DeFi operations (swap, stake, farm via chat)
- [ ] 🖼️ NFT minting through conversation
- [ ] 📊 Transaction simulation & gas optimization
- [ ] 📈 Analytics dashboard
- [ ] 📱 Mobile app (iOS/Android)
- [ ] 🔔 Push notifications for transaction status
- [ ] 🤖 Advanced AI: predict user intent, suggest actions

---

## 🎬 Demo Video

**Watch 2-minute demo:** [Coming Soon]

See PayperAI in action:

- ✅ Social login (no wallet install)
- ✅ Natural language commands
- ✅ x402 payment flow
- ✅ Live token deployment
- ✅ Real-time transaction execution

---

## 🤝 For Hackathon Judges

### **Why PayperAI Stands Out:**

1. **Lowers Blockchain Adoption Barrier**

   - Privy integration enables Web2 users to interact with Movement
   - No crypto knowledge required
   - Onboarding time reduced from 10+ minutes to 30 seconds

2. **Novel x402 Use Case**

   - First AI-as-a-Service monetized via micropayments
   - Demonstrates sustainable revenue model
   - Goes beyond basic content paywalls

3. **Technical Innovation**

   - Combines Privy + x402 + LangChain + Movement
   - Multi-tool AI agent with conversation memory
   - Production-ready implementation

4. **Ecosystem Impact**
   - Shows Movement's capability for real-time AI interactions
   - Provides framework for other conversational dApps
   - Demonstrates MoveVM's speed advantages

---

## 🙏 Built With

- [Movement Network](https://movementlabs.xyz/) - Fast, low-cost MoveVM L2
- [Privy](https://privy.io/) - Social login & embedded wallets
- [x402 Protocol](https://x402.org/) - Blockchain micropayments
- [LangChain](https://langchain.com/) - AI agent framework
- [OpenAI](https://openai.com/) - GPT-4o-mini

---

## 📧 Contact

Built with ❤️ for the Movement M1 Hackathon

- **GitHub:** [@Imdavyking](https://github.com/Imdavyking)
- **Demo:** [Coming Soon]
- **Contract:** `0xf4d68c54a7f54731dda866f211359ee492aeee9c5eb6c6b9f220394a30652d4f`

---

## 🎯 Try It Now!

**No crypto experience required. Just login and start chatting.**

👉 **[Launch PayperAI](#)** 👈

---

## 🤝 Contributing

We welcome contributions! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit PRs
- ⭐ Star the repo

---

_Making blockchain accessible to everyone, one conversation at a time._ 💬⚡

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

**Built for Movement M1 Hackathon | Powered by Privy, x402, and Movement Network**

---
