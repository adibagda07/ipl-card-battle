import React, { useState } from 'react';
import { useGameStore } from '../context/gameStore';
import { PlayerCard } from '../components/cards/PlayerCard';
import { CATEGORY_LABELS, Category } from '../types/game';
import { PLAYERS } from '../data/players';

const CATEGORIES: { key: Category; label: string; icon: string; type: string }[] = [
  { key: 'runs', label: 'Runs', icon: '🏏', type: 'Batting' },
  { key: 'battingAverage', label: 'Batting Avg', icon: '📊', type: 'Batting' },
  { key: 'strikeRate', label: 'Strike Rate', icon: '⚡', type: 'Batting' },
  { key: 'sixes', label: 'Sixes', icon: '6️⃣', type: 'Batting' },
  { key: 'fours', label: 'Fours', icon: '4️⃣', type: 'Batting' },
  { key: 'wickets', label: 'Wickets', icon: '🎯', type: 'Bowling' },
  { key: 'economy', label: 'Economy (low)', icon: '💰', type: 'Bowling' },
  { key: 'dotBalls', label: 'Dot Balls', icon: '⭕', type: 'Bowling' },
  { key: 'catches', label: 'Catches', icon: '🤲', type: 'Fielding' },
  { key: 'fantasyPoints', label: 'Fantasy Pts', icon: '⭐', type: 'Fantasy' },
];

