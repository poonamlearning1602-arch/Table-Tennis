// Main initialization and entry point
// Define all functions globally FIRST, before DOMContentLoaded

// Navigation functions
function startTwoPlayerMode() {
    uiManager.showDifficultyMenu('2player');
    updateDifficultyMenuForPlayer1();
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
