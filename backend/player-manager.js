/**
 * PlayerManager
 * Tracks players and their room assignments
 */

const { v4: uuidv4 } = require('uuid');

class PlayerManager {
  constructor() {
    this.players = new Map(); // playerId -> playerInfo
    this.roomAssignments = new Map(); // roomCode -> Set of playerIds
  }

  /**
   * Register a new player
   */
  registerPlayer(socket) {
    const playerId = uuidv4();
    this.players.set(playerId, {
      id: playerId,
      socket: socket,
      roomCode: null,
      joinedAt: Date.now(),
      disconnected: false
    });

    return playerId;
  }

  /**
   * Assign player to a room
   */
  assignPlayerToRoom(playerId, roomCode) {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.roomCode = roomCode;

    if (!this.roomAssignments.has(roomCode)) {
      this.roomAssignments.set(roomCode, new Set());
    }
    this.roomAssignments.get(roomCode).add(playerId);

    return true;
  }

  /**
   * Remove player from room
   */
  removePlayerFromRoom(playerId) {
    const player = this.players.get(playerId);
    if (!player || !player.roomCode) return null;

    const roomCode = player.roomCode;
    const roomPlayers = this.roomAssignments.get(roomCode);

    if (roomPlayers) {
      roomPlayers.delete(playerId);
      if (roomPlayers.size === 0) {
        this.roomAssignments.delete(roomCode);
      }
    }

    player.roomCode = null;
    return roomCode;
  }

  /**
   * Get players in a room
   */
  getPlayersInRoom(roomCode) {
    const playerIds = this.roomAssignments.get(roomCode) || new Set();
    const players = [];

    for (const playerId of playerIds) {
      const player = this.players.get(playerId);
      if (player) {
        players.push(player);
      }
    }

    return players;
  }

  /**
   * Check if room is available (has space for another player)
   */
  isRoomAvailable(roomCode) {
    const players = this.getPlayersInRoom(roomCode);
    return players.length < 2;
  }

  /**
   * Mark player as disconnected
   */
  markDisconnected(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.disconnected = true;
    }
  }

  /**
   * Remove player (cleanup)
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) return null;

    const roomCode = this.removePlayerFromRoom(playerId);
    this.players.delete(playerId);

    return roomCode;
  }

  /**
   * Get player info
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Get total number of active players
   */
  getTotalPlayers() {
    return this.players.size;
  }

  /**
   * Get total number of active rooms
   */
  getTotalRooms() {
    return this.roomAssignments.size;
  }

  /**
   * Cleanup inactive players (optional)
   */
  cleanupInactivePlayers(timeoutMs = 60000) {
    const now = Date.now();
    const toRemove = [];

    for (const [playerId, player] of this.players) {
      if (player.disconnected && (now - player.joinedAt) > timeoutMs) {
        toRemove.push(playerId);
      }
    }

    for (const playerId of toRemove) {
      this.removePlayer(playerId);
    }

    return toRemove.length;
  }
}

module.exports = PlayerManager;
