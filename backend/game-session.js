/**
 * GameSession
 * Manages a single game session between two players
 */

class GameSession {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.player1 = null;
    this.player2 = null;
    this.gameState = {
      ball: {
        x: 400,
        y: 300,
        vx: 0,
        vy: 4,
        radius: 5
      },
      paddle1: {
        x: 350,
        y: 50,
        width: 100,
        height: 15,
        isMovingLeft: false,
        isMovingRight: false
      },
      paddle2: {
        x: 350,
        y: 535,
        width: 100,
        height: 15,
        isMovingLeft: false,
        isMovingRight: false
      },
      scores: {
        p1: 0,
        p2: 0
      },
      isPaused: false,
      gameOver: false,
      winner: null
    };
    this.createdAt = Date.now();
    this.lastUpdateTime = Date.now();
    this.gameRunning = false;
    this.broadcastInterval = null;
    this.maxScore = 11;
    this.winBy = 2;
  }

  /**
   * Add a player to the session
   */
  addPlayer(playerNumber, socket, playerId) {
    if (playerNumber === 1) {
      this.player1 = {
        id: playerId,
        socket: socket,
        lastInput: null
      };
    } else if (playerNumber === 2) {
      this.player2 = {
        id: playerId,
        socket: socket,
        lastInput: null
      };
    }
  }

  /**
   * Check if both players are connected
   */
  isGameReady() {
    return this.player1 && this.player1.socket &&
           this.player2 && this.player2.socket;
  }

  /**
   * Check if both players are still connected
   */
  arePlayersConnected() {
    return this.player1 && this.player2 &&
           this.player1.socket && this.player2.socket &&
           this.player1.socket.readyState === 1 &&
           this.player2.socket.readyState === 1;
  }

  /**
   * Start the game loop
   */
  startGame() {
    if (this.gameRunning) return;

    this.gameRunning = true;
    this.gameState.gameOver = false;

    // Broadcast game state 30 times per second (33ms per frame)
    this.broadcastInterval = setInterval(() => {
      if (!this.arePlayersConnected()) {
        this.stopGame();
        return;
      }

      this.update();
      this.broadcast();
    }, 33);
  }

  /**
   * Stop the game loop
   */
  stopGame() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }
    this.gameRunning = false;
  }

  /**
   * Process player input
   */
  processInput(playerNumber, input) {
    if (playerNumber === 1) {
      if (this.player1) {
        this.player1.lastInput = input;
      }
    } else if (playerNumber === 2) {
      if (this.player2) {
        this.player2.lastInput = input;
      }
    }
  }

  /**
   * Update game state (physics, collisions, scoring)
   */
  update() {
    if (!this.gameRunning || this.gameState.gameOver) return;

    const state = this.gameState;
    const ball = state.ball;
    const paddle1 = state.paddle1;
    const paddle2 = state.paddle2;

    // Apply input to paddles
    if (this.player1 && this.player1.lastInput) {
      paddle1.isMovingLeft = this.player1.lastInput.left || false;
      paddle1.isMovingRight = this.player1.lastInput.right || false;
    }

    if (this.player2 && this.player2.lastInput) {
      paddle2.isMovingLeft = this.player2.lastInput.left || false;
      paddle2.isMovingRight = this.player2.lastInput.right || false;
    }

    // Update paddle positions
    const paddleSpeed = 6;
    if (paddle1.isMovingLeft && paddle1.x > 0) {
      paddle1.x -= paddleSpeed;
    }
    if (paddle1.isMovingRight && paddle1.x + paddle1.width < 800) {
      paddle1.x += paddleSpeed;
    }
    if (paddle2.isMovingLeft && paddle2.x > 0) {
      paddle2.x -= paddleSpeed;
    }
    if (paddle2.isMovingRight && paddle2.x + paddle2.width < 800) {
      paddle2.x += paddleSpeed;
    }

    // Update ball position
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with left/right walls
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > 800) {
      ball.vx = -ball.vx;
      ball.x = Math.max(ball.radius, Math.min(800 - ball.radius, ball.x));
    }

    // Ball collision with paddles
    this.checkPaddleCollision(paddle1);
    this.checkPaddleCollision(paddle2);

    // Ball collision with top/bottom (scoring)
    if (ball.y - ball.radius < 0) {
      // Player 2 scores
      state.scores.p2++;
      this.resetBall();
      this.checkGameOver();
    } else if (ball.y + ball.radius > 600) {
      // Player 1 scores
      state.scores.p1++;
      this.resetBall();
      this.checkGameOver();
    }
  }

  /**
   * Check and handle paddle collision
   */
  checkPaddleCollision(paddle) {
    const ball = this.gameState.ball;

    if (ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height) {

      // Reverse vertical velocity
      ball.vy = -Math.abs(ball.vy);

      // Add horizontal component based on paddle position
      const paddleCenter = paddle.x + paddle.width / 2;
      const hitPos = (ball.x - paddleCenter) / (paddle.width / 2);
      ball.vx = hitPos * 2;

      // Ensure ball is above/below paddle to prevent stuck collisions
      if (paddle === this.gameState.paddle1) {
        ball.y = paddle.y + paddle.height + ball.radius;
      } else {
        ball.y = paddle.y - ball.radius;
      }
    }
  }

  /**
   * Reset ball to center
   */
  resetBall() {
    this.gameState.ball = {
      x: 400,
      y: 300,
      vx: 0,
      vy: 4,
      radius: 5
    };
  }

  /**
   * Check if game is over
   */
  checkGameOver() {
    const scores = this.gameState.scores;

    if (scores.p1 >= this.maxScore || scores.p2 >= this.maxScore) {
      const leadBy = Math.abs(scores.p1 - scores.p2);
      if (leadBy >= this.winBy) {
        this.gameState.gameOver = true;
        this.gameState.winner = scores.p1 > scores.p2 ? 1 : 2;
        this.stopGame();
      }
    }
  }

  /**
   * Broadcast current game state to both players
   */
  broadcast() {
    const message = JSON.stringify({
      type: 'gameState',
      payload: this.gameState
    });

    if (this.player1 && this.player1.socket && this.player1.socket.readyState === 1) {
      this.player1.socket.send(message);
    }
    if (this.player2 && this.player2.socket && this.player2.socket.readyState === 1) {
      this.player2.socket.send(message);
    }
  }

  /**
   * Send message to Player 1
   */
  sendToPlayer1(message) {
    if (this.player1 && this.player1.socket && this.player1.socket.readyState === 1) {
      this.player1.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Send message to Player 2
   */
  sendToPlayer2(message) {
    if (this.player2 && this.player2.socket && this.player2.socket.readyState === 1) {
      this.player2.socket.send(JSON.stringify(message));
    }
  }

  /**
   * Send message to both players
   */
  sendToAllPlayers(message) {
    this.sendToPlayer1(message);
    this.sendToPlayer2(message);
  }

  /**
   * Pause the game
   */
  pauseGame() {
    this.gameState.isPaused = true;
    this.broadcast();
  }

  /**
   * Resume the game
   */
  resumeGame() {
    this.gameState.isPaused = false;
    this.broadcast();
  }

  /**
   * Clean up the session
   */
  cleanup() {
    this.stopGame();

    if (this.player1 && this.player1.socket) {
      this.player1.socket.close();
    }
    if (this.player2 && this.player2.socket) {
      this.player2.socket.close();
    }

    this.player1 = null;
    this.player2 = null;
  }

  /**
   * Get session info
   */
  getInfo() {
    return {
      roomCode: this.roomCode,
      player1Connected: !!this.player1,
      player2Connected: !!this.player2,
      gameRunning: this.gameRunning,
      createdAt: this.createdAt,
      scores: this.gameState.scores
    };
  }
}

module.exports = GameSession;
