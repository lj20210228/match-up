import React, { useState, useRef, useEffect } from "react";
import { useChatWebSocket } from "../hooks/useChatWebSocket";

export default function ChatScreen({ chat, currentUserId, onBack }) {
  const { messages, sendMessage, isConnected } = useChatWebSocket(chat.id);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  console.log(chat);

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
            {chat.sportEmoji || "⚽"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-[#F5F5F3] tracking-tight truncate">
              {chat.name}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#F5F5F3]/40 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              {chat.participants || 0} igrača
            </div>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-hidden">
        {messages.map((msg, idx) => {
          const isUser = msg.senderId === currentUserId;
          const prev = messages[idx - 1];
          const sameSender = prev && prev.senderId === msg.senderId;
          if (isUser) {
            return (
              <div key={msg.id || idx} className="flex justify-end mb-1">
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
            <div key={msg.id || idx} className="flex gap-2 mb-1 items-end">
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
                    {msg.senderName}
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