// Main game logic and loop
class GameManager {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.canvasWidth = canvasElement.width;
        this.canvasHeight = canvasElement.height;

        // Game objects
        this.ball = new Ball(this.canvasWidth / 2, this.canvasHeight / 2);
        this.paddle1 = new Paddle(
            this.canvasWidth / 2 - 50,
            20,
            'top',
            'medium'
        );
        this.paddle2 = new Paddle(
            this.canvasWidth / 2 - 50,
            this.canvasHeight - 35,
            'bottom',
            'medium'
        );

        this.aiPlayer = null;
        this.isRunning = false;
        this.isPaused = false;
        this.scores = { p1: 0, p2: 0 };
        this.maxScore = 11;
        this.winBy = 2;

        this.frameCount = 0;
        this.lastTime = Date.now();
    }

    initGame(mode, p1Difficulty, p2Difficulty) {
        this.mode = mode;
        this.scores = { p1: 0, p2: 0 };

        // Set player 1 difficulty
        this.paddle1.setDifficulty(p1Difficulty);
        this.paddle1.reset(this.canvasWidth, this.canvasHeight);

        // Set player 2 or AI difficulty
        if (mode === '2player') {
            this.paddle2.setDifficulty(p2Difficulty);
            this.aiPlayer = null;
        } else {
            this.paddle2.setDifficulty('medium'); // AI paddle uses medium as base
            this.aiPlayer = new AIPlayer(this.paddle2, p2Difficulty);
        }

        this.paddle2.reset(this.canvasWidth, this.canvasHeight);
        this.ball.serve(this.canvasWidth, this.canvasHeight, 1);

        this.isRunning = true;
        this.isPaused = false;
        this.startGameLoop();
    }

    startGameLoop() {
        const gameLoop = () => {
            if (!this.isPaused) {
                this.update();
            }
            this.draw();

            if (this.isRunning) {
                requestAnimationFrame(gameLoop);
            }
        };

        requestAnimationFrame(gameLoop);
    }

    update() {
        // Update paddles
        this.paddle1.update(this.canvasWidth, this.canvasHeight);
        this.paddle2.update(this.canvasWidth, this.canvasHeight);

        // Update AI if in single player mode
        if (this.aiPlayer) {
            this.aiPlayer.update(this.ball, this.canvasWidth, this.canvasHeight);
        }

        // Update ball
        const ballInBounds = this.ball.update({
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
        });

        if (!ballInBounds) {
            // Ball went out of bounds - someone scored
            if (this.ball.x < 0) {
                this.scores.p2++;
            } else {
                this.scores.p1++;
            }

            uiManager.updateScore(this.scores.p1, this.scores.p2);

            // Check for game over
            if (this.isGameOver()) {
                this.endGame();
            } else {
                // Serve again
                const server = this.scores.p1 > this.scores.p2 ? 1 : 2;
                const direction = server === 1 ? 1 : -1;
                this.ball.serve(this.canvasWidth, this.canvasHeight, direction);
            }

            return;
        }

        // Check paddle collisions
        const ballMovingDown = this.ball.vy > 0;

        if (this.ball.checkPaddleCollisionSimplified(this.paddle1, ballMovingDown)) {
            // Collision with paddle 1
        }

        if (this.ball.checkPaddleCollisionSimplified(this.paddle2, ballMovingDown)) {
            // Collision with paddle 2
        }
    }

    draw() {
        // Draw background (floor/court)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#2a4a2a');
        gradient.addColorStop(1, '#1a3a1a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Draw outer brown border
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 12;
        this.ctx.strokeRect(6, 6, this.canvasWidth - 12, this.canvasHeight - 12);

        // Draw table surface
        this.drawTableSurface();

        // Draw table markings
        this.drawTableMarkings();

        // Draw net
        this.drawNet();

        // Draw ball (with shadow)
        this.drawBall();

        // Draw paddles
        this.paddle1.draw(this.ctx);
        this.paddle2.draw(this.ctx);
    }

    drawTableSurface() {
        // Main table surface
        const tableLeft = 0;
        const tableTop = 0;
        const tableRight = this.canvasWidth;
        const tableBottom = this.canvasHeight;

        // Draw table with gradient for depth
        const tableGradient = this.ctx.createLinearGradient(0, tableTop, 0, tableBottom);
        tableGradient.addColorStop(0, '#2d5016');
        tableGradient.addColorStop(0.5, '#1a3d0a');
        tableGradient.addColorStop(1, '#0f2a00');
        this.ctx.fillStyle = tableGradient;
        this.ctx.fillRect(tableLeft, tableTop, tableRight, tableBottom);
    }

    drawTableMarkings() {
        // White boundary lines
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;

        // Outer boundary
        this.ctx.strokeRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Service lines (parallel to net)
        const tableTop = 0;
        const tableBottom = this.canvasHeight;
        const tableCenter = this.canvasHeight / 2;
        const serviceLineOffset = this.canvasHeight / 6;

        // Top service line
        this.ctx.beginPath();
        this.ctx.moveTo(0, tableTop + serviceLineOffset);
        this.ctx.lineTo(this.canvasWidth, tableTop + serviceLineOffset);
        this.ctx.stroke();

        // Bottom service line
        this.ctx.beginPath();
        this.ctx.moveTo(0, tableBottom - serviceLineOffset);
        this.ctx.lineTo(this.canvasWidth, tableBottom - serviceLineOffset);
        this.ctx.stroke();

        // Center line (doubles sideline equivalent)
        this.ctx.setLineDash([4, 6]);
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, tableCenter);
        this.ctx.lineTo(this.canvasWidth, tableCenter);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Side lines for each half
        const sideMargin = 20;
        // Top side lines
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.moveTo(sideMargin, 0);
        this.ctx.lineTo(sideMargin, tableCenter);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasWidth - sideMargin, 0);
        this.ctx.lineTo(this.canvasWidth - sideMargin, tableCenter);
        this.ctx.stroke();

        // Bottom side lines
        this.ctx.beginPath();
        this.ctx.moveTo(sideMargin, tableCenter);
        this.ctx.lineTo(sideMargin, tableBottom);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasWidth - sideMargin, tableCenter);
        this.ctx.lineTo(this.canvasWidth - sideMargin, tableBottom);
        this.ctx.stroke();

        // 2-inch white stripe along edges (typical table tennis table)
        const stripeWidth = 3;
        this.ctx.lineWidth = stripeWidth;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';

        // Top stripe
        this.ctx.beginPath();
        this.ctx.moveTo(0, 10);
        this.ctx.lineTo(this.canvasWidth, 10);
        this.ctx.stroke();

        // Bottom stripe
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvasHeight - 10);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - 10);
        this.ctx.stroke();

        // Left stripe
        this.ctx.beginPath();
        this.ctx.moveTo(10, 0);
        this.ctx.lineTo(10, this.canvasHeight);
        this.ctx.stroke();

        // Right stripe
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasWidth - 10, 0);
        this.ctx.lineTo(this.canvasWidth - 10, this.canvasHeight);
        this.ctx.stroke();
    }

    drawNet() {
        const centerY = this.canvasHeight / 2;
        const netHeight = 20; // Height of the net
        const netTop = centerY - netHeight / 2;
        const netBottom = centerY + netHeight / 2;

        // Net pole left
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, netTop - 5, 3, netHeight + 10);

        // Net pole right
        this.ctx.fillRect(this.canvasWidth - 3, netTop - 5, 3, netHeight + 10);

        // Net cord (top)
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(3, netTop);
        this.ctx.lineTo(this.canvasWidth - 3, netTop);
        this.ctx.stroke();

        // Net cord (bottom)
        this.ctx.beginPath();
        this.ctx.moveTo(3, netBottom);
        this.ctx.lineTo(this.canvasWidth - 3, netBottom);
        this.ctx.stroke();

        // Net mesh (vertical lines)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 1;
        const meshDensity = 15;
        for (let i = 0; i <= meshDensity; i++) {
            const x = 3 + ((this.canvasWidth - 6) / meshDensity) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, netTop);
            this.ctx.lineTo(x, netBottom);
            this.ctx.stroke();
        }

        // Net mesh (horizontal lines)
        const meshHeightDensity = 5;
        for (let i = 0; i <= meshHeightDensity; i++) {
            const y = netTop + ((netHeight) / meshHeightDensity) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(3, y);
            this.ctx.lineTo(this.canvasWidth - 3, y);
            this.ctx.stroke();
        }
    }

    drawBall() {
        // Ball shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.ball.x,
            this.ball.y + this.ball.radius * 1.5,
            this.ball.radius * 1.2,
            this.ball.radius * 0.4,
            0,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Ball with gradient for 3D effect
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - 2,
            this.ball.y - 2,
            0,
            this.ball.x,
            this.ball.y,
            this.ball.radius
        );
        ballGradient.addColorStop(0, '#fff');
        ballGradient.addColorStop(0.7, '#f0f0f0');
        ballGradient.addColorStop(1, '#d0d0d0');

        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Ball border
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Ball seam (typical ping pong ball)
        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius * 0.8, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawDebugInfo() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        const fps = 1000 / deltaTime;

        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 20);
        this.ctx.fillText(`Ball: ${this.ball.x.toFixed(1)}, ${this.ball.y.toFixed(1)}`, 10, 35);
        this.ctx.fillText(`Velocity: ${this.ball.vx.toFixed(2)}, ${this.ball.vy.toFixed(2)}`, 10, 50);

        this.lastTime = currentTime;
    }

    isGameOver() {
        // Check if someone won
        const p1Won = this.scores.p1 >= this.maxScore && this.scores.p1 - this.scores.p2 >= this.winBy;
        const p2Won = this.scores.p2 >= this.maxScore && this.scores.p2 - this.scores.p1 >= this.winBy;

        return p1Won || p2Won;
    }

    endGame() {
        this.isRunning = false;
        const winner = this.scores.p1 > this.scores.p2 ? 'p1' : 'p2';
        uiManager.showGameOverScreen(winner);
    }

    pauseGame() {
        this.isPaused = true;
        this.paddle1.stopMovement();
        this.paddle2.stopMovement();
    }

    resumeGame() {
        this.isPaused = false;
    }

    resetGame() {
        this.scores = { p1: 0, p2: 0 };
        this.isRunning = false;
        this.isPaused = false;
        this.ball.reset(this.canvasWidth, this.canvasHeight);
        this.paddle1.reset(this.canvasWidth, this.canvasHeight);
        this.paddle2.reset(this.canvasWidth, this.canvasHeight);
        this.paddle1.stopMovement();
        this.paddle2.stopMovement();

        // Reinitialize with current difficulties
        this.initGame(
            uiManager.gameState.mode,
            uiManager.gameState.p1Difficulty,
            uiManager.gameState.p2Difficulty
        );
    }
}

