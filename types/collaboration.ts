export interface CollabUser {
  id: string;
  socketId: string; // Socket.IO socket ID — used to match cursor:moved / user:left events
  name: string;
  color: string;
  activeCellRef?: string; // e.g. "B4"
}

export interface CollabPresence {
  users: CollabUser[];
}
