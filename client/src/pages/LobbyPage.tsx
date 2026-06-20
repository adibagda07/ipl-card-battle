import React, { useState } from 'react';
import { useGameStore } from '../context/gameStore';
import { DEFAULT_SETTINGS } from '../types/game';

const LobbyPage: React.FC = () => {
  const { room, myId, startAuction, updateSettings } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!room) return null;
  const me = room.players.find(p => p.id === myId);
  const isHost = me?.isHost;
  const shareUrl = `${window.location.origin}`;
  const networkTip = window.location.hostname === 'localhost'
    ? `Ask friends to open http://YOUR_LOCAL_IP:3000 on the same WiFi`
    : `Share this URL: ${shareUrl}`;

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const s = room.settings;

  return (
    <div className="min-h-screen stadium-bg bg-dots flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-display text-4xl text-amber-400">🏏 LOBBY</div>
          <p className="text-gray-400 mt-1">Waiting for players to join...</p>
        </div>

        {/* Room Code */}
        <div className="glass-panel rounded-2xl p-6 mb-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-display text-5xl text-amber-400 tracking-[0.2em]">{room.roomCode}</span>
            <button onClick={copyCode} className="text-gray-400 hover:text-amber-400 transition-colors">
              {copied ? '✅' : '📋'}
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-3">{networkTip}</p>
          <div className="mt-3 p-2 rounded-lg text-xs text-amber-600" style={{ background: 'rgba(245,158,11,0.07)' }}>
            💡 For internet play: <code className="text-amber-400">npx ngrok http 3001</code> or <code className="text-amber-400">npx cloudflared tunnel --url http://localhost:3001</code>
          </div>
        </div>

        {/* Players */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>👥 Players</span>
            <span className="text-gray-400 text-sm font-normal">({room.players.length}/{s.maxPlayers})</span>
          </h3>
          <div className="space-y-3">
            {room.players.map(player => (
              <div key={player.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: player.id === myId ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                    {player.name[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-white font-semibold">{player.name}</span>
                    {player.id === myId && <span className="text-amber-400 text-xs ml-2">(You)</span>}
                    {player.isHost && <span className="text-blue-400 text-xs ml-2">👑 Host</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              </div>
            ))}
            {room.players.length < 2 && (
              <p className="text-gray-500 text-sm text-center py-2">
                Waiting for more players... (min 2 to start)
              </p>
            )}
          </div>
        </div>

        {/* Settings (host only) */}
        {isHost && (
          <div className="glass-panel rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold mb-4">⚙️ Game Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Budget (pts)</label>
                <select
                  className="input-field text-sm"
                  value={s.budget}
                  onChange={e => updateSettings({ budget: Number(e.target.value) })}>
                  <option value={800}>800</option>
                  <option value={1000}>1000</option>
                  <option value={1500}>1500</option>
                  <option value={2000}>2000</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Team Size</label>
                <select
                  className="input-field text-sm"
                  value={s.teamSize}
                  onChange={e => updateSettings({ teamSize: Number(e.target.value) })}>
                  {[6, 7, 8, 9, 10, 11].map(n => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Win Condition</label>
                <select
                  className="input-field text-sm"
                  value={s.winMode}
                  onChange={e => updateSettings({ winMode: e.target.value as any })}>
                  <option value="rounds">Most Round Wins</option>
                  <option value="points">Most Total Points</option>
                  <option value="lastcard">Last Card Standing</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Max Players</label>
                <select
                  className="input-field text-sm"
                  value={s.maxPlayers}
                  onChange={e => updateSettings({ maxPlayers: Number(e.target.value) })}>
                  {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} players</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Auction Timer</label>
                <select
                  className="input-field text-sm"
                  value={s.auctionTimer}
                  onChange={e => updateSettings({ auctionTimer: Number(e.target.value) })}>
                  <option value={15}>15s</option>
                  <option value={20}>20s</option>
                  <option value={30}>30s</option>
                  <option value={45}>45s</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Captain Bonus</label>
                <select
                  className="input-field text-sm"
                  value={s.captainBonus ? 'yes' : 'no'}
                  onChange={e => updateSettings({ captainBonus: e.target.value === 'yes' })}>
                  <option value="yes">Enabled (+10% C, +5% VC)</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Start button */}
        {isHost ? (
          <button
            className="btn-gold w-full text-xl py-4"
            onClick={startAuction}
            disabled={room.players.length < 2}>
            🔨 Start Auction
          </button>
        ) : (
          <div className="text-center glass-panel rounded-2xl p-6">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-400">Waiting for host to start the game...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LobbyPage;
