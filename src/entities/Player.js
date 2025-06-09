import { GameObject } from './GameObject.js';
import { GAME_CONFIG } from '../utils/constants.js';
import { clamp } from '../utils/helpers.js';

export class Player extends GameObject {
    constructor(x, y) {
        super(x, y, GAME_CONFIG.PLAYER.WIDTH, GAME_CONFIG.PLAYER.HEIGHT);
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        this.color = GAME_CONFIG.PLAYER.COLOR;
        this.character = GAME_CONFIG.PLAYER.CHARACTER;
    }

    update(deltaTime, inputManager, canvasHeight) {
        if (inputManager.isKeyPressed('UP')) {
            this.y -= this.speed;
        }
        if (inputManager.isKeyPressed('DOWN')) {
            this.y += this.speed;
        }

        // Keep player within canvas bounds
        this.y = clamp(this.y, 0, canvasHeight - this.height);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = '48px sans-serif';
        ctx.fillText(this.character, this.x, this.y + 40);
    }

    reset() {
        this.x = GAME_CONFIG.PLAYER.INITIAL_X;
        this.y = GAME_CONFIG.CANVAS_HEIGHT / 2;
        this.active = true;
    }

    getFirePosition() {
        return {
            x: this.x + this.width,
            y: this.y + this.height / 2
        };
    }
}