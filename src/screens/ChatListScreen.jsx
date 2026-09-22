import React, { useCallback, useEffect, useState } from "react";
import { listChats } from "../api/matchupApi";

export default function ChatListScreen({
  onChatPress,
  onUnreadChange,
  refreshKey,
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await listChats();
      const loadedChats = Array.isArray(data) ? data : [];

      setChats(loadedChats);

      const unreadTotal = loadedChats.reduce(
        (sum, chat) => sum + Number(chat.unread || 0),
        0
      );

      onUnreadChange(unreadTotal);
    } catch (err) {
      console.error("Greška pri učitavanju četova:", err);
      setError("Četovi trenutno nisu dostupni.");
      onUnreadChange(0);
    } finally {
      setLoading(false);
    }
  }, [onUnreadChange]);

  useEffect(() => {
    loadChats();
  }, [loadChats, refreshKey]);

  const totalUnread = chats.reduce(
    (sum, chat) => sum + Number(chat.unread || 0),
    0
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11]">
      <div className="pt-4 px-5 pb-4 shrink-0">
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

        <p className="m-0 text-xs text-[#F5F5F3]/40">
          Grupni četovi mečeva
        </p>
      </div>

      <div className="h-px bg-white/5 shrink-0" />

      <div className="flex-1 overflow-y-auto py-2 scrollbar-hidden">
        {loading && (
          <div className="px-5 py-8 text-center text-xs text-[#F5F5F3]/40">
            Učitavanje četova...
          </div>
        )}

        {!loading && error && (
          <div className="px-5 py-8 text-center text-xs text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && chats.length === 0 && (
          <div className="px-5 py-8 text-center text-xs text-[#F5F5F3]/40">
            Još nemaš aktivnih četova.
          </div>
        )}

        {chats.map((chat) => (
          <ChatRow
            key={chat.id}
            chat={chat}
            onPress={() => onChatPress(chat)}
          />
        ))}
      </div>
    </div>
  );
}

function ChatRow({ chat, onPress }) {
  const unread = Number(chat.unread || 0);

  const unreadLabel =
    unread === 0
      ? "Nema nepročitanih poruka"
      : unread === 1
        ? "1 nepročitana poruka"
        : `${unread} nepročitanih poruka`;

  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left cursor-pointer border-b border-white/5 transition-colors hover:bg-white/[0.02]"
    >
      <div className="w-[50px] h-[50px] rounded-[16px] bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-2xl shrink-0 relative">
        {chat.sportEmoji || "⚽"}

        {unread > 0 && (
          <div className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-[#D4FF00] border-2 border-[#0F0F11] flex items-center justify-center text-[9px] font-extrabold text-[#0F0F11] px-1">
            {unread}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[#F5F5F3] tracking-tight truncate">
          {chat.name || "Grupni čet"}
        </div>

        <div
          className={`text-xs truncate mt-1 ${
            unread > 0
              ? "text-[#D4FF00] font-semibold"
              : "text-[#F5F5F3]/40"
          }`}
        >
          {unreadLabel}
        </div>
      </div>
    </button>
  );
}