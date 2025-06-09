import { GameObject } from './GameObject.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class Enemy extends GameObject {
    constructor(x, y, type) {
        super(x, y, GAME_CONFIG.ENEMIES.WIDTH, GAME_CONFIG.ENEMIES.HEIGHT);
        this.type = type;
        this.config = GAME_CONFIG.ENEMIES.TYPES[type.toUpperCase()];
        this.hp = this.config.HP;
        this.maxHp = this.config.HP;
        this.speed = GAME_CONFIG.ENEMIES.SPEED;
        this.lastShot = 0;
        
        // Flying enemy specific properties
        if (type === 'flying') {
            this.speed = this.config.SPEED;
            this.initialY = y;
            this.angle = 0;
        }
    }

    update(deltaTime) {
        if (this.type === 'flying') {
            this.x -= this.speed;
            this.angle += this.config.WAVE_FREQUENCY;
            this.y = this.initialY + Math.sin(this.angle) * this.config.WAVE_AMPLITUDE;
        } else {
            this.x -= this.speed;
        }

        if (this.x < -this.width) {
            this.destroy();
        }
    }

    draw(ctx) {
        if (this.type === 'durable') {
            const hpIndex = this.hp - 1;
            ctx.font = `${this.config.FONT_SIZES[hpIndex]}px sans-serif`;
            ctx.fillStyle = this.config.COLOR;
            ctx.fillText(
                this.config.CHARACTERS[hpIndex], 
                this.x, 
                this.y + this.config.FONT_SIZES[hpIndex] - 10
            );
        } else {
            ctx.font = `${this.config.FONT_SIZE}px sans-serif`;
            ctx.fillStyle = this.config.COLOR;
            ctx.fillText(this.config.CHARACTER, this.x, this.y + 40);
        }
    }

    takeDamage(damage = 1) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.destroy();
            return true; // Enemy destroyed
        }
        return false; // Enemy still alive
    }

    canShoot(currentTime) {
        return this.type === 'shooter' && 
               currentTime - this.lastShot > this.config.SHOOT_INTERVAL;
    }

    shoot(currentTime) {
        this.lastShot = currentTime;
        return {
            x: this.x,
            y: this.y + this.height / 2
        };
    }
}

export class EnemyFactory {
    static create(x, y) {
        const rand = Math.random();
        let enemyType = 'normal';
        
        if (rand < GAME_CONFIG.ENEMIES.TYPES.FLYING.PROBABILITY) {
            enemyType = 'flying';
        } else if (rand < GAME_CONFIG.ENEMIES.TYPES.FLYING.PROBABILITY + 
                          GAME_CONFIG.ENEMIES.TYPES.DURABLE.PROBABILITY) {
            enemyType = 'durable';
        } else if (rand < GAME_CONFIG.ENEMIES.TYPES.FLYING.PROBABILITY + 
                          GAME_CONFIG.ENEMIES.TYPES.DURABLE.PROBABILITY +
                          GAME_CONFIG.ENEMIES.TYPES.SHOOTER.PROBABILITY) {
            enemyType = 'shooter';
        }
        
        return new Enemy(x, y, enemyType);
    }
}