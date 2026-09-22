import React, { useState, useEffect,useCallback } from "react";
import FeedScreen from "./screens/FeedScreen";
import AuthScreen from "./screens/AuthScreen";

import MatchesScreen from "./screens/MatchesScreen";
import MatchDetailScreen from "./screens/MatchDetailScreen";
import ChatListScreen from "./screens/ChatListScreen";
import ChatScreen from "./screens/ChatScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";

export default function App() {
  const [nav, setNav] = useState({ tab: "explore", screen: "main" });
  const [totalUnread, setTotalUnread] = useState(0);
const [chatListVersion, setChatListVersion] = useState(0);
  // Provera postojanja tokena u localStorage pri pokretanju
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("matchup_token");
  });






  const handleLogout = () => {
    localStorage.removeItem("matchup_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setNav({ tab: "explore", screen: "main" });
  };

  const goToMatch = (match, isMyMatch) => {
    setNav((prev) => ({ ...prev, screen: "matchDetail", selectedMatch: match, isMyMatch }));
  };

  const goToChat = (chatId) => {
    const chat = listChats.find((c) => c.id === chatId) ?? CHATS[0];
    setNav((prev) => ({ tab: "chat", screen: "chat", selectedChat: chat }));
  };

  const goBack = () => {
    setNav((prev) => ({ ...prev, screen: "main" }));
  };
const switchTab = (tab) => {
  if (tab === "chat") {
    setChatListVersion((version) => version + 1);
  }

  setNav({ tab, screen: "main" });
};
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }


  const renderScreen = () => {
    if (nav.screen === "matchDetail" && nav.selectedMatch) {
      return (
        <MatchDetailScreen
          match={nav.selectedMatch}
          isMyMatch={nav.isMyMatch ?? false}
          onBack={goBack}
          onChat={goToChat}
        />
      );
    }

    if (nav.screen === "chat" && nav.selectedChat) {
  return (
    <ChatScreen
      chat={nav.selectedChat}
      onBack={() => {
        setChatListVersion((version) => version + 1);
        setNav((prev) => ({
          ...prev,
          screen: "main",
          tab: "chat",
        }));
      }}
    />
  );
}

    switch (nav.tab) {
      case "explore":
        return <FeedScreen onMatchPress={(m) => goToMatch(m, false)} />;
      case "matches":
        return <MatchesScreen onMatchPress={(m) => goToMatch(m, true)} />;
      case "map":
        return <MapScreen onMatchPress={(m) => goToMatch(m, false)} />;
      case "chat":
        return (
          <ChatListScreen
      refreshKey={chatListVersion}
      onUnreadChange={setTotalUnread}
      onChatPress={(chat) => {
        setNav({
          tab: "chat",
          screen: "chat",
          selectedChat: chat,
        });
      }}
    />
        );
      case "profile":
        return <ProfileScreen onLogout={handleLogout} />;
      default:
        return <FeedScreen onMatchPress={(m) => goToMatch(m, false)} />;
    }
  };

  const isFullscreen = nav.screen === "matchDetail";

  return (
    <div className="w-full h-[100dvh] max-w-[430px] mx-auto bg-[#0F0F11] flex flex-col overflow-hidden relative">
      {/* Ekranski sadržaj */}
      <div className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </div>

      {/* Tab Bar — sakriva se u fullscreen pregledu */}
      {!isFullscreen && (
        <div className="bg-[#0F0F11] border-t border-white/[0.07] flex items-center justify-around py-[10px] pb-[22px] shrink-0 z-50">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = nav.tab === id && nav.screen === "main";
            return (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer px-[14px] py-[4px] relative transition-colors duration-150 ${
                  isActive ? "text-[#D4FF00]" : "text-[#F5F5F3]/30"
                }`}
              >
                <Icon active={isActive} />
                {id === "chat" && totalUnread > 0 && (
                  <div className="absolute top-0 right-[6px] w-4 h-4 rounded-full bg-[#D4FF00] border-2 border-[#0F0F11] flex items-center justify-center text-[8px] font-extrabold text-[#0F0F11]">
                    {totalUnread}
                  </div>
                )}
                <span className={`text-[10px] tracking-tight ${isActive ? "font-bold" : "font-medium"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Ikone za Tab Bar ──────────────────────────────────────────────────────────

const TAB_ITEMS = [
  { id: "explore", label: "Istraži", icon: CompassIcon },
  { id: "matches", label: "Mečevi", icon: ShieldIcon },
  { id: "map", label: "Mapa", icon: MapIcon },
  { id: "chat", label: "Poruke", icon: ChatIcon },
  { id: "profile", label: "Profil", icon: ProfileIcon },
];

function CompassIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path
        d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
        fill={active ? "#D4FF00" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3L4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "rgba(212,255,0,0.15)" : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7M9 20l6-3M9 20V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7M9 7l6-3"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "rgba(212,255,0,0.08)" : "none"}
      />
    </svg>
  );
}

function ChatIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        fill={active ? "rgba(212,255,0,0.15)" : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}