# Table Tennis Multiplayer Game Server

Backend server for the Table Tennis multiplayer game. Manages game sessions, player connections, and real-time game state synchronization via WebSocket.

## Features

- **WebSocket Server**: Real-time bidirectional communication between clients
- **Game Session Management**: Handles up to multiple concurrent game rooms
- **State Broadcasting**: 30 Hz game state synchronization
- **Room-based Matchmaking**: Players create/join rooms with unique codes
- **Automatic Cleanup**: Removes inactive sessions and players

## Tech Stack

- **Node.js** with Express.js
- **WebSocket** (ws library)
- **UUID** for unique identifiers
- **CORS** for cross-origin requests

## Installation

### Prerequisites
- Node.js 14+ and npm

### Local Development

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Run the server:
```bash
npm start
```

Server will start on `http://localhost:3000`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `GITHUB_PAGES_URL` - Frontend URL for CORS (default: https://poonamlearning1602-arch.github.io)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

### REST API

#### POST /api/rooms
Create a new game room
- **Response**: `{ success: true, roomCode: "XXXX" }`

#### POST /api/join
Join an existing game room
- **Request**: `{ roomCode: "XXXX" }`
- **Response**: `{ success: true, roomCode: "XXXX" }`

#### GET /api/stats
Get server statistics
- **Response**: `{ stats: { totalSessions, activeSessions, totalPlayers } }`

#### GET /health
Health check endpoint
- **Response**: `{ status: "OK" }`

### WebSocket Messages

#### Client → Server

**join**
```json
{
  "type": "join",
  "roomCode": "XXXX",
  "isCreating": true
}
```

**input** (paddle movement)
```json
{
  "type": "input",
  "payload": {
    "left": false,
    "right": true
  }
}
```

**pause/resume/disconnect**
```json
{
  "type": "pause"
}
```

#### Server → Client

**joinSuccess**
```json
{
  "type": "joinSuccess",
  "payload": {
    "roomCode": "XXXX",
    "playerNumber": 1
  }
}
```

**gameState**
```json
{
  "type": "gameState",
  "payload": {
    "ball": { "x": 400, "y": 300, "vx": 0, "vy": 4, "radius": 5 },
    "paddle1": { "x": 350, "y": 50, "width": 100, "height": 15 },
    "paddle2": { "x": 350, "y": 535, "width": 100, "height": 15 },
    "scores": { "p1": 0, "p2": 0 },
    "isPaused": false,
    "gameOver": false,
    "winner": null
  }
}
```

**opponentJoined**
```json
{
  "type": "opponentJoined",
  "payload": { "message": "Opponent has joined" }
}
```

## Deployment on Railway

### Step 1: Prepare for Deployment

1. Initialize git in the backend directory (if not already done):
```bash
cd backend
git init
git add .
git commit -m "Initial commit - backend server"
```

2. Push to your GitHub repository:
```bash
git remote add origin https://github.com/YOUR_USERNAME/Table-Tennis.git
git push -u origin master
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `Table-Tennis` repository
5. Railway will auto-detect Node.js and install dependencies

### Step 3: Configure Environment

1. In Railway dashboard, go to your project
2. Click on the service
3. Go to "Variables"
4. Add:
   - `PORT`: `3000`
   - `GITHUB_PAGES_URL`: `https://poonamlearning1602-arch.github.io`
   - `NODE_ENV`: `production`

### Step 4: Get Your Server URL

1. Go to the "Deployments" tab
2. Wait for deployment to complete (green checkmark)
3. Find the URL (something like: `https://table-tennis-server-production.up.railway.app`)

### Step 5: Update Frontend

Update the server URL in `js/main.js`:
```javascript
const serverUrl = 'https://your-railway-url.up.railway.app';
```

## Testing

### Local Testing

1. Start the server: `npm start`
2. Open your game in two browser windows
3. One player creates a room, other joins
4. Both should connect and be able to play

### Production Testing

1. Deploy to Railway
2. Update frontend with production URL
3. Test from two different devices/networks
4. Verify connection stability and game state sync

## Troubleshooting

### WebSocket Connection Fails
- Check that server URL is correct (no trailing slashes)
- Verify CORS settings include your frontend domain
- Check browser console for detailed errors

### Room Not Found
- Verify room code is exactly 4 characters
- Ensure both players are using correct server URL
- Check server is running and accessible

### Latency Issues
- Normal for 100-300ms network delays
- Game uses interpolation to smooth remote paddle movement
- If consistently > 500ms, check network connection

## Performance

- Tested with up to 20 concurrent game sessions
- State broadcasts at 30 Hz (33ms per update)
- WebSocket connections use minimal bandwidth (~5KB per game/min)

## License

MIT

## Support

For issues or questions, check the main [Table Tennis Repository](https://github.com/poonamlearning1602-arch/Table-Tennis)
