# PayPerAI

**AI Agent + Blockchain Pay-per-Use (x402) on Movement**

PayPerAI is a developer-friendly AI agent SDK that allows users to create, register, and run AI-powered functions **securely on the Movement blockchain**, with **payment per request** via x402 blockchain transactions. Combine the power of AI and blockchain in a modular, on-chain framework.

---

## 🚀 Features

- **Pay-per-request AI**: Users pay on-chain (Movement blockchain) before each function execution.
- **User-defined functions**: Easily register custom AI tools with input validation using **Zod**.
- **On-chain verification**: Securely check x402 payments directly on Movement.
- **LangChain compatible**: Integrates with LangChain workflows.
- **Flexible pricing**: Set different prices for each function/tool.

---

## 💻 Installation

```bash
# Using npm
npm install payperai

# Or using yarn
yarn add payperai
```

---

## ⚡ Quick Start

### 1. Initialize Agent

```ts
import { X402BlockchainAgent, X402Error } from "payperai";

// Blockchain payment verification for Movement
const verifyPayment = async (txHash: string) => {
  // TODO: Implement x402 verification on Movement blockchain
  return true; // mock valid for now
};

const agent = new X402BlockchainAgent(verifyPayment);
```

### 2. Add a Function / Tool

```ts
import { z } from "zod";

agent.addFunction(
  "webSearch",
  z.object({ query: z.string() }),
  {
    price: "0.1",
    asset: "MOV", // Movement blockchain token
    chain: "movement", // Specify Movement chain
    recipient: "0xYourWallet",
  },
  async ({ query }) => {
    // Your AI logic here
    return `Results for ${query}`;
  }
);
```

### 3. Execute Tool with Payment Proof

```ts
const txHash = "0xabc123"; // Movement blockchain transaction hash

try {
  const result = await agent
    .getTools()[0]
    .func({ query: "AI news" }, undefined, {
      configurable: { paymentProof: { txHash } },
    });
  console.log("AI Result:", result);
} catch (err) {
  if (err instanceof X402Error) {
    console.error("Payment required:", err.payment);
  } else {
    console.error(err);
  }
}
```

---

## 📂 Example Folder Structure

```
payperai/
├─ src/
│  ├─ index.ts       # SDK entry point
│  ├─ agent.ts       # X402 Blockchain Agent class
│  └─ tools.ts       # Dynamic tools / functions
├─ README.md
└─ package.json
```

---

## 🛠 Roadmap

- ✅ User-defined AI functions
- ✅ x402 payment verification on Movement blockchain
- 🔲 Agent-level subscriptions and batch requests
- 🔲 Dashboard for payments and request history

---

## 💡 Notes

- PayPerAI **does not handle LangChain payments internally** — all payments are verified **on Movement blockchain**.
- Each function can have its **own price per request**.
- Designed to work **natively on Movement blockchain**, using MOV or other supported tokens.

---
