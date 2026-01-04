import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const openAIApiKey = process.env.OPENAI_API_KEY!;

export async function runAIAgent(messages: (AIMessage | HumanMessage)[]) {
  const tools = {
    sendMove: tool(() => undefined, {
      name: "sendMove",
      description: "Send MOVE tokens to a specific address.",
      schema: z.object({
        tokenAddress: z.string().describe("The token to send"),
        recipientAddress: z.string().describe("The address to send tokens to"),
        amount: z.number().describe("The amount of tokens to send"),
      }),
    }),
    txHashSummary: tool(() => undefined, {
      name: "txHashSummary",
      description: "Get a summary of a transaction hash.",
      schema: z.object({
        hash: z.string().describe("The transaction hash"),
        summary: z.string().describe("The summary of the transaction"),
        legalAdvice: z.string().describe("Legal advice on the transaction"),
      }),
    }),
    addressInfo: tool(() => undefined, {
      name: "addressInfo",
      description: "Get information about a blockchain address.",
      schema: z.object({
        address: z.string().describe("The blockchain address"),
      }),
    }),
  };

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: openAIApiKey,
  }).bind({
    tools: Object.values(tools),
  });

  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats.`
  );
  const result = await llm.invoke([systemPrompt, ...messages]);

  return { content: result.content, tool_calls: result.tool_calls };
}
