import type { CollabUser } from "@/types/collaboration";

export interface CollaborationState {
  connected: boolean;
  users: CollabUser[];
  localPeerId: string;
}

export type CollabAction =
  | { type: "SET_CONNECTED"; connected: boolean }
  | { type: "SET_USERS"; users: CollabUser[] }
  | { type: "USER_JOIN"; user: CollabUser }
  | { type: "USER_LEAVE"; socketId: string }
  | { type: "USER_CURSOR"; socketId: string; cellRef: string }
  /** Remove any entry whose id matches — used to purge self when auth loads late. */
  | { type: "PURGE_USER_BY_ID"; userId: string };

export function generatePeerId(): string {
  return `peer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const initialCollabState: CollaborationState = {
  connected: false,
  users: [],
  localPeerId: "", // must be set at mount time
};

export function collabReducer(state: CollaborationState, action: CollabAction): CollaborationState {
  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, connected: action.connected };
    case "SET_USERS":
      return { ...state, users: action.users };
    case "USER_JOIN":
      if (state.users.some((u) => u.socketId === action.user.socketId)) return state;
      return { ...state, users: [...state.users, action.user] };
    case "USER_LEAVE":
      return {
        ...state,
        users: state.users.filter((u) => u.socketId !== action.socketId),
      };
    case "PURGE_USER_BY_ID":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.userId),
      };
    case "USER_CURSOR":
      return {
        ...state,
        users: state.users.map((u) =>
          u.socketId === action.socketId ? { ...u, activeCellRef: action.cellRef } : u,
        ),
      };
    default:
      return state;
  }
}
