import React, { useState, useRef, useEffect } from "react";

export default function ChatScreen({ chat, onBack }) {
  const [messages, setMessages] = useState(chat.messages);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages(chat.messages);
  }, [chat.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { id: Date.now(), type: "user", text, time }]);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11]">
      {/* Header */}
      <div className="bg-[#0F0F11] border-b border-white/10 pt-12 px-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5F5F3] shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="w-9 h-9 rounded-xl bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-lg shrink-0">
            {chat.sportEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#F5F5F3] tracking-tight truncate">
              {chat.name}
            </div>
            <div className="text-[11px] text-[#F5F5F3]/40 mt-0.5">
              {chat.participants} igrača
            </div>
          </div>

          {/* Stacked avatars */}
          <div className="flex shrink-0">
            {["MK", "JP", "BN"].map((init, i) => (
              <div
                key={init}
                className={`w-6.5 h-6.5 rounded-full bg-[#242426] border-2 border-[#0F0F11] flex items-center justify-center text-[8px] font-bold text-[#F5F5F3] relative ${
                  i !== 0 ? "-ml-2" : ""
                }`}
                style={{ zIndex: 3 - i }}
              >
                {init}
              </div>
            ))}
            <div className="w-6.5 h-6.5 rounded-full bg-[#D4FF00]/15 border-2 border-[#0F0F11] flex items-center justify-center text-[8px] font-bold text-[#D4FF00] -ml-2 relative">
              +{chat.participants - 3}
            </div>
          </div>
        </div>

        {/* Match info banner */}
        <div className="flex items-center gap-2.5 p-3 bg-[#1C1C1E] rounded-t-xl border border-white/10 border-b-0">
          <div className="flex-1">
            <div className="text-xs font-bold text-[#F5F5F3] tracking-tight">
              {chat.venue}
            </div>
            <div className="text-[11px] text-[#F5F5F3]/35 mt-0.5">
              {chat.participants} igrača prijavljeno
            </div>
          </div>
          <button className="bg-transparent border-0 text-xs font-semibold text-[#D4FF00] underline decoration-[#D4FF00]/30 p-0">
            Vidi meč
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-hidden">
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const sameSender = prev && prev.type === msg.type && prev.sender === msg.sender;

          if (msg.type === "system") {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="bg-white/5 text-zinc-400 text-[11px] px-3 py-1 rounded-full border border-white/5">
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === "user") {
            return (
              <div key={msg.id} className="flex justify-end mb-1">
                <div className="max-w-[75%]">
                  <div className="bg-[#D4FF00] text-[#0F0F11] px-3.5 py-2 rounded-2xl rounded-tr-none text-xs font-medium leading-relaxed">
                    {msg.text}
                  </div>
                  <div className="text-right text-[10px] text-[#F5F5F3]/25 mt-1 pr-1">
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex gap-2 mb-1 items-end">
              <div className="w-7 shrink-0">
                {!sameSender && (
                  <div className="w-7 h-7 rounded-full bg-[#242426] border border-white/10 flex items-center justify-center text-[9px] font-bold text-[#F5F5F3]">
                    {msg.senderInitials}
                  </div>
                )}
              </div>
              <div className="max-w-[75%]">
                {!sameSender && (
                  <div className="text-[10px] font-semibold text-[#F5F5F3]/35 mb-1 pl-1">
                    {msg.sender}
                  </div>
                )}
                <div className="bg-[#1C1C1E] border border-white/10 text-[#F5F5F3] px-3.5 py-2 rounded-2xl rounded-tl-none text-xs leading-relaxed">
                  {msg.text}
                </div>
                <div className="text-[10px] text-[#F5F5F3]/20 mt-1 pl-1">
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 pb-7 bg-[#0F0F11] border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <button className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#F5F5F3]/40 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path
                d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex-1 bg-[#1C1C1E] border border-white/10 rounded-full flex items-center px-4 h-10">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Poruka..."
              className="flex-1 bg-transparent border-0 outline-none text-xs text-[#F5F5F3] caret-[#D4FF00]"
            />
          </div>

          <button
            onClick={send}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              input.trim() ? "bg-[#D4FF00] text-[#0F0F11]" : "bg-white/5 text-[#F5F5F3]/20"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}