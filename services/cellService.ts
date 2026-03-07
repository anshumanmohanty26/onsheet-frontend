import { api } from "./api";
import type { CellStyle } from "@/types/cell";

export interface ApiCell {
  id: string;
  sheetId: string;
  row: number;
  col: number;
  rawValue?: string | null;
  computed?: string | null;
  formatted?: string | null;
  style?: CellStyle;
  version?: number;
}

export interface UpsertCellDto {
  row: number;
  col: number;
  rawValue?: string;
  computed?: string;
  formatted?: string;
  style?: CellStyle;
  baseVersion?: number;
}

export const cellService = {
  /** Get all cells for a sheet */
  list: (sheetId: string) => api.get<ApiCell[]>(`/sheets/${sheetId}/cells`),

  /** Upsert a single cell */
  upsert: (sheetId: string, dto: UpsertCellDto) =>
    api.put<ApiCell>(`/sheets/${sheetId}/cells`, dto),

  /** Bulk upsert cells */
  bulkUpsert: (sheetId: string, cells: UpsertCellDto[]) =>
    api.put<ApiCell[]>(`/sheets/${sheetId}/cells/bulk`, cells),
};
