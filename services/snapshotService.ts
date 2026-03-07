import { api } from "./api";

export interface Snapshot {
  id: string;
  name: string;
  createdAt: string;
  user: { id: string; displayName: string; avatarUrl: string | null };
}

export const snapshotService = {
  list: (workbookId: string, sheetId: string) =>
    api.get<Snapshot[]>(`/workbooks/${workbookId}/sheets/${sheetId}/snapshots`),

  create: (workbookId: string, sheetId: string, name?: string) =>
    api.post<Snapshot>(`/workbooks/${workbookId}/sheets/${sheetId}/snapshots`, { name }),

  restore: (workbookId: string, sheetId: string, snapshotId: string) =>
    api.post<{ restored: boolean; snapshotId: string }>(
      `/workbooks/${workbookId}/sheets/${sheetId}/snapshots/${snapshotId}/restore`,
    ),
};
