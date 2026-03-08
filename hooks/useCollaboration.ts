/**
 * useCollaboration — wires up the CRDT doc, Socket.IO, presence, and history
 * into a single hook that the sheet editor page consumes.
 *
 * Architecture (mirrors Google Sheets):
 *   1. Each cell is an LWW-Register with Lamport timestamps.
 *   2. Local edits optimistically apply to the CRDT and render immediately.
 *   3. A Socket.IO connection broadcasts edits and cursor moves to peers.
 *   4. Remote edits are applied directly to the spreadsheet state.
 *   5. Undo/redo uses an operation log (old value ↔ new value).
 *   6. Presence (cursor positions) piggybacks on the same socket.
 *
 * Backend Socket.IO gateway (namespace /collab) events:
 *   Client → Server:  sheet:join  cursor:move  cell:update  cell:history
 *   Server → Client:  sheet:users  user:joined  user:left  cursor:moved
 *                     cell:updated  cell:confirmed  cell:conflict  collab:error
 */

import { env } from "@/config/env";
import { useAuth } from "@/lib/auth/AuthContext";
import { CrdtDoc, type CrdtEntry } from "@/lib/collaboration/crdt";
import { PresenceTracker } from "@/lib/collaboration/presence";
import { SocketManager } from "@/lib/collaboration/socket";
import { type CellOperation, HistoryManager } from "@/lib/history/history";
import { cellRef, parseCellRef } from "@/lib/utils/coordinates";
import { collabReducer, generatePeerId, initialCollabState } from "@/store/collaborationStore";
import { historyReducer, initialHistoryState } from "@/store/historyStore";
import type { SpreadsheetAction } from "@/store/spreadsheetStore";
import type { CellStyle } from "@/types/cell";
import type { CollabUser } from "@/types/collaboration";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

