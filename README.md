# 🏏 IPL 2026 Fantasy Card Battle

A real-time multiplayer IPL card game — auction players, build a squad, and battle using cricket stats.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm 9+

### Install & Run

```bash
# 1. Clone or unzip the project
cd ipl-card-battle

# 2. Install all dependencies
npm install          # root (concurrently)
cd client && npm install && cd ..
cd server && npm install && cd ..

# 3. Start both frontend and backend
npm run dev
```

- **Frontend** → http://localhost:3000
- **Backend** → http://localhost:3001

---

## 🌐 Multiplayer Setup

### Same Wi-Fi (Recommended)
When the server starts, it prints your local IP:
```
Local network: http://192.168.1.42:3000
```
Share this link with friends on the same Wi-Fi.

### Internet (Free Options)

#### Option A – Cloudflare Tunnel (Best)
```bash
# Install once
npm install -g cloudflared

# In a new terminal, after starting the game:
cloudflared tunnel --url http://localhost:3000
```
Share the `*.trycloudflare.com` URL.

#### Option B – ngrok
```bash
# Install: https://ngrok.com/download
ngrok http 3000
```
Share the `*.ngrok-free.app` URL.

#### Option C – LocalTunnel
```bash
npm install -g localtunnel
lt --port 3000
```
Share the `*.loca.lt` URL.

> **Note:** When using tunnels, players will connect to your tunnel URL.  
> The backend (port 3001) socket connection is proxied automatically through Vite.  
> For production tunnel use, also tunnel port 3001 and update `SOCKET_URL` in `client/src/context/gameStore.ts`.

---

## 🎮 Game Flow

### 1. Lobby
- Host creates a room → gets a 6-character **room code**
- Other players join with the room code
- Host configures settings (budget, team size, win mode)
- Host clicks **Start Auction**

### 2. IPL Auction
- Players receive a starting budget (default: 1000 pts)
- Player cards are shown one by one with a countdown timer
- Anyone can bid — highest bid when timer ends wins the card
- Auction ends when all teams are full (teamSize × playerCount cards sold)

### 3. Team Review
- All players review their squads
- Each player sets their **Captain** (+10% stat bonus) and **Vice-Captain** (+5%)
- Host clicks **Start Battle**

### 4. Card Battle
- Each round: the active player picks a **category** (Runs, Wickets, Economy, etc.)
- All players secretly pick one card from their hand
- Cards are revealed — **highest value wins** (economy: lower = better)
- Winner gets +1 round point and goes next
- **Tie:** tied players submit another card; repeat until broken

### 5. Game Over
- Winner declared based on chosen win mode:
  - **Most Rounds Won** (default)
  - **Most Total Points**
  - **Last Card Standing**
- Leaderboard shows rankings, MVP, and team stats

---

## ⚙️ Settings

| Setting | Default | Range |
|---|---|---|
| Budget | 1000 pts | 500–5000 |
| Team Size | 11 | 5–15 |
| Auction Timer | 20s | 10–60s |
| Win Mode | Most Rounds | rounds / points / lastcard |
| Captain Bonus | On | On / Off |
| Max Players | 6 | 2–8 |

---

## 📁 Project Structure

```
ipl-card-battle/
├── client/                 # React + TypeScript + Tailwind
│   └── src/
│       ├── App.tsx          # Route controller (phase-based)
│       ├── pages/           # LandingPage, LobbyPage, AuctionPage,
│       │                    # TeamReviewPage, BattlePage, GameOverPage
│       ├── components/
│       │   └── cards/PlayerCard.tsx
│       ├── context/
│       │   └── gameStore.ts  # Zustand + Socket.IO state
│       ├── data/players.ts   # 105 IPL players dataset
│       └── types/game.ts     # All TypeScript interfaces
├── server/                 # Node.js + Express + Socket.IO
│   ├── index.js             # Entry point, prints local IP
│   ├── socket/handlers.js   # All Socket.IO event handlers
│   ├── game-engine/engine.js# Core game logic (auction, battle)
│   └── data/players.js      # Server-side player data
└── package.json            # Root (runs both with concurrently)
```

---

## 🃏 Player Cards

105 IPL players across 4 rarities:
- 🟡 **Legendary** (8) – Kohli, Bumrah, Rohit, etc.
- 🟣 **Epic** (13) – Gill, Jaiswal, Pant, Jadeja, etc.
- 🔵 **Rare** (20+) – Suryakumar, Rashid, Maxwell, etc.
- ⚪ **Common** (60+) – Remaining IPL players

---

## 🛠 Troubleshooting

**"Cannot connect to server"**  
→ Make sure you ran `npm run dev` (not just the client)  
→ Check port 3001 is not in use: `lsof -i :3001`

**Friends can't connect via local IP**  
→ Disable your firewall temporarily, or allow port 3000/3001  
→ Confirm everyone is on the same Wi-Fi network

**Game state out of sync**  
→ Refresh the page — the server will resync your state on reconnect

---

## 📝 License
MIT — free to use and modify.
