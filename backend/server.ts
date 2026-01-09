// x402-compliant server with USDC (SPL Token) payments
import express from "express";
import cors from "cors";
import { x402Paywall } from "x402plus";
import dotenv from "dotenv";
import { conversationMemory, runAIAgent } from "./agent";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { movementDocs } from "./docs_rag";
dotenv.config();

const PORT = process.env.PORT || 3000;
const PRICE_4MINI = process.env.AMOUNT_REQUIRED_MINI || "1000000"; // 0.01 MOVE;
const PRICE_4PRO = process.env.AMOUNT_REQUIRED_PRO || "2000000"; // 0.02 MOVE;

const app = express();
app.use(cors());
app.use(express.json());

movementDocs.initialize().then(() => {
  console.log("Movement Docs RAG initialized");
});

app.use(
  x402Paywall(
    process.env.MOVEMENT_PAY_TO as string,
    {
      "POST /api/ai-agent": {
        network: "movement-testnet",
        asset: "0x1::aptos_coin::AptosCoin",
        maxAmountRequired: PRICE_4MINI,
        description: "AI Agent Access",
        mimeType: "application/json",
        maxTimeoutSeconds: 600,
      },
      "POST /api/ai-agent-4": {
        network: "movement-testnet",
        asset: "0x1::aptos_coin::AptosCoin",
        maxAmountRequired: PRICE_4PRO,
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

export const models = [
  {
    name: "gpt-4o-mini",
    description: "GPT-4o Mini - Cost Effective and Fast",
    price: PRICE_4MINI,
  },
  {
    name: "gpt-4o",
    description: "GPT-4o - High Performance Model",
    price: PRICE_4PRO,
  },
];

app.get("/api/ai-models", (req, res) => {
  try {
    return res.json({ models });
  } catch (error) {
    console.error("Error in /ai-user:", error);
    res.status(500).json({
      error: `Internal server error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
});

app.get("/api/ai-user", (req, res) => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || "default";
    const history = conversationMemory.getHistory(sessionId);
    return res.json({ history });
  } catch (error) {
    console.error("Error in /ai-user:", error);
    res.status(500).json({
      error: `Internal server error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
});

app.post("/api/ai-memory-add", (req, res) => {
  try {
    const { lastToolAIMsg } = req.body;
    const sessionId = req.headers["x-session-id"];
    lastToolAIMsg?.forEach((msg: string) => {
      conversationMemory.addMessage(
        sessionId as string,
        new AIMessage({ content: msg })
      );
    });
    return res.json({ status: "ok" });
  } catch (e) {
    console.error("Error in /ai-memory-add:", e);
    res.status(500).json({
      error: `Internal server error: ${
        e instanceof Error ? e.message : String(e)
      }`,
    });
  }
});

app.post("/api/ai-agent", async (req, res) => {
  try {
    const { task } = req.body;
    const sessionId = req.headers["x-session-id"];
    const model = req.headers["x-model"];

    if (!task) {
      res.status(400).json({
        error: "Missing required fields: task",
      });
      return;
    }
    const userModel =
      models.find((m) => m.name == model)?.name ?? models[0].name;

    const generateActions = await runAIAgent(
      [new HumanMessage(task)],
      typeof sessionId === "string" ? sessionId : undefined,
      userModel,
      undefined
      // (chunk) => {
      //   console.log(`Streaming chunk: ${chunk}`);
      // } gives problem with tool call args
    );
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
