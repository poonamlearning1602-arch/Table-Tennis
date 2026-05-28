/**
 * GameStateSync
 * Handles game state synchronization, serialization, and interpolation
 */

class GameStateSync {
  constructor() {
    this.lastReceivedState = null;
    this.interpolationFactor = 0.7; // How much to interpolate (0-1)
    this.syncTimestamp = null;
  }

  /**
   * Encode game state to JSON for transmission
   */
  encodeState(gameState) {
    return JSON.stringify({
      ball: {
        x: Math.round(gameState.ball.x * 100) / 100,
        y: Math.round(gameState.ball.y * 100) / 100,
        vx: Math.round(gameState.ball.vx * 100) / 100,
        vy: Math.round(gameState.ball.vy * 100) / 100,
        radius: gameState.ball.radius
      },
      paddle1: {
        x: Math.round(gameState.paddle1.x * 100) / 100,
        y: gameState.paddle1.y,
        width: gameState.paddle1.width,
        height: gameState.paddle1.height
      },
      paddle2: {
        x: Math.round(gameState.paddle2.x * 100) / 100,
        y: gameState.paddle2.y,
        width: gameState.paddle2.width,
        height: gameState.paddle2.height
      },
      scores: {
        p1: gameState.scores.p1,
        p2: gameState.scores.p2
      },
      isPaused: gameState.isPaused,
      gameOver: gameState.gameOver,
      winner: gameState.winner
    });
  }

  /**
   * Decode game state from server
   */
  decodeState(jsonState) {
    if (!jsonState) return null;

    try {
      if (typeof jsonState === 'string') {
        return JSON.parse(jsonState);
      }
      return jsonState;
    } catch (error) {
      console.error('[GameStateSync] Error decoding state:', error);
      return null;
    }
  }

  /**
   * Apply received state to local game
   * Uses interpolation for remote paddle to avoid jerky movement
   */
  applyState(gameState, receivedState, localPlayerNumber) {
    if (!receivedState) return;

    // Update ball position and velocity from server (authoritative)
    gameState.ball.x = receivedState.ball.x;
    gameState.ball.y = receivedState.ball.y;
    gameState.ball.vx = receivedState.ball.vx;
    gameState.ball.vy = receivedState.ball.vy;

    // Update local player paddle (keep local, only update if needed)
    const localPaddle = localPlayerNumber === 1 ? gameState.paddle1 : gameState.paddle2;
    const remotePaddle = localPlayerNumber === 1 ? gameState.paddle2 : gameState.paddle1;
    const receivedLocalPaddle = localPlayerNumber === 1 ? receivedState.paddle1 : receivedState.paddle2;
    const receivedRemotePaddle = localPlayerNumber === 1 ? receivedState.paddle2 : receivedState.paddle1;

    // Interpolate remote paddle position for smooth movement
    this.interpolatePaddle(remotePaddle, receivedRemotePaddle);

    // Update scores from server
    gameState.scores = receivedState.scores;
    gameState.isPaused = receivedState.isPaused;
    gameState.gameOver = receivedState.gameOver;
    gameState.winner = receivedState.winner;

    this.lastReceivedState = receivedState;
    this.syncTimestamp = Date.now();
  }

  /**
   * Interpolate remote paddle position between updates
   * Creates smooth movement despite network updates being discrete
   */
  interpolatePaddle(localPaddle, remotePaddle) {
    if (!localPaddle || !remotePaddle) return;

    // Linear interpolation towards target position
    localPaddle.x += (remotePaddle.x - localPaddle.x) * this.interpolationFactor;

    // Ensure paddle stays within bounds
    localPaddle.x = Math.max(0, Math.min(800 - localPaddle.width, localPaddle.x));
  }

  /**
   * Validate ball state to detect desyncs
   * If server ball and local ball diverged significantly, correct local state
   */
  validateBallState(gameState, receivedState, tolerance = 50) {
    if (!receivedState || !receivedState.ball) return false;

    const distance = Math.sqrt(
      Math.pow(gameState.ball.x - receivedState.ball.x, 2) +
      Math.pow(gameState.ball.y - receivedState.ball.y, 2)
    );

    if (distance > tolerance) {
      console.warn(`[GameStateSync] Ball desync detected (distance: ${distance}). Correcting...`);
      return true; // Desync detected
    }

    return false; // State is consistent
  }

  /**
   * Handle desync: correct local ball state to match server
   */
  correctBallState(gameState, receivedState) {
    if (!receivedState || !receivedState.ball) return;

    gameState.ball.x = receivedState.ball.x;
    gameState.ball.y = receivedState.ball.y;
    gameState.ball.vx = receivedState.ball.vx;
    gameState.ball.vy = receivedState.ball.vy;

    console.log('[GameStateSync] Ball state corrected');
  }

  /**
   * Get time elapsed since last state update
   */
  getTimeSinceLastUpdate() {
    if (!this.syncTimestamp) return 0;
    return Date.now() - this.syncTimestamp;
  }

  /**
   * Set interpolation factor (affects smoothness vs responsiveness)
   * Higher value = smoother but less responsive
   * Lower value = more responsive but jerkier
   */
  setInterpolationFactor(factor) {
    this.interpolationFactor = Math.max(0, Math.min(1, factor));
  }

  /**
   * Reset sync state
   */
  reset() {
    this.lastReceivedState = null;
    this.syncTimestamp = null;
  }

  /**
   * Get sync info for debugging
   */
  getInfo() {
    return {
      lastSyncTime: this.syncTimestamp,
      timeSinceSync: this.getTimeSinceLastUpdate(),
      interpolationFactor: this.interpolationFactor,
      hasState: !!this.lastReceivedState
    };
  }
}
