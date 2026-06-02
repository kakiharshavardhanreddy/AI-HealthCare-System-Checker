"use client";

import { Bot, Brain, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";

import { Button3D } from "@/components/design/button-3d";
import { LoadingDots } from "@/components/design/loading";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type Message = { role: "user" | "assistant"; content: string };

export function ChatbotWidget() {
  const token = useAuthStore((state) => state.accessToken);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I am HealthAI Assistant. Tell me what changed, how severe it feels, and when it started." }
  ]);
  const sessionId = useMemo(() => `session-${Math.random().toString(36).slice(2)}`, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || !token) return;
    const next = input.trim();
    setMessages((items) => [...items, { role: "user", content: next }]);
    setInput("");
    setLoading(true);
    try {
      const response = await api.chat(token, { session_id: sessionId, message: next });
      setMessages((items) => [...items, { role: "assistant", content: response.answer }]);
    } finally {
      setLoading(false);
    }
  }

  if (!token) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 grid h-[60px] w-[60px] place-items-center rounded-full bg-button-gradient text-white shadow-neon"
        aria-label="Open HealthAI Assistant"
      >
        <span className="absolute inset-0 animate-pulseRing rounded-full bg-bio-cyan/30" />
        <Brain className="relative h-7 w-7" />
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass-panel fixed bottom-24 right-4 z-50 flex h-[520px] w-[min(380px,calc(100vw-2rem))] flex-col rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-bio-cyan/15 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-button-gradient">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold">HealthAI Assistant</p>
                  <p className="text-xs text-bio-success">Online</p>
                </div>
              </div>
              <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="text-bio-muted hover:text-bio-ice">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={message.role === "user" ? "ml-auto max-w-[82%] rounded-2xl bg-bio-cyan/20 p-3 text-sm text-bio-ice" : "mr-auto max-w-[86%] rounded-2xl border border-bio-cyan/10 bg-black/30 p-3 text-sm text-bio-muted"}
                >
                  {message.content}
                </motion.div>
              ))}
              {loading ? (
                <div className="mr-auto max-w-[86%] rounded-2xl border border-bio-cyan/10 bg-black/30 p-3">
                  <LoadingDots />
                </div>
              ) : null}
            </div>
            <form onSubmit={submit} className="flex gap-2 border-t border-bio-cyan/15 p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about symptoms..."
                className="h-11 flex-1 rounded-xl border border-bio-cyan/20 bg-black/40 px-4 text-sm outline-none transition focus:border-bio-cyan/70"
              />
              <Button3D aria-label="Send message" className="h-11 min-h-11 px-4">
                <Send className="h-4 w-4" />
              </Button3D>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
