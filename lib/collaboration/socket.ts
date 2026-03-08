/**
 * Socket.IO connection manager.
 *
 * Wraps socket.io-client so the rest of the app uses a simple
 * send / onMessage / onConnect API.
 *
 * The backend runs a Socket.IO gateway at namespace /collab.
 */
import { type Socket as IoSocket, io } from "socket.io-client";

export type MessageHandler = (type: string, payload: unknown) => void;

export class SocketManager {
  private socket: IoSocket | null = null;
  private readonly serverUrl: string;
  private readonly namespace: string;
  private readonly handlers = new Set<MessageHandler>();
  private readonly connectHandlers = new Set<() => void>();

  constructor(serverUrl: string, namespace = "/collab") {
    this.serverUrl = serverUrl;
    this.namespace = namespace;
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  connect(): void {
    if (this.socket) return;
    this.socket = io(`${this.serverUrl}${this.namespace}`, {
      withCredentials: true,
      // Try WebSocket first, fall back to long-polling
      transports: ["websocket", "polling"],
    });

    // Fires on every connect / reconnect — lets consumers re-join rooms
    this.socket.on("connect", () => {
      for (const h of this.connectHandlers) h();
    });

    // Forward connection errors and disconnects so consumers can react
    this.socket.on("connect_error", (err: Error) => {
      for (const h of this.handlers) h("connect_error", err.message);
    });
    this.socket.on("disconnect", (reason: string) => {
      for (const h of this.handlers) h("disconnect", reason);
    });

    // Forward all server events to registered message handlers
    this.socket.onAny((event: string, payload: unknown) => {
      for (const h of this.handlers) h(event, payload);
    });
  }

  /** Register a callback that fires every time the socket (re)connects. */
  onConnect(handler: () => void): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  send(event: string, payload: unknown): void {
    this.socket?.emit(event, payload);
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connectHandlers.clear();
  }
}
