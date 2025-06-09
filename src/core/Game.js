import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Star } from '../entities/Star.js';
import { InputManager } from './InputManager.js';
import { GameState } from './GameState.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { GAME_CONFIG } from '../utils/constants.js';
import { clearArray } from '../utils/helpers.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        this.animationId = null;
        
        // Initialize systems
        this.inputManager = new InputManager();
        this.gameState = new GameState();
        this.renderSystem = new RenderSystem(this.canvas, this.ctx);
        this.collisionSystem = new CollisionSystem();
        this.spawnSystem = new SpawnSystem();
        
        // Initialize entities
        this.entities = {
            player: new Player(GAME_CONFIG.PLAYER.INITIAL_X, GAME_CONFIG.CANVAS_HEIGHT / 2),
            bullets: [],
            enemies: [],
            enemyBullets: [],
            stars: Star.createStarField()
        };
        
        this.setupInputHandlers();
        this.setupGameState();
    }

    setupInputHandlers() {
        this.inputManager.addListener('shoot', () => {
            if (this.gameState.isActive()) {
                this.fireBullet();
            }
        });
    }

    setupGameState() {
        this.gameState.setRestartCallback(() => this.restart());
    }

    fireBullet() {
        const firePos = this.entities.player.getFirePosition();
        const bullet = new Bullet(firePos.x, firePos.y, 1);
        this.entities.bullets.push(bullet);
    }

    update(deltaTime) {
        if (!this.gameState.isActive()) return;

        // Update player
        this.entities.player.update(deltaTime, this.inputManager, GAME_CONFIG.CANVAS_HEIGHT);
        
        // Update stars
        for (const star of this.entities.stars) {
            star.update(deltaTime);
        }
        
        // Update bullets
        this.updateEntityArray(this.entities.bullets, deltaTime);
        this.updateEntityArray(this.entities.enemyBullets, deltaTime);
        
        // Update enemies
        this.updateEntityArray(this.entities.enemies, deltaTime);
        
        // Update systems
        this.spawnSystem.update(deltaTime, this.entities, this.gameState);
        this.collisionSystem.update(deltaTime, this.entities, this.gameState);
    }

    updateEntityArray(entityArray, deltaTime) {
        for (let i = entityArray.length - 1; i >= 0; i--) {
            const entity = entityArray[i];
            entity.update(deltaTime);
            
            if (!entity.active) {
                entityArray.splice(i, 1);
            }
        }
    }

    render() {
        this.renderSystem.render(this.entities, this.collisionSystem);
    }

    gameLoop(timestamp) {
        if (!this.gameState.isActive() && this.animationId) {
            return;
        }
        
        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
        // Skip frame if delta time is too large (e.g., tab was inactive)
        if (deltaTime < 0.1) {
            this.update(deltaTime);
        }
        
        this.render();
        
        this.animationId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    start() {
        this.lastTime = 0;
        this.gameLoop(0);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    restart() {
        // Reset game state
        this.gameState.reset();
        
        // Reset player
        this.entities.player.reset();
        
        // Clear all entity arrays
        clearArray(this.entities.bullets);
        clearArray(this.entities.enemies);
        clearArray(this.entities.enemyBullets);
        
        // Reset stars
        clearArray(this.entities.stars);
        this.entities.stars.push(...Star.createStarField());
        
        // Reset systems
        this.spawnSystem.reset();
        this.collisionSystem.reset();
        
        // Reset input
        this.inputManager.reset();
        
        // Restart game loop
        this.start();
    }

    destroy() {
        this.stop();
        this.inputManager.destroy();
    }
}