const { PLAYERS } = require('../data/players');

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const rooms = new Map();
// Track socket -> { roomCode, playerName } for reconnect
const socketRoomMap = new Map();

function createRoom(hostId, hostName) {
  const code = generateRoomCode();
  const room = {
    code,
    roomCode: code,
    phase: 'lobby',
    players: [{
      id: hostId,
      name: hostName,
      budget: 1000,
      team: [],
      roundWins: 0,
      totalPoints: 0,
      isHost: true,
      isReady: false,
      isConnected: true,
      captain: null,
      viceCaptain: null,
    }],
    settings: {
      budget: 1000,
      teamSize: 11,
      roundTimer: 30,
      auctionTimer: 20,
      winMode: 'rounds',
      maxPlayers: 6,
      captainBonus: true,
      specialCards: true,
    },
    auctionState: null,
    currentRound: null,
    roundHistory: [],
    winner: null,
    totalRounds: 0,
    auctionInterval: null,
    battleInterval: null,
  };
  rooms.set(code, room);
  socketRoomMap.set(hostId, { roomCode: code, playerName: hostName });
  return room;
}

function joinRoom(roomCode, playerId, playerName) {
  const room = rooms.get(roomCode);
  if (!room) return { error: 'Room not found' };

  // Check if this is a reconnect (player name already exists)
  const existing = room.players.find(p => p.name === playerName);
  if (existing) {
    // Reconnect: update socket id
    existing.id = playerId;
    existing.isConnected = true;
    socketRoomMap.set(playerId, { roomCode, playerName });
    return { room, reconnected: true };
  }

  if (room.phase !== 'lobby') return { error: 'Game in progress — use your original name to rejoin' };
  if (room.players.length >= room.settings.maxPlayers) return { error: 'Room is full' };

  room.players.push({
    id: playerId,
    name: playerName,
    budget: room.settings.budget,
    team: [],
    roundWins: 0,
    totalPoints: 0,
    isHost: false,
    isReady: false,
    isConnected: true,
    captain: null,
    viceCaptain: null,
  });
  socketRoomMap.set(playerId, { roomCode, playerName });
  return { room };
}

function disconnectPlayer(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return;
  const player = room.players.find(p => p.id === playerId);
  if (player) player.isConnected = false;
}

function reconnectPlayer(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.isConnected = true;
    return room;
  }
  return null;
}

// Build a balanced auction pool with nationality and role mix
function buildBalancedPool(numPlayers, teamSize) {
  const needed = numPlayers * teamSize;

  const indian = PLAYERS.filter(p => p.nationality === 'India');
  const overseas = PLAYERS.filter(p => p.nationality !== 'India');

  // Role categories
  const getByRole = (arr, role) => arr.filter(p => p.role === role);
  const getRarity = (arr, rarity) => arr.filter(p => p.rarity === rarity);

  // Ensure at least 4 overseas per team
  const overseasNeeded = numPlayers * 4;
  const indianNeeded = needed - overseasNeeded;

  // Sort by rarity priority
  const rarityOrder = { Legendary: 0, Epic: 1, Rare: 2, Common: 3 };
  const byRarity = (a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity];

  const overseasPool = shuffle(overseas).sort(byRarity).slice(0, Math.min(overseasNeeded + 15, overseas.length));
  const indianPool = shuffle(indian).sort(byRarity).slice(0, Math.min(indianNeeded + 15, indian.length));

  // Merge and shuffle maintaining rarity order within nationality groups
  const combined = [...overseasPool, ...indianPool];
  combined.sort(byRarity);

  return combined.slice(0, Math.min(needed + 25, PLAYERS.length));
}

function startAuction(roomCode, io) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.players.forEach(p => {
    p.budget = room.settings.budget;
    p.team = [];
  });

  const pool = buildBalancedPool(room.players.length, room.settings.teamSize);

  room.phase = 'auction';
  room.auctionState = {
    currentPlayerIndex: 0,
    currentBid: pool[0]?.minimumBid || 10,
    currentBidder: null,
    timer: room.settings.auctionTimer,
    isActive: true,
    bids: [],
    soldPlayers: [],
    playerQueue: pool.map(p => p.id),
  };

  return room;
}

function placeBid(roomCode, bidderId, amount) {
  const room = rooms.get(roomCode);
  if (!room || !room.auctionState) return null;
  const a = room.auctionState;

  const bidder = room.players.find(p => p.id === bidderId);
  if (!bidder) return null;
  if (bidder.budget < amount) return null;
  if (amount <= a.currentBid) return null;
  if (bidder.team.length >= room.settings.teamSize) return null;

  // Role limit check
  const currentIplPlayer = PLAYERS.find(p => p.id === a.playerQueue[a.currentPlayerIndex]);
  if (currentIplPlayer) {
    const roleCount = bidder.team.filter(c => c.role === currentIplPlayer.role).length;
    const limits = getRoleLimits(room.settings.teamSize);
    if (roleCount >= limits[currentIplPlayer.role].max) return null;
  }

  a.currentBid = amount;
  a.currentBidder = bidderId;
  a.timer = Math.max(a.timer, 8);
  a.bids.push({
    playerId: a.playerQueue[a.currentPlayerIndex],
    bidderId, amount, timestamp: Date.now()
  });

  return room;
}

