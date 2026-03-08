import { api } from "./api";

export interface AgentAction {
  type: "SET_CELLS" | "ADD_COMMENT" | "DELETE_CELLS";
  cells?: Record<string, { raw: string; computed?: string; style?: Record<string, unknown> }>;
  comment?: { row: number; col: number; content: string };
}

export interface AgentResult {
  answer: string;
  toolsUsed: string[];
  actions: AgentAction[];
}

export const aiService = {
  ask: (sheetId: string, query: string) => api.post<AgentResult>("/ai/agent", { sheetId, query }),
};
