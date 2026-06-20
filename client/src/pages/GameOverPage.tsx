import React, { useMemo } from 'react';
import { useGameStore } from '../context/gameStore';
import { GamePlayer } from '../types/game';

export default function GameOverPage() {
  const { room, myId, restartGame } = useGameStore();
  if (!room) return null;

  const { players, winner, roundHistory, settings } = room;

  const ranked = useMemo(() => {
    return [...players].sort((a, b) => {
      if (settings.winMode === 'rounds') return b.roundWins - a.roundWins;
      if (settings.winMode === 'points') return b.totalPoints - a.totalPoints;
      return b.team.length - a.team.length;
    });
  }, [players, settings.winMode]);

  const mvp = useMemo(() => {
    // Player whose cards won the most rounds
    const wins: Record<string, number> = {};
    roundHistory.forEach(r => {
      if (r.winner) wins[r.winner] = (wins[r.winner] || 0) + 1;
    });
    const topId = Object.entries(wins).sort((a, b) => b[1] - a[1])[0]?.[0];
    return players.find(p => p.id === topId) || null;
  }, [roundHistory, players]);

  const winnerPlayer = players.find(p => p.id === winner) || ranked[0];
  const isHost = players.find(p => p.id === myId)?.isHost;

  const medals = ['🥇', '🥈', '🥉'];

  const teamValue = (p: GamePlayer) =>
    p.team.reduce((sum, c) => sum + c.marketValue, 0);

  return (
    <div className="min-h-screen stadium-bg flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🏆</div>
        <h1 className="text-4xl font-black text-gold-400 uppercase tracking-widest font-display">
          Game Over
        </h1>
        {winnerPlayer && (
          <p className="text-xl text-white mt-2">
            <span className="text-gold-400 font-bold">{winnerPlayer.name}</span> wins the IPL Card Battle!
          </p>
        )}
      </div>

      <div className="w-full max-w-2xl space-y-4">

        {/* Leaderboard */}
        <div className="glass-panel p-5">
          <h2 className="text-lg font-bold text-gold-400 mb-4 uppercase tracking-wider">
            🏆 Final Standings
          </h2>
          <div className="space-y-3">
            {ranked.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  i === 0
                    ? 'border-gold-400/60 bg-gold-400/10'
                    : p.id === myId
                    ? 'border-blue-500/40 bg-blue-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <span className="text-2xl w-8 text-center">
                  {i < 3 ? medals[i] : `#${i + 1}`}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{p.name}</span>
                    {p.id === myId && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">You</span>
                    )}
                    {p.isHost && (
                      <span className="text-xs bg-amber-700 text-white px-2 py-0.5 rounded-full">Host</span>
                    )}
                    {p.id === mvp?.id && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">⭐ MVP</span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>{p.team.length} players</span>
                    <span>Team val: {teamValue(p)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-gold-400">{p.roundWins}</div>
                  <div className="text-xs text-gray-400">Rounds won</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel p-4 text-center">
            <div className="text-2xl font-black text-white">{roundHistory.length}</div>
            <div className="text-xs text-gray-400 mt-1">Total Rounds</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-2xl font-black text-green-400">
              {roundHistory.filter(r => r.isTie).length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Ties</div>
          </div>
          <div className="glass-panel p-4 text-center">
            <div className="text-lg font-black text-purple-400 truncate">
              {mvp?.name.split(' ')[0] ?? '—'}
            </div>
            <div className="text-xs text-gray-400 mt-1">⭐ MVP</div>
          </div>
        </div>

        {/* MVP Card */}
        {mvp && (
          <div className="glass-panel p-4">
            <h2 className="text-sm font-bold text-gold-400 mb-3 uppercase tracking-wider">
              ⭐ Tournament MVP
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center text-xl font-black text-white">
                {mvp.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-white text-lg">{mvp.name}</div>
                <div className="text-sm text-gray-400">{mvp.roundWins} rounds won · {mvp.team.length} players in squad</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {isHost && (
            <button
              onClick={restartGame}
              className="btn-gold flex-1 py-3 text-sm font-bold uppercase tracking-wider"
            >
              🔄 Play Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="btn-outline flex-1 py-3 text-sm font-bold uppercase tracking-wider"
          >
            🏠 Main Menu
          </button>
        </div>
        {!isHost && (
          <p className="text-center text-xs text-gray-500">
            Waiting for host to restart the game…
          </p>
        )}
      </div>
    </div>
  );
}