function getRoleLimits(teamSize) {
  return {
    'Batsman': { min: 3, max: 5 },
    'Bowler': { min: 3, max: 5 },
    'All-Rounder': { min: 1, max: 4 },
    'Wicket-Keeper': { min: 1, max: 2 },
  };
}

function autoFillTeam(room) {
  const teamSize = room.settings.teamSize;
  room.players.forEach(player => {
    if (player.team.length >= teamSize) return;

    const needed = teamSize - player.team.length;
    const takenIds = new Set(room.players.flatMap(p => p.team.map(c => c.id)));
    const available = PLAYERS.filter(p => !takenIds.has(p.id));

    // Try to fill role gaps first
    const limits = getRoleLimits(teamSize);
    let filled = 0;

    for (const [role, limit] of Object.entries(limits)) {
      const currentCount = player.team.filter(c => c.role === role).length;
      const shortfall = limit.min - currentCount;
      if (shortfall > 0) {
        const candidates = shuffle(available.filter(p => p.role === role && !takenIds.has(p.id)));
        const toAdd = candidates.slice(0, shortfall);
        toAdd.forEach(p => {
          player.team.push(p);
          takenIds.add(p.id);
          filled++;
        });
      }
    }

    // Fill remaining with any available players
    const stillNeeded = teamSize - player.team.length;
    if (stillNeeded > 0) {
      const remaining = shuffle(PLAYERS.filter(p => !takenIds.has(p.id)));
      remaining.slice(0, stillNeeded).forEach(p => {
        player.team.push(p);
        takenIds.add(p.id);
      });
    }

    player.budget = Math.max(0, player.budget);
  });
}

function advanceAuction(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || !room.auctionState) return null;
  const a = room.auctionState;

  const currentPlayerId = a.playerQueue[a.currentPlayerIndex];
  if (a.currentBidder) {
    const winner = room.players.find(p => p.id === a.currentBidder);
    if (winner && winner.team.length < room.settings.teamSize) {
      const player = PLAYERS.find(p => p.id === currentPlayerId);
      if (player) {
        winner.team.push(player);
        winner.budget -= a.currentBid;
        a.soldPlayers.push({ playerId: currentPlayerId, buyerId: a.currentBidder, price: a.currentBid });
      }
    }
  }

  const allFull = room.players.every(p => p.team.length >= room.settings.teamSize);
  a.currentPlayerIndex++;

  if (allFull || a.currentPlayerIndex >= a.playerQueue.length) {
    // Auto-fill any incomplete teams
    autoFillTeam(room);
    room.phase = 'team-review';
    a.isActive = false;
    return { room, auctionDone: true };
  }

  // Check if remaining players can still bid (budget check)
  const playersWhoCanBid = room.players.filter(p =>
    p.team.length < room.settings.teamSize && p.budget > 0
  );
  if (playersWhoCanBid.length === 0) {
    autoFillTeam(room);
    room.phase = 'team-review';
    a.isActive = false;
    return { room, auctionDone: true };
  }

  const nextPlayer = PLAYERS.find(p => p.id === a.playerQueue[a.currentPlayerIndex]);
  a.currentBid = nextPlayer?.minimumBid || 10;
  a.currentBidder = null;
  a.timer = room.settings.auctionTimer;

  return { room, auctionDone: false };
}

function tickAuction(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || !room.auctionState || !room.auctionState.isActive) return null;

  room.auctionState.timer--;

  if (room.auctionState.timer <= 0) {
    return advanceAuction(roomCode);
  }

  return { room, auctionDone: false };
}

function startBattle(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;

  room.players.forEach(p => {
    if (!p.captain && p.team.length > 0) p.captain = p.team[0]?.id || null;
    if (!p.viceCaptain && p.team.length > 1) p.viceCaptain = p.team[1]?.id || null;
  });

  room.phase = 'battle';
  const firstActivePlayer = room.players[0];
  room.currentRound = {
    roundNumber: 1,
    activePlayerId: firstActivePlayer.id,
    selectedCategory: null,
    playedCards: [],
    revealed: false,
    winner: null,
    isTie: false,
    tiedPlayers: [],
    scores: [],
  };
  room.totalRounds = 0;

  return room;
}

function selectCategory(roomCode, playerId, category) {
  const room = rooms.get(roomCode);
  if (!room || !room.currentRound) return null;
  if (room.currentRound.activePlayerId !== playerId) return null;
  if (room.currentRound.selectedCategory) return null;

  room.currentRound.selectedCategory = category;
  return room;
}

