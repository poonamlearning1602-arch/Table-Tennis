/**
 * NetworkManager
 * Handles WebSocket connection and communication with the server
 */

class NetworkManager {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.playerId = null;
    this.roomCode = null;
    this.playerNumber = null;
    this.isConnected = false;
    this.gameState = null;

    // Callbacks
    this.onGameStateReceived = null;
    this.onOpponentJoined = null;
    this.onOpponentDisconnected = null;
    this.onConnectionError = null;
    this.onJoinSuccess = null;
    this.onJoinFailed = null;
    this.onWaiting = null;
  }

  /**
   * Connect to server and join a room
   */
  connect(roomCode, isCreating = false) {
    return new Promise((resolve, reject) => {
      try {
        // Construct WebSocket URL
        const wsUrl = this.serverUrl.replace(/^http/, 'ws');
        console.log('[Network] Connecting to:', wsUrl);

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Network] WebSocket connected');
          this.isConnected = true;

          // Send join message
          this.ws.send(JSON.stringify({
            type: 'join',
            roomCode: roomCode,
            isCreating: isCreating
          }));
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[Network] WebSocket error:', error);
          this.isConnected = false;
          if (this.onConnectionError) {
            this.onConnectionError('WebSocket connection error');
          }
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[Network] WebSocket closed');
          this.isConnected = false;
          if (this.onConnectionError) {
            this.onConnectionError('Connection closed');
          }
        };

        // Timeout after 30 seconds
        setTimeout(() => {
          if (!this.playerId) {
            this.disconnect();
            reject(new Error('Connection timeout'));
          }
        }, 30000);

        // Resolve when join is successful
        const checkJoin = () => {
          if (this.playerId) {
            resolve();
          } else {
            setTimeout(checkJoin, 100);
          }
        };
        checkJoin();
      } catch (error) {
        console.error('[Network] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle messages from server
   */
  handleMessage(message) {
    try {
      const data = JSON.parse(message);
      console.log('[Network] Received message type:', data.type);

      switch (data.type) {
        case 'joinSuccess':
          this.handleJoinSuccess(data.payload);
          break;

        case 'joinFailed':
          this.handleJoinFailed(data.payload);
          break;

        case 'waiting':
          if (this.onWaiting) {
            this.onWaiting(data.payload);
          }
          break;

        case 'opponentJoined':
          if (this.onOpponentJoined) {
            this.onOpponentJoined(data.payload);
          }
          break;

        case 'opponentDisconnected':
          if (this.onOpponentDisconnected) {
            this.onOpponentDisconnected(data.payload);
          }
          break;

        case 'gameState':
          this.gameState = data.payload;
          if (this.onGameStateReceived) {
            this.onGameStateReceived(this.gameState);
          }
          break;

        case 'error':
          console.error('[Network] Server error:', data.payload);
          if (this.onConnectionError) {
            this.onConnectionError(data.payload.message);
          }
          break;

        default:
          console.warn('[Network] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[Network] Error handling message:', error);
    }
  }

  /**
   * Handle successful join
   */
  handleJoinSuccess(payload) {
    this.roomCode = payload.roomCode;
    this.playerNumber = payload.playerNumber;
    console.log(`[Network] Join successful - Player ${this.playerNumber}, Room ${this.roomCode}`);

    if (this.onJoinSuccess) {
      this.onJoinSuccess(payload);
    }
  }

  /**
   * Handle failed join
   */
  handleJoinFailed(payload) {
    console.error('[Network] Join failed:', payload.message);

    if (this.onJoinFailed) {
      this.onJoinFailed(payload);
    }
  }

  /**
   * Send paddle input to server
   */
  sendInput(input) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'input',
      payload: {
        left: input.left || false,
        right: input.right || false
      }
    }));
  }

  /**
   * Send pause message
   */
  pause() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'pause'
    }));
  }

  /**
   * Send resume message
   */
  resume() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'resume'
    }));
  }

  /**
   * Get latest game state
   */
  getLatestState() {
    return this.gameState;
  }

  /**
   * Check if connection is active
   */
  isActive() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.ws) {
      this.ws.send(JSON.stringify({
        type: 'disconnect'
      }));

      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.playerId = null;
    this.roomCode = null;
    this.playerNumber = null;
  }

  /**
   * Get connection info
   */
  getInfo() {
    return {
      isConnected: this.isConnected,
      roomCode: this.roomCode,
      playerNumber: this.playerNumber,
      serverUrl: this.serverUrl
    };
  }
}
