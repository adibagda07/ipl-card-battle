import React, { useState, useMemo } from 'react';
import { useGameStore } from '../context/gameStore';
import { PLAYERS, TEAM_COLORS } from '../data/players';
import { CATEGORY_LABELS } from '../types/game';

const ROLE_LIMITS = {
  Batsman: { min: 3, max: 5 },
  Bowler: { min: 3, max: 5 },
  'All-Rounder': { min: 1, max: 4 },
  'Wicket-Keeper': { min: 1, max: 2 },
};

const ROLE_ICONS: Record<string, string> = {
  Batsman: '🏏', Bowler: '🎯', 'All-Rounder': '⚡', 'Wicket-Keeper': '🧤',
};

export default function AuctionPage() {
  const { room, myId, placeBid, passBid } = useGameStore();
  const [customBid, setCustomBid] = useState('');
  const [showSquad, setShowSquad] = useState(false);

  if (!room || !room.auctionState) return null;

  const a = room.auctionState;
  const me = room.players.find(p => p.id === myId);
  const currentPlayer = PLAYERS.find(p => p.id === a.playerQueue[a.currentPlayerIndex]);
  const currentBidderName = room.players.find(p => p.id === a.currentBidder)?.name;
  const teamColor = currentPlayer ? (TEAM_COLORS[currentPlayer.team] || '#444') : '#444';

  const myRoleCounts = useMemo(() => {
    if (!me) return {};
    return me.team.reduce((acc: Record<string, number>, p) => {
      acc[p.role] = (acc[p.role] || 0) + 1;
      return acc;
    }, {});
  }, [me?.team]);

  const canBidOnCurrent = useMemo(() => {
    if (!me || !currentPlayer) return false;
    const roleCount = myRoleCounts[currentPlayer.role] || 0;
    const limit = ROLE_LIMITS[currentPlayer.role as keyof typeof ROLE_LIMITS];
    return roleCount < (limit?.max || 99);
  }, [me, currentPlayer, myRoleCounts]);

  const budgetWarning = me && me.budget < 100;
  const teamSlots = room.settings.teamSize;
  const myTeamCount = me?.team.length || 0;
  const slotsLeft = teamSlots - myTeamCount;

  const quickBids = useMemo(() => {
    const base = a.currentBid;
    return [base + 5, base + 10, base + 25, base + 50].filter(b => b <= (me?.budget || 0));
  }, [a.currentBid, me?.budget]);

  const handleBid = (amount: number) => {
    if (!me || me.budget < amount) return;
    placeBid(amount);
  };

  const handleCustomBid = () => {
    const amount = parseInt(customBid);
    if (!isNaN(amount) && amount > a.currentBid) {
      handleBid(amount);
      setCustomBid('');
    }
  };

  const timerUrgent = a.timer <= 5;

  const overseasCount = me?.team.filter(p => p.nationality !== 'India').length || 0;
  const indianCount = me?.team.filter(p => p.nationality === 'India').length || 0;

  return (
    <div className="min-h-screen stadium-bg flex flex-col">
      {/* Header */}
      <div className="text-center py-4 px-4">
        <h1 className="text-2xl font-black text-gold-400 font-display uppercase tracking-widest">🔨 IPL Mega Auction</h1>
        <p className="text-gray-400 text-sm mt-1">
          Player {a.currentPlayerIndex + 1} of {a.playerQueue.length} • Sold: {a.soldPlayers.length}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4 max-w-6xl mx-auto w-full">

        {/* Left: Current player card */}
        <div className="flex flex-col items-center gap-3 lg:w-72">
          {currentPlayer && (
            <div className="glass-panel rounded-2xl p-4 w-full" style={{ borderColor: teamColor + '66' }}>
              {/* Team color header */}
              <div className="rounded-lg p-2 mb-3 flex justify-between items-center" style={{ background: teamColor }}>
                <span className="font-black text-white text-sm tracking-widest">{currentPlayer.team}</span>
                <span>{currentPlayer.rarity === 'Legendary' ? '⭐' : currentPlayer.rarity === 'Epic' ? '💜' : currentPlayer.rarity === 'Rare' ? '💙' : '⬜'}</span>
              </div>

              {/* Player silhouette area */}
              <div className="h-32 flex items-center justify-center mb-2 relative" style={{ background: `radial-gradient(ellipse at 50% 100%,${teamColor}44,transparent)` }}>
                <div className="text-8xl font-black opacity-10 absolute" style={{ color: teamColor }}>
                  {currentPlayer.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div className="text-6xl relative z-10">
                  {ROLE_ICONS[currentPlayer.role]}
                </div>
              </div>

              <div className="text-center mb-3">
                <div className="font-black text-white text-xl">{currentPlayer.name}</div>
                <div className="text-gray-400 text-sm">{ROLE_ICONS[currentPlayer.role]} {currentPlayer.role} • {currentPlayer.nationality}</div>
                <div className="text-xs mt-1" style={{ color: currentPlayer.rarity === 'Legendary' ? '#FFD700' : currentPlayer.rarity === 'Epic' ? '#9B59B6' : currentPlayer.rarity === 'Rare' ? '#3498DB' : '#666' }}>
                  {currentPlayer.rarity}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                {[
                  ['🏏 Runs', currentPlayer.runs],
                  ['📊 Avg', currentPlayer.battingAverage],
                  ['⚡ SR', currentPlayer.strikeRate],
                  ['🎯 Wkts', currentPlayer.wickets],
                  ['💨 Eco', currentPlayer.economy || '-'],
                  ['6️⃣ Sixes', currentPlayer.sixes],
                  ['🧤 Catches', currentPlayer.catches],
                  ['⭐ FP', currentPlayer.fantasyPoints],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-200 font-bold">{val}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-xs border-t border-white/10 pt-2">
                <span className="text-gray-400">Min Bid: <span className="text-gold-400 font-bold">{currentPlayer.minimumBid} pts</span></span>
                <span className="text-gray-400">Market: <span className="text-blue-400 font-bold">{currentPlayer.marketValue} pts</span></span>
              </div>

              {/* Role limit warning */}
              {!canBidOnCurrent && me && (
                <div className="mt-2 text-xs text-red-400 text-center bg-red-900/30 rounded p-1">
                  ⚠️ Max {ROLE_LIMITS[currentPlayer.role as keyof typeof ROLE_LIMITS]?.max} {currentPlayer.role}s reached
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Bidding + standings */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Current bid + timer */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Current Bid</div>
                <div className="text-4xl font-black text-gold-400">{a.currentBid} <span className="text-lg text-gray-400">pts</span></div>
                <div className="text-sm text-gray-400 mt-1">
                  {currentBidderName ? `🔥 ${currentBidderName} is winning` : 'No bids yet'}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-black ${timerUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {a.timer}
                </div>
                <div className="text-xs text-gray-400">seconds</div>
                <div className="w-24 h-1.5 bg-white/10 rounded mt-1 overflow-hidden">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(a.timer / room.settings.auctionTimer) * 100}%`,
                      background: timerUrgent ? '#EF4444' : '#F59E0B'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Budget warning */}
            {budgetWarning && (
              <div className="bg-red-900/40 border border-red-500/40 rounded-lg p-2 mb-3 text-xs text-red-400 text-center">
                ⚠️ Low budget! Only <strong>{me?.budget} pts</strong> remaining — {slotsLeft} slots left to fill
              </div>
            )}

            <div className="flex justify-between items-center mb-3 p-2 bg-white/5 rounded-lg">
              <span className="text-gray-400 text-sm">My Budget</span>
              <span className={`font-bold text-sm ${budgetWarning ? 'text-red-400' : 'text-gold-400'}`}>
                {me?.budget || 0} pts remaining
              </span>
            </div>

            {/* Team progress */}
            <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
              <span>Team Progress</span>
              <span>{myTeamCount}/{teamSlots} players</span>
            </div>
            <div className="h-2 bg-white/10 rounded overflow-hidden mb-4">
              <div className="h-full bg-gold-400 rounded transition-all" style={{ width: `${(myTeamCount / teamSlots) * 100}%` }} />
            </div>

            {/* Quick bids */}
            {canBidOnCurrent && me && myTeamCount < teamSlots && (
              <>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {quickBids.slice(0, 4).map(b => (
                    <button key={b} onClick={() => handleBid(b)} className="btn-gold py-3 text-sm font-bold">
                      {b} pts
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={customBid}
                    onChange={e => setCustomBid(e.target.value)}
                    placeholder={`Custom bid (>${a.currentBid})`}
                    className="input-field flex-1 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleCustomBid()}
                  />
                  <button onClick={handleCustomBid} className="btn-gold px-4 py-2 text-sm font-bold">BID</button>
                </div>
              </>
            )}

            {/* Pass button */}
            <button
              onClick={passBid}
              className="btn-outline w-full py-2 text-xs text-gray-500 hover:text-gray-300"
            >
              Pass on this player
            </button>
          </div>

          {/* Role mix indicator */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Squad Mix</span>
              <button onClick={() => setShowSquad(!showSquad)} className="text-xs text-gold-400">
                {showSquad ? 'Hide' : 'Show'} squad ▾
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(ROLE_LIMITS).map(([role, limits]) => {
                const count = myRoleCounts[role] || 0;
                const ok = count >= limits.min;
                const full = count >= limits.max;
                return (
                  <div key={role} className="text-center">
                    <div className="text-lg">{ROLE_ICONS[role]}</div>
                    <div className={`text-xs font-bold ${full ? 'text-red-400' : ok ? 'text-green-400' : 'text-yellow-400'}`}>
                      {count}/{limits.max}
                    </div>
                    <div className="text-gray-600" style={{ fontSize: 9 }}>{role.split('-')[0]}</div>
                    {count < limits.min && <div className="text-red-500" style={{ fontSize: 9 }}>Need {limits.min - count} more</div>}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span>🇮🇳 Indian: {indianCount}</span>
              <span>🌍 Overseas: {overseasCount}</span>
              <span className={overseasCount < 4 ? 'text-yellow-400' : 'text-green-400'}>
                {overseasCount < 4 ? `Need ${4 - overseasCount} more overseas` : '✓ Good mix'}
              </span>
            </div>
          </div>

          {/* Squad tray */}
          {showSquad && me && me.team.length > 0 && (
            <div className="glass-panel rounded-xl p-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Squad ({me.team.length}/{teamSlots})</div>
              <div className="flex flex-wrap gap-2">
                {me.team.map(player => (
                  <div key={player.id} className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                    <span className="text-xs">{ROLE_ICONS[player.role]}</span>
                    <span className="text-xs text-white font-medium">{player.name.split(' ').slice(-1)[0]}</span>
                    <span className="text-xs" style={{ color: TEAM_COLORS[player.team] }}>•</span>
                    <span className="text-xs text-gray-500">{player.nationality !== 'India' ? '🌍' : '🇮🇳'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All players standings */}
          <div className="glass-panel rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">All Players</div>
            <div className="space-y-2">
              {room.players.map(p => (
                <div key={p.id} className={`flex items-center gap-3 p-2 rounded-lg ${p.id === myId ? 'bg-white/10' : 'bg-white/5'}`}>
                  <div className="w-7 h-7 rounded-full bg-gold-400/20 flex items-center justify-center text-xs font-bold text-gold-400">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {p.name} {p.id === myId ? '(You)' : ''}
                      {!p.isConnected && <span className="text-red-400 text-xs ml-1">● offline</span>}
                    </div>
                    <div className="text-xs text-gray-500">{p.team.length}/{teamSlots} players</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gold-400">{p.budget} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
