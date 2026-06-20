import React from 'react';
import { IPLPlayer, TEAM_COLORS } from '../../data/players';

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
  Batsman: '🏏', Bowler: '🎯', 'All-Rounder': '⚡', 'Wicket-Keeper': '🧤',
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

function getJerseyNumber(name: string): string {
  const num = JERSEY_NUMBERS[name];
  return num ? `#${num}` : `#${(name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % 99 + 1}`;
}

function lighten(hex: string, amt: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#FFD700', Epic: '#9B59B6', Rare: '#3498DB', Common: '#555',
};
const RARITY_BG: Record<string, string> = {
  Legendary: 'linear-gradient(160deg,#1a1000,#2d1f00,#1a1000)',
  Epic: 'linear-gradient(160deg,#0d0018,#1a0030,#0d0018)',
  Rare: 'linear-gradient(160deg,#001428,#002244,#001428)',
  Common: 'linear-gradient(160deg,#0f0f0f,#1c1c1c,#0f0f0f)',
};
const RARITY_GLOW: Record<string, string> = {
  Legendary: '0 0 22px #FFD70066,0 0 44px #FFD70022',
  Epic: '0 0 18px #9B59B655,0 0 36px #9B59B622',
  Rare: '0 0 12px #3498DB44',
  Common: 'none',
};

const BatsmanFigure: React.FC<{ c: string; s: string }> = ({ c, s }) => (
  <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <ellipse cx="50" cy="92" rx="22" ry="30" fill={c} />
    <circle cx="50" cy="36" r="15" fill={s} />
    <path d="M35 34 Q35 17 50 17 Q65 17 65 34 Q65 26 50 24 Q35 24 35 34Z" fill={c} />
    <path d="M35 36 Q35 34 50 33 Q65 34 65 36" stroke={s} strokeWidth="3" fill="none" />
    <rect x="64" y="53" width="8" height="48" rx="2" fill={s} transform="rotate(-20,68,77)" />
    <path d="M50 73 Q70 63 72 70" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M50 73 Q30 68 28 78" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M42 120 L38 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
    <path d="M58 120 L62 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
  </svg>
);

const BowlerFigure: React.FC<{ c: string; s: string }> = ({ c, s }) => (
  <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <ellipse cx="48" cy="90" rx="20" ry="28" fill={c} />
    <circle cx="48" cy="36" r="15" fill={s} />
    <path d="M33 34 Q33 18 48 18 Q63 18 63 34Z" fill={c} />
    <rect x="30" y="33" width="36" height="4" rx="2" fill={c} />
    <path d="M48 68 Q62 48 72 33" stroke={s} strokeWidth="7" fill="none" strokeLinecap="round" />
    <circle cx="74" cy="30" r="7" fill="#CC3333" />
    <path d="M48 68 Q32 70 28 80" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M40 116 L32 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
    <path d="M56 116 L64 128" stroke={c} strokeWidth="7" strokeLinecap="round" />
  </svg>
);

const AllRounderFigure: React.FC<{ c: string; s: string }> = ({ c, s }) => (
  <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <ellipse cx="50" cy="91" rx="24" ry="29" fill={c} />
    <circle cx="50" cy="34" r="15" fill={s} />
    <path d="M35 32 Q35 16 50 16 Q65 16 65 32Z" fill={c} />
    <rect x="65" y="48" width="7" height="46" rx="2" fill={s} transform="rotate(-15,68,71)" />
    <circle cx="28" cy="73" r="6" fill="#CC3333" />
    <path d="M50 70 Q68 60 70 66" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M50 70 Q32 66 28 73" stroke={s} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M42 118 L38 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
    <path d="M58 118 L62 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
  </svg>
);

