import type { CellStyle } from "@/types/cell";
import { api } from "./api";

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
    api.put<{ count: number }>(`/sheets/${sheetId}/cells/bulk`, cells),

  /**
   * Chunked bulk import with progress callback.
   * Splits cells into 5 000-cell chunks to keep request sizes reasonable
   * and report progress to the caller.
   */
  bulkImport: async (
    sheetId: string,
    cells: UpsertCellDto[],
    onProgress?: (pct: number) => void,
  ) => {
    const CHUNK = 5000;
    let imported = 0;
    for (let i = 0; i < cells.length; i += CHUNK) {
      const chunk = cells.slice(i, i + CHUNK);
      await api.put(`/sheets/${sheetId}/cells/bulk`, chunk);
      imported += chunk.length;
      onProgress?.(Math.round((imported / cells.length) * 100));
    }
    return { count: imported };
  },
};
