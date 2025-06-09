import { GameObject } from './GameObject.js';
import { GAME_CONFIG } from '../utils/constants.js';
import { random } from '../utils/helpers.js';

export class Star extends GameObject {
    constructor(x, y) {
        super(x, y, 16, 16);
        this.speed = random(GAME_CONFIG.STARS.MIN_SPEED, GAME_CONFIG.STARS.MAX_SPEED);
        this.color = GAME_CONFIG.STARS.COLOR;
        this.character = GAME_CONFIG.STARS.CHARACTER;
    }

    update(deltaTime) {
        this.x -= this.speed;
        
        if (this.x < -10) {
            this.x = GAME_CONFIG.CANVAS_WIDTH + 10;
            this.y = Math.random() * GAME_CONFIG.CANVAS_HEIGHT;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.font = `${GAME_CONFIG.STARS.FONT_SIZE}px sans-serif`;
        ctx.fillText(this.character, this.x, this.y);
    }

    static createStarField() {
        const stars = [];
        for (let i = 0; i < GAME_CONFIG.STARS.COUNT; i++) {
            stars.push(new Star(
                Math.random() * GAME_CONFIG.CANVAS_WIDTH,
                Math.random() * GAME_CONFIG.CANVAS_HEIGHT
            ));
        }
        return stars;
    }
}