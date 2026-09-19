import React, { useState, useEffect } from "react";
import { listMatches } from "../api/matchupApi"; // Tvoj klijent sa fetch logikom

const sports = ["All", "Football", "Basketball", "Tennis", "Padel", "Running"];
const distances = [
  { label: "Sve", value: null },
  { label: "< 1 km", value: 1 },
  { label: "< 3 km", value: 3 },
  { label: "< 5 km", value: 5 },
];

const sportEmojis = {
  Football: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Padel: "🏸",
  Running: "🏃",
  All: "◉",
};

export default function FeedScreen({ onMatchPress }) {
  const [activeSport, setActiveSport] = useState("All");
  const [maxDistance, setMaxDistance] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Povlačenje mečeva sa backenda pri promeni filtera
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const filters = {};
    if (activeSport !== "All") filters.sport = activeSport;
    if (maxDistance !== null) filters.maxDistance = maxDistance;
    if (searchQuery.trim() !== "") filters.q = searchQuery;

    listMatches(filters)
      .then((data) => {
        if (isMounted) {
          setMatches(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Greška pri učitavanju mečeva");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSport, maxDistance, searchQuery]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11]">
      {/* Header */}
      <div className="pt-14 px-5 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-medium text-[#F5F5F3]/40 tracking-wider uppercase">
                Dobro veče
              </span>
              <span className="bg-white/[0.07] border border-white/10 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-[#F5F5F3]/65 flex items-center gap-1">
                <span className="text-[9px]">📍</span> Beograd
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#F5F5F3] tracking-tight leading-tight m-0">
              Nađi meč
            </h1>
          </div>

          {/* Avatar + Karma Badge */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2a2a2c] to-[#1a1a1c] border border-white/12 flex items-center justify-center text-sm font-bold text-[#F5F5F3]">
              MK
            </div>
            <div className="bg-[#D4FF00]/12 border border-[#D4FF00]/25 text-[#D4FF00] rounded-full text-[11px] font-bold px-2 py-0.5 whitespace-nowrap">
              ★ 4.9
            </div>
          </div>
        </div>

        {/* Pretraga */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-xl flex items-center gap-2.5 px-4 py-3 mb-3.5">
          <svg className="w-4 h-4 text-[#F5F5F3]/30 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16.5 16.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pretraži terene, sportove..."
            className="w-full bg-transparent border-none outline-none text-sm text-[#F5F5F3] placeholder-[#F5F5F3]/30"
          />
        </div>
      </div>

      {/* Sport Pills Horizontal Filter */}
      <div className="flex gap-2 px-5 pb-2.5 overflow-x-auto shrink-0 scrollbar-hidden">
        {sports.map((sport) => {
          const isActive = activeSport === sport;
          return (
            <button
              key={sport}
              onClick={() => setActiveSport(sport)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#D4FF00] text-[#0F0F11]"
                  : "bg-white/[0.07] text-[#F5F5F3]/60 border border-white/10"
              }`}
            >
              <span className="text-xs">{sportEmojis[sport]}</span>
              {sport}
            </button>
          );
        })}
      </div>

      {/* Udaljenost / Radijus Filter */}
      <div className="px-5 pb-3.5 flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-hidden">
        <span className="text-[11px] font-semibold text-[#F5F5F3]/30 uppercase tracking-wider shrink-0 mr-1">
          Udaljenost:
        </span>
        {distances.map((d) => {
          const isActive = maxDistance === d.value;
          return (
            <button
              key={d.label}
              onClick={() => setMaxDistance(d.value)}
              className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-[#D4FF00]/15 text-[#D4FF00] border-[#D4FF00]/40"
                  : "bg-[#1C1C1E] text-[#F5F5F3]/40 border-white/5 hover:text-[#F5F5F3]/70"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Brojač i status */}
      <div className="px-5 pb-3 flex items-center justify-between shrink-0">
        <span className="text-[12px] font-semibold tracking-wider uppercase text-[#F5F5F3]/30">
          {loading ? "Učitavanje..." : `${matches.length} mečeva u blizini`}
        </span>
        <button className="text-xs font-semibold text-[#D4FF00] bg-transparent border-0 cursor-pointer">
          Mapa
        </button>
      </div>

      {/* Kartice Mečeva */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3 scrollbar-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#F5F5F3]/40 text-xs font-medium">
            Učitavanje mečeva...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-red-400 space-y-1">
            <p className="text-xs font-medium m-0">{error}</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-[#F5F5F3]/30 space-y-2">
            <span className="text-3xl">📍</span>
            <p className="text-xs font-medium m-0">Nema mečeva u izabranom radijusu.</p>
          </div>
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} onPress={() => onMatchPress(match)} />
          ))
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, onPress }) {
  const pct = match.joined / match.total;
  const spotsLeft = match.total - match.joined;
  const almostFull = pct >= 0.75;
  const isFull = match.joined >= match.total;

  return (
    <div
      onClick={onPress}
      className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4.5 cursor-pointer relative overflow-hidden transition-all hover:border-white/20"
    >
      {match.urgent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4FF00] to-[#D4FF00]/30" />
      )}

      {/* Gornji red */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg">
            {match.sportEmoji}
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/40">
              {match.sport}
            </div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${match.urgent ? "text-[#D4FF00]" : "text-[#F5F5F3]/50"}`}>
              {match.urgent && <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] animate-pulse" />}
              {match.timeLeft}
            </div>
          </div>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            isFull
              ? "bg-white/5 border-white/10 text-[#F5F5F3]/30"
              : almostFull
              ? "bg-[#D4FF00]/10 border-[#D4FF00]/20 text-[#D4FF00]"
              : "bg-white/5 border-white/10 text-[#F5F5F3]/45"
          }`}
        >
          {isFull ? "Popunjeno" : `${spotsLeft} mеst${spotsLeft === 1 ? "o" : "a"}`}
        </div>
      </div>

      {/* Naziv i adresa terena */}
      <div className="mb-3">
        <div className="text-base font-bold text-[#F5F5F3] tracking-tight leading-snug mb-0.5">
          {match.venue}
        </div>
        <div className="text-xs text-[#F5F5F3]/40 flex items-center gap-1">
          <svg className="w-3 h-3 text-current" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          </svg>
          <span className="text-[#D4FF00] font-semibold">{match.distance} km</span> • {match.address.split(",")[1]?.trim() ?? match.address}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3.5">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-[#F5F5F3]/40 font-medium">
            {match.joined}/{match.total} igrača
          </span>
          <span className={`text-[11px] font-bold ${almostFull ? "text-[#D4FF00]" : "text-[#F5F5F3]/35"}`}>
            {Math.round(pct * 100)}%
          </span>
        </div>
        <div className="bg-white/10 rounded-full h-1">
          <div className="bg-[#D4FF00] rounded-full h-1 transition-all duration-300" style={{ width: `${pct * 100}%` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-[#F5F5F3] tracking-tight">
            {match.pricePerPerson === 0 ? "Besplatno" : `${match.pricePerPerson.toLocaleString()} ${match.currency}`}
            {match.pricePerPerson > 0 && <span className="font-normal text-[#F5F5F3]/40 text-xs"> /os.</span>}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-4.5 h-4.5 rounded-full bg-[#242426] border border-white/10 flex items-center justify-center text-[7px] font-bold text-[#F5F5F3]">
              {match.hostInitials}
            </div>
            <span className="text-xs text-[#F5F5F3]/40">{match.host}</span>
          </div>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onPress(); }}
          disabled={isFull}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer ${
            isFull ? "bg-white/5 text-[#F5F5F3]/30 cursor-default" : "bg-[#D4FF00] text-[#0F0F11]"
          }`}
        >
          {isFull ? "Popunjeno" : "Pridruži se"}
        </button>
      </div>
    </div>
  );
}