import { api } from "./api";
import type { CellStyle } from "@/types/cell";

export interface Sheet {
  id: string;
  workbookId: string;
  name: string;
  index: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSheetDto {
  name?: string;
}

export interface UpdateSheetDto {
  name?: string;
  index?: number;
}

/** Sheet-level CRUD operations scoped under a workbook. */
export const sheetService = {
  /** List all sheets in a workbook. */
  list: (workbookId: string) =>
    api.get<Sheet[]>(`/workbooks/${workbookId}/sheets`),

  /** Get a single sheet. */
  get: (workbookId: string, sheetId: string) =>
    api.get<Sheet>(`/workbooks/${workbookId}/sheets/${sheetId}`),

  /** Create a new sheet in a workbook. */
  create: (workbookId: string, dto: CreateSheetDto) =>
    api.post<Sheet>(`/workbooks/${workbookId}/sheets`, dto),

  /** Rename or reorder a sheet. */
  update: (workbookId: string, sheetId: string, dto: UpdateSheetDto) =>
    api.patch<Sheet>(`/workbooks/${workbookId}/sheets/${sheetId}`, dto),

  /** Delete a sheet. */
  delete: (workbookId: string, sheetId: string) =>
    api.delete<void>(`/workbooks/${workbookId}/sheets/${sheetId}`),
};
