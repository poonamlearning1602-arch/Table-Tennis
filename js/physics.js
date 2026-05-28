// Physics engine for table tennis game
class Ball {
    constructor(x, y, radius = 5) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = 0;
        this.vy = 0;
        this.speed = 4;
    }

    update(gameState) {
        // Move ball
        this.x += this.vx;
        this.y += this.vy;

        // Top and bottom wall collisions
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy;
        }
        if (this.y + this.radius > gameState.canvasHeight) {
            this.y = gameState.canvasHeight - this.radius;
            this.vy = -this.vy;
        }

        // Left and right boundary (out of bounds - goal)
        if (this.x < 0 || this.x > gameState.canvasWidth) {
            return false; // Ball out of bounds
        }

        return true; // Ball in bounds
    }

    checkPaddleCollision(paddle) {
        // Simple rectangular collision with paddle
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;

        // Check if ball is within paddle's Y range and approaching from correct direction
        if (this.y > paddleTop - this.radius && this.y < paddleBottom + this.radius) {
            // Check X collision
            const ballMovingRight = this.vx > 0;
            const ballMovingLeft = this.vx < 0;

            // Right paddle collision (bottom of screen)
            if (
                paddle.position === 'bottom' &&
                ballMovingDown === true &&
                this.x + this.radius > paddleLeft &&
                this.x - this.radius < paddleRight &&
                this.y + this.radius >= paddleTop
            ) {
                return this.hitPaddle(paddle);
            }

            // Left paddle collision (top of screen)
            if (
                paddle.position === 'top' &&
                ballMovingDown === false &&
                this.x + this.radius > paddleLeft &&
                this.x - this.radius < paddleRight &&
                this.y - this.radius <= paddleBottom
            ) {
                return this.hitPaddle(paddle);
            }
        }

        return false;
    }

    checkPaddleCollisionSimplified(paddle, ballMovingDown) {
        const paddleTop = paddle.y;
        const paddleBottom = paddle.y + paddle.height;
        const paddleLeft = paddle.x;
        const paddleRight = paddle.x + paddle.width;

        // Check if ball is in paddle's Y range
        const inYRange =
            this.y + this.radius >= paddleTop &&
            this.y - this.radius <= paddleBottom;

        // Check if ball is in paddle's X range
        const inXRange =
            this.x + this.radius >= paddleLeft &&
            this.x - this.radius <= paddleRight;

        if (!inYRange || !inXRange) return false;

        // Check if ball is moving toward paddle
        if (paddle.position === 'bottom' && ballMovingDown && this.vy > 0) {
            return this.hitPaddle(paddle);
        }
        if (paddle.position === 'top' && !ballMovingDown && this.vy < 0) {
            return this.hitPaddle(paddle);
        }

        return false;
    }

    hitPaddle(paddle) {
        // Reverse Y velocity
        this.vy = -this.vy;

        // Add angle based on where ball hits paddle (hit near edges = more angle)
        const paddleCenter = paddle.y + paddle.height / 2;
        const hitOffset = (this.y - paddleCenter) / (paddle.height / 2);

        // Add some horizontal velocity based on hit location (capped to prevent excessive angles)
        this.vx = Math.max(-3, Math.min(3, hitOffset * 2.5));

        // Apply ball speed from paddle settings
        const speed = Math.sqrt(this.vx ** 2 + this.vy ** 2);
        if (speed > 0) {
            const targetSpeed = Math.min(paddle.ballSpeed, paddle.maxBallSpeed);
            this.vx = (this.vx / speed) * targetSpeed;
            this.vy = (this.vy / speed) * targetSpeed;
        } else {
            // Ensure ball always moves if speed is 0
            this.vy = this.vy < 0 ? -paddle.ballSpeed : paddle.ballSpeed;
        }

        // Push ball away from paddle to prevent multiple collisions
        if (paddle.position === 'bottom') {
            this.y = paddle.y - this.radius - 2;
        } else {
            this.y = paddle.y + paddle.height + this.radius + 2;
        }

        return true;
    }

    reset(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.vx = 0;
        this.vy = 0;
    }

    serve(canvasWidth, canvasHeight, direction = 1) {
        this.x = canvasWidth / 2;
        this.y = canvasHeight / 2;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = direction * 4; // Increased from 3 to 4 for better serve speed
    }
}
