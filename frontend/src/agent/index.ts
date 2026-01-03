// /** @format */

// import { callLLMApi } from "../services/aiagent.services";
// import {
//   deployTokenService,
//   sendNativeTokenService,
//   sendERC20TokenService,
//   wrapNativetokenService,
//   unwrapNativetokenService,
//   getTransactionInfo,
//   getWalletAddressService,
//   getTokenBalanceService,
// } from "../services/blockchain.services";
// import { AiResponseType, SolveTaskResult, ToolCall } from "../types";
// import { charityCategories } from "../utils/charity.categories";
// import { bridgeCoin } from "../services/debridge.services";
// import { FAILED_KEY } from "../utils/constants";

// export class AIAgent {
//   tools: { [key: string]: Function };
//   toolsInfo: { [key: string]: string };

//   constructor() {
//     this.tools = {
//       bridge: bridgeCoin,
//       donate: donateToFoundationService,
//       redeemPoints: redeemPointsService,
//       deployToken: deployTokenService,
//       sendNativeToken: sendNativeTokenService,
//       sendERC20Token: sendERC20TokenService,
//       wrapNativetoken: wrapNativetokenService,
//       unwrapNativetoken: unwrapNativetokenService,
//       swapToken: swapTokenService,
//       tokenBalance: getTokenBalanceService,
//       walletAddress: getWalletAddressService,
//     };
//     this.toolsInfo = {
//       bridge:
//         "Only Mainnet Bridges are Supported: Example - Bridge 10 SONIC to BSC",
//       donate: `Example: Donate 100 USD to a cause. e.g ${Object.keys(
//         charityCategories
//       ).join(", ")}`,
//       redeemPoints: "Example: Redeem 5 reward points",
//       deployToken:
//         "Example: Deploy a token named 'Token' with symbol 'TKN' and an initial supply of 1,000",
//       sendNativeToken:
//         "Example: Send 10 SONIC to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
//       sendERC20Token:
//         "Example: Send 10 wSonic to 0x1CE05Bf474802D49a77b3829c566a9AABbfb8C6d",
//       wrapNativetoken: "Example: Wrap 10 SONIC",
//       unwrapNativetoken: "Example: Unwrap 10 wrappedSonic",
//       swapToken: "Example: Swap 10 SONIC for USDC",
//       tokenBalance: "Example: Get balance of SONIC",
//       walletAddress: "Example: Get wallet address",
//     };
//   }

//   private async executeAction(action: ToolCall) {
//     const tool = this.tools[action.name];
//     if (!tool) {
//       return `Tool ${action.name} not found`;
//     }
//     return tool.bind(this)(action.args ? action.args : {});
//   }

//   public async solveTask(task: string): Promise<SolveTaskResult> {
//     const action = (await callLLMApi({
//       task,
//     })) as AiResponseType;

//     const results: string[] = [];

//     // TODO: fix for multiple args (like user need more details)
//     if (action.tool_calls.length === 0 && action.content.trim() !== "") {
//       results.push(action.content);
//     }
//     for (const toolCall of action.tool_calls) {
//       const result = await this.executeAction(toolCall);
//       results.push(result);
//     }

//     return {
//       results,
//       needsMoreData: action.content.trim() !== "",
//     };
//   }
// }