function playCard(roomCode, playerId, cardId) {
  const room = rooms.get(roomCode);
  if (!room || !room.currentRound || !room.currentRound.selectedCategory) return null;

  const player = room.players.find(p => p.id === playerId);
  if (!player) return null;

  const hasCard = player.team.find(c => c.id === cardId);
  if (!hasCard) return null;

  const alreadyPlayed = room.currentRound.playedCards.find(pc => pc.playerId === playerId);
  if (alreadyPlayed) return null;

  room.currentRound.playedCards.push({ playerId, cardId });

  const eligiblePlayers = room.currentRound.isTie
    ? room.currentRound.tiedPlayers
    : room.players.filter(p => p.team.length > 0).map(p => p.id);

  if (room.currentRound.playedCards.length >= eligiblePlayers.length) {
    return resolveRound(roomCode);
  }

  return room;
}

function getCategoryValue(player, cardId, category, settings) {
  const card = player.team.find(c => c.id === cardId);
  if (!card) return 0;

  let value = card[category] || 0;

  if (category === 'economy') {
    value = card.economy > 0 ? (20 - card.economy) : 0;
  }

  if (settings.captainBonus) {
    if (player.captain === cardId) value *= 1.1;
    else if (player.viceCaptain === cardId) value *= 1.05;
  }

  return parseFloat(value.toFixed(2));
}

function resolveRound(roomCode) {
  const room = rooms.get(roomCode);
  if (!room || !room.currentRound) return null;
  const round = room.currentRound;

  const scores = round.playedCards.map(pc => {
    const player = room.players.find(p => p.id === pc.playerId);
    return {
      playerId: pc.playerId,
      cardId: pc.cardId,
      value: getCategoryValue(player, pc.cardId, round.selectedCategory, room.settings),
    };
  });

  round.scores = scores;
  round.revealed = true;

  const maxVal = Math.max(...scores.map(s => s.value));
  const winners = scores.filter(s => s.value === maxVal);

  if (winners.length === 1) {
    round.winner = winners[0].playerId;
    round.isTie = false;
    const winPlayer = room.players.find(p => p.id === round.winner);
    if (winPlayer) {
      winPlayer.roundWins++;
      winPlayer.totalPoints += scores.length;
    }

    // Remove played cards
    round.playedCards.forEach(pc => {
      const p = room.players.find(pl => pl.id === pc.playerId);
      if (p) p.team = p.team.filter(c => c.id !== pc.cardId);
    });

    room.totalRounds++;

    // Check game over
    const playersWithCards = room.players.filter(p => p.team.length > 0);
    if (room.settings.winMode === 'lastcard' && playersWithCards.length <= 1) {
      endGame(room);
      return room;
    }

    if (room.totalRounds >= 20 || playersWithCards.length < 2) {
      endGame(room);
      return room;
    }

    room.roundHistory.push({ ...round });
    setTimeout(() => {
      startNextRound(roomCode, round.winner);
    }, 4000);
  } else {
    round.isTie = true;
    round.tiedPlayers = winners.map(w => w.playerId);
    round.playedCards = [];
  }

  return room;
}

function startNextRound(roomCode, lastWinnerId) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const nextActive = lastWinnerId || room.players[0].id;
  room.currentRound = {
    roundNumber: room.totalRounds + 1,
    activePlayerId: nextActive,
    selectedCategory: null,
    playedCards: [],
    revealed: false,
    winner: null,
    isTie: false,
    tiedPlayers: [],
    scores: [],
  };
}

function endGame(room) {
  room.phase = 'gameover';
  let winner;
  if (room.settings.winMode === 'rounds') {
    winner = room.players.reduce((a, b) => a.roundWins > b.roundWins ? a : b);
  } else if (room.settings.winMode === 'points') {
    winner = room.players.reduce((a, b) => a.totalPoints > b.totalPoints ? a : b);
  } else {
    winner = room.players.reduce((a, b) => a.team.length > b.team.length ? a : b);
  }
  room.winner = winner.id;
}

function setCaptain(roomCode, playerId, cardId, role) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return null;
  if (role === 'captain') player.captain = cardId;
  else if (role === 'viceCaptain') player.viceCaptain = cardId;
  return room;
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function getSocketRoom(socketId) {
  return socketRoomMap.get(socketId);
}

function updateSettings(roomCode, settings) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  room.settings = { ...room.settings, ...settings };
  room.players.forEach(p => p.budget = room.settings.budget);
  return room;
}

function restartGame(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  room.phase = 'lobby';
  room.players.forEach(p => {
    p.budget = room.settings.budget;
    p.team = [];
    p.roundWins = 0;
    p.totalPoints = 0;
    p.isReady = false;
    p.captain = null;
    p.viceCaptain = null;
  });
  room.auctionState = null;
  room.currentRound = null;
  room.roundHistory = [];
  room.winner = null;
  room.totalRounds = 0;
  return room;
}

module.exports = {
  createRoom, joinRoom, startAuction, placeBid, advanceAuction, tickAuction,
  startBattle, selectCategory, playCard, startNextRound, setCaptain,
  getRoom, getSocketRoom, disconnectPlayer, reconnectPlayer, updateSettings, restartGame,
};
