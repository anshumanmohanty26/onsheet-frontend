export interface CollabUser {
  id: string;
  name: string;
  color: string;
  activeCellRef?: string; // e.g. "B4"
}

export interface CollabPresence {
  users: CollabUser[];
}
