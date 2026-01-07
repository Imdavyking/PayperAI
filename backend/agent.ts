import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const openAIApiKey = process.env.OPENAI_API_KEY!;

// Conversation memory storage
class ConversationMemory {
  private conversations: Map<string, BaseMessage[]> = new Map();

  addMessage(sessionId: string, message: BaseMessage) {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, []);
    }
    this.conversations.get(sessionId)!.push(message);
  }

  getHistory(sessionId: string): BaseMessage[] {
    return this.conversations.get(sessionId) || [];
  }

  clearHistory(sessionId: string) {
    this.conversations.delete(sessionId);
  }
}

// Helper to convert MessageContent to string
function contentToString(content: any): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.type === "text" && item.text) return item.text;
        return "";
      })
      .filter(Boolean)
      .join("");
  }
  return "";
}

// Create a global memory instance
export const conversationMemory = new ConversationMemory();

export async function runAIAgent(
  messages: (AIMessage | HumanMessage)[],
  sessionId: string = "default",
  onStream?: (chunk: string) => void
) {
  const tools = {
    sendMove: tool(() => undefined, {
      name: "sendMove",
      description: "Send MOVE tokens to a specific address.",
      schema: z.object({
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
    streaming: onStream ? true : false,
  }).bind({
    tools: Object.values(tools),
  });

  // Add new messages to memory
  messages.forEach((msg) => conversationMemory.addMessage(sessionId, msg));

  // Get conversation history
  const history = conversationMemory.getHistory(sessionId);

  const systemPrompt = new SystemMessage(
    `You are an assistant that converts user prompts into structured formats. You remember previous conversations with the user.`
  );

  // Use history instead of just current messages
  const allMessages = [systemPrompt, ...history];

  if (onStream) {
    // Streaming mode
    let fullContent = "";
    let toolCalls: any[] = [];

    const stream = await llm.stream(allMessages);

    for await (const chunk of stream) {
      // Handle content chunks
      if (chunk.content) {
        const chunkText = contentToString(chunk.content);
        if (chunkText) {
          fullContent += chunkText;
          onStream(chunkText);
        }
      }

      // Collect tool calls if present
      if (chunk.tool_calls && chunk.tool_calls.length > 0) {
        toolCalls = chunk.tool_calls;
      }
    }

    // Add AI response to memory
    const aiMessage = new AIMessage({
      content: fullContent,
      tool_calls: toolCalls,
    });
    conversationMemory.addMessage(sessionId, aiMessage);

    return { content: fullContent, tool_calls: toolCalls };
  } else {
    // Non-streaming mode
    const result = await llm.invoke(allMessages);

    // Add AI response to memory
    const aiMessage = new AIMessage({
      content: result.content,
      tool_calls: result.tool_calls || [],
    });
    conversationMemory.addMessage(sessionId, aiMessage);

    return {
      content: contentToString(result.content),
      tool_calls: result.tool_calls || [],
    };
  }
}

// Helper function to clear conversation
export function clearConversation(sessionId: string = "default") {
  conversationMemory.clearHistory(sessionId);
}