interface UseCollaborationOptions {
  sheetId: string | null;
  workbookId: string | null;
  /** Dispatch into the spreadsheet reducer to update rendered cells */
  spreadsheetDispatch: React.Dispatch<SpreadsheetAction>;
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function pickColor(id: string | undefined | null): string {
  if (!id) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
}

/** Base server URL — strips /api/v1 suffix, keeps protocol (http/https) */
function getServerUrl(): string {
  return env.apiUrl.replace(/\/api\/v1\/?$/, "");
}

export function useCollaboration({
  sheetId,
  workbookId,
  spreadsheetDispatch,
}: UseCollaborationOptions) {
  const { user } = useAuth();
  // Keep a ref so the socket message closure always reads the latest userId
  // without needing to be in the effect dependency array.
  const localUserIdRef = useRef<string | null>(null);
  localUserIdRef.current = user?.id ?? null;
  const peerId = useMemo(generatePeerId, []);
  const doc = useMemo(() => new CrdtDoc(peerId), [peerId]);
  const history = useMemo(() => new HistoryManager(), []);
  const presence = useMemo(() => new PresenceTracker(), []);

  const socketRef = useRef<SocketManager | null>(null);
  const sheetIdRef = useRef(sheetId);
  sheetIdRef.current = sheetId;

  const [pendingWrites, setPendingWrites] = useState(0);

  const [collab, collabDispatch] = useReducer(collabReducer, {
    ...initialCollabState,
    localPeerId: peerId,
  });
  const [histState, histDispatch] = useReducer(historyReducer, initialHistoryState);

  // When auth loads after the socket has already received sheet:users,
  // purge any self-entry that slipped through the null-id filter.
  useEffect(() => {
    if (user?.id) {
      collabDispatch({ type: "PURGE_USER_BY_ID", userId: user.id });
    }
  }, [user?.id]);

  // Connect / disconnect Socket.IO when sheetId changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: doc.currentClock/doc.merge intentionally excluded — adding them would reconnect the socket on every cell edit; peerId is stable for the session
  useEffect(() => {
    if (!sheetId) return;

    const socket = new SocketManager(getServerUrl());
    socketRef.current = socket;

    // Track our own socket ID so we can reliably filter self from presence lists
    // without depending on auth state timing.
    const mySocketIdRef = { current: null as string | null };

    // Emit sheet:join on every connect / reconnect
    const unsubConnect = socket.onConnect(() => {
      mySocketIdRef.current = socket.socketId;
      socket.send("sheet:join", { sheetId, workbookId });
      collabDispatch({ type: "SET_CONNECTED", connected: true });
    });

    const unsubMessage = socket.onMessage((type, payload) => {
      switch (type) {
        // ── Presence ──────────────────────────────────────────────────────
        case "sheet:users":
        case "user:joined": {
          // payload is the full users array in the room
          const users = (Array.isArray(payload) ? payload : []) as Array<{
            userId: string;
            displayName: string;
            socketId: string;
            color?: string;
          }>;

          const mapped: CollabUser[] = users
            .filter((u) => {
              const keepSocketId = u.socketId !== mySocketIdRef.current;
              // Only apply userId exclusion when userId is actually present
              const keepUserId = !u.userId || u.userId !== localUserIdRef.current;
              return keepSocketId && keepUserId;
            })
            .map((u) => ({
              id: u.userId,
              socketId: u.socketId,
              name: u.displayName ?? "User",
              color: u.color ?? pickColor(u.userId),
            }));
          collabDispatch({ type: "SET_USERS", users: mapped });
          break;
        }
        case "user:left": {
          const { socketId } = payload as { socketId: string };
          collabDispatch({ type: "USER_LEAVE", socketId });
          presence.remove(socketId);
          break;
        }
        case "cursor:moved": {
          const { socketId, row, col } = payload as {
            socketId: string;
            row: number;
            col: number;
          };
          const ref = cellRef(row, col);
          collabDispatch({ type: "USER_CURSOR", socketId, cellRef: ref });
          break;
        }

        // ── Cell updates ──────────────────────────────────────────────────
        case "cell:updated": {
          // payload: { userId, cell: { row, col, rawValue, computed, style, version } }
          const update = payload as {
            userId?: string;
            cell: {
              row: number;
              col: number;
              rawValue?: string;
              computed?: string;
              style?: CellStyle;
              version?: number;
            };
          };
          const ref = cellRef(update.cell.row, update.cell.col);
          const raw = update.cell.rawValue ?? "";

          // Merge into the CRDT doc so undo/redo stays consistent with remote state.
          // Use localClock+1 as the timestamp so this server-confirmed entry
          // ALWAYS wins the LWW comparison against any speculative local edits,
          // regardless of the server's DB version number (a different clock space).
          // mergeClocks() then advances the local clock above this value so future
          // local edits can still beat subsequent remote updates as expected.
          const serverTs = doc.currentClock + 1;
          doc.merge({
            ref,
            raw,
            style: update.cell.style,
            timestamp: serverTs,
            peerId: update.userId ?? "__server__",
          });

          // Use the server-computed (formula-evaluated) value when available so
          // formula cells show their result rather than the raw formula string.
          spreadsheetDispatch({
            type: "SET_CELL",
            ref,
            data: {
              raw,
              computed: update.cell.computed ?? raw,
              style: update.cell.style,
            },
          });
          break;
        }

        // ── ops:catchup — intentionally ignored ───────────────────────────
        // Cells are loaded fresh from the DB via cellService.list() before the
        // socket connects, so the DB state is already correct. The op log uses
        // a different field (newValue) and has no style, so replaying it here
        // overwrites loaded data with stale / style-less ops. Real-time edits
        // from collaborators arrive via cell:updated instead.
        case "ops:catchup":
          break;

        case "connect_error":
          collabDispatch({ type: "SET_CONNECTED", connected: false });
          break;

        case "disconnect":
          setPendingWrites(0);
          collabDispatch({ type: "SET_CONNECTED", connected: false });
          break;

        case "cell:confirmed":
          setPendingWrites((n) => Math.max(0, n - 1));
          break;

        case "sheet:created": {
          // Another collaborator added a new sheet tab
          const { sheet } = payload as {
            sheet: { id: string; name: string; index: number; workbookId: string };
          };
          spreadsheetDispatch({ type: "ADD_SHEET", sheet });
          break;
        }

        case "sheet:deleted": {
          const { sheetId: deletedId } = payload as { sheetId: string };
          spreadsheetDispatch({ type: "REMOVE_SHEET", sheetId: deletedId });
          break;
        }

        case "exception":
          break;

        case "collab:error":
          break;

        default:
          break;
      }
    });

    socket.connect();

    return () => {
      unsubConnect();
      unsubMessage();
      socket.disconnect();
      socketRef.current = null;
      collabDispatch({ type: "SET_CONNECTED", connected: false });
      collabDispatch({ type: "SET_USERS", users: [] });
      presence.clear();
    };
  }, [sheetId, workbookId, peerId, spreadsheetDispatch, presence]);

  /** Apply a local cell edit through the CRDT pipeline */
  const setCellCrdt = useCallback(
    (ref: string, raw: string, style?: CellStyle, computed?: string) => {
      // 1. Capture old value for undo
      const existing = doc.get(ref);
      const op: CellOperation = {
        ref,
        oldRaw: existing?.raw ?? "",
        oldStyle: existing?.style,
        newRaw: raw,
        newStyle: style,
      };
      history.push([op]);

      // 2. Optimistically apply to CRDT
      const entry: CrdtEntry = doc.apply(ref, raw, style);

      // 3. Update rendered state immediately —
      //    use caller-provided `computed` (formula result) if available
      const displayValue = computed ?? raw;
      spreadsheetDispatch({
        type: "SET_CELL",
        ref,
        data: { raw, computed: displayValue, style },
      });

      // 4. Broadcast to backend — use the correct Socket.IO event/payload
      const parsed = parseCellRef(ref);
      if (parsed && sheetIdRef.current) {
        socketRef.current?.send("cell:update", {
          sheetId: sheetIdRef.current,
          cell: {
            row: parsed.row,
            col: parsed.col,
            rawValue: raw,
            computed: computed,
            style: style ?? entry.style,
          },
        });
        setPendingWrites((n) => n + 1);
      }

      // 5. Update undo/redo availability
      histDispatch({ type: "SET_CAN_UNDO", value: history.canUndo });
      histDispatch({ type: "SET_CAN_REDO", value: history.canRedo });
    },
    [doc, history, spreadsheetDispatch],
  );

  /** Undo the last local operation */
  const undo = useCallback(() => {
    const ops = history.undo();
    if (!ops) return;
    for (const op of ops) {
      const entry: CrdtEntry = doc.apply(op.ref, op.oldRaw, op.oldStyle);
      spreadsheetDispatch({
        type: "SET_CELL",
        ref: op.ref,
        data: { raw: op.oldRaw, computed: op.oldRaw, style: op.oldStyle },
      });
      const parsed = parseCellRef(op.ref);
      if (parsed && sheetIdRef.current) {
        socketRef.current?.send("cell:update", {
          sheetId: sheetIdRef.current,
          cell: {
            row: parsed.row,
            col: parsed.col,
            rawValue: op.oldRaw,
            style: op.oldStyle ?? entry.style,
          },
        });
      }
    }
    histDispatch({ type: "SET_CAN_UNDO", value: history.canUndo });
    histDispatch({ type: "SET_CAN_REDO", value: history.canRedo });
  }, [doc, history, spreadsheetDispatch]);

  /** Redo the last undone operation */
  const redo = useCallback(() => {
    const ops = history.redo();
    if (!ops) return;
    for (const op of ops) {
      const entry: CrdtEntry = doc.apply(op.ref, op.newRaw, op.newStyle);
      spreadsheetDispatch({
        type: "SET_CELL",
        ref: op.ref,
        data: { raw: op.newRaw, computed: op.newRaw, style: op.newStyle },
      });
      const parsed = parseCellRef(op.ref);
      if (parsed && sheetIdRef.current) {
        socketRef.current?.send("cell:update", {
          sheetId: sheetIdRef.current,
          cell: {
            row: parsed.row,
            col: parsed.col,
            rawValue: op.newRaw,
            style: op.newStyle ?? entry.style,
          },
        });
      }
    }
    histDispatch({ type: "SET_CAN_UNDO", value: history.canUndo });
    histDispatch({ type: "SET_CAN_REDO", value: history.canRedo });
  }, [doc, history, spreadsheetDispatch]);

  /** Broadcast local cursor position to peers */
  const broadcastCursor = useCallback((activeCellRef: string) => {
    const parsed = parseCellRef(activeCellRef);
    if (!parsed) return;
    socketRef.current?.send("cursor:move", { row: parsed.row, col: parsed.col });
  }, []);

  /** Load initial cells into the CRDT doc */
  const loadIntoCrdt = useCallback(
    (entries: CrdtEntry[]) => {
      doc.load(entries);
      history.clear();
      histDispatch({ type: "SET_CAN_UNDO", value: false });
      histDispatch({ type: "SET_CAN_REDO", value: false });
    },
    [doc, history],
  );

  return {
    collab,
    histState,
    pendingWrites,
    setCellCrdt,
    undo,
    redo,
    broadcastCursor,
    loadIntoCrdt,
    peerId,
    pickColor,
  };
}
