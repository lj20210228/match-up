import React, { useState, useEffect } from "react";
import { listMatches } from "../api/matchupApi";

const sports = ["Svi", "Football", "Basketball", "Tennis", "Padel", "Running"];
const sportEmojis = {
  Football: "⚽",
  Basketball: "🏀",
  Tennis: "🎾",
  Padel: "🏸",
  Running: "🏃",
};

export default function MapScreen({ onMatchPress }) {
  const [activeSport, setActiveSport] = useState("Svi");
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dohvatanje realnih mečeva sa API-ja
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const sportParam = activeSport === "Svi" ? null : activeSport;

    listMatches(sportParam)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          // Filtriramo samo mečeve koji imaju slobodna mesta i validne koordinate
          const availableMatches = data.filter(
            (m) => m.joined < m.total && m.lat != null && m.lng != null
          );
          setMatches(availableMatches);
        }
      })
      .catch((err) => {
        console.error("Greška pri učitavanju mečeva za mapu:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSport]);

  const centerLat = 44.806;
  const centerLng = 20.465;

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-[#0F0F11]">
      {/* OpenStreetMap Prikaz */}
      <div className="absolute inset-0">
        <iframe
          title="Matches map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.08},${centerLat - 0.05},${centerLng + 0.08},${centerLat + 0.05}&layer=mapnik`}
          className="w-full h-full border-0 invert hue-rotate-180 saturate-75 brightness-75"
        />
      </div>

      {/* Overlay sa pinovima */}
      <div className="absolute inset-0 pointer-events-none">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0F0F11]/40 backdrop-blur-xs pointer-events-auto">
            <span className="text-xs font-semibold text-[#D4FF00] bg-[#0F0F11]/80 px-4 py-2 rounded-full border border-white/10">
              Učitavanje mečeva na mapi...
            </span>
          </div>
        ) : (
          matches.map((match) => {
            const lngRange = 0.16;
            const latRange = 0.10;
            const x = ((match.lng - (centerLng - lngRange / 2)) / lngRange) * 100;
            const y = (1 - (match.lat - (centerLat - latRange / 2)) / latRange) * 100;
            const isSelected = selectedMatch?.id === match.id;

            return (
              <div
                key={match.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMatch(isSelected ? null : match);
                }}
                style={{
                  left: `${Math.max(5, Math.min(95, x))}%`,
                  top: `${Math.max(5, Math.min(90, y))}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-full pointer-events-auto cursor-pointer transition-transform ${
                  isSelected ? "z-20 scale-110" : "z-10 scale-100"
                }`}
              >
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 transition-all ${
                    isSelected
                      ? "bg-[#D4FF00] border-2 border-[#D4FF00] rounded-t-xl rounded-bl-xl shadow-lg shadow-[#D4FF00]/40"
                      : "bg-[#0F0F11] border-2 border-[#D4FF00]/50 rounded-t-lg rounded-bl-lg shadow-md"
                  }`}
                >
                  <span className="text-xs">{match.sportEmoji || "⚽"}</span>
                  {isSelected && (
                    <span className="text-[11px] font-extrabold text-[#0F0F11] whitespace-nowrap">
                      {match.venue.split(" ").slice(0, 2).join(" ")}
                    </span>
                  )}
                </div>
                <div
                  className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ml-auto mr-0 ${
                    isSelected ? "border-t-[#D4FF00]" : "border-t-[#0F0F11]"
                  }`}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Gornji filteri */}
<div className="relative z-30 pt-[calc(env(safe-area-inset-top)+0.75rem)] pointer-events-none">     <div className="px-5 pb-3 bg-gradient-to-b from-[#0F0F11]/90 via-[#0F0F11]/60 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-extrabold text-[#F5F5F3] tracking-tight m-0">
                Mečevi u blizini
              </h1>
              <div className="text-xs text-[#F5F5F3]/40 mt-0.5">
                {matches.length} dostupnih mečeva
              </div>
            </div>
            <div className="bg-[#0F0F11]/80 border border-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00]" />
              <span className="text-xs font-semibold text-[#F5F5F3]/70">Beograd</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hidden">
            {sports.map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 border border-white/10 backdrop-blur-md transition-all cursor-pointer ${
                  activeSport === sport
                    ? "bg-[#D4FF00] text-[#0F0F11] border-[#D4FF00]"
                    : "bg-[#0F0F11]/75 text-[#F5F5F3]/65"
                }`}
              >
                {sport !== "Svi" && <span className="text-xs">{sportEmojis[sport]}</span>}
                {sport}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kartica izabranog meča */}
      {selectedMatch && (
        <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-6 bg-gradient-to-t from-[#0F0F11] via-[#0F0F11]/90 to-transparent">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
            <div className="w-11.5 h-11.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
              {selectedMatch.sportEmoji || "⚽"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#F5F5F3] tracking-tight mb-0.5 truncate">
                {selectedMatch.venue}
              </div>
              <div className="text-xs text-[#F5F5F3]/40 mb-1.5">
                {selectedMatch.timeLeft} · {selectedMatch.distance} km
              </div>
              <div className="bg-white/10 rounded-full h-1">
                <div
                  className="bg-[#D4FF00] rounded-full h-1"
                  style={{
                    width: `${Math.min(100, (selectedMatch.joined / selectedMatch.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => {
                onMatchPress(selectedMatch);
                setSelectedMatch(null);
              }}
              className="bg-[#D4FF00] text-[#0F0F11] font-extrabold rounded-full px-4.5 py-2.5 text-xs shrink-0 cursor-pointer hover:bg-[#c2eb00] transition-colors"
            >
              Otvori
            </button>
          </div>
        </div>
      )}
    </div>
  );
}