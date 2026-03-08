"use client";

import { type AgentAction, aiService } from "@/services/aiService";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
  actionsCount?: number;
}

interface Props {
  sheetId: string | null;
  onClose: () => void;
  onActions?: (actions: AgentAction[]) => void;
}

export function AiPanel({ sheetId, onClose, onActions }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit() {
    const query = input.trim();
    if (!query || !sheetId || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setLoading(true);

    try {
      const result = await aiService.ask(sheetId, query);
      const actionsCount = result.actions?.length ?? 0;
      setMessages((prev) => [...prev, { role: "assistant", text: result.answer, actionsCount }]);
      if (actionsCount > 0 && onActions) {
        onActions(result.actions);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get a response.";
      setMessages((prev) => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <span className="text-sm font-semibold text-gray-800">OnSheet AI</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          aria-label="Close AI panel"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-xs text-gray-400 text-center mt-8 leading-relaxed animate-fade-in">
            Ask me to fill data, create tables, add formulas, analyse your sheet, or add comments.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col gap-0.5 animate-slide-up ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`text-xs px-3 py-2 rounded-xl max-w-[90%] whitespace-pre-wrap leading-relaxed ${
                m.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
            {(m.actionsCount ?? 0) > 0 && (
              <div className="text-[10px] text-emerald-500 px-1 font-medium">
                ✓ {m.actionsCount} change{(m.actionsCount as number) > 1 ? "s" : ""} applied to
                sheet
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start animate-slide-up">
            <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2">
              <span className="flex gap-1 items-center">
                <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="size-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask about this sheet…"
            rows={2}
            disabled={loading || !sheetId}
            className="flex-1 text-xs text-gray-800 placeholder:text-gray-400 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !input.trim() || !sheetId}
            className="shrink-0 size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            aria-label="Send"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </div>
  );
}
