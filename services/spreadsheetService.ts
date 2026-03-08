import { api } from "./api";

export type PermissionRole = "viewer" | "commenter" | "editor";

export interface Permission {
  userId: string;
  email: string;
  name: string;
  role: PermissionRole;
}

export interface ShareDto {
  email: string;
  role: PermissionRole;
}

export interface ShareInfo {
  shareToken: string | null;
  publicAccess: boolean;
}

/** Spreadsheet-level operations: permissions / sharing. */
export const spreadsheetService = {
  /** List all permission entries for a workbook. */
  listPermissions: (workbookId: string) =>
    api.get<Permission[]>(`/workbooks/${workbookId}/permissions`),

  /** Share a workbook with another user by email. */
  share: (workbookId: string, dto: ShareDto) =>
    api.post<Permission>(`/workbooks/${workbookId}/permissions`, dto),

  /** Revoke a user's access to a workbook. */
  revokeAccess: (workbookId: string, targetUserId: string) =>
    api.delete<void>(`/workbooks/${workbookId}/permissions/${targetUserId}`),

  /** Get public share settings for a workbook. */
  getShareInfo: (workbookId: string) => api.get<ShareInfo>(`/workbooks/${workbookId}/share-info`),

  /** Enable or disable public link access for a workbook. */
  setPublicAccess: (workbookId: string, publicAccess: boolean) =>
    api.patch<ShareInfo>(`/workbooks/${workbookId}/public-access`, { publicAccess }),
};
