import React, { useEffect } from 'react';
import { useGameStore } from './context/gameStore';
import LandingPage from './pages/LandingPage';
import LobbyPage from './pages/LobbyPage';
import AuctionPage from './pages/AuctionPage';
import TeamReviewPage from './pages/TeamReviewPage';
import BattlePage from './pages/BattlePage';
import GameOverPage from './pages/GameOverPage';

export default function App() {
  const { connect, room, error, clearError } = useGameStore();

  useEffect(() => {
    connect();
  }, []);

  const phase = room?.phase;

  return (
    <div className="min-h-screen bg-pitch-900 text-white">
      {/* Global error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-sm w-full mx-4">
          <span className="flex-1 text-sm font-medium">{error}</span>
          <button onClick={clearError} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
        </div>
      )}

      {!phase && <LandingPage />}
      {phase === 'lobby' && <LobbyPage />}
      {phase === 'auction' && <AuctionPage />}
      {phase === 'team-review' && <TeamReviewPage />}
      {phase === 'battle' && <BattlePage />}
      {phase === 'gameover' && <GameOverPage />}
    </div>
  );
}
