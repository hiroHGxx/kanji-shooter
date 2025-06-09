import { GameObject } from './GameObject.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class Bullet extends GameObject {
    constructor(x, y, direction = 1) {
        super(x, y, GAME_CONFIG.BULLETS.WIDTH, GAME_CONFIG.BULLETS.HEIGHT);
        this.speed = GAME_CONFIG.BULLETS.SPEED;
        this.direction = direction; // 1 for right, -1 for left
        this.color = GAME_CONFIG.BULLETS.COLOR;
        this.character = GAME_CONFIG.BULLETS.CHARACTER;
    }

    update(deltaTime) {
        this.x += this.speed * this.direction;
        
        // Remove bullet if it goes off screen
        if (this.direction > 0 && this.x > GAME_CONFIG.CANVAS_WIDTH) {
            this.destroy();
        } else if (this.direction < 0 && this.x < -this.width) {
            this.destroy();
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = '24px sans-serif';
        ctx.fillText(this.character, this.x, this.y + 20);
    }
}

export class EnemyBullet extends GameObject {
    constructor(x, y) {
        super(x, y, GAME_CONFIG.ENEMY_BULLETS.WIDTH, GAME_CONFIG.ENEMY_BULLETS.HEIGHT);
        this.speed = GAME_CONFIG.ENEMY_BULLETS.SPEED;
        this.color = GAME_CONFIG.ENEMY_BULLETS.COLOR;
        this.character = GAME_CONFIG.ENEMY_BULLETS.CHARACTER;
    }

    update(deltaTime) {
        this.x -= this.speed;
        
        // Remove bullet if it goes off screen
        if (this.x < -this.width) {
            this.destroy();
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = '24px sans-serif';
        ctx.fillText(this.character, this.x, this.y + 20);
    }
}