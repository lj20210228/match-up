import React from "react";
import { CHATS } from "../data/chats";

export default function ChatListScreen({ onChatPress }) {
  const totalUnread = CHATS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11]">
      {/* Header */}
      <div className="pt-14 px-5 pb-4 shrink-0">
        <div className="flex items-end justify-between mb-1">
          <h1 className="text-2xl font-extrabold text-[#F5F5F3] tracking-tight m-0">
            Poruke
          </h1>
          {totalUnread > 0 && (
            <div className="bg-[#D4FF00] text-[#0F0F11] rounded-full text-[11px] font-extrabold px-2.5 py-0.5 mb-1">
              {totalUnread} novo
            </div>
          )}
        </div>
        <p className="m-0 text-xs text-[#F5F5F3]/40 font-normal">
          Grupni četovi mečeva
        </p>
      </div>

      <div className="h-[1px] bg-white/5 shrink-0" />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-hidden">
        {CHATS.map((chat) => (
          <ChatRow key={chat.id} chat={chat} onPress={() => onChatPress(chat)} />
        ))}
      </div>
    </div>
  );
}

function ChatRow({ chat, onPress }) {
  return (
    <div
      onClick={onPress}
      className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.02]"
    >
      {/* Sport avatar */}
      <div className="w-[50px] h-[50px] rounded-[16px] bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-2xl shrink-0 relative">
        {chat.sportEmoji}
        {chat.unread > 0 && (
          <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#D4FF00] border-2 border-[#0F0F11] flex items-center justify-center text-[9px] font-extrabold text-[#0F0F11]">
            {chat.unread}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-sm font-bold text-[#F5F5F3] tracking-tight">
            {chat.name}
          </div>
          <div className="text-[11px] text-[#F5F5F3]/30 shrink-0 ml-2">
            {chat.lastMessageTime}
          </div>
        </div>
        <div className="text-xs text-[#F5F5F3]/40 truncate mb-1">
          {chat.lastMessage}
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-2.5 h-2.5 text-[#F5F5F3]/25" fill="none" viewBox="0 0 24 24">
            <path
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[11px] text-[#F5F5F3]/25">
            {chat.participants} igrača · {chat.venue}
          </span>
        </div>
      </div>

      <svg className="w-3.5 h-3.5 text-[#F5F5F3]/20 shrink-0" fill="none" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}