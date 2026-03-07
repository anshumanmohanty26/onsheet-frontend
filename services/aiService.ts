import { api } from "./api";

export interface AgentResult {
  answer: string;
  toolsUsed: string[];
}

export const aiService = {
  ask: (sheetId: string, query: string) =>
    api.post<AgentResult>("/ai/agent", { sheetId, query }),
};