const KeeperFigure: React.FC<{ c: string; s: string }> = ({ c, s }) => (
  <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <ellipse cx="50" cy="96" rx="22" ry="24" fill={c} />
    <circle cx="50" cy="38" r="15" fill={s} />
    <path d="M35 36 Q35 20 50 20 Q65 20 65 36Z" fill={c} />
    <ellipse cx="28" cy="88" rx="8" ry="6" fill={s} />
    <ellipse cx="72" cy="88" rx="8" ry="6" fill={s} />
    <path d="M50 76 Q40 80 28 88" stroke={s} strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M50 76 Q60 80 72 88" stroke={s} strokeWidth="7" fill="none" strokeLinecap="round" />
    <line x1="44" y1="114" x2="44" y2="130" stroke="#D4A017" strokeWidth="3" />
    <line x1="50" y1="114" x2="50" y2="130" stroke="#D4A017" strokeWidth="3" />
    <line x1="56" y1="114" x2="56" y2="130" stroke="#D4A017" strokeWidth="3" />
    <line x1="41" y1="116" x2="59" y2="116" stroke="#D4A017" strokeWidth="2" />
    <path d="M40 118 L34 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
    <path d="M60 118 L66 130" stroke={c} strokeWidth="7" strokeLinecap="round" />
  </svg>
);

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player, size = 'md', onClick, selected, isCaptain, isViceCaptain, playedValue, isWinner, dimmed
}) => {
  const teamColor = TEAM_COLORS[player.team] || '#444';
  const lightColor = lighten(teamColor, 90);
  const border = RARITY_BORDER[player.rarity];
  const jersey = getJerseyNumber(player.name);

  const sz = {
    sm: { w: 112, h: 162, avatarH: 54, ns: 9, ss: 8 },
    md: { w: 170, h: 244, avatarH: 80, ns: 11, ss: 9 },
    lg: { w: 212, h: 306, avatarH: 100, ns: 13, ss: 10 },
  }[size];

  const Figure = player.role === 'Bowler' ? BowlerFigure
    : player.role === 'All-Rounder' ? AllRounderFigure
    : player.role === 'Wicket-Keeper' ? KeeperFigure
    : BatsmanFigure;

  return (
    <div onClick={onClick} style={{
      width: sz.w, height: sz.h, borderRadius: 14,
      border: `${player.rarity === 'Legendary' ? 3 : 2}px solid ${border}`,
      boxShadow: selected ? `0 0 0 3px #F59E0B,${RARITY_GLOW[player.rarity]}`
        : isWinner ? `0 0 0 3px #22C55E,${RARITY_GLOW[player.rarity]}`
        : RARITY_GLOW[player.rarity],
      background: RARITY_BG[player.rarity],
      cursor: onClick ? 'pointer' : 'default',
      opacity: dimmed ? 0.4 : 1,
      transform: selected ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>

      {/* Team header */}
      <div style={{
        background: `linear-gradient(90deg,${teamColor},${lighten(teamColor, 40)})`,
        padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: sz.ss + 1, letterSpacing: 1, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          {player.team}
        </span>
        <span style={{ fontSize: sz.ss + 2 }}>
          {player.rarity === 'Legendary' ? '⭐' : player.rarity === 'Epic' ? '💜' : player.rarity === 'Rare' ? '💙' : '⬜'}
        </span>
      </div>

      {/* Player figure */}
      <div style={{
        height: sz.avatarH, position: 'relative',
        background: `radial-gradient(ellipse at 50% 100%,${teamColor}44 0%,transparent 70%)`,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          fontSize: sz.avatarH * 0.58, fontWeight: 900,
          color: `${teamColor}30`, fontFamily: 'Arial Black,sans-serif',
          userSelect: 'none', letterSpacing: -2, pointerEvents: 'none',
        }}>
          {jersey.replace('#', '')}
        </div>
        <div style={{ height: '94%', width: '65%', position: 'relative', zIndex: 2 }}>
          <Figure c={teamColor} s={lightColor} />
        </div>
        <div style={{
          position: 'absolute', top: 4, left: 6, zIndex: 3,
          background: teamColor, border: `1px solid ${border}88`,
          borderRadius: 6, padding: '1px 5px',
          fontSize: sz.ss, fontWeight: 900, color: '#fff',
        }}>
          {jersey}
        </div>
      </div>

      <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${border},transparent)` }} />

      <div style={{ padding: '4px 8px 2px', textAlign: 'center' }}>
        <div style={{
          color: '#fff', fontWeight: 900, fontSize: sz.ns + 1, lineHeight: 1.2,
          textShadow: `0 0 8px ${teamColor}99`,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{player.name}</div>
        <div style={{ color: '#999', fontSize: sz.ss, marginTop: 1 }}>
          {ROLE_ICONS[player.role]} {player.role}
        </div>
      </div>

      {size !== 'sm' && (
        <div style={{ padding: '4px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', flex: 1 }}>
          {[
            { label: 'Runs', value: player.runs },
            { label: 'Wkts', value: player.wickets },
            { label: 'SR', value: player.strikeRate },
            { label: 'Eco', value: player.economy || '-' },
            { label: '6s', value: player.sixes },
            { label: 'Avg', value: player.battingAverage },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#666', fontSize: sz.ss - 1 }}>{s.label}</span>
              <span style={{ color: '#ddd', fontWeight: 700, fontSize: sz.ss }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        padding: '3px 8px 5px',
        background: `linear-gradient(180deg,transparent,${teamColor}22)`,
        borderTop: `1px solid ${border}33`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ color: border, fontSize: sz.ss - 1, fontWeight: 700 }}>FP</span>
          <span style={{ color: border, fontSize: sz.ss, fontWeight: 900 }}>{player.fantasyPoints}</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 3 }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${Math.min((player.fantasyPoints / 1400) * 100, 100)}%`,
            background: `linear-gradient(90deg,${border},${teamColor})`,
          }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: sz.ss - 1 }}>💰 {player.marketValue} pts</span>
        </div>
      </div>

      {isCaptain && (
        <div style={{ position: 'absolute', top: 24, right: 5, zIndex: 20, background: '#F59E0B', color: '#000', fontWeight: 900, fontSize: 10, borderRadius: 5, padding: '1px 5px' }}>C</div>
      )}
      {isViceCaptain && (
        <div style={{ position: 'absolute', top: 24, right: isCaptain ? 28 : 5, zIndex: 20, background: '#3B82F6', color: '#fff', fontWeight: 900, fontSize: 10, borderRadius: 5, padding: '1px 5px' }}>VC</div>
      )}

      {playedValue !== undefined && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: isWinner ? 'rgba(34,197,94,0.25)' : 'rgba(0,0,0,0.6)', borderRadius: 12,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: isWinner ? '#22C55E' : '#fff' }}>{playedValue}</div>
            {isWinner && <div style={{ color: '#22C55E', fontWeight: 900, fontSize: 12, marginTop: 4 }}>👑 WINNER</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
