/**
 * StateBroadcaster
 * Manages broadcasting game state to players
 */

class StateBroadcaster {
  constructor() {
    this.sessions = new Map(); // roomCode -> GameSession
  }

  /**
   * Register a game session
   */
  registerSession(gameSession) {
    this.sessions.set(gameSession.roomCode, gameSession);
  }

  /**
   * Unregister a game session
   */
  unregisterSession(roomCode) {
    this.sessions.delete(roomCode);
  }

  /**
   * Get session by room code
   */
  getSession(roomCode) {
    return this.sessions.get(roomCode);
  }

  /**
   * Broadcast game state to all players in a session
   */
  broadcastState(roomCode) {
    const session = this.getSession(roomCode);
    if (!session) return false;

    session.broadcast();
    return true;
  }

  /**
   * Send notification to players
   */
  sendNotification(roomCode, type, payload) {
    const session = this.getSession(roomCode);
    if (!session) return false;

    const message = {
      type: type,
      payload: payload
    };

    session.sendToAllPlayers(message);
    return true;
  }

  /**
   * Send notification to specific player
   */
  sendToPlayer(roomCode, playerNumber, type, payload) {
    const session = this.getSession(roomCode);
    if (!session) return false;

    const message = {
      type: type,
      payload: payload
    };

    if (playerNumber === 1) {
      session.sendToPlayer1(message);
    } else if (playerNumber === 2) {
      session.sendToPlayer2(message);
    }

    return true;
  }

  /**
   * Get session statistics
   */
  getStats() {
    const stats = {
      totalSessions: this.sessions.size,
      activeSessions: 0,
      totalPlayers: 0,
      sessions: []
    };

    for (const [roomCode, session] of this.sessions) {
      if (session.gameRunning) {
        stats.activeSessions++;
      }

      const playerCount = (session.player1 ? 1 : 0) + (session.player2 ? 1 : 0);
      stats.totalPlayers += playerCount;

      stats.sessions.push({
        roomCode: roomCode,
        playerCount: playerCount,
        gameRunning: session.gameRunning,
        scores: session.gameState.scores,
        createdAt: session.createdAt
      });
    }

    return stats;
  }

  /**
   * Cleanup old sessions
   */
  cleanupOldSessions(maxAgeMs = 3600000) { // Default: 1 hour
    const now = Date.now();
    const toRemove = [];

    for (const [roomCode, session] of this.sessions) {
      if ((now - session.createdAt) > maxAgeMs && !session.gameRunning) {
        toRemove.push(roomCode);
      }
    }

    for (const roomCode of toRemove) {
      const session = this.getSession(roomCode);
      if (session) {
        session.cleanup();
        this.unregisterSession(roomCode);
      }
    }

    return toRemove.length;
  }
}

module.exports = StateBroadcaster;
