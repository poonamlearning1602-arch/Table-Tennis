// UI management and screen rendering
class UIManager {
    constructor() {
        this.currentScreen = 'mainMenu';
        this.gameState = {
            mode: null, // '2player' or 'singleplayer'
            p1Difficulty: 'medium',
            p2Difficulty: 'medium',
            p1Score: 0,
            p2Score: 0,
            isPaused: false,
            isGameOver: false,
            winner: null,
        };
    }

    switchScreen(screenName) {
        // Hide all screens
        document.getElementById('mainMenu').classList.remove('active');
        document.getElementById('difficultyMenu').classList.remove('active');
        document.getElementById('gameScreen').classList.remove('active');
        document.getElementById('pauseScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');

        // Show selected screen
        document.getElementById(screenName).classList.add('active');
        this.currentScreen = screenName;
    }

    showDifficultyMenu(mode) {
        this.gameState.mode = mode;

        const titleEl = document.getElementById('difficultyTitle');
        const subtitleEl = document.getElementById('difficultySubtitle');

        if (mode === '2player') {
            titleEl.textContent = 'Player Difficulties';
            subtitleEl.textContent = 'Select difficulty for each player';
            this.currentDifficultyPlayer = 1;
        } else {
            titleEl.textContent = 'Your Difficulty Level';
            subtitleEl.textContent = 'Choose how challenging you want the game';
            this.currentDifficultyPlayer = 1;
        }

        this.switchScreen('difficultyMenu');
    }

    selectDifficulty(difficulty) {
        if (this.gameState.mode === '2player') {
            if (this.currentDifficultyPlayer === 1) {
                this.gameState.p1Difficulty = difficulty;
                this.currentDifficultyPlayer = 2;

                const titleEl = document.getElementById('difficultyTitle');
                const subtitleEl = document.getElementById('difficultySubtitle');
                titleEl.textContent = 'Player 2 Difficulty';
                subtitleEl.textContent = 'Select difficulty for Player 2';
            } else {
                this.gameState.p2Difficulty = difficulty;
                this.switchScreen('gameScreen');
            }
        } else {
            this.gameState.p1Difficulty = difficulty;
            // For single player, select AI difficulty next
            this.currentDifficultyPlayer = 2;

            const titleEl = document.getElementById('difficultyTitle');
            const subtitleEl = document.getElementById('difficultySubtitle');
            titleEl.textContent = 'AI Difficulty';
            subtitleEl.textContent = 'Choose the AI opponent difficulty';
        }
    }

    selectAIDifficulty(difficulty) {
        this.gameState.p2Difficulty = difficulty;
        this.switchScreen('gameScreen');
    }

    updateScore(p1Score, p2Score) {
        this.gameState.p1Score = p1Score;
        this.gameState.p2Score = p2Score;

        document.getElementById('score1').textContent = p1Score;
        document.getElementById('score2').textContent = p2Score;
    }

    updateDifficultyBadges() {
        const diffNames = {
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
        };

        document.getElementById('p1DiffBadge').textContent = diffNames[this.gameState.p1Difficulty] || 'Medium';
        document.getElementById('p2DiffBadge').textContent = diffNames[this.gameState.p2Difficulty] || 'Medium';

        // Update player 2 label
        const p2Label = this.gameState.mode === 'singleplayer' ? 'AI' : 'Player 2';
        document.getElementById('p2Label').textContent = p2Label;

        // Update control info
        this.updateControlsInfo();
    }

    updateControlsInfo() {
        const controlsEl = document.getElementById('controlsInfo');
        if (controlsEl) {
            if (this.gameState.mode === '2player') {
                controlsEl.innerHTML = '<p><strong>P1:</strong> ← → or A/D | <strong>P2:</strong> ↑ ↓ or W/S | Space: Pause | R: Reset | Menu Button: Back to Mode Selection</p>';
            } else {
                controlsEl.innerHTML = '<p><strong>You:</strong> ← → or A/D | Space: Pause | R: Reset | Menu Button: Back to Mode Selection</p>';
            }
        }
    }

    showPauseScreen() {
        this.gameState.isPaused = true;
        document.getElementById('pauseScore1').textContent = this.gameState.p1Score;
        document.getElementById('pauseScore2').textContent = this.gameState.p2Score;
        document.getElementById('pauseScreen').classList.add('active');
    }

    hidePauseScreen() {
        this.gameState.isPaused = false;
        document.getElementById('pauseScreen').classList.remove('active');
    }

    showGameOverScreen(winner) {
        this.gameState.isGameOver = true;
        this.gameState.winner = winner;

        const winnerText = document.getElementById('winnerText');
        if (winner === 'p1') {
            winnerText.textContent = '🎉 Player 1 Wins!';
        } else if (winner === 'p2') {
            if (this.gameState.mode === 'singleplayer') {
                winnerText.textContent = '🤖 AI Wins!';
            } else {
                winnerText.textContent = '🎉 Player 2 Wins!';
            }
        }

        document.getElementById('finalScore1').textContent = this.gameState.p1Score;
        document.getElementById('finalScore2').textContent = this.gameState.p2Score;

        document.getElementById('gameOverScreen').classList.add('active');
    }

    resetGameUI() {
        this.gameState.p1Score = 0;
        this.gameState.p2Score = 0;
        this.gameState.isPaused = false;
        this.gameState.isGameOver = false;
        this.gameState.winner = null;

        document.getElementById('pauseScreen').classList.remove('active');
        document.getElementById('gameOverScreen').classList.remove('active');

        this.updateScore(0, 0);
        this.updateDifficultyBadges();
    }

    goToMainMenu() {
        this.resetGameUI();
        this.switchScreen('mainMenu');
    }
}

// Global UI manager instance
const uiManager = new UIManager();

// UI Event Handlers
function startTwoPlayerMode() {
    uiManager.showDifficultyMenu('2player');
}

function startSinglePlayerMode() {
    uiManager.showDifficultyMenu('singleplayer');
}

function selectDifficulty(difficulty) {
    if (uiManager.gameState.mode === '2player') {
        uiManager.selectDifficulty(difficulty);
    } else {
        uiManager.selectDifficulty(difficulty);
    }

    // If single player and just selected player difficulty, show AI difficulty menu
    if (
        uiManager.gameState.mode === 'singleplayer' &&
        uiManager.currentDifficultyPlayer === 2
    ) {
        // Menu is still open for AI selection
    } else if (uiManager.gameState.mode === '2player' && uiManager.currentDifficultyPlayer === 2) {
        // Wait for player 2 selection
    } else if (uiManager.currentScreen === 'difficultyMenu') {
        // Still on difficulty menu
    } else {
        // Should start game
    }
}

function backToMainMenu() {
    uiManager.goToMainMenu();
}

function togglePause() {
    if (uiManager.gameState.isPaused) {
        uiManager.hidePauseScreen();
        gameManager.resumeGame();
    } else {
        uiManager.showPauseScreen();
        gameManager.pauseGame();
    }
}

function resetGame() {
    gameManager.resetGame();
    uiManager.resetGameUI();
}

function playAgain() {
    gameManager.resetGame();
    uiManager.resetGameUI();
}
