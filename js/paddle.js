// Paddle class for controlling game paddles
class Paddle {
    constructor(x, y, position, difficulty = 'medium') {
        this.x = x;
        this.y = y;
        this.position = position; // 'top' or 'bottom'
        this.difficulty = difficulty;
        this.baseWidth = 100;
        this.baseHeight = 15;
        this.moveSpeed = 6;
        this.isMovingLeft = false;
        this.isMovingRight = false;

        this.setDifficulty(difficulty);
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;

        // All paddles have the same size - difficulty affects ball speed only
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.moveSpeed = 6;

        switch (difficulty) {
            case 'easy':
                this.ballSpeed = 3; // Slower ball
                this.maxBallSpeed = 5;
                break;
            case 'medium':
                this.ballSpeed = 4;
                this.maxBallSpeed = 6;
                break;
            case 'hard':
                this.ballSpeed = 5; // Faster ball
                this.maxBallSpeed = 8;
                break;
        }
    }

    update(canvasWidth, canvasHeight) {
        // Handle movement
        if (this.isMovingLeft && this.x > 0) {
            this.x -= this.moveSpeed;
        }
        if (this.isMovingRight && this.x + this.width < canvasWidth) {
            this.x += this.moveSpeed;
        }

        // Ensure paddle stays in bounds
        this.x = Math.max(0, Math.min(this.x, canvasWidth - this.width));
    }

    draw(ctx) {
        // Draw paddle with realistic racket appearance
        const isTopPaddle = this.position === 'top';
        const primaryColor = isTopPaddle ? '#4ECDC4' : '#FF6B6B';
        const secondaryColor = isTopPaddle ? '#3DB8B1' : '#EE5A5A';
        const darkColor = isTopPaddle ? '#2a9b96' : '#CC4444';

        // Paddle surface gradient
        const gradient = ctx.createLinearGradient(
            this.x,
            this.y,
            this.x,
            this.y + this.height
        );
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(0.5, secondaryColor);
        gradient.addColorStop(1, darkColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Paddle border - wood frame effect
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        // Rubber surface details (cross pattern)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;

        // Horizontal lines
        const lineSpacing = this.height / 3;
        for (let i = 1; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + lineSpacing * i);
            ctx.lineTo(this.x + this.width, this.y + lineSpacing * i);
            ctx.stroke();
        }

        // Vertical lines
        const colSpacing = this.width / 5;
        for (let i = 1; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x + colSpacing * i, this.y);
            ctx.lineTo(this.x + colSpacing * i, this.y + this.height);
            ctx.stroke();
        }

        // Highlight for 3D effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x + 1, this.y + 1);
        ctx.lineTo(this.x + this.width - 1, this.y + 1);
        ctx.stroke();

        // Shadow for 3D effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x, this.y + this.height - 1, this.width, 2);
    }

    reset(canvasWidth, canvasHeight) {
        this.x = canvasWidth / 2 - this.width / 2;
        if (this.position === 'top') {
            this.y = 20;
        } else {
            this.y = canvasHeight - 35;
        }
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }

    setMovement(direction) {
        // direction: 'left', 'right', 'stop'
        if (direction === 'left') {
            this.isMovingLeft = true;
            this.isMovingRight = false;
        } else if (direction === 'right') {
            this.isMovingLeft = false;
            this.isMovingRight = true;
        } else {
            this.isMovingLeft = false;
            this.isMovingRight = false;
        }
    }

    stopMovement() {
        this.isMovingLeft = false;
        this.isMovingRight = false;
    }
}
