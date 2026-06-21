import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, GameSettings, Category } from '../types/game';

const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? window.location.origin
  : 'http://localhost:3001';

const SESSION_KEY = 'ipl_session';

interface SessionData {
  roomCode: string;
  playerName: string;
}

function saveSession(data: SessionData) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}

function loadSession(): SessionData | null {
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

interface GameStore {
  socket: Socket | null;
  room: GameState | null;
  myId: string | null;
  myName: string | null;
  error: string | null;
  connecting: boolean;
  reconnecting: boolean;

  connect: () => void;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startAuction: () => void;
  placeBid: (amount: number) => void;
  passBid: () => void;
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
  reconnecting: false,

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    set({ connecting: true });
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      set({ socket, myId: socket.id, connecting: false });

      // Auto-rejoin if session exists
      const session = loadSession();
      if (session) {
        set({ reconnecting: true, myName: session.playerName });
        socket.emit('join_room', { roomCode: session.roomCode, playerName: session.playerName });
      }
    });

    socket.on('connect_error', () => {
      set({ error: 'Cannot connect to server. Check your connection.', connecting: false });
    });

    socket.on('reconnect', () => {
      set({ reconnecting: false });
      const session = loadSession();
      if (session) {
        socket.emit('join_room', { roomCode: session.roomCode, playerName: session.playerName });
      }
    });

    socket.on('room_created', ({ room }: { room: GameState }) => {
      saveSession({ roomCode: room.roomCode, playerName: get().myName || '' });
      set({ room, reconnecting: false });
    });

    socket.on('room_joined', ({ room }: { room: GameState }) => {
      saveSession({ roomCode: room.roomCode, playerName: get().myName || '' });
      set({ room, reconnecting: false });
    });

    socket.on('room_rejoined', ({ room }: { room: GameState }) => {
      set({ room, reconnecting: false, error: null });
    });

    socket.on('room_updated', ({ room }: { room: GameState }) => {
      set({ room });
    });

    socket.on('auction_started', ({ room }: { room: GameState }) => set({ room }));
    socket.on('auction_tick', ({ room }: { room: GameState }) => set({ room }));
    socket.on('auction_ended', ({ room }: { room: GameState }) => set({ room }));
    socket.on('bid_placed', ({ room }: { room: GameState }) => set({ room }));
    socket.on('battle_started', ({ room }: { room: GameState }) => set({ room }));
    socket.on('category_selected', ({ room }: { room: GameState }) => set({ room }));

    socket.on('game_restarted', ({ room }: { room: GameState }) => {
      clearSession();
      set({ room });
    });

    socket.on('join_error', ({ error }: { error: string }) => {
      set({ error, reconnecting: false });
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

  passBid: () => {
    const { socket, room } = get();
    if (!socket || !room) return;
    socket.emit('pass_bid', { roomCode: room.roomCode });
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
