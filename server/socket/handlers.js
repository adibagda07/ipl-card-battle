const engine = require('../game-engine/engine');

let auctionTimers = new Map();

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('create_room', ({ playerName }) => {
      const room = engine.createRoom(socket.id, playerName);
      socket.join(room.code);
      socket.emit('room_created', { room });
      console.log(`Room created: ${room.code} by ${playerName}`);
    });

    socket.on('join_room', ({ roomCode, playerName }) => {
      const result = engine.joinRoom(roomCode.toUpperCase(), socket.id, playerName);
      if (result.error) {
        socket.emit('join_error', { error: result.error });
        return;
      }
      socket.join(roomCode.toUpperCase());
      socket.emit('room_joined', { room: result.room });
      io.to(roomCode.toUpperCase()).emit('room_updated', { room: result.room });
      console.log(`${playerName} joined room ${roomCode}`);
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
      if (room) {
        io.to(roomCode).emit('bid_placed', { room });
      }
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
        // Start battle timer
        startBattleTimer(io, roomCode);
      }
    });

    socket.on('play_card', ({ roomCode, cardId }) => {
      const room = engine.playCard(roomCode, socket.id, cardId);
      if (room) {
        io.to(roomCode).emit('room_updated', { room });
        // Check if round resolved
        if (room.currentRound?.revealed) {
          setTimeout(() => {
            const updatedRoom = engine.getRoom(roomCode);
            if (updatedRoom) io.to(roomCode).emit('room_updated', { room: updatedRoom });
          }, 4000);
        }
      }
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
      // Find and update room
      // Note: in production, you'd want to track which room each socket is in
    });
  });
}

function startAuctionTimer(io, roomCode) {
  stopAuctionTimer(roomCode);
  const interval = setInterval(() => {
    const result = engine.tickAuction(roomCode);
    if (!result) {
      stopAuctionTimer(roomCode);
      return;
    }
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
  // Auto-resolve after timer if not all cards played
  const room = engine.getRoom(roomCode);
  if (!room) return;
  setTimeout(() => {
    const r = engine.getRoom(roomCode);
    if (r && r.currentRound && !r.currentRound.revealed) {
      io.to(roomCode).emit('room_updated', { room: r });
    }
  }, (room.settings.roundTimer + 5) * 1000);
}

module.exports = { setupSocket };
