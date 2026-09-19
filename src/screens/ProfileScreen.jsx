import React, { useState } from "react";
import { logout } from "../api/matchupApi"; // Prilagodi putanju do tvog API fajla

const ALL_SPORTS = [
  { name: "Football", emoji: "⚽" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Tennis", emoji: "🎾" },
  { name: "Padel", emoji: "🏸" },
  { name: "Running", emoji: "🏃" },
];

export default function ProfileScreen({ onLogout }) {
  const [selectedSports, setSelectedSports] = useState(["Football", "Basketball"]);
  const [level, setLevel] = useState("Rekreativno");
  const [editing, setEditing] = useState(false);

  const toggleSport = (sport) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleLogout = async () => {
    try {
      // Pozivamo backend logout ako postoji
      await logout().catch(() => {});
    } finally {
      // Brišemo lokalno sačuvani token i podatke o korisniku
      localStorage.removeItem("matchup_token");
      localStorage.removeItem("user");

      // Obaveštavamo roditeljsku komponentu (App.jsx) da prebaci na AuthScreen
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11]">
      <div className="flex-1 overflow-y-auto scrollbar-hidden">
        <div className="pt-14 px-5 pb-24">
          
          <div className="flex items-start justify-between mb-6">
            <div className="flex gap-3.5 items-center">
              <div className="w-17 h-17 rounded-2xl bg-gradient-to-br from-[#242426] to-[#1a1a1c] border border-white/12 flex items-center justify-center text-xl font-bold text-[#F5F5F3]">
                MK
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#F5F5F3] tracking-tight mb-0.5">
                  Miloš Kovačević
                </h2>
                <div className="text-xs text-[#F5F5F3]/45 flex items-center gap-1 font-medium">
                  Beograd, Srbija
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                editing ? "bg-[#D4FF00] text-[#0F0F11]" : "bg-white/[0.07] text-[#F5F5F3]/65 border border-white/10"
              }`}
            >
              {editing ? "Sačuvaj" : "Uredi"}
            </button>
          </div>

          <div className="bg-[#1C1C1E] border border-[#D4FF00]/15 rounded-2xl p-4 flex items-center gap-3.5 mb-5">
            <div className="text-3xl font-black text-[#D4FF00] tracking-tight">★ 4.9</div>
            <div>
              <div className="text-xs font-bold text-[#F5F5F3]">Karma ocena</div>
              <div className="text-[11px] text-[#F5F5F3]/38">Na osnovu 24 mečeva · Top 5% igrača</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/30 mb-3">
              Moji sportovi
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_SPORTS.map(({ name, emoji }) => {
                const active = selectedSports.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => editing && toggleSport(name)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      editing ? "cursor-pointer" : "cursor-default"
                    } ${
                      active ? "bg-[#D4FF00] text-[#0F0F11]" : "bg-white/[0.07] text-[#F5F5F3]/45 border border-white/10"
                    }`}
                  >
                    <span>{emoji}</span> {name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/30 mb-3">
              Nivo igre
            </div>
            <div className="flex gap-2">
              {["Početnik", "Rekreativno", "Napredni"].map((l) => (
                <button
                  key={l}
                  onClick={() => editing && setLevel(l)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    editing ? "cursor-pointer" : "cursor-default"
                  } ${
                    level === l ? "bg-[#D4FF00] text-[#0F0F11]" : "bg-white/[0.07] text-[#F5F5F3]/45 border border-white/10"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden">
            {[
              { icon: "🔔", label: "Notifikacije", onClick: () => {} },
              { icon: "🔒", label: "Privatnost", onClick: () => {} },
              { icon: "📍", label: "Moj grad", onClick: () => {} },
              { icon: "🚪", label: "Odjava", danger: true, onClick: handleLogout },
            ].map(({ icon, label, danger, onClick }, i, arr) => (
              <div
                key={label}
                onClick={onClick}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors ${
                  i < arr.length - 1 ? "border-b border-white/5" : ""
                }`}
              >
                <span className="text-base">{icon}</span>
                <span className={`flex-1 text-sm font-medium ${danger ? "text-red-400" : "text-[#F5F5F3]"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}