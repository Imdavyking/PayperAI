// x402-compliant server with USDC (SPL Token) payments
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { x402Paywall } from "x402plus";
import dotenv from "dotenv";
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
      "GET /api/premium-content": {
        network: "movement",
        asset: "0x1::aptos_coin::AptosCoin",
        maxAmountRequired: amountRequired,
        description: "Premium workshop content",
        mimeType: "application/json",
        maxTimeoutSeconds: 600,
      },
    },
    {
      url: "https://facilitator.stableyard.fi",
    }
  )
);

app.get("/api/premium-content", (_req, res) => {
  res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
});
app.listen(PORT, () => console.log(`x402 USDC server listening on :${PORT}`));
