const engine = require('../game-engine/engine');

let auctionTimers = new Map();
let battleTimers = new Map();

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('create_room', ({ playerName }) => {
      const room = engine.createRoom(socket.id, playerName);
      socket.join(room.code);
      socket.emit('room_created', { room });
    });

    socket.on('join_room', ({ roomCode, playerName }) => {
      const result = engine.joinRoom(roomCode.toUpperCase(), socket.id, playerName);
      if (result.error) {
        socket.emit('join_error', { error: result.error });
        return;
      }
      socket.join(roomCode.toUpperCase());
      if (result.reconnected) {
        socket.emit('room_rejoined', { room: result.room });
      } else {
        socket.emit('room_joined', { room: result.room });
      }
      io.to(roomCode.toUpperCase()).emit('room_updated', { room: result.room });
    });

    socket.on('update_settings', ({ roomCode, settings }) => {
      const room = engine.updateSettings(roomCode, settings);
      if (room) io.to(roomCode).emit('room_updated', { room });
    });

    socket.on('start_auction', ({ roomCode }) => {
      const room = engine.startAuction(roomCode, io);
      if (room) {
        io.to(roomCode).emit('auction_started', { room });
        startAuctionTimer(io, roomCode);
      }
    });

    socket.on('place_bid', ({ roomCode, amount }) => {
      const room = engine.placeBid(roomCode, socket.id, amount);
      if (room) io.to(roomCode).emit('bid_placed', { room });
    });

    socket.on('start_battle', ({ roomCode }) => {
      const room = engine.startBattle(roomCode);
      if (room) io.to(roomCode).emit('battle_started', { room });
    });

    socket.on('set_captain', ({ roomCode, cardId, role }) => {
      const room = engine.setCaptain(roomCode, socket.id, cardId, role);
      if (room) io.to(roomCode).emit('room_updated', { room });
    });

    socket.on('select_category', ({ roomCode, category }) => {
      const room = engine.selectCategory(roomCode, socket.id, category);
      if (room) {
        io.to(roomCode).emit('category_selected', { room });
        startBattleTimer(io, roomCode);
      }
    });

    socket.on('play_card', ({ roomCode, cardId }) => {
      const room = engine.playCard(roomCode, socket.id, cardId);
      if (room) {
        io.to(roomCode).emit('room_updated', { room });
        if (room.currentRound?.revealed) {
          setTimeout(() => {
            const updatedRoom = engine.getRoom(roomCode);
            if (updatedRoom) io.to(roomCode).emit('room_updated', { room: updatedRoom });
          }, 4000);
        }
      }
    });

    socket.on('pass_bid', ({ roomCode }) => {
      // Allow a player to explicitly pass on current auction item
      const room = engine.getRoom(roomCode);
      if (room) io.to(roomCode).emit('room_updated', { room });
    });

    socket.on('restart_game', ({ roomCode }) => {
      const room = engine.restartGame(roomCode);
      if (room) {
        stopAuctionTimer(roomCode);
        io.to(roomCode).emit('game_restarted', { room });
      }
    });

    socket.on('get_room', ({ roomCode }) => {
      const room = engine.getRoom(roomCode);
      if (room) socket.emit('room_updated', { room });
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      const info = engine.getSocketRoom(socket.id);
      if (info) {
        engine.disconnectPlayer(info.roomCode, socket.id);
        const room = engine.getRoom(info.roomCode);
        if (room) io.to(info.roomCode).emit('room_updated', { room });
      }
    });
  });
}

function startAuctionTimer(io, roomCode) {
  stopAuctionTimer(roomCode);
  const interval = setInterval(() => {
    const result = engine.tickAuction(roomCode);
    if (!result) { stopAuctionTimer(roomCode); return; }
    io.to(roomCode).emit('auction_tick', { room: result.room });
    if (result.auctionDone) {
      stopAuctionTimer(roomCode);
      io.to(roomCode).emit('auction_ended', { room: result.room });
    }
  }, 1000);
  auctionTimers.set(roomCode, interval);
}

function stopAuctionTimer(roomCode) {
  if (auctionTimers.has(roomCode)) {
    clearInterval(auctionTimers.get(roomCode));
    auctionTimers.delete(roomCode);
  }
}

function startBattleTimer(io, roomCode) {
  if (battleTimers.has(roomCode)) {
    clearTimeout(battleTimers.get(roomCode));
  }
  const room = engine.getRoom(roomCode);
  if (!room) return;
  const timeout = setTimeout(() => {
    const r = engine.getRoom(roomCode);
    if (r && r.currentRound && !r.currentRound.revealed) {
      io.to(roomCode).emit('room_updated', { room: r });
    }
  }, (room.settings.roundTimer + 5) * 1000);
  battleTimers.set(roomCode, timeout);
}

module.exports = { setupSocket };
