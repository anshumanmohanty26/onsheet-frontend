/**
 * CRDT: Last-Writer-Wins Element Register per cell.
 *
 * Each cell is modeled as an LWW-Register keyed by its cell reference (e.g. "A1").
 * The register stores `{ value, style, timestamp, peerId }` and merges use
 * (timestamp, peerId) as a total-order tiebreaker — the same approach Google Sheets
 * uses internally.
 *
 * Concurrent edits to the *same* cell converge to the same winner on every peer.
 * Edits to *different* cells commute by default (no conflicts).
 */

import type { CellData, CellStyle } from "@/types/cell";

export interface CrdtEntry {
  ref: string; // cell reference, e.g. "A1"
  raw: string;
  style?: CellStyle;
  /** Lamport timestamp — monotonically increasing per peer */
  timestamp: number;
  /** Globally unique peer/client ID */
  peerId: string;
}

export type CrdtCellMap = Map<string, CrdtEntry>;

/**
 * The CrdtDoc holds the canonical state of every cell on a single sheet.
 * It supports:
 *  - local `apply()` — sets a cell with a new Lamport timestamp
 *  - remote `merge()` — integrates a peer's operation with LWW resolution
 *  - `snapshot()` — returns the current CellMap for rendering
 */
export class CrdtDoc {
  private cells: CrdtCellMap = new Map();
  private clock = 0;
  readonly peerId: string;

  constructor(peerId: string) {
    this.peerId = peerId;
  }

  /** Advance the local Lamport clock and return the new value */
  private tick(): number {
    return ++this.clock;
  }

  /** Merge the Lamport clock with a remote timestamp (standard Lamport rule) */
  private mergeClocks(remoteTs: number): void {
    this.clock = Math.max(this.clock, remoteTs);
  }

  /** Apply a local edit — returns the entry to broadcast to peers */
  apply(ref: string, raw: string, style?: CellStyle): CrdtEntry {
    const ts = this.tick();
    const entry: CrdtEntry = { ref, raw, style, timestamp: ts, peerId: this.peerId };
    this.cells.set(ref, entry);
    return entry;
  }

  /** Merge a remote (or local replay) entry using LWW semantics */
  merge(entry: CrdtEntry): boolean {
    this.mergeClocks(entry.timestamp);

    const existing = this.cells.get(entry.ref);
    if (!existing || this.wins(entry, existing)) {
      this.cells.set(entry.ref, entry);
      return true; // state changed
    }
    return false; // existing wins; no change
  }

  /** Bulk-load initial cells (e.g. from API) — resets the doc */
  load(entries: CrdtEntry[]): void {
    this.cells.clear();
    for (const e of entries) {
      this.cells.set(e.ref, e);
      this.mergeClocks(e.timestamp);
    }
  }

  /** LWW comparison: higher timestamp wins; on tie, higher peerId wins (deterministic) */
  private wins(a: CrdtEntry, b: CrdtEntry): boolean {
    if (a.timestamp !== b.timestamp) return a.timestamp > b.timestamp;
    return a.peerId > b.peerId; // deterministic tiebreaker
  }

  /** Return a plain CellData map for rendering */
  snapshot(): Record<string, CellData> {
    const out: Record<string, CellData> = {};
    for (const [ref, entry] of this.cells) {
      out[ref] = { raw: entry.raw, computed: entry.raw, style: entry.style };
    }
    return out;
  }

  /** Get a single cell entry */
  get(ref: string): CrdtEntry | undefined {
    return this.cells.get(ref);
  }

  /** Current Lamport clock value */
  get currentClock(): number {
    return this.clock;
  }
}
