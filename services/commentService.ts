import { api } from "./api";

export interface CellComment {
  id: string;
  row: number;
  col: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
}

export const commentService = {
  list: (sheetId: string) => api.get<CellComment[]>(`/sheets/${sheetId}/cells/comments`),

  add: (sheetId: string, row: number, col: number, content: string) =>
    api.post<CellComment>(`/sheets/${sheetId}/cells/comments`, { row, col, content }),

  delete: (sheetId: string, commentId: string) =>
    api.delete<void>(`/sheets/${sheetId}/cells/comments/${commentId}`),
};