const BattlePage: React.FC = () => {
  const { room, myId, selectCategory, playCard } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  if (!room?.currentRound) return null;
  const round = room.currentRound;
  const me = room.players.find(p => p.id === myId);
  const isActive = round.activePlayerId === myId;
  const activePLayer = room.players.find(p => p.id === round.activePlayerId);
  const hasPlayed = round.playedCards.some(pc => pc.playerId === myId);

  // Compute scores
  const getScore = (playerId: string): { card: any; value: number } | null => {
    if (!round.revealed) return null;
    const played = round.playedCards.find(pc => pc.playerId === playerId);
    if (!played) return null;
    const player = room.players.find(p => p.id === playerId);
    const card = player?.team.find(c => c.id === played.cardId) 
      || PLAYERS.find(p => p.id === played.cardId);
    const score = round.scores.find(s => s.playerId === playerId);
    return card ? { card, value: score?.value || 0 } : null;
  };

  const winner = round.winner ? room.players.find(p => p.id === round.winner) : null;

  const handleCategorySelect = (cat: Category) => {
    selectCategory(cat);
    setShowCategoryPicker(false);
  };

  const handlePlayCard = () => {
    if (selectedCard) {
      playCard(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <div className="min-h-screen stadium-bg bg-dots px-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-display text-2xl text-amber-400">⚔️ BATTLE</div>
            <p className="text-gray-400 text-sm">Round {room.totalRounds + 1}</p>
          </div>

          {/* Scoreboard */}
          <div className="flex gap-3">
            {room.players.map(p => (
              <div key={p.id}
                className={`px-3 py-2 rounded-lg text-center text-xs ${p.id === myId ? 'border border-amber-500/30' : ''}`}
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-amber-400 font-bold">{p.roundWins}</div>
                <div className="text-gray-400">{p.name.split(' ')[0]}</div>
                <div className="text-gray-500">{p.team.length}🃏</div>
              </div>
            ))}
          </div>
        </div>

        {/* Round status banner */}
        <div className={`rounded-xl p-4 mb-6 text-center ${round.revealed && winner ? 'border border-green-500/30' : round.isTie ? 'border border-yellow-500/30' : 'border border-amber-500/20'}`}
          style={{ background: round.revealed && winner ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)' }}>
          {!round.selectedCategory && (
            <p className="text-gray-300">
              {isActive ? '👑 You are leading this round! Pick a category.' : `⏳ Waiting for ${activePLayer?.name} to pick a category...`}
            </p>
          )}
          {round.selectedCategory && !round.revealed && (
            <div>
              <p className="text-amber-400 font-bold text-lg">
                Category: {CATEGORY_LABELS[round.selectedCategory].icon} {CATEGORY_LABELS[round.selectedCategory].label}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {hasPlayed ? '✅ You played your card!' : '🎴 Select and play your card!'} 
                {' '}({round.playedCards.length}/{room.players.filter(p => p.team.length > 0).length} played)
              </p>
            </div>
          )}
          {round.revealed && winner && (
            <div>
              <p className="text-green-400 font-bold text-xl">🏆 {winner.id === myId ? 'YOU WIN' : `${winner.name} WINS`} this round!</p>
              <p className="text-gray-400 text-sm">Next round starting...</p>
            </div>
          )}
          {round.isTie && (
            <p className="text-yellow-400 font-bold">🤝 TIE! Play another card to break the tie.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* My Hand */}
          <div className="md:col-span-2">
            <h3 className="text-white font-bold mb-3">🃏 Your Cards ({me?.team.length || 0} remaining)</h3>
            {me?.team && me.team.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                {me.team.map(card => (
                  <PlayerCard
                    key={card.id}
                    player={card}
                    size="sm"
                    selected={selectedCard === card.id}
                    isCaptain={me?.captain === card.id}
                    isViceCaptain={me?.viceCaptain === card.id}
                    onClick={() => {
                      if (!hasPlayed && round.selectedCategory) {
                        setSelectedCard(selectedCard === card.id ? null : card.id);
                      }
                    }}
                    dimmed={hasPlayed || !round.selectedCategory}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">🏳️</div>
                <p className="text-gray-400">No cards remaining!</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex gap-3">
              {isActive && !round.selectedCategory && (
                <button
                  className="btn-gold flex-1"
                  onClick={() => setShowCategoryPicker(true)}>
                  🎯 Pick Category
                </button>
              )}
              {round.selectedCategory && !hasPlayed && selectedCard && (
                <button
                  className="btn-gold flex-1"
                  onClick={handlePlayCard}>
                  🎴 Play {PLAYERS.find(p => p.id === selectedCard)?.name}!
                </button>
              )}
              {round.selectedCategory && !hasPlayed && !selectedCard && (
                <p className="text-gray-400 text-sm py-3">👆 Click a card to select it, then play it</p>
              )}
            </div>
          </div>

          {/* Battle Arena - revealed cards */}
          <div>
            <h3 className="text-white font-bold mb-3">⚔️ Battle Arena</h3>
            <div className="space-y-3">
              {room.players.map(player => {
                const played = round.playedCards.find(pc => pc.playerId === player.id);
                const scoreData = getScore(player.id);
                const isWinner = round.winner === player.id;

                return (
                  <div key={player.id}
                    className={`p-3 rounded-xl glass-panel ${isWinner ? 'border border-green-500/40' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-semibold ${player.id === myId ? 'text-amber-400' : 'text-white'}`}>
                        {player.name} {player.id === myId ? '(you)' : ''}
                        {isWinner && ' 👑'}
                      </span>
                      <span className="text-gray-400 text-xs">{player.team.length} cards left</span>
                    </div>

                    {played && !round.revealed && (
                      <div className="h-16 rounded-lg flex items-center justify-center text-2xl"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        🎴
                      </div>
                    )}

                    {scoreData && round.revealed && (
                      <div className={`rounded-lg p-2 text-center ${isWinner ? 'bg-green-500/20' : 'bg-white/5'}`}>
                        <p className="text-white text-xs font-bold">{scoreData.card.name}</p>
                        <p className={`text-2xl font-display ${isWinner ? 'text-green-400' : 'text-amber-400'}`}>
                          {scoreData.value}
                        </p>
                        {isWinner && <p className="text-green-400 text-xs">WINNER</p>}
                      </div>
                    )}

                    {!played && (
                      <div className="h-16 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <span className="text-gray-500 text-xs">
                          {player.team.length === 0 ? 'No cards' : 'Not played yet'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Round history */}
            {room.roundHistory.length > 0 && (
              <div className="mt-4 glass-panel rounded-xl p-3">
                <p className="text-gray-400 text-xs font-semibold mb-2">Recent Rounds</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {[...room.roundHistory].reverse().slice(0, 5).map((rh, i) => {
                    const rWinner = rh.winner ? room.players.find(p => p.id === rh.winner) : null;
                    const cat = rh.selectedCategory ? CATEGORY_LABELS[rh.selectedCategory as Category] : null;
                    return (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-500">R{rh.roundNumber}: {cat?.icon} {cat?.label}</span>
                        <span className={rh.winner === myId ? 'text-green-400' : 'text-gray-400'}>
                          {rWinner?.name || 'Tie'} {rh.winner === myId ? '✓' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category picker modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md animate-bounce-in">
            <h3 className="text-white font-bold text-xl mb-4 text-center">🎯 Choose a Category</h3>
            <p className="text-gray-400 text-sm text-center mb-6">Pick the stat to compare cards on</p>

            {['Batting', 'Bowling', 'Fielding', 'Fantasy'].map(type => (
              <div key={type} className="mb-4">
                <p className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wider">{type}</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.filter(c => c.type === type).map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => handleCategorySelect(cat.key)}
                      className="flex items-center gap-2 p-3 rounded-xl font-semibold text-sm hover:bg-amber-500/20 transition-all hover:border-amber-500/50 border border-white/10 text-white active:scale-95">
                      <span className="text-xl">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={() => setShowCategoryPicker(false)}
              className="w-full mt-2 text-gray-400 hover:text-white py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattlePage;
