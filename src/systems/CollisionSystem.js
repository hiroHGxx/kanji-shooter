import { checkCollision } from '../utils/helpers.js';
import { Explosion } from '../entities/Explosion.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class CollisionSystem {
    constructor() {
        this.explosions = [];
    }

    update(deltaTime, entities, gameState) {
        this.checkBulletEnemyCollisions(entities, gameState);
        this.checkPlayerEnemyCollisions(entities, gameState);
        this.checkPlayerEnemyBulletCollisions(entities, gameState);
        this.updateExplosions(deltaTime);
    }

    checkBulletEnemyCollisions(entities, gameState) {
        const { bullets, enemies } = entities;
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.active) continue;

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.active) continue;

                if (checkCollision(bullet.getBounds(), enemy.getBounds())) {
                    // Create explosion
                    this.addExplosion(bullet.x, bullet.y);
                    
                    // Remove bullet
                    bullet.destroy();
                    
                    // Damage enemy
                    const destroyed = enemy.takeDamage(1);
                    if (destroyed) {
                        gameState.addScore(GAME_CONFIG.SCORE.POINTS_PER_ENEMY);
                    }
                    
                    break;
                }
            }
        }
    }

    checkPlayerEnemyCollisions(entities, gameState) {
        const { player, enemies } = entities;
        
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            if (checkCollision(player.getBounds(), enemy.getBounds())) {
                gameState.gameOver();
                return;
            }
        }
    }

    checkPlayerEnemyBulletCollisions(entities, gameState) {
        const { player, enemyBullets } = entities;
        
        for (const bullet of enemyBullets) {
            if (!bullet.active) continue;
            
            if (checkCollision(player.getBounds(), bullet.getBounds())) {
                gameState.gameOver();
                return;
            }
        }
    }

    addExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
    }

    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (!this.explosions[i].active) {
                this.explosions.splice(i, 1);
            }
        }
    }

    drawExplosions(ctx) {
        for (const explosion of this.explosions) {
            explosion.draw(ctx);
        }
    }

    reset() {
        this.explosions.length = 0;
    }
}