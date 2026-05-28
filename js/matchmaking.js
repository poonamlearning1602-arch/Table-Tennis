/**
 * MatchmakingManager
 * Handles room creation, joining, and matchmaking logic
 */

class MatchmakingManager {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.currentRoomCode = null;
  }

  /**
   * Create a new game room
   * Returns a promise that resolves with the room code
   */
  createRoom() {
    return new Promise((resolve, reject) => {
      try {
        const apiUrl = `${this.serverUrl.replace(/\/$/, '')}/api/rooms`;

        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (data.success && data.roomCode) {
              this.currentRoomCode = data.roomCode;
              console.log('[Matchmaking] Room created:', data.roomCode);
              resolve(data.roomCode);
            } else {
              reject(new Error(data.error || 'Failed to create room'));
            }
          })
          .catch(error => {
            console.error('[Matchmaking] Error creating room:', error);
            reject(error);
          });
      } catch (error) {
        console.error('[Matchmaking] Unexpected error:', error);
        reject(error);
      }
    });
  }

  /**
   * Join an existing game room
   * Returns a promise that resolves with the room info
   */
  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      try {
        // Validate room code format
        if (!this.isValidRoomCode(roomCode)) {
          reject(new Error('Invalid room code format. Must be 4 alphanumeric characters.'));
          return;
        }

        const apiUrl = `${this.serverUrl.replace(/\/$/, '')}/api/join`;

        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roomCode: roomCode.toUpperCase()
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            if (data.success && data.roomCode) {
              this.currentRoomCode = data.roomCode;
              console.log('[Matchmaking] Room joined:', data.roomCode);
              resolve({
                roomCode: data.roomCode,
                message: data.message
              });
            } else {
              reject(new Error(data.error || 'Failed to join room'));
            }
          })
          .catch(error => {
            console.error('[Matchmaking] Error joining room:', error);
            reject(error);
          });
      } catch (error) {
        console.error('[Matchmaking] Unexpected error:', error);
        reject(error);
      }
    });
  }

  /**
   * Validate room code format
   * Valid format: 4 alphanumeric characters (A-Z, 0-9)
   */
  isValidRoomCode(code) {
    if (!code || typeof code !== 'string') return false;
    return /^[A-Z0-9]{4}$/i.test(code);
  }

  /**
   * Format room code to uppercase
   */
  formatRoomCode(code) {
    return (code || '').toUpperCase().trim();
  }

  /**
   * Get current room code
   */
  getCurrentRoomCode() {
    return this.currentRoomCode;
  }

  /**
   * Clear current room code
   */
  clearRoomCode() {
    this.currentRoomCode = null;
  }

  /**
   * Check server connectivity
   */
  checkServerConnectivity() {
    return new Promise((resolve) => {
      try {
        const healthUrl = `${this.serverUrl.replace(/\/$/, '')}/health`;

        fetch(healthUrl, { timeout: 5000 })
          .then(response => {
            if (response.ok) {
              resolve(true);
            } else {
              resolve(false);
            }
          })
          .catch(error => {
            console.error('[Matchmaking] Server connectivity check failed:', error);
            resolve(false);
          });
      } catch (error) {
        console.error('[Matchmaking] Error checking connectivity:', error);
        resolve(false);
      }
    });
  }

  /**
   * Get server statistics
   */
  getServerStats() {
    return new Promise((resolve) => {
      try {
        const statsUrl = `${this.serverUrl.replace(/\/$/, '')}/api/stats`;

        fetch(statsUrl)
          .then(response => response.json())
          .then(data => {
            resolve(data.stats);
          })
          .catch(error => {
            console.error('[Matchmaking] Error getting server stats:', error);
            resolve(null);
          });
      } catch (error) {
        console.error('[Matchmaking] Unexpected error:', error);
        resolve(null);
      }
    });
  }
}
