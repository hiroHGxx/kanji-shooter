import { GameObject } from './GameObject.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class Explosion extends GameObject {
    constructor(x, y) {
        super(x, y, 32, 32);
        this.timer = GAME_CONFIG.EXPLOSIONS.DURATION;
        this.color = GAME_CONFIG.EXPLOSIONS.COLOR;
        this.character = GAME_CONFIG.EXPLOSIONS.CHARACTER;
    }

    update(deltaTime) {
        this.timer -= deltaTime;
        if (this.timer <= 0) {
            this.destroy();
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = `${GAME_CONFIG.EXPLOSIONS.FONT_SIZE}px sans-serif`;
        ctx.fillText(this.character, this.x, this.y + 24);
    }
}