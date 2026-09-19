import React, { useState, useEffect } from "react";
import { joinMatch, leaveMatch, getMatchPlayers } from "../api/matchupApi";

export default function MatchDetailScreen({ match: initialMatch, isMyMatch, onBack, onChat }) {
  const [match, setMatch] = useState(initialMatch);
  const [joined, setJoined] = useState(isMyMatch || initialMatch.isMyMatch);
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Dohvaćanje svih prijavljenih igrača pri učitavanju ili promjeni statusa prijave
  useEffect(() => {
    let isMounted = true;
    setLoadingPlayers(true);

    getMatchPlayers(match.id)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setPlayers(data);
        }
      })
      .catch((err) => {
        console.error("Greška pri učitavanju igrača:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingPlayers(false);
      });

    return () => { isMounted = false; };
  }, [match.id, joined]);

  const handleToggleJoin = async () => {
    if (loadingAction) return;
    setLoadingAction(true);

    try {
      if (joined) {
        await leaveMatch(match.id);
        setJoined(false);
        setMatch((prev) => ({ ...prev, joined: Math.max(0, prev.joined - 1) }));
      } else {
        await joinMatch(match.id);
        setJoined(true);
        setMatch((prev) => ({ ...prev, joined: prev.joined + 1 }));
      }
    } catch (err) {
      alert(err.message || "Greška pri promjeni statusa prijave.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Dinamičko izračunavanje na temelju dužine niza učitanih igrača
  const currentJoined = players.length > 0 ? players.length : match.joined;
  const pct = currentJoined / match.total;
  const spotsLeft = Math.max(0, match.total - currentJoined);
  const isFull = currentJoined >= match.total && !joined;

  return (
    <div className="h-full flex flex-col overflow-hidden relative bg-[#0F0F11]">
      {/* Mapa Gore */}
      <div className="relative h-[40%] shrink-0 overflow-hidden bg-[#141416]">
        <iframe
          title="Match location"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${match.lng - 0.04},${match.lat - 0.025},${match.lng + 0.04},${match.lat + 0.025}&layer=mapnik&marker=${match.lat},${match.lng}`}
          className="w-full h-full border-0 invert hue-rotate-180 saturate-75 brightness-75"
        />

        {/* Gornja Dugmad */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-4 pb-4 bg-gradient-to-b from-[#0F0F11]/85 to-transparent flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#0F0F11]/70 border border-white/10 backdrop-blur-md flex items-center justify-center text-[#F5F5F3] cursor-pointer hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {joined && (
            <button
              onClick={() => onChat(match.id)}
              className="rounded-xl bg-[#0F0F11]/70 border border-white/10 backdrop-blur-md flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F5F5F3] cursor-pointer hover:bg-white/10 transition-colors"
            >
              Chat
            </button>
          )}
        </div>
      </div>

      {/* Donji Detalji */}
      <div className="flex-1 overflow-y-auto bg-[#0F0F11] rounded-t-3xl -mt-5 z-10 relative scrollbar-hidden">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        <div className="p-5 pb-32">
          {/* Tagovi za Sport i Nivo */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-semibold text-[#F5F5F3]/70 flex items-center gap-1.5">
              <span>{match.sportEmoji}</span> {match.sport}
            </span>
            <span className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-full px-3 py-1 text-xs font-bold text-[#D4FF00]">
              {match.level} · {match.levelSrb}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-[#F5F5F3] tracking-tight mb-1">
            {match.venue}
          </h1>
          <div className="text-xs text-[#F5F5F3]/45 mb-4 flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5 text-[#D4FF00]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
            {match.address} · {match.distance} km
          </div>

          {/* Vrijeme i Datum */}
          <div className="flex items-center gap-2.5 p-3.5 bg-[#1C1C1E] border border-white/10 rounded-xl mb-5">
            <div className="flex-1">
              <div className="text-xs font-bold text-[#F5F5F3]">
                {match.dateLabel}, {match.timeRange}
              </div>
              <div className="text-[11px] text-[#F5F5F3]/30 mt-0.5">Dolazak 15 min ranije</div>
            </div>
            <div className="bg-[#D4FF00]/10 border border-[#D4FF00]/20 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#D4FF00]">
              {match.timeLeft}
            </div>
          </div>

          {/* Popunjenost Mesta (Sinhronizovano) */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-[#F5F5F3]">Igrači</span>
              <span className="text-xs font-bold text-[#D4FF00]">{currentJoined} / {match.total}</span>
            </div>
            <div className="bg-white/10 rounded-full h-1.5 mb-1">
              <div className="bg-[#D4FF00] rounded-full h-1.5 transition-all duration-300" style={{ width: `${Math.min(100, pct * 100)}%` }} />
            </div>
            <div className="text-[11px] text-[#F5F5F3]/30">
              {spotsLeft} {spotsLeft === 1 ? "slobodno mjesto" : "slobodnih mjesta"}
            </div>
          </div>

          {/* Lista Potvrđenih Igrača */}
          <div className="mb-5">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#F5F5F3]/30 mb-3">
              Potvrđeni igrači ({players.length > 0 ? players.length : 1})
            </div>
            <div className="flex flex-col gap-2">
              {players.length > 0 ? (
                players.map((p) => (
                  <div key={p.id || p.initials} className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#242426] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F5F5F3]">
                        {p.initials}
                      </div>
                      <span className="text-xs font-semibold text-[#F5F5F3]">{p.name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 rounded-full border border-[#D4FF00]/20">
                      {p.showUpRate}% dolazak
                    </span>
                  </div>
                ))
              ) : (
                /* Prikaz Organizatora kao Fallback */
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-2 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#242426] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F5F5F3]">
                      {match.hostInitials || "MU"}
                    </div>
                    <span className="text-xs font-semibold text-[#F5F5F3]">{match.host || "Organizator"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 rounded-full border border-[#D4FF00]/20">
                    100% dolazak
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donja Fiksirana Traka */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#0F0F11]/95 backdrop-blur-xl border-t border-white/10 p-4 pb-7 flex items-center justify-between">
        <div>
          <div className="text-xl font-extrabold text-[#F5F5F3]">
            {match.pricePerPerson === 0 ? "Besplatno" : `${match.pricePerPerson.toLocaleString()} ${match.currency}`}
          </div>
          {match.pricePerPerson > 0 && (
            <div className="text-[11px] text-[#F5F5F3]/35">po osobi</div>
          )}
        </div>

        <button
          onClick={handleToggleJoin}
          disabled={isFull || loadingAction}
          className={`px-7 py-3 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
            isFull
              ? "bg-white/5 text-[#F5F5F3]/30 cursor-default"
              : joined
              ? "bg-[#D4FF00]/12 text-[#D4FF00] border border-[#D4FF00]/30"
              : "bg-[#D4FF00] text-[#0F0F11]"
          }`}
        >
          {loadingAction ? "Učitavanje..." : isFull ? "Popunjeno" : joined ? "✓ Prijavljen" : "Pridruži se"}
        </button>
      </div>
    </div>
  );
}