// Global game manager instance
let gameManager;

// Keyboard event handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Paddle 1 controls (Arrow keys or A/D)
    if (keys['arrowleft'] || keys['a']) {
        gameManager.paddle1.setMovement('left');
    }
    if (keys['arrowright'] || keys['d']) {
        gameManager.paddle1.setMovement('right');
    }

    // Paddle 2 controls (if two player mode)
    if (uiManager.gameState.mode === '2player') {
        if (keys['arrowdown'] || keys['s']) {
            gameManager.paddle2.setMovement('left');
        }
        if (keys['arrowup'] || keys['w']) {
            gameManager.paddle2.setMovement('right');
        }
    }

    // Pause with Space
    if (e.key === ' ') {
        e.preventDefault();
        if (uiManager.currentScreen === 'gameScreen') {
            togglePause();
        }
    }

    // Reset with R
    if (e.key.toLowerCase() === 'r') {
        if (uiManager.currentScreen === 'gameScreen' && !uiManager.gameState.isPaused) {
            resetGame();
        }
    }

    // Menu with ESC
    if (e.key === 'Escape') {
        if (uiManager.currentScreen === 'gameScreen') {
            backToMainMenu();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;

    // Stop paddle 1 movement
    if (
        (!keys['arrowleft'] && !keys['a'] && !keys['arrowright'] && !keys['d'])
    ) {
        gameManager.paddle1.stopMovement();
    }

    // Stop paddle 2 movement
    if (
        uiManager.gameState.mode === '2player' &&
        (!keys['arrowdown'] && !keys['s'] && !keys['arrowup'] && !keys['w'])
    ) {
        gameManager.paddle2.stopMovement();
    }
});
