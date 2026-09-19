import React, { useState, useEffect } from "react";
import { getMyMatches } from "../api/matchupApi";
import CreateMatchModal from "../components/CreateMatchModal"; // Prilagodi putanju do modala

export default function MatchesScreen({ onMatchPress }) {
  const [tab, setTab] = useState("joined");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stanje za prikaz modala za dodavanje meča
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchMatches = () => {
    let isMounted = true;
    setLoading(true);

    getMyMatches(tab)
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
  };

  useEffect(() => {
    fetchMatches();
  }, [tab]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0F0F11] relative">
      <div className="pt-14 px-5 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-extrabold text-[#F5F5F3] tracking-tight">
            Moji mečevi
          </h1>
          
          {/* Dugme za otvaranje modala */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#D4FF00] text-[#0F0F11] text-xs font-extrabold px-3.5 py-2 rounded-full cursor-pointer hover:bg-[#c2eb00] transition-all flex items-center gap-1 shrink-0"
          >
            <span>+</span> Organizuj
          </button>
        </div>

        <p className="text-xs text-[#F5F5F3]/40 mb-4 font-normal">
          Predstojeći i prošli mečevi
        </p>

        {/* Tabovi */}
        <div className="flex gap-2">
          {["joined", "hosted"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4.5 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                tab === t
                  ? "bg-[#D4FF00] text-[#0F0F11]"
                  : "bg-white/[0.07] text-[#F5F5F3]/55 border border-white/10"
              }`}
            >
              {t === "joined" ? "Prijavljen" : "Organizujem"}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-white/5 mt-4 shrink-0" />

      <div className="flex-1 overflow-y-auto p-5 space-y-2.5 scrollbar-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#F5F5F3]/40 text-xs font-medium">
            Učitavanje mečeva...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-400 text-xs font-medium">
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-3/5 gap-3 text-center">
            <span className="text-4xl">🏟️</span>
            <div className="text-sm font-semibold text-[#F5F5F3]/45">
              {tab === "joined" ? "Niste prijavljeni ni na jedan meč" : "Niste kreirali nijedan meč"}
            </div>
            {tab === "hosted" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-xs font-bold text-[#D4FF00] underline bg-transparent border-0 cursor-pointer"
              >
                Kreirajte svoj prvi meč
              </button>
            )}
          </div>
        ) : (
          matches.map((match) => (
            <div
              key={match.id}
              onClick={() => onMatchPress(match)}
              className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4 cursor-pointer flex gap-3.5 items-start hover:border-white/20 transition-all"
            >
              <div className="w-11.5 h-11.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
                {match.sportEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#F5F5F3] leading-snug mb-0.5 truncate">
                  {match.venue}
                </div>
                <div className="text-xs text-[#F5F5F3]/40 mb-2">
                  {match.dateLabel} · {match.timeRange}
                </div>
                <div className="bg-white/10 rounded-full h-1 mb-1.5">
                  <div
                    className="bg-[#D4FF00] rounded-full h-1"
                    style={{ width: `${Math.min(100, (match.joined / match.total) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#F5F5F3]/35">
                  <span>
                    {match.joined}/{match.total} igrača
                  </span>
                  <span className="font-semibold text-[#D4FF00]">
                    {match.pricePerPerson === 0
                      ? "Besplatno"
                      : `${match.pricePerPerson} ${match.currency}/os.`}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Sheet Modal za kreiranje novog meča */}
      <CreateMatchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onMatchCreated={() => {
          setTab("hosted"); // Automatski prebacuje na "Organizujem" tab
          fetchMatches();   // Osvežava listu iz baze
        }}
      />
    </div>
  );
}