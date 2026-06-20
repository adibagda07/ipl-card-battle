import React, { useState, useEffect } from 'react';
import { useGameStore } from '../context/gameStore';

const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const { connect, createRoom, joinRoom, error, connecting, clearError, socket } = useGameStore();

  useEffect(() => { connect(); }, []);

  const handleCreate = () => {
    if (!playerName.trim()) return;
    createRoom(playerName.trim());
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
  };

  return (
    <div className="min-h-screen stadium-bg bg-dots flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-block mb-4">
          <div className="text-6xl mb-2">🏏</div>
          <div className="font-display text-5xl md:text-7xl text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)' }}>
            IPL 2026
          </div>
          <div className="font-display text-3xl md:text-5xl text-white mt-1 tracking-widest">
            FANTASY CARD BATTLE
          </div>
        </div>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Bid for IPL legends. Build your dream team. Battle for supremacy.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {['🎴 100+ Player Cards', '⚡ Live Auction', '🏆 Card Battles', '👥 2-6 Players'].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full text-amber-400"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Server status */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-400' : connecting ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
        <span className="text-gray-400">
          {socket?.connected ? 'Server Connected' : connecting ? 'Connecting...' : 'Server Offline'}
        </span>
        {!socket?.connected && !connecting && (
          <button onClick={() => connect()} className="text-amber-400 underline text-xs">Retry</button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-red-300 text-sm flex items-center gap-2 max-w-md"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          ⚠️ {error}
          <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Main card */}
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
        {mode === 'home' && (
          <div className="space-y-4">
            <button
              className="btn-gold w-full text-lg"
              onClick={() => setMode('create')}
              disabled={!socket?.connected}
            >
              🎮 Create Room
            </button>
            <button
              className="btn-outline w-full text-lg"
              onClick={() => setMode('join')}
              disabled={!socket?.connected}
            >
              🚪 Join Room
            </button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-500 text-xs text-center mb-3">How to play multiplayer</p>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">1.</span>
                  <span>Host creates a room and shares the Room Code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">2.</span>
                  <span>Friends join using the code at <span className="text-amber-400">localhost:3000</span> or your local IP</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">3.</span>
                  <span>Bid for players, build your team, battle!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="space-y-4">
            <button onClick={() => { setMode('home'); clearError(); }}
              className="text-gray-400 hover:text-white flex items-center gap-2 text-sm mb-2">
              ← Back
            </button>

            <h2 className="text-xl font-bold text-white">
              {mode === 'create' ? '🎮 Create a Room' : '🚪 Join a Room'}
            </h2>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Your Name</label>
              <input
                className="input-field"
                placeholder="Enter your name..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
                maxLength={20}
                autoFocus
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Room Code</label>
                <input
                  className="input-field text-center text-2xl tracking-[0.3em] font-bold uppercase"
                  placeholder="XXXXXX"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  maxLength={6}
                />
              </div>
            )}

            <button
              className="btn-gold w-full"
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={!playerName.trim() || (mode === 'join' && roomCode.length < 4)}
            >
              {mode === 'create' ? '🎮 Create Room' : '🚪 Join Game'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-8 text-center">
        IPL 2026 Fantasy Card Battle • Multiplayer Cricket Card Game<br />
        Run <code className="text-amber-600">npm install && npm run dev</code> to start the server
      </p>
    </div>
  );
};

export default LandingPage;
