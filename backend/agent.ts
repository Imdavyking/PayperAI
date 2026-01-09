import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  ToolMessage,
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
    deployMemeCoin: tool(() => undefined, {
      name: "deployMemeCoin",
      description: "Deploy a MemeCoin with a name, symbol, and initial supply.",
      schema: z.object({
        name: z.string().describe("The name of the MemeCoin"),
        symbol: z.string().describe("The symbol of the MemeCoin"),
        initialSupply: z
          .string()
          .describe("The initial supply of the MemeCoin"),
      }),
    }),
    searchMovementDocs: tool(() => undefined, {
      name: "searchMovementDocs",
      description:
        "Search Movement Network documentation to answer questions about Movement blockchain, MoveVM, smart contracts, fungible assets, deployment, and best practices. Use this when users ask 'how to', 'what is', or need technical information about Movement.",
      schema: z.object({
        query: z
          .string()
          .describe(
            "The search query or question about Movement (e.g., 'how to deploy fungible assets', 'what is MoveVM', 'gas fees on Movement')"
          ),
        detailed: z
          .boolean()
          .optional()
          .describe(
            "Set to true for detailed search results, false for quick answers"
          ),
      }),
    }),
    transferFA: tool(() => undefined, {
      name: "transferFA",
      description:
        "Transfer a specific amount of a fungible asset (FA) token to a recipient address.",
      schema: z.object({
        recipientAddress: z.string().describe("The address to send tokens to"),
        amount: z.number().describe("The amount of tokens to send"),
        tokenAddress: z.string().describe("The address of the FA token"),
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
    `You are an expert AI assistant for the Movement Network blockchain ecosystem.

**Your Capabilities:**
1. **Movement Documentation Expert** - Use searchMovementDocs to answer questions about Movement
2. **Transaction Executor** - Send MOVE, deploy tokens, transfer fungible assets
3. **Educator** - Explain blockchain concepts at appropriate knowledge levels
4. **Helpful Guide** - Remember conversation context and guide users step-by-step

**When to Use Each Tool:**
- searchMovementDocs: User asks "how to", "what is", needs technical info about Movement
- sendMove: Transfer MOVE tokens only
- transferFA: Transfer any fungible asset token (NOT MOVE)
- deployMemeCoin: Create new fungible asset tokens

**Best Practices:**
1. When users ask technical questions, ALWAYS search docs first before answering
2. Cite sources when providing information from documentation
3. Offer to execute actions after explaining them
4. Be educational - teach users while helping them
5. If unsure, search the documentation rather than guessing

**Example Interactions:**
User: "How do fungible assets work?"
You: [Use searchMovementDocs] → Explain based on official docs → Offer to deploy one

User: "Send 10 MOVE to 0x123"
You: [Use sendMove] → Confirm transaction details

User: "What's the difference between MOVE and FA tokens?"
You: [Use searchMovementDocs] → Clear explanation → Ask if they want to try deploying an FA

Remember: You're both a teacher and a doer. Educate users while executing their requests.`
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

    // ✅ If there are tool calls, add mock tool responses
    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const toolMessage = new ToolMessage({
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            status: "pending",
            message: `Tool ${toolCall.name} called with args: ${JSON.stringify(
              toolCall.args
            )}`,
          }),
        });
        conversationMemory.addMessage(sessionId, toolMessage);
      }
    }

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

    // ✅ If there are tool calls, add mock tool responses
    if (result.tool_calls && result.tool_calls.length > 0) {
      for (const toolCall of result.tool_calls) {
        const toolMessage = new ToolMessage({
          tool_call_id: toolCall.id!,
          content: JSON.stringify({
            status: "pending",
            message: `Tool ${toolCall.name} called with args: ${JSON.stringify(
              toolCall.args
            )}`,
          }),
        });
        conversationMemory.addMessage(sessionId, toolMessage);
      }
    }

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
