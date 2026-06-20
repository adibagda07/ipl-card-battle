import React, { useState } from 'react';
import { useGameStore } from '../context/gameStore';
import { PlayerCard } from '../components/cards/PlayerCard';

const TeamReviewPage: React.FC = () => {
  const { room, myId, setCaptain, startBattle } = useGameStore();
  const [viewingPlayer, setViewingPlayer] = useState<string | null>(null);

  if (!room) return null;
  const me = room.players.find(p => p.id === myId);
  const isHost = me?.isHost;

  return (
    <div className="min-h-screen stadium-bg bg-dots px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="font-display text-4xl text-amber-400">🏆 YOUR SQUAD</div>
          <p className="text-gray-400 mt-1">Set your Captain & Vice-Captain before battle!</p>
        </div>

        {/* All players overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {room.players.map(player => {
            const isMe = player.id === myId;
            const spent = room.settings.budget - player.budget;
            
            return (
              <div key={player.id} className={`glass-panel rounded-2xl p-5 ${isMe ? 'border border-amber-500/30' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      {player.name}
                      {isMe && <span className="text-amber-400 text-sm">(You)</span>}
                      {player.isHost && <span className="text-blue-400 text-xs">👑</span>}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      💰 {spent} pts spent · {player.budget} remaining
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-display text-amber-400">{player.team.length}</div>
                    <div className="text-gray-400 text-xs">/{room.settings.teamSize} players</div>
                  </div>
                </div>

                {/* Captain selection (only for me) */}
                {isMe && player.team.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(245,158,11,0.08)' }}>
                    <p className="text-amber-400 font-semibold mb-2">👑 Assign Captain & Vice-Captain</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Captain (+10% stats)</p>
                        <select
                          className="input-field text-xs py-1"
                          value={me?.captain || ''}
                          onChange={e => setCaptain(e.target.value, 'captain')}>
                          <option value="">Select Captain</option>
                          {player.team.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Vice-Captain (+5% stats)</p>
                        <select
                          className="input-field text-xs py-1"
                          value={me?.viceCaptain || ''}
                          onChange={e => setCaptain(e.target.value, 'viceCaptain')}>
                          <option value="">Select VC</option>
                          {player.team.filter(c => c.id !== me?.captain).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team cards */}
                <div className="flex flex-wrap gap-2">
                  {player.team.map(card => (
                    <PlayerCard
                      key={card.id}
                      player={card}
                      size="sm"
                      isCaptain={isMe && me?.captain === card.id}
                      isViceCaptain={isMe && me?.viceCaptain === card.id}
                      onClick={isMe ? () => setViewingPlayer(card.id) : undefined}
                    />
                  ))}
                  {player.team.length === 0 && (
                    <p className="text-gray-500 text-sm">No players acquired in auction</p>
                  )}
                </div>

                {/* Team stats summary */}
                {player.team.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-amber-400 font-bold">{player.team.reduce((s, c) => s + c.runs, 0)}</div>
                      <div className="text-gray-400">Total Runs</div>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-amber-400 font-bold">{player.team.reduce((s, c) => s + c.wickets, 0)}</div>
                      <div className="text-gray-400">Total Wkts</div>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-amber-400 font-bold">{player.team.reduce((s, c) => s + c.sixes, 0)}</div>
                      <div className="text-gray-400">Total 6s</div>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="text-amber-400 font-bold">
                        {player.team.filter(c => c.rarity === 'Legendary' || c.rarity === 'Epic').length}
                      </div>
                      <div className="text-gray-400">L/E Cards</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start battle button */}
        {isHost ? (
          <div className="text-center">
            <button onClick={startBattle} className="btn-gold text-xl py-5 px-12">
              ⚔️ Start Card Battle!
            </button>
            <p className="text-gray-400 text-sm mt-3">All players can see their teams. Ready to battle!</p>
          </div>
        ) : (
          <div className="text-center glass-panel rounded-2xl p-6">
            <div className="text-3xl mb-2">⚔️</div>
            <p className="text-gray-300 font-semibold">Waiting for host to start the battle...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamReviewPage;
