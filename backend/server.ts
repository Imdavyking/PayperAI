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

const PRICE_USDC = 100;

const app = express();
app.use(cors()); // ✅ enable CORS for all origins
app.use(express.json());

app.use(
  x402Paywall(
    process.env.MOVEMENT_PAY_TO as string,
    {
      "GET /api/premium-content": {
        network: "movement",
        asset: "0x1::aptos_coin::AptosCoin",
        maxAmountRequired: "100000000",
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
app.listen(3001, () => console.log("x402 USDC server listening on :3001"));
