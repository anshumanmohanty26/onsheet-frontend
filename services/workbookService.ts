import { api } from "./api";

export interface Workbook {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  sheets?: Sheet[];
}

export interface SharedWorkbook extends Workbook {
  myRole: "viewer" | "editor" | "commenter";
  owner: {
    id: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export interface Sheet {
  id: string;
  workbookId: string;
  name: string;
  index: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkbookDto {
  name: string;
}

export interface CreateSheetDto {
  name?: string;
}

export const workbookService = {
  list: () => api.get<Workbook[]>("/workbooks"),

  sharedWithMe: () => api.get<SharedWorkbook[]>("/workbooks/shared-with-me"),

  get: (id: string) => api.get<Workbook>(`/workbooks/${id}`),

  create: (body: CreateWorkbookDto) => api.post<Workbook>("/workbooks", body),

  update: (id: string, body: Partial<CreateWorkbookDto>) =>
    api.patch<Workbook>(`/workbooks/${id}`, body),

  delete: (id: string) => api.delete<void>(`/workbooks/${id}`),

  // Sheets within a workbook
  listSheets: (workbookId: string) => api.get<Sheet[]>(`/workbooks/${workbookId}/sheets`),

  createSheet: (workbookId: string, body: CreateSheetDto) =>
    api.post<Sheet>(`/workbooks/${workbookId}/sheets`, body),

  deleteSheet: (workbookId: string, sheetId: string) =>
    api.delete<void>(`/workbooks/${workbookId}/sheets/${sheetId}`),
};
