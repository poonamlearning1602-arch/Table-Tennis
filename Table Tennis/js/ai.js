// AI player logic
class AIPlayer {
    constructor(paddle, difficulty = 'medium') {
        this.paddle = paddle;
        this.difficulty = difficulty;
        this.reactionTime = 0;
        this.lastActionTime = 0;
        this.targetX = paddle.x;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    update(ball, canvasWidth, canvasHeight, gameState) {
        const currentTime = Date.now();

        // Reset reaction timer if not set
        if (this.reactionTime === 0) {
            this.setReactionTime();
        }

        // Check if enough time has passed for AI to react
        if (currentTime - this.lastActionTime < this.reactionTime) {
            return;
        }

        // Calculate AI behavior based on difficulty
        switch (this.difficulty) {
            case 'easy':
                this.updateEasy(ball, canvasWidth, canvasHeight, gameState);
                break;
            case 'medium':
                this.updateMedium(ball, canvasWidth, canvasHeight, gameState);
                break;
            case 'hard':
                this.updateHard(ball, canvasWidth, canvasHeight, gameState);
                break;
        }

        this.lastActionTime = currentTime;
        this.setReactionTime();
    }

    updateEasy(ball, canvasWidth, canvasHeight, gameState) {
        // Easy AI: Try to stay centered, moves slowly
        // Only track ball if it's on this side of table
        const isBottomAI = this.paddle.position === 'bottom';
        const ballMovingTowardsPaddle = isBottomAI ? ball.vy > 0 : ball.vy < 0;

        if (ballMovingTowardsPaddle) {
            // Ball coming toward AI, try to intercept
            const paddleCenter = this.paddle.x + this.paddle.width / 2;
            const ballCenter = ball.x;

            if (ballCenter < paddleCenter - 20) {
                this.paddle.setMovement('left');
            } else if (ballCenter > paddleCenter + 20) {
                this.paddle.setMovement('right');
            } else {
                this.paddle.stopMovement();
            }
        } else {
            // Ball on other side, move to center
            const paddleCenter = this.paddle.x + this.paddle.width / 2;
            const canvasCenter = canvasWidth / 2;

            if (paddleCenter < canvasCenter - 10) {
                this.paddle.setMovement('right');
            } else if (paddleCenter > canvasCenter + 10) {
                this.paddle.setMovement('left');
            } else {
                this.paddle.stopMovement();
            }
        }
    }

    updateMedium(ball, canvasWidth, canvasHeight, gameState) {
        // Medium AI: Predict ball position 1 second ahead
        const isBottomAI = this.paddle.position === 'bottom';
        const ballMovingTowardsPaddle = isBottomAI ? ball.vy > 0 : ball.vy < 0;

        // Predict where ball will be in ~1 second (based on current velocity)
        const predictionFrames = 30; // ~0.5 seconds at 60 FPS
        let predictedX = ball.x + ball.vx * predictionFrames;
        let predictedY = ball.y + ball.vy * predictionFrames;

        // Clamp predicted position to canvas
        predictedX = Math.max(0, Math.min(predictedX, canvasWidth));

        // Add some randomness to make it less perfect
        const randomOffset = (Math.random() - 0.5) * 40;

        const paddleCenter = this.paddle.x + this.paddle.width / 2;
        const targetX = predictedX + randomOffset;

        if (Math.abs(paddleCenter - targetX) > 15) {
            if (paddleCenter < targetX) {
                this.paddle.setMovement('right');
            } else {
                this.paddle.setMovement('left');
            }
        } else {
            this.paddle.stopMovement();
        }
    }

    updateHard(ball, canvasWidth, canvasHeight, gameState) {
        // Hard AI: Predict ball position 2 seconds ahead, optimal positioning
        const isBottomAI = this.paddle.position === 'bottom';

        // More aggressive prediction (2 seconds)
        const predictionFrames = 60; // ~1 second at 60 FPS
        let predictedX = ball.x + ball.vx * predictionFrames;
        let predictedY = ball.y + ball.vy * predictionFrames;

        // Clamp to canvas
        predictedX = Math.max(0, Math.min(predictedX, canvasWidth));

        // Try to position paddle at the intercept point
        const paddleCenter = this.paddle.x + this.paddle.width / 2;

        // Calculate optimal return angle
        // Hard AI tries to hit the ball back at a slightly different angle
        if (Math.abs(paddleCenter - predictedX) > 5) {
            if (paddleCenter < predictedX - 5) {
                this.paddle.setMovement('right');
            } else if (paddleCenter > predictedX + 5) {
                this.paddle.setMovement('left');
            }
        } else {
            this.paddle.stopMovement();
        }

        // Additional: Try to hit ball back toward center of opponent's court
        // This makes hard AI more aggressive
        if (Math.abs(paddleCenter - (canvasWidth / 2)) > 30) {
            if (paddleCenter < canvasWidth / 2) {
                this.paddle.setMovement('right');
            }
        }
    }

    setReactionTime() {
        // Set reaction time based on difficulty
        let minTime, maxTime;

        switch (this.difficulty) {
            case 'easy':
                minTime = 200;
                maxTime = 500;
                break;
            case 'medium':
                minTime = 80;
                maxTime = 150;
                break;
            case 'hard':
                minTime = 30;
                maxTime = 80;
                break;
            default:
                minTime = 100;
                maxTime = 200;
        }

        this.reactionTime = Math.random() * (maxTime - minTime) + minTime;
    }
}
