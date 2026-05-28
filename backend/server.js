/**
 * Table Tennis Multiplayer Game Server
 * Handles WebSocket connections, game sessions, and state synchronization
 */

require('dotenv').config();

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const GameSession = require('./game-session');
const PlayerManager = require('./player-manager');
const StateBroadcaster = require('./state-broadcaster');

// Configuration
const PORT = process.env.PORT || 3000;
const GITHUB_PAGES_URL = process.env.GITHUB_PAGES_URL || 'https://poonamlearning1602-arch.github.io';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: [
    GITHUB_PAGES_URL,
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
  ]
}));

app.use(express.json());

// Initialize managers
const playerManager = new PlayerManager();
const stateBroadcaster = new StateBroadcaster();

// Helper: Generate room code (4 alphanumeric characters)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper: Validate room code format
function isValidRoomCode(code) {
  return /^[A-Z0-9]{4}$/.test(code);
}

// ===== REST Endpoints =====

/**
 * POST /api/rooms
 * Create a new game room
 */
app.post('/api/rooms', (req, res) => {
  try {
    let roomCode;
    let attempts = 0;
    const maxAttempts = 100;

    // Generate unique room code
    do {
      roomCode = generateRoomCode();
      attempts++;
    } while (stateBroadcaster.getSession(roomCode) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Unable to generate unique room code' });
    }

    // Create new game session
    const gameSession = new GameSession(roomCode);
    stateBroadcaster.registerSession(gameSession);

    res.json({
      success: true,
      roomCode: roomCode,
      message: 'Room created successfully'
    });

    console.log(`[ROOMS] Room created: ${roomCode}`);
  } catch (error) {
    console.error('[ROOMS] Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * POST /api/join
 * Join an existing game room
 */
app.post('/api/join', (req, res) => {
  try {
    const { roomCode } = req.body;

    if (!roomCode || !isValidRoomCode(roomCode)) {
      return res.status(400).json({ error: 'Invalid room code format' });
    }

    const session = stateBroadcaster.getSession(roomCode);
    if (!session) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!playerManager.isRoomAvailable(roomCode)) {
      return res.status(400).json({ error: 'Room is full (2 players already present)' });
    }

    res.json({
      success: true,
      roomCode: roomCode,
      message: 'Successfully joined room'
    });

    console.log(`[ROOMS] Player joined room: ${roomCode}`);
  } catch (error) {
    console.error('[ROOMS] Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

/**
 * GET /api/stats
 * Get server statistics
 */
app.get('/api/stats', (req, res) => {
  const stats = stateBroadcaster.getStats();
  res.json({
    success: true,
    stats: stats,
    uptime: process.uptime()
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ===== WebSocket Server =====

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('[WS] New WebSocket connection');

  let playerId = null;
  let playerNumber = null;
  let roomCode = null;

  /**
   * Handle message from client
   */
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          handleJoinMessage(data);
          break;

        case 'input':
          handleInputMessage(data);
          break;

        case 'pause':
          handlePauseMessage(data);
          break;

        case 'resume':
          handleResumeMessage(data);
          break;

        case 'disconnect':
          handleDisconnectMessage(data);
          break;

        default:
          console.warn(`[WS] Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('[WS] Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Error processing message' }
      }));
    }
  });

  /**
   * Handle client disconnect
   */
  ws.on('close', () => {
    console.log(`[WS] Connection closed - Player: ${playerId}, Room: ${roomCode}`);

    if (roomCode && playerNumber) {
      const session = stateBroadcaster.getSession(roomCode);
      if (session) {
        // Notify other player
        if (playerNumber === 1 && session.player2) {
          session.sendToPlayer2({
            type: 'opponentDisconnected',
            payload: { message: 'Opponent has disconnected' }
          });
        } else if (playerNumber === 2 && session.player1) {
          session.sendToPlayer1({
            type: 'opponentDisconnected',
            payload: { message: 'Opponent has disconnected' }
          });
        }

        // Stop game if it was running
        session.stopGame();
      }

      playerManager.removePlayer(playerId);
    }
  });

  /**
   * Handle WebSocket errors
   */
  ws.on('error', (error) => {
    console.error('[WS] WebSocket error:', error);
  });

  /**
   * Handle join message from client
   */
  function handleJoinMessage(data) {
    const { roomCode: code, isCreating } = data;

    if (!code || !isValidRoomCode(code)) {
      ws.send(JSON.stringify({
        type: 'joinFailed',
        payload: { message: 'Invalid room code' }
      }));
      return;
    }

    roomCode = code;
    let session = stateBroadcaster.getSession(roomCode);

    if (!session) {
      ws.send(JSON.stringify({
        type: 'joinFailed',
        payload: { message: 'Room not found' }
      }));
      return;
    }

    // Register player
    playerId = playerManager.registerPlayer(ws);
    playerManager.assignPlayerToRoom(playerId, roomCode);

    // Assign player number
    if (!session.player1) {
      playerNumber = 1;
      session.addPlayer(1, ws, playerId);
    } else if (!session.player2) {
      playerNumber = 2;
      session.addPlayer(2, ws, playerId);
    } else {
      ws.send(JSON.stringify({
        type: 'joinFailed',
        payload: { message: 'Room is full' }
      }));
      return;
    }

    // Confirm join
    ws.send(JSON.stringify({
      type: 'joinSuccess',
      payload: {
        roomCode: roomCode,
        playerNumber: playerNumber,
        message: `You are Player ${playerNumber}`
      }
    }));

    console.log(`[WS] Player ${playerNumber} joined room ${roomCode}`);

    // Check if game can start
    if (session.isGameReady()) {
      // Notify both players that opponent has joined
      session.sendToAllPlayers({
        type: 'opponentJoined',
        payload: { message: 'Opponent has joined. Game starting...' }
      });

      // Start the game
      session.startGame();
    } else {
      // Waiting for opponent
      ws.send(JSON.stringify({
        type: 'waiting',
        payload: { message: 'Waiting for opponent...' }
      }));
    }
  }

  /**
   * Handle input message (paddle movement)
   */
  function handleInputMessage(data) {
    if (!roomCode || !playerNumber) return;

    const session = stateBroadcaster.getSession(roomCode);
    if (!session) return;

    const input = data.payload || {};
    session.processInput(playerNumber, {
      left: input.left || false,
      right: input.right || false
    });
  }

  /**
   * Handle pause message
   */
  function handlePauseMessage(data) {
    if (!roomCode) return;

    const session = stateBroadcaster.getSession(roomCode);
    if (!session) return;

    session.pauseGame();
    console.log(`[GAME] Game paused in room ${roomCode}`);
  }

  /**
   * Handle resume message
   */
  function handleResumeMessage(data) {
    if (!roomCode) return;

    const session = stateBroadcaster.getSession(roomCode);
    if (!session) return;

    session.resumeGame();
    console.log(`[GAME] Game resumed in room ${roomCode}`);
  }

  /**
   * Handle disconnect message
   */
  function handleDisconnectMessage(data) {
    if (playerId) {
      playerManager.markDisconnected(playerId);
    }
  }
});

// ===== Server Startup =====

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  Table Tennis Multiplayer Server      ║
║  ────────────────────────────────────  ║
║  Server running on port: ${PORT}              ║
║  Status: Ready to accept connections  ║
╚════════════════════════════════════════╝
  `);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API stats: http://localhost:${PORT}/api/stats`);
});

// ===== Maintenance Tasks =====

// Cleanup old sessions every 30 minutes
setInterval(() => {
  const cleaned = stateBroadcaster.cleanupOldSessions();
  if (cleaned > 0) {
    console.log(`[MAINTENANCE] Cleaned up ${cleaned} old sessions`);
  }

  const inactive = playerManager.cleanupInactivePlayers();
  if (inactive > 0) {
    console.log(`[MAINTENANCE] Cleaned up ${inactive} inactive players`);
  }
}, 30 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[SERVER] SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
});

module.exports = server;
