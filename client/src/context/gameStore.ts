import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, GameSettings, Category } from '../types/game';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

interface GameStore {
  socket: Socket | null;
  room: GameState | null;
  myId: string | null;
  myName: string | null;
  error: string | null;
  connecting: boolean;

  connect: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startAuction: () => void;
  placeBid: (amount: number) => void;
  startBattle: () => void;
  setCaptain: (cardId: string, role: 'captain' | 'viceCaptain') => void;
  selectCategory: (category: Category) => void;
  playCard: (cardId: string) => void;
  restartGame: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  room: null,
  myId: null,
  myName: null,
  error: null,
  connecting: false,

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    set({ connecting: true });
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      set({ socket, myId: socket.id, connecting: false });
      console.log('Connected:', socket.id);
    });

    socket.on('connect_error', () => {
      set({ error: 'Cannot connect to server. Make sure the server is running on port 3001.', connecting: false });
    });

    socket.on('room_created', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('room_joined', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('room_updated', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('auction_started', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('auction_tick', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('auction_ended', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('bid_placed', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('battle_started', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('category_selected', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('game_restarted', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('join_error', ({ error }: { error: string }) => {
      set({ error });
    });

    socket.on('disconnect', () => {
      set({ connecting: false });
    });

    set({ socket });
  },

  createRoom: (playerName: string) => {
    const { socket } = get();
    if (!socket) return;
    set({ myName: playerName });
    socket.emit('create_room', { playerName });
  },

  joinRoom: (roomCode: string, playerName: string) => {
    const { socket } = get();
    if (!socket) return;
    set({ myName: playerName });
    socket.emit('join_room', { roomCode, playerName });
  },

  updateSettings: (settings: Partial<GameSettings>) => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('update_settings', { roomCode: room.roomCode, settings });
  },

  startAuction: () => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('start_auction', { roomCode: room.roomCode });
  },

  placeBid: (amount: number) => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('place_bid', { roomCode: room.roomCode, amount });
  },

  startBattle: () => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('start_battle', { roomCode: room.roomCode });
  },

  setCaptain: (cardId: string, role: 'captain' | 'viceCaptain') => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('set_captain', { roomCode: room.roomCode, cardId, role });
  },

  selectCategory: (category: Category) => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('select_category', { roomCode: room.roomCode, category });
  },

  playCard: (cardId: string) => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('play_card', { roomCode: room.roomCode, cardId });
  },

  restartGame: () => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('restart_game', { roomCode: room.roomCode });
  },

  clearError: () => set({ error: null }),
}));
