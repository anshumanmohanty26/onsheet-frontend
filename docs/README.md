# OnSheet Frontend — Documentation

**Next.js 15 App Router · TypeScript · Zustand-like reducers · Socket.IO · LWW-CRDT**

---

## Quick Navigation

| Document | What it covers |
|---|---|
| [Architecture](./architecture.md) | App Router structure, route layout, rendering strategy, middleware |
| [Collaboration](./collaboration.md) | LWW-CRDT cell register, Lamport clocks, Socket.IO event flow, conflict resolution |
| [State Management](./state.md) | All stores, reducers, and hooks — how data flows from API to render |
| [Formula Engine](./formula.md) | Client-side tokenizer → parser → AST evaluator, supported functions |
| [Services & API](./services.md) | HTTP client, auto-refresh, per-resource service modules |

---

## Stack at a Glance

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| State | `useReducer` + custom hooks (no global state library) |
| Real-time | Socket.IO client (`socket.io-client`) |
| HTTP client | Custom `fetch` wrapper with auto-refresh |
| Formula engine | Custom: tokenizer → Pratt parser → AST evaluator |
| Code quality | Biome (lint + format) |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **LWW-Register CRDT per cell** | Concurrent edits to the same cell converge deterministically via Lamport timestamps + peerId tiebreaker — no merge conflicts, no server-side OCC needed for the client layer |
| **Optimistic local apply** | Cell changes render instantly; Socket.IO carries them to the server and peers in the background |
| **`useReducer` not Zustand** | Keeps state logic co-located with the component tree; avoids a global singleton that makes server components harder |
| **Formula eval on client** | Eliminates a server round-trip for live formula preview; server computes the canonical `computed` value on upsert |
| **Session marker cookie** | Middleware can't read the httpOnly `accessToken` (API-domain), so a lightweight `session` cookie signals auth state for route guarding |
