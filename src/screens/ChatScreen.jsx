import React, { useState, useRef, useEffect } from "react";
import { useChatWebSocket } from "../hooks/useChatWebSocket";

export default function ChatScreen({ chat, currentUserId, onBack }) {
  const { messages, sendMessage, isConnected } = useChatWebSocket(chat.id);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    sendMessage(text);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0F0F11]">
      <header
        className="shrink-0 border-b border-white/[0.08] bg-[#111113]/95 px-4 pb-4 backdrop-blur-xl"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Nazad"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#F5F5F3]/80 transition-colors hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M19 12H5m7 7-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4FF00]/15 bg-[#D4FF00]/[0.08] text-xl">
            {chat.sportEmoji || "⚽"}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="m-0 truncate text-sm font-bold tracking-tight text-[#F5F5F3]">
              {chat.name}
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#F5F5F3]/45">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected ? "bg-[#D4FF00]" : "bg-white/30"
                }`}
              />
              <span>{chat.participants || 0} igrača</span>
              <span className="text-white/20">·</span>
              <span>{isConnected ? "Povezano" : "Povezivanje..."}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 scrollbar-hidden">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-2xl">
              💬
            </div>
            <p className="m-0 text-sm font-semibold text-[#F5F5F3]/75">
              Započni razgovor
            </p>
            <p className="mb-0 mt-1 max-w-56 text-xs leading-relaxed text-[#F5F5F3]/35">
              Pošalji poruku ekipi i dogovorite detalje meča.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isUser = msg.senderId === currentUserId;
              const prev = messages[idx - 1];
              const sameSender = prev && prev.senderId === msg.senderId;

              if (isUser) {
                return (
                  <div
                    key={msg.id || idx}
                    className="flex justify-end"
                  >
                    <div className="max-w-[82%]">
                      <div className="rounded-2xl rounded-tr-md bg-[#D4FF00] px-4 py-2.5 text-[13px] font-medium leading-relaxed text-[#111113] shadow-[0_4px_16px_rgba(212,255,0,0.08)]">
                        {msg.text}
                      </div>
                      {msg.time && (
                        <div className="mt-1.5 pr-1 text-right text-[10px] text-[#F5F5F3]/30">
                          {msg.time}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id || idx}
                  className="flex items-end gap-2"
                >
                  <div className="w-8 shrink-0">
                    {!sameSender && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#242426] text-[9px] font-bold text-[#F5F5F3]/80">
                        {msg.senderInitials || "?"}
                      </div>
                    )}
                  </div>

                  <div className="max-w-[82%]">
                    {!sameSender && msg.senderName && (
                      <div className="mb-1.5 pl-1 text-[10px] font-semibold text-[#F5F5F3]/45">
                        {msg.senderName}
                      </div>
                    )}
                    <div className="rounded-2xl rounded-tl-md border border-white/[0.08] bg-[#1C1C1E] px-4 py-2.5 text-[13px] leading-relaxed text-[#F5F5F3]/90">
                      {msg.text}
                    </div>
                    {msg.time && (
                      <div className="mt-1.5 pl-1 text-[10px] text-[#F5F5F3]/30">
                        {msg.time}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer
        className="shrink-0 border-t border-white/[0.08] bg-[#111113]/95 px-4 pt-3 backdrop-blur-xl"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        }}
      >
        <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-[#1C1C1E] p-1.5 pl-4 transition-colors focus-within:border-[#D4FF00]/40">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKey}
            placeholder="Napiši poruku..."
            aria-label="Napiši poruku"
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[13px] text-[#F5F5F3] outline-none placeholder:text-[#F5F5F3]/30"
          />

          <button
            type="button"
            onClick={send}
            disabled={!input.trim()}
            aria-label="Pošalji poruku"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
              input.trim()
                ? "cursor-pointer bg-[#D4FF00] text-[#111113] hover:bg-[#c2eb00]"
                : "cursor-default bg-white/[0.05] text-[#F5F5F3]/25"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M22 2 11 13m11-11-7 20-4-9-9-4 20-7Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <p className="mb-0 mt-2 text-center text-[10px] text-[#F5F5F3]/25">
          Enter za slanje
        </p>
      </footer>
    </div>
  );
}