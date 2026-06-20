import React from 'react';
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

const JERSEY_NUMBERS: Record<string, number> = {
  'Virat Kohli': 18, 'Rohit Sharma': 45, 'Jasprit Bumrah': 93, 'MS Dhoni': 7,
  'Hardik Pandya': 228, 'Rishabh Pant': 17, 'Ravindra Jadeja': 8, 'Andre Russell': 12,
  'Shubman Gill': 77, 'Yashasvi Jaiswal': 58, 'KL Rahul': 1, 'Ruturaj Gaikwad': 31,
  'Sunil Narine': 74, 'Mohammed Shami': 11, 'Arshdeep Singh': 2, 'Yuzvendra Chahal': 3,
  'Axar Patel': 20, 'Rinku Singh': 12, 'Sanju Samson': 9, 'Ishan Kishan': 32,
  'Kuldeep Yadav': 23, 'David Warner': 31, 'Rashid Khan': 19, 'Suryakumar Yadav': 63,
  'AB de Villiers': 17, 'Faf du Plessis': 13, 'Glenn Maxwell': 32, 'Jos Buttler': 6,
  'Pat Cummins': 30, 'Trent Boult': 18, 'Shikhar Dhawan': 42, 'Chris Gayle': 333,
  'Dwayne Bravo': 47, 'Ravichandran Ashwin': 99, 'Bhuvneshwar Kumar': 15,
  'Lasith Malinga': 14, 'Kieron Pollard': 55,
};

