import React, { useState } from 'react';
import { IPLPlayer, TEAM_COLORS, RARITY_COLORS } from '../../data/players';

interface PlayerCardProps {
  player: IPLPlayer;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  showStats?: boolean;
  playedValue?: number;
  isWinner?: boolean;
  dimmed?: boolean;
}

const ROLE_ICONS: Record<string, string> = {
  Batsman: '🏏',
  Bowler: '🎯',
  'All-Rounder': '⚡',
  'Wicket-Keeper': '🧤',
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player, size = 'md', onClick, selected, isCaptain, isViceCaptain, showStats, playedValue, isWinner, dimmed
}) => {
  const [flipped, setFlipped] = useState(false);
  const rarity = RARITY_COLORS[player.rarity];
  const teamColor = TEAM_COLORS[player.team] || { primary: '#666', secondary: '#888', bg: '#111' };
  
  const rarityClass = {
    Legendary: 'card-legendary',
    Epic: 'card-epic',
    Rare: 'card-rare',
    Common: 'card-common',
  }[player.rarity];

  const sizeClasses = {
    sm: 'w-28 min-h-40 text-xs',
    md: 'w-44 min-h-64 text-sm',
    lg: 'w-56 min-h-80 text-base',
  }[size];

  const initials = player.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const statRows = [
    { label: 'Runs', value: player.runs, icon: '🏏' },
    { label: 'Avg', value: player.battingAverage, icon: '📊' },
    { label: 'SR', value: player.strikeRate, icon: '⚡' },
    { label: 'Wkts', value: player.wickets, icon: '🎯' },
    { label: 'Eco', value: player.economy || '-', icon: '💰' },
    { label: '6s', value: player.sixes, icon: '6️⃣' },
    { label: 'FP', value: player.fantasyPoints, icon: '⭐' },
  ];

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        ${sizeClasses} ${rarityClass}
        ${selected ? 'ring-2 ring-amber-400 scale-105' : ''}
        ${dimmed ? 'opacity-40' : ''}
        ${isWinner ? 'ring-2 ring-green-400 animate-pulse' : ''}
        ${onClick ? 'hover:scale-105 hover:shadow-xl' : ''}
        flex flex-col
      `}
      onClick={onClick}
      style={{ minHeight: size === 'sm' ? '160px' : size === 'md' ? '256px' : '320px' }}
    >
      {/* Shimmer for legendary */}
      {player.rarity === 'Legendary' && <div className="absolute inset-0 shimmer pointer-events-none z-10" />}

      {/* Header */}
      <div
        className="p-2 pb-1 relative"
        style={{ background: `linear-gradient(135deg, ${teamColor.primary}44, ${teamColor.secondary}22)` }}
      >
        <div className="flex justify-between items-start">
          <span className="font-bold text-white text-xs">{player.team}</span>
          <span className={`text-xs font-bold rarity-${player.rarity.toLowerCase()} capitalize`}>
            {player.rarity === 'Legendary' ? '⭐' : player.rarity === 'Epic' ? '💜' : player.rarity === 'Rare' ? '💙' : '⬜'}
          </span>
        </div>
      </div>

      {/* Avatar */}
      <div
        className="flex items-center justify-center py-3"
        style={{ background: `linear-gradient(180deg, ${teamColor.bg} 0%, transparent 100%)` }}
      >
        <div
          className="rounded-full flex items-center justify-center font-display text-2xl font-black"
          style={{
            width: size === 'sm' ? '48px' : '64px',
            height: size === 'sm' ? '48px' : '64px',
            background: `radial-gradient(circle, ${teamColor.primary}88, ${teamColor.primary}22)`,
            border: `2px solid ${rarity.border}`,
            boxShadow: `0 0 15px ${rarity.glow}66`,
            color: teamColor.secondary,
            letterSpacing: '2px',
          }}
        >
          {initials}
        </div>
      </div>

      {/* Name & Role */}
      <div className="px-2 text-center">
        <p className="font-bold text-white leading-tight text-xs">{player.name}</p>
        <p className="text-gray-400 mt-0.5" style={{ fontSize: '10px' }}>
          {ROLE_ICONS[player.role]} {player.role}
        </p>
      </div>

      {/* Stats */}
      {size !== 'sm' && (
        <div className="px-2 mt-2 flex-1">
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            {statRows.slice(0, 6).map(stat => (
              <div key={stat.label} className="flex justify-between items-center">
                <span className="text-gray-500" style={{ fontSize: '9px' }}>{stat.icon} {stat.label}</span>
                <span className="text-gray-200 font-semibold" style={{ fontSize: '9px' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fantasy points bar */}
      {size !== 'sm' && (
        <div className="px-2 pb-2 mt-1">
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontSize: '9px', color: rarity.text }}>⭐ Fantasy Pts</span>
            <span className="font-bold" style={{ fontSize: '10px', color: rarity.text }}>{player.fantasyPoints}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full stat-bar-fill"
              style={{
                width: `${Math.min((player.fantasyPoints / 1200) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${rarity.border}, ${teamColor.primary})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Market value */}
      <div className="px-2 pb-2">
        <div className="text-center rounded py-0.5" style={{ background: 'rgba(245,158,11,0.1)' }}>
          <span className="text-amber-400 font-bold" style={{ fontSize: '10px' }}>
            💰 {player.marketValue} pts
          </span>
        </div>
      </div>

      {/* Captain badge */}
      {isCaptain && (
        <div className="absolute top-1 right-6 bg-amber-500 text-black text-xs font-black rounded px-1">C</div>
      )}
      {isViceCaptain && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-black rounded px-1">VC</div>
      )}

      {/* Played value overlay */}
      {playedValue !== undefined && (
        <div className={`absolute inset-0 flex items-center justify-center rounded-xl ${isWinner ? 'bg-green-500/20' : 'bg-black/50'}`}>
          <div className={`text-center ${isWinner ? 'text-green-400' : 'text-white'}`}>
            <div className="text-3xl font-display font-black">{playedValue}</div>
            {isWinner && <div className="text-xs font-bold mt-1">👑 WINNER</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
