/** @format */
import { AiResponseType, SolveTaskResult } from "../types";

export class AIAgent {
  public async solveTask(action: AiResponseType): Promise<SolveTaskResult> {
    const results: string[] = [];

    if (action.tool_calls.length === 0 && action.content.trim() !== "") {
      results.push(action.content);
    }

    return { results };
  }
}
