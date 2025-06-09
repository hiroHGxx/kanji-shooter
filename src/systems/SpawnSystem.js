import { EnemyFactory } from '../entities/Enemy.js';
import { EnemyBullet } from '../entities/Bullet.js';
import { GAME_CONFIG } from '../utils/constants.js';

export class SpawnSystem {
    constructor() {
        this.enemySpawnTimer = 0;
        this.currentSpawnInterval = GAME_CONFIG.ENEMIES.SPAWN_INTERVAL;
    }

    update(deltaTime, entities, gameState) {
        if (!gameState.isActive()) return;

        this.updateEnemySpawning(deltaTime, entities, gameState);
        this.updateEnemyShooting(entities);
    }

    updateEnemySpawning(deltaTime, entities, gameState) {
        this.enemySpawnTimer += deltaTime * 1000; // Convert to milliseconds
        
        if (this.enemySpawnTimer >= this.currentSpawnInterval) {
            this.spawnEnemy(entities);
            this.enemySpawnTimer = 0;
            
            // Adjust difficulty based on score
            this.updateDifficulty(gameState.getScore());
        }
    }

    spawnEnemy(entities) {
        const enemy = EnemyFactory.create(
            GAME_CONFIG.CANVAS_WIDTH,
            Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ENEMIES.HEIGHT)
        );
        entities.enemies.push(enemy);
    }

    updateEnemyShooting(entities) {
        const currentTime = Date.now();
        
        for (const enemy of entities.enemies) {
            if (enemy.active && enemy.canShoot(currentTime)) {
                const bulletPos = enemy.shoot(currentTime);
                const bullet = new EnemyBullet(bulletPos.x, bulletPos.y);
                entities.enemyBullets.push(bullet);
            }
        }
    }

    updateDifficulty(score) {
        const difficultyLevel = Math.floor(score / GAME_CONFIG.ENEMIES.DIFFICULTY_SCORE_THRESHOLD);
        const newInterval = Math.max(
            GAME_CONFIG.ENEMIES.SPAWN_INTERVAL * Math.pow(GAME_CONFIG.ENEMIES.DIFFICULTY_INCREASE_RATE, difficultyLevel),
            GAME_CONFIG.ENEMIES.MIN_SPAWN_INTERVAL
        );
        
        this.currentSpawnInterval = newInterval;
    }

    reset() {
        this.enemySpawnTimer = 0;
        this.currentSpawnInterval = GAME_CONFIG.ENEMIES.SPAWN_INTERVAL;
    }
}