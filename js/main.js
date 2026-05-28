// Main initialization and entry point
// Define all functions globally FIRST, before DOMContentLoaded

// Navigation functions
// Local vs Online Mode Selection
function startLocalTwoPlayerMode() {
    uiManager.showDifficultyMenu('2player');
    updateDifficultyMenuForPlayer1();
}

function startOnlineTwoPlayerMode() {
    uiManager.switchScreen('onlineMenuScreen');
}

function startSinglePlayerMode() {
    uiManager.showDifficultyMenu('singleplayer');
    updateDifficultyMenuForPlayer1();
}

function selectDifficulty(difficulty) {
    if (uiManager.gameState.mode === '2player') {
        if (uiManager.currentDifficultyPlayer === 1) {
            uiManager.gameState.p1Difficulty = difficulty;
            uiManager.currentDifficultyPlayer = 2;
            updateDifficultyMenuForPlayer2();
        } else if (uiManager.currentDifficultyPlayer === 2) {
            uiManager.gameState.p2Difficulty = difficulty;
            startGame();
        }
    } else if (uiManager.gameState.mode === 'singleplayer') {
        if (uiManager.currentDifficultyPlayer === 1) {
            uiManager.gameState.p1Difficulty = difficulty;
            uiManager.currentDifficultyPlayer = 2;
            updateDifficultyMenuForAI();
        } else if (uiManager.currentDifficultyPlayer === 2) {
            uiManager.gameState.p2Difficulty = difficulty;
            startGame();
        }
    }
}

function backToMainMenu() {
    console.log('backToMainMenu called');
    try {
        // Stop the game
        if (gameManager) {
            gameManager.isRunning = false;
            if (gameManager.paddle1) gameManager.paddle1.stopMovement();
            if (gameManager.paddle2) gameManager.paddle2.stopMovement();
        }
        // Reset UI and switch to main menu
        if (uiManager) {
            uiManager.resetGameUI();
            uiManager.switchScreen('mainMenu');
        }
        console.log('Successfully switched to mainMenu');
    } catch (error) {
        console.error('Error in backToMainMenu:', error);
    }
}

function togglePause() {
    console.log('togglePause called');
    try {
        if (uiManager.gameState.isPaused) {
            uiManager.hidePauseScreen();
            if (gameManager) gameManager.resumeGame();
        } else {
            uiManager.showPauseScreen();
            if (gameManager) gameManager.pauseGame();
        }
        console.log('Pause toggled, isPaused:', uiManager.gameState.isPaused);
    } catch (error) {
        console.error('Error in togglePause:', error);
    }
}

function resetGame() {
    console.log('resetGame called');
    try {
        if (gameManager) gameManager.resetGame();
        if (uiManager) uiManager.resetGameUI();
        console.log('Game reset');
    } catch (error) {
        console.error('Error in resetGame:', error);
    }
}

function playAgain() {
    console.log('playAgain called');
    try {
        if (gameManager) gameManager.resetGame();
        if (uiManager) uiManager.resetGameUI();
    } catch (error) {
        console.error('Error in playAgain:', error);
    }
}

// Helper functions for difficulty menu
function updateDifficultyMenuForPlayer1() {
    const titleEl = document.getElementById('difficultyTitle');
    const subtitleEl = document.getElementById('difficultySubtitle');

    if (uiManager.gameState.mode === '2player') {
        titleEl.textContent = 'Player 1 Difficulty';
        subtitleEl.textContent = 'Select difficulty for Player 1';
    } else {
        titleEl.textContent = 'Your Difficulty';
        subtitleEl.textContent = 'Choose how challenging you want the game';
    }
}

function updateDifficultyMenuForPlayer2() {
    const titleEl = document.getElementById('difficultyTitle');
    const subtitleEl = document.getElementById('difficultySubtitle');
    titleEl.textContent = 'Player 2 Difficulty';
    subtitleEl.textContent = 'Select difficulty for Player 2';
}

function updateDifficultyMenuForAI() {
    const titleEl = document.getElementById('difficultyTitle');
    const subtitleEl = document.getElementById('difficultySubtitle');
    titleEl.textContent = 'AI Difficulty';
    subtitleEl.textContent = 'Choose the AI opponent difficulty';
}

// Online Mode Functions
function showCreateRoomScreen() {
    console.log('showCreateRoomScreen called');
    uiManager.switchScreen('createRoomScreen');

    // Auto-create room
    setTimeout(() => {
        handleCreateRoom();
    }, 100);
}

