// x402-compliant server with USDC (SPL Token) payments
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { x402Paywall } from "x402plus";
import dotenv from "dotenv";
import { runAIAgent } from "./agent";
import { HumanMessage } from "@langchain/core/messages";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

const amountRequired = process.env.AMOUNT_REQUIRED || "1000000"; // 0.01 MOVE

app.use(
  x402Paywall(
    process.env.MOVEMENT_PAY_TO as string,
    {
      "POST /api/ai-agent": {
        network: "movement-testnet",
        asset: "0x1::aptos_coin::AptosCoin",
        maxAmountRequired: amountRequired,
        description: "AI Agent Access",
        mimeType: "application/json",
        maxTimeoutSeconds: 600,
      },
    },
    {
      url: "https://facilitator.stableyard.fi",
    }
  )
);

app.post("/api/ai-agent", async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      res.status(400).json({
        error: "Missing required fields: task",
      });
      return;
    }

    const generateActions = await runAIAgent([new HumanMessage(task)]);
    res.json(generateActions);
  } catch (error) {
    console.error("Error in /api/ai-agent:", error);
    res.status(500).json({
      error: `Internal server error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
});
app.listen(PORT, () => console.log(`x402 USDC server listening on :${PORT}`));
