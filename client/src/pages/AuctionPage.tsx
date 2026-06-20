import React, { useState } from 'react';
import { useGameStore } from '../context/gameStore';
import { PLAYERS, TEAM_COLORS, RARITY_COLORS } from '../data/players';

const AuctionPage: React.FC = () => {
  const { room, myId, placeBid } = useGameStore();
  const [customBid, setCustomBid] = useState('');

  if (!room?.auctionState) return null;
  const a = room.auctionState;
  const me = room.players.find(p => p.id === myId);

  const currentPlayerId = a.playerQueue[a.currentPlayerIndex];
  const currentPlayer = PLAYERS.find(p => p.id === currentPlayerId);
  const currentBidder = room.players.find(p => p.id === a.currentBidder);
  const rarity = currentPlayer ? RARITY_COLORS[currentPlayer.rarity] : null;
  const teamColor = currentPlayer ? (TEAM_COLORS[currentPlayer.team] || { primary: '#666', secondary: '#888' }) : null;

  const myBudget = me?.budget || 0;
  const myTeamSize = me?.team.length || 0;
  const teamFull = myTeamSize >= room.settings.teamSize;
  const timerUrgent = a.timer <= 5;

  const quickBids = [
    a.currentBid + 5,
    a.currentBid + 10,
    a.currentBid + 25,
    a.currentBid + 50,
  ].filter(b => b <= myBudget && !teamFull);

  const handleBid = (amount: number) => {
    if (amount <= a.currentBid || amount > myBudget || teamFull) return;
    placeBid(amount);
  };

  if (!currentPlayer) return (
    <div className="min-h-screen stadium-bg flex items-center justify-center">
      <div className="text-white text-2xl">Loading auction...</div>
    </div>
  );

  const initials = currentPlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen stadium-bg bg-dots flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-display text-3xl text-amber-400">🔨 IPL MEGA AUCTION</div>
          <p className="text-gray-400 text-sm mt-1">
            Player {a.currentPlayerIndex + 1} of {a.playerQueue.length}
            {' • '}Sold: {a.soldPlayers.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Player Card - Large */}
          <div className="md:col-span-1 flex flex-col items-center">
            {/* Card */}
            <div
              className={`relative rounded-2xl overflow-hidden w-64 animate-slide-up`}
              style={{
                background: `linear-gradient(135deg, ${teamColor?.primary}22, ${teamColor?.secondary}11)`,
                border: `2px solid ${rarity?.border}`,
                boxShadow: `0 0 30px ${rarity?.glow}55`,
              }}
            >
              {currentPlayer.rarity === 'Legendary' && (
                <div className="absolute inset-0 shimmer pointer-events-none z-10" />
              )}

              {/* Team banner */}
              <div className="p-4 text-center" style={{ background: `${teamColor?.primary}33` }}>
                <span className="font-display text-2xl" style={{ color: teamColor?.secondary }}>{currentPlayer.team}</span>
              </div>

              {/* Avatar */}
              <div className="flex justify-center py-6">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center font-display text-4xl"
                  style={{
                    background: `radial-gradient(circle, ${teamColor?.primary}88, ${teamColor?.primary}22)`,
                    border: `3px solid ${rarity?.border}`,
                    boxShadow: `0 0 25px ${rarity?.glow}`,
                    color: teamColor?.secondary,
                  }}
                >
                  {initials}
                </div>
              </div>

              {/* Info */}
              <div className="px-4 pb-2 text-center">
                <h2 className="text-xl font-bold text-white">{currentPlayer.name}</h2>
                <p className="text-gray-400 text-sm">{currentPlayer.role} • {currentPlayer.nationality}</p>
                <span className={`text-sm font-bold rarity-${currentPlayer.rarity.toLowerCase()}`}>
                  {currentPlayer.rarity}
                </span>
              </div>

              {/* Stats grid */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {[
                    ['🏏 Runs', currentPlayer.runs],
                    ['📊 Avg', currentPlayer.battingAverage],
                    ['⚡ SR', currentPlayer.strikeRate],
                    ['🎯 Wkts', currentPlayer.wickets],
                    ['💰 Eco', currentPlayer.economy || '—'],
                    ['6️⃣ Sixes', currentPlayer.sixes],
                    ['🤲 Catches', currentPlayer.catches],
                    ['⭐ FP', currentPlayer.fantasyPoints],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between p-1 rounded"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <span className="text-gray-400">{label}</span>
                      <span className="text-white font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimum bid */}
              <div className="px-4 pb-4 text-center">
                <span className="text-xs text-gray-500">Min Bid: </span>
                <span className="text-amber-400 font-bold">{currentPlayer.minimumBid} pts</span>
                <span className="text-gray-500 text-xs ml-2">| Market: </span>
                <span className="text-green-400 font-bold text-xs">{currentPlayer.marketValue} pts</span>
              </div>
            </div>
          </div>

          {/* Bidding Panel */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Current bid & timer */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Current Bid</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl text-amber-400">{a.currentBid}</span>
                    <span className="text-amber-600 font-bold">pts</span>
                  </div>
                  {currentBidder ? (
                    <p className="text-green-400 text-sm mt-1">
                      🏆 {currentBidder.name === me?.name ? 'You are leading!' : `${currentBidder.name} leads`}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">No bids yet</p>
                  )}
                </div>

                {/* Timer */}
                <div className={`text-center ${timerUrgent ? 'timer-urgent' : ''}`}>
                  <div className={`font-display text-5xl ${timerUrgent ? 'text-red-400' : 'text-white'}`}>{a.timer}</div>
                  <p className="text-gray-400 text-xs">seconds</p>
                  <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(a.timer / room.settings.auctionTimer) * 100}%`,
                        background: timerUrgent ? '#ef4444' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* My budget */}
              <div className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.08)' }}>
                <span className="text-gray-400 text-sm">My Budget</span>
                <span className="text-amber-400 font-bold">{myBudget} pts remaining</span>
              </div>

              {/* My team progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Team Progress</span>
                  <span>{myTeamSize}/{room.settings.teamSize} players</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(myTeamSize / room.settings.teamSize) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bid buttons */}
            {!teamFull ? (
              <div className="glass-panel rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">Place Your Bid</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {quickBids.map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleBid(amount)}
                      className="py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: amount <= a.currentBid + 10
                          ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                          : 'linear-gradient(135deg, #16a34a, #15803d)',
                      }}
                    >
                      {amount} pts
                    </button>
                  ))}
                </div>

                {/* Custom bid */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input-field flex-1"
                    placeholder={`Custom bid (>${a.currentBid})`}
                    value={customBid}
                    onChange={e => setCustomBid(e.target.value)}
                    min={a.currentBid + 1}
                    max={myBudget}
                  />
                  <button
                    onClick={() => { handleBid(Number(customBid)); setCustomBid(''); }}
                    className="btn-gold px-4 py-2 text-sm"
                    disabled={!customBid || Number(customBid) <= a.currentBid || Number(customBid) > myBudget}
                  >
                    Bid
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-green-400 font-bold">Your team is complete!</p>
                <p className="text-gray-400 text-sm mt-1">Watching others bid...</p>
              </div>
            )}

            {/* All players budgets */}
            <div className="glass-panel rounded-2xl p-4">
              <h3 className="text-white font-semibold text-sm mb-3">📊 Player Standings</h3>
              <div className="space-y-2">
                {room.players.map(player => (
                  <div key={player.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${a.currentBidder === player.id ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'}`} />
                      <span className={player.id === myId ? 'text-amber-400 font-semibold' : 'text-gray-300'}>
                        {player.name} {player.id === myId ? '(you)' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-gray-400">{player.team.length}/{room.settings.teamSize} 🃏</span>
                      <span className="text-amber-400 font-bold">{player.budget} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent bids */}
            {a.bids.length > 0 && (
              <div className="glass-panel rounded-2xl p-4">
                <h3 className="text-white font-semibold text-sm mb-3">🔔 Bid History</h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...a.bids].reverse().slice(0, 8).map((bid, i) => {
                    const bidder = room.players.find(p => p.id === bid.bidderId);
                    const player = PLAYERS.find(p => p.id === bid.playerId);
                    return (
                      <div key={i} className="flex justify-between text-xs text-gray-400">
                        <span className="text-white">{bidder?.name}</span>
                        <span className="text-amber-400">{bid.amount} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