function showJoinRoomScreen() {
    console.log('showJoinRoomScreen called');
    uiManager.switchScreen('joinRoomScreen');
    document.getElementById('joinRoomInput').focus();
}

async function handleCreateRoom() {
    try {
        const roomCreatingEl = document.getElementById('roomCreationLoading');
        const roomDisplayEl = document.getElementById('roomCodeDisplay');

        if (roomCreatingEl) roomCreatingEl.style.display = 'block';
        if (roomDisplayEl) roomDisplayEl.style.display = 'none';

        // Check server connectivity first
        const serverUrl = 'https://table-tennis-production.up.railway.app'; // Update with actual server URL
        const matchmaking = new MatchmakingManager(serverUrl);

        const isServerUp = await matchmaking.checkServerConnectivity();
        if (!isServerUp) {
            alert('⚠️ Server is currently unavailable. Please try again later.');
            backToMainMenu();
            return;
        }

        // Create room
        const roomCode = await matchmaking.createRoom();

        if (roomCreatingEl) roomCreatingEl.style.display = 'none';
        if (roomDisplayEl) roomDisplayEl.style.display = 'block';

        document.getElementById('roomCode').textContent = roomCode;

        // Start waiting with network connection
        startOnlineGame(roomCode, true);
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Failed to create room: ' + error.message);
        backToMainMenu();
    }
}

function copyRoomCodeToClipboard() {
    const roomCode = document.getElementById('roomCode').textContent;
    if (roomCode && roomCode !== '----') {
        navigator.clipboard.writeText(roomCode).then(() => {
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        });
    }
}

function formatRoomCodeInput(input) {
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Clear error message on input
    const errorMsg = document.getElementById('joinErrorMsg');
    if (errorMsg) errorMsg.style.display = 'none';
}

async function handleJoinRoom() {
    const roomCode = document.getElementById('joinRoomInput').value.trim().toUpperCase();
    const errorMsg = document.getElementById('joinErrorMsg');

    if (!roomCode || roomCode.length !== 4) {
        if (errorMsg) {
            errorMsg.textContent = 'Please enter a 4-character room code';
            errorMsg.style.display = 'block';
        }
        return;
    }

    try {
        const serverUrl = 'https://table-tennis-production.up.railway.app'; // Update with actual server URL
        const matchmaking = new MatchmakingManager(serverUrl);

        const isServerUp = await matchmaking.checkServerConnectivity();
        if (!isServerUp) {
            if (errorMsg) {
                errorMsg.textContent = 'Server is unavailable. Please try again later.';
                errorMsg.style.display = 'block';
            }
            return;
        }

        // Try to join room
        await matchmaking.joinRoom(roomCode);

        // Start online game
        startOnlineGame(roomCode, false);
    } catch (error) {
        console.error('Error joining room:', error);
        if (errorMsg) {
            errorMsg.textContent = error.message || 'Failed to join room';
            errorMsg.style.display = 'block';
        }
    }
}

function startOnlineGame(roomCode, isCreating) {
    console.log(`[Main] Starting online game - Room: ${roomCode}, Creating: ${isCreating}`);

    uiManager.switchScreen('waitingForOpponentScreen');
    uiManager.gameState.mode = 'onlineMultiplayer';
    uiManager.gameState.roomCode = roomCode;
    uiManager.gameState.isCreating = isCreating;

    // Will be continued in Step 4: Game State Synchronization
}

function cancelWaiting() {
    console.log('cancelWaiting called');
    if (gameManager && gameManager.isOnlineMode) {
        gameManager.disconnectNetwork();
    }
    backToMainMenu();
}

function startGame() {
    console.log('startGame called');
    try {
        uiManager.updateDifficultyBadges();
        gameManager.initGame(
            uiManager.gameState.mode,
            uiManager.gameState.p1Difficulty,
            uiManager.gameState.p2Difficulty
        );
        uiManager.switchScreen('gameScreen');
        console.log('Game started');
    } catch (error) {
        console.error('Error in startGame:', error);
    }
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');

    // Initialize game manager
    const canvas = document.getElementById('gameCanvas');
    gameManager = new GameManager(canvas);

    console.log('Game manager initialized');
    console.log('UI manager:', uiManager);
    console.log('Game manager:', gameManager);
});
