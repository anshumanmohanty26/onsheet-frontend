/**
 * Presence tracker — keeps a map of connected users and their cursor positions.
 */

import type { CollabUser } from "@/types/collaboration";

export type PresenceMap = Map<string, CollabUser>;

export class PresenceTracker {
  private users: PresenceMap = new Map();
  private listeners = new Set<() => void>();

  /** Upsert a user's presence (cursor position, etc.) */
  set(user: CollabUser): void {
    this.users.set(user.id, user);
    this.notify();
  }

  /** Remove a user (e.g. on disconnect) */
  remove(userId: string): void {
    this.users.delete(userId);
    this.notify();
  }

  /** Get all currently present users */
  getAll(): CollabUser[] {
    return Array.from(this.users.values());
  }

  /** Subscribe to presence changes */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  clear(): void {
    this.users.clear();
    this.notify();
  }
}
