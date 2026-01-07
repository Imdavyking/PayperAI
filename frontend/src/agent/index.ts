/** @format */

// import { callLLMApi } from "../services/aiagent.services";
import { aptos } from "../services/blockchain.services";
import { AiResponseType, SolveTaskResult, ToolCall } from "../types";

export class AIAgent {
  tools: { [key: string]: Function };
  toolsInfo: { [key: string]: string };

  constructor() {
    this.tools = {
      sendMove: async ({
        recipientAddress,
        amount,
      }: {
        recipientAddress: string;
        amount: string;
      }) => {
        recipientAddress;
        amount;
        // const tx = await aptos.transaction.build.simple({
        //   sender: account.address,
        //   data: {
        //     function: "0x1::aptos_account::transfer",
        //     functionArguments: [recipientAddress, amount],
        //   },
        // });
      },
    };
    this.toolsInfo = {
      sendMove:
        "Example: Send 10 MOVE to 0x56700360ae32507d9dc80819c029417f7d2dfbd1d37a5f7225ee940a8433b9c8",
    };
  }

  private async executeAction(action: ToolCall) {
    const tool = this.tools[action.name];
    if (!tool) {
      return `Tool ${action.name} not found`;
    }
    return tool.bind(this)(action.args ? action.args : {});
  }

  public async solveTask(action: AiResponseType): Promise<SolveTaskResult> {
    const results: string[] = [];

    if (action.tool_calls.length === 0 && action.content.trim() !== "") {
      results.push(action.content);
    }
    for (const toolCall of action.tool_calls) {
      const result = await this.executeAction(toolCall);
      results.push(result);
    }

    return {
      results,
    };
  }
}