// SVG cricket player silhouettes by role
const PLAYER_SVG: Record<string, (color: string, secondary: string) => string> = {
  Batsman: (c, s) => `
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <ellipse cx="50" cy="95" rx="22" ry="32" fill="${c}" opacity="0.9"/>
      <!-- Head -->
      <circle cx="50" cy="38" r="16" fill="${s}" opacity="0.95"/>
      <!-- Helmet -->
      <path d="M34 36 Q34 18 50 18 Q66 18 66 36 Q66 28 50 26 Q34 26 34 36Z" fill="${c}"/>
      <!-- Visor -->
      <path d="M34 38 Q34 36 50 35 Q66 36 66 38" stroke="${s}" stroke-width="3" fill="none" opacity="0.8"/>
      <!-- Bat -->
      <rect x="64" y="55" width="8" height="50" rx="2" fill="${s}" opacity="0.9" transform="rotate(-20, 68, 80)"/>
      <rect x="62" y="100" width="12" height="6" rx="1" fill="${c}" transform="rotate(-20, 68, 103)"/>
      <!-- Arms -->
      <path d="M50 75 Q70 65 72 72" stroke="${s}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M50 75 Q30 70 28 80" stroke="${s}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- Legs -->
      <path d="M42 125 L38 140" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <path d="M58 125 L62 140" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <!-- Gloves -->
      <ellipse cx="71" cy="72" rx="5" ry="4" fill="${s}" opacity="0.8"/>
    </svg>`,
  Bowler: (c, s) => `
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <!-- Body -->
      <ellipse cx="48" cy="92" rx="20" ry="30" fill="${c}" opacity="0.9"/>
      <!-- Head -->
      <circle cx="48" cy="36" r="15" fill="${s}" opacity="0.95"/>
      <!-- Cap -->
      <path d="M33 34 Q33 18 48 18 Q63 18 63 34Z" fill="${c}"/>
      <rect x="30" y="34" width="36" height="4" rx="2" fill="${c}"/>
      <!-- Bowling arm raised -->
      <path d="M48 70 Q62 50 72 35" stroke="${s}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <!-- Ball -->
      <circle cx="74" cy="32" r="7" fill="#CC3333" opacity="0.9"/>
      <path d="M68 32 Q74 28 80 32" stroke="#8B0000" stroke-width="1.5" fill="none"/>
      <path d="M68 32 Q74 36 80 32" stroke="#8B0000" stroke-width="1.5" fill="none"/>
      <!-- Other arm -->
      <path d="M48 70 Q32 72 28 82" stroke="${s}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- Legs stride -->
      <path d="M40 120 L32 140" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <path d="M56 120 L64 138" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
  'All-Rounder': (c, s) => `
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <!-- Body strong -->
      <ellipse cx="50" cy="93" rx="24" ry="31" fill="${c}" opacity="0.9"/>
      <!-- Head -->
      <circle cx="50" cy="36" r="16" fill="${s}" opacity="0.95"/>
      <!-- Helmet half -->
      <path d="M34 34 Q34 17 50 17 Q66 17 66 34Z" fill="${c}"/>
      <rect x="32" y="34" width="36" height="3" rx="1.5" fill="${s}" opacity="0.7"/>
      <!-- Bat angled -->
      <rect x="65" y="50" width="7" height="48" rx="2" fill="${s}" opacity="0.85" transform="rotate(-15, 68, 74)"/>
      <!-- Ball -->
      <circle cx="28" cy="75" r="6" fill="#CC3333" opacity="0.85"/>
      <!-- Arms spread -->
      <path d="M50 72 Q68 62 70 68" stroke="${s}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M50 72 Q32 68 28 75" stroke="${s}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- Legs -->
      <path d="M42 122 L38 140" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <path d="M58 122 L62 140" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
  'Wicket-Keeper': (c, s) => `
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <!-- Body crouched -->
      <ellipse cx="50" cy="100" rx="22" ry="26" fill="${c}" opacity="0.9"/>
      <!-- Head -->
      <circle cx="50" cy="40" r="16" fill="${s}" opacity="0.95"/>
      <!-- Keeper helmet with grille -->
      <path d="M34 38 Q34 20 50 20 Q66 20 66 38Z" fill="${c}"/>
      <line x1="46" y1="22" x2="44" y2="38" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
      <line x1="50" y1="21" x2="50" y2="38" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
      <line x1="54" y1="22" x2="56" y2="38" stroke="${s}" stroke-width="1.5" opacity="0.6"/>
      <path d="M34 38 Q34 36 50 35 Q66 36 66 38" stroke="${s}" stroke-width="2" fill="none" opacity="0.7"/>
      <!-- Gloves big -->
      <ellipse cx="30" cy="90" rx="8" ry="6" fill="${s}" opacity="0.85"/>
      <ellipse cx="70" cy="90" rx="8" ry="6" fill="${s}" opacity="0.85"/>
      <!-- Arms spread wide -->
      <path d="M50 78 Q40 82 30 90" stroke="${s}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M50 78 Q60 82 70 90" stroke="${s}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <!-- Stumps -->
      <line x1="44" y1="118" x2="44" y2="140" stroke="#D4A017" stroke-width="3"/>
      <line x1="50" y1="118" x2="50" y2="140" stroke="#D4A017" stroke-width="3"/>
      <line x1="56" y1="118" x2="56" y2="140" stroke="#D4A017" stroke-width="3"/>
      <line x1="41" y1="120" x2="59" y2="120" stroke="#D4A017" stroke-width="2"/>
      <!-- Legs crouched -->
      <path d="M40 122 L34 136" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
      <path d="M60 122 L66 136" stroke="${c}" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
};

function getJerseyNumber(name: string): string {
  const num = JERSEY_NUMBERS[name];
  return num ? `#${num}` : `#${(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % 99 + 1}`;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player, size = 'md', onClick, selected, isCaptain, isViceCaptain, showStats, playedValue, isWinner, dimmed
}) => {
  const rarityColor = RARITY_COLORS[player.rarity];
  const teamColor = TEAM_COLORS[player.team] || '#444444';
  const lightTeam = lightenColor(teamColor, 80);

  const rarityGradients: Record<string, string> = {
    Legendary: 'linear-gradient(135deg, #1a1000, #2d1f00, #1a1000)',
    Epic: 'linear-gradient(135deg, #0d0018, #1a0030, #0d0018)',
    Rare: 'linear-gradient(135deg, #001428, #002244, #001428)',
    Common: 'linear-gradient(135deg, #0f0f0f, #1a1a1a, #0f0f0f)',
  };

  const rarityBorder: Record<string, string> = {
    Legendary: '#FFD700',
    Epic: '#9B59B6',
    Rare: '#3498DB',
    Common: '#666',
  };

  const rarityGlow: Record<string, string> = {
    Legendary: '0 0 20px #FFD70066, 0 0 40px #FFD70033',
    Epic: '0 0 20px #9B59B666, 0 0 40px #9B59B633',
    Rare: '0 0 15px #3498DB44',
    Common: 'none',
  };

  const sizeConfig = {
    sm: { w: 110, h: 158, avatarH: 52, nameSize: 9, statSize: 8, padding: 6 },
    md: { w: 168, h: 240, avatarH: 78, nameSize: 11, statSize: 9, padding: 10 },
    lg: { w: 210, h: 300, avatarH: 98, nameSize: 13, statSize: 10, padding: 12 },
  }[size];

  const jersey = getJerseyNumber(player.name);
  const svgFn = PLAYER_SVG[player.role] || PLAYER_SVG['Batsman'];
  const playerSvg = svgFn(teamColor, lightTeam);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(playerSvg)}`;

  const borderWidth = player.rarity === 'Legendary' ? 3 : player.rarity === 'Epic' ? 2 : 2;

  return (
    <div
      onClick={onClick}
      style={{
        width: sizeConfig.w,
        height: sizeConfig.h,
        borderRadius: 14,
        border: `${borderWidth}px solid ${rarityBorder[player.rarity]}`,
        boxShadow: selected
          ? `0 0 0 3px #F59E0B, ${rarityGlow[player.rarity]}`
          : isWinner
          ? `0 0 0 3px #22C55E, ${rarityGlow[player.rarity]}`
          : rarityGlow[player.rarity],
        background: rarityGradients[player.rarity],
        cursor: onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.4 : 1,
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Legendary shimmer overlay */}
      {player.rarity === 'Legendary' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,215,0,0.08) 50%, transparent 60%)',
          animation: 'shimmer 3s infinite',
        }} />
      )}

      {/* TOP STRIP — team color band */}
      <div style={{
        background: `linear-gradient(90deg, ${teamColor}, ${lightenColor(teamColor, 40)})`,
        padding: '4px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: sizeConfig.statSize + 1, letterSpacing: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {player.team}
        </span>
        <span style={{ fontSize: sizeConfig.statSize + 2 }}>
          {player.rarity === 'Legendary' ? '⭐' : player.rarity === 'Epic' ? '💜' : player.rarity === 'Rare' ? '💙' : '⬜'}
        </span>
      </div>

      {/* PLAYER ILLUSTRATION */}
      <div style={{
        height: sizeConfig.avatarH,
        position: 'relative',
        background: `radial-gradient(ellipse at 50% 100%, ${teamColor}33 0%, transparent 70%)`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Jersey number watermark */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: sizeConfig.avatarH * 0.55,
          fontWeight: 900,
          color: `${teamColor}22`,
          fontFamily: 'Arial Black, sans-serif',
          userSelect: 'none',
          letterSpacing: -2,
        }}>
          {jersey.replace('#', '')}
        </div>
        {/* Player SVG illustration */}
        <img
          src={svgDataUrl}
          alt={player.name}
          style={{ height: '95%', width: 'auto', objectFit: 'contain', position: 'relative', zIndex: 2 }}
        />
        {/* Jersey number badge */}
        <div style={{
          position: 'absolute', top: 4, left: 6,
          background: `${teamColor}cc`,
          border: `1px solid ${rarityBorder[player.rarity]}88`,
          borderRadius: 6,
          padding: '1px 5px',
          fontSize: sizeConfig.statSize,
          fontWeight: 900,
          color: '#fff',
          zIndex: 3,
        }}>
          {jersey}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${rarityBorder[player.rarity]}, transparent)` }} />

      {/* NAME & ROLE */}
      <div style={{ padding: '4px 8px 2px', textAlign: 'center' }}>
        <div style={{
          color: '#fff', fontWeight: 900, fontSize: sizeConfig.nameSize + 1,
          lineHeight: 1.2, letterSpacing: 0.3,
          textShadow: `0 0 8px ${teamColor}99`,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {player.name}
        </div>
        <div style={{ color: '#aaa', fontSize: sizeConfig.statSize, marginTop: 1 }}>
          {ROLE_ICONS[player.role]} {player.role}
        </div>
      </div>

      {/* STATS GRID */}
      {size !== 'sm' && (
        <div style={{
          padding: '4px 8px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2px 8px',
          flex: 1,
        }}>
          {[
            { label: 'Runs', value: player.runs },
            { label: 'Wkts', value: player.wickets },
            { label: 'SR', value: player.strikeRate },
            { label: 'Eco', value: player.economy || '-' },
            { label: '6s', value: player.sixes },
            { label: 'Avg', value: player.battingAverage },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: sizeConfig.statSize - 1 }}>{s.label}</span>
              <span style={{ color: '#ddd', fontWeight: 700, fontSize: sizeConfig.statSize }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM — fantasy points + market value */}
      <div style={{
        padding: '3px 8px 5px',
        background: `linear-gradient(180deg, transparent, ${teamColor}22)`,
        borderTop: `1px solid ${rarityBorder[player.rarity]}33`,
      }}>
        {/* FP bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ color: rarityBorder[player.rarity], fontSize: sizeConfig.statSize - 1, fontWeight: 700 }}>FP</span>
          <span style={{ color: rarityBorder[player.rarity], fontSize: sizeConfig.statSize, fontWeight: 900 }}>{player.fantasyPoints}</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 3 }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${Math.min((player.fantasyPoints / 1400) * 100, 100)}%`,
            background: `linear-gradient(90deg, ${rarityBorder[player.rarity]}, ${teamColor})`,
          }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: sizeConfig.statSize - 1 }}>
            💰 {player.marketValue} pts
          </span>
        </div>
      </div>

      {/* Captain / VC badges */}
      {isCaptain && (
        <div style={{
          position: 'absolute', top: 24, right: 5, zIndex: 20,
          background: '#F59E0B', color: '#000',
          fontWeight: 900, fontSize: 10, borderRadius: 5,
          padding: '1px 5px', boxShadow: '0 0 6px #F59E0B88',
        }}>C</div>
      )}
      {isViceCaptain && (
        <div style={{
          position: 'absolute', top: 24, right: isCaptain ? 28 : 5, zIndex: 20,
          background: '#3B82F6', color: '#fff',
          fontWeight: 900, fontSize: 10, borderRadius: 5,
          padding: '1px 5px', boxShadow: '0 0 6px #3B82F688',
        }}>VC</div>
      )}

      {/* Played value overlay */}
      {playedValue !== undefined && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isWinner ? 'rgba(34,197,94,0.25)' : 'rgba(0,0,0,0.6)',
          borderRadius: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 36, fontWeight: 900, color: isWinner ? '#22C55E' : '#fff',
              textShadow: isWinner ? '0 0 20px #22C55E' : '0 2px 8px rgba(0,0,0,0.8)',
            }}>{playedValue}</div>
            {isWinner && <div style={{ color: '#22C55E', fontWeight: 900, fontSize: 12, marginTop: 4 }}>👑 WINNER</div>}
          </div>
        </div>
      )}

      {/* Winner pulse ring */}
      {isWinner && (
        <div style={{
          position: 'absolute', inset: -3, zIndex: 1,
          borderRadius: 16, border: '3px solid #22C55E',
          animation: 'pulse 1s infinite',
          pointerEvents: 'none',
        }} />
      )}
    </div>
  );
};

export default PlayerCard;
