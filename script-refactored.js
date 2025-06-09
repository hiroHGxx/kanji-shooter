// ゲーム設定
const GAME_CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    BACKGROUND_COLOR: '#000020',
    
    PLAYER: {
        INITIAL_X: 100,
        SPEED: 5,
        WIDTH: 48,
        HEIGHT: 48,
        COLOR: 'cyan',
        CHARACTER: '味'
    },
    
    BULLETS: {
        SPEED: 7,
        WIDTH: 24,
        HEIGHT: 24,
        COLOR: 'yellow',
        CHARACTER: '弾'
    },
    
    ENEMY_BULLETS: {
        SPEED: 5,
        WIDTH: 24,
        HEIGHT: 24,
        COLOR: 'orange',
        CHARACTER: '矢'
    },
    
    ENEMIES: {
        SPEED: 2,
        WIDTH: 48,
        HEIGHT: 48,
        SPAWN_INTERVAL: 2000,
        MIN_SPAWN_INTERVAL: 500,
        DIFFICULTY_INCREASE_RATE: 0.9,
        DIFFICULTY_SCORE_THRESHOLD: 30,
        
        TYPES: {
            NORMAL: {
                PROBABILITY: 0.45,
                HP: 1,
                COLOR: 'red',
                CHARACTER: '敵',
                FONT_SIZE: 48
            },
            FLYING: {
                PROBABILITY: 0.15,
                HP: 1,
                COLOR: 'yellow',
                CHARACTER: '飛',
                FONT_SIZE: 48,
                SPEED: 5,
                WAVE_AMPLITUDE: 30,
                WAVE_FREQUENCY: 0.1
            },
            DURABLE: {
                PROBABILITY: 0.2,
                HP: 3,
                COLOR: 'purple',
                CHARACTERS: ['大', '中', '小'],
                FONT_SIZES: [64, 40, 28]
            },
            SHOOTER: {
                PROBABILITY: 0.2,
                HP: 1,
                COLOR: 'orange',
                CHARACTER: '攻',
                FONT_SIZE: 48,
                SHOOT_INTERVAL: 2000
            }
        }
    },
    
    STARS: {
        COUNT: 30,
        COLOR: '#666666',
        FONT_SIZE: 16,
        CHARACTER: '星',
        MIN_SPEED: 1,
        MAX_SPEED: 3
    },
    
    EXPLOSIONS: {
        COLOR: 'orange',
        FONT_SIZE: 32,
        CHARACTER: '爆',
        DURATION: 0.1
    },
    
    SCORE: {
        POINTS_PER_ENEMY: 10
    }
};

// ユーティリティ関数
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function clearArray(array) {
    array.length = 0;
}

// ゲームオブジェクト基底クラス
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    draw(ctx) {
        // Override in subclasses
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    destroy() {
        this.active = false;
    }
}

// プレイヤークラス
class Player extends GameObject {
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

// 弾クラス
class Bullet extends GameObject {
    constructor(x, y, direction = 1) {
        super(x, y, GAME_CONFIG.BULLETS.WIDTH, GAME_CONFIG.BULLETS.HEIGHT);
        this.speed = GAME_CONFIG.BULLETS.SPEED;
        this.direction = direction;
        this.color = GAME_CONFIG.BULLETS.COLOR;
        this.character = GAME_CONFIG.BULLETS.CHARACTER;
    }

    update(deltaTime) {
        this.x += this.speed * this.direction;
        
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

// 敵の弾クラス
class EnemyBullet extends GameObject {
    constructor(x, y) {
        super(x, y, GAME_CONFIG.ENEMY_BULLETS.WIDTH, GAME_CONFIG.ENEMY_BULLETS.HEIGHT);
        this.speed = GAME_CONFIG.ENEMY_BULLETS.SPEED;
        this.color = GAME_CONFIG.ENEMY_BULLETS.COLOR;
        this.character = GAME_CONFIG.ENEMY_BULLETS.CHARACTER;
    }

    update(deltaTime) {
        this.x -= this.speed;
        
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

// 敵クラス
class Enemy extends GameObject {
    constructor(x, y, type) {
        super(x, y, GAME_CONFIG.ENEMIES.WIDTH, GAME_CONFIG.ENEMIES.HEIGHT);
        this.type = type;
        this.config = GAME_CONFIG.ENEMIES.TYPES[type.toUpperCase()];
        this.hp = this.config.HP;
        this.maxHp = this.config.HP;
        this.speed = GAME_CONFIG.ENEMIES.SPEED;
        this.lastShot = 0;
        
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
            if (this.hp === 3) {
                ctx.font = '64px sans-serif';
                ctx.fillStyle = this.config.COLOR;
                ctx.fillText('大', this.x, this.y + 54);
            } else if (this.hp === 2) {
                ctx.font = '40px sans-serif';
                ctx.fillStyle = this.config.COLOR;
                ctx.fillText('中', this.x, this.y + 40);
            } else if (this.hp === 1) {
                ctx.font = '28px sans-serif';
                ctx.fillStyle = this.config.COLOR;
                ctx.fillText('小', this.x, this.y + 28);
            }
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
            return true;
        }
        return false;
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

// 敵ファクトリー
class EnemyFactory {
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

// 星クラス
class Star extends GameObject {
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

// 爆発エフェクトクラス
class Explosion extends GameObject {
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

// 入力管理クラス
class InputManager {
    constructor() {
        this.keys = {};
        this.listeners = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(event) {
        const key = this.mapKey(event);
        if (key) {
            if (key === 'SHOOT' && !this.keys[key]) {
                this.triggerAction('shoot');
                event.preventDefault();
            }
            this.keys[key] = true;
        }
    }

    handleKeyUp(event) {
        const key = this.mapKey(event);
        if (key) {
            this.keys[key] = false;
        }
    }

    mapKey(event) {
        switch (event.key) {
            case 'ArrowUp':
                return 'UP';
            case 'ArrowDown':
                return 'DOWN';
            case ' ':
                return 'SHOOT';
            default:
                return null;
        }
    }

    isKeyPressed(key) {
        return !!this.keys[key];
    }

    addListener(action, callback) {
        if (!this.listeners[action]) {
            this.listeners[action] = [];
        }
        this.listeners[action].push(callback);
    }

    triggerAction(action) {
        if (this.listeners[action]) {
            this.listeners[action].forEach(callback => callback());
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    reset() {
        this.keys = {};
    }
}

// ゲーム状態管理クラス
class GameState {
    constructor() {
        this.score = 0;
        this.gameActive = true;
        this.scoreDisplay = document.getElementById('score-display');
        this.gameOverElement = document.getElementById('game-over');
        this.gameOverText = document.getElementById('game-over-text');
        this.restartButton = document.getElementById('restart-button');
    }

    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    }

    getScore() {
        return this.score;
    }

    isActive() {
        return this.gameActive;
    }

    gameOver() {
        this.gameActive = false;
        this.showGameOverScreen();
    }

    showGameOverScreen() {
        this.gameOverText.textContent = `終\nSCORE: ${this.score}`;
        this.gameOverElement.classList.remove('hidden');
    }

    hideGameOverScreen() {
        this.gameOverElement.classList.add('hidden');
    }

    updateScoreDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `SCORE: ${this.score}`;
        }
    }

    reset() {
        this.score = 0;
        this.gameActive = true;
        this.updateScoreDisplay();
        this.hideGameOverScreen();
    }

    setRestartCallback(callback) {
        if (this.restartButton) {
            this.restartButton.addEventListener('click', callback);
        }
    }
}

// メインゲームクラス
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        this.animationId = null;
        this.explosions = [];
        this.enemySpawnTimer = 0;
        this.currentSpawnInterval = GAME_CONFIG.ENEMIES.SPAWN_INTERVAL;
        
        this.setupCanvas();
        
        // 初期化
        this.inputManager = new InputManager();
        this.gameState = new GameState();
        
        // エンティティ
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

    setupCanvas() {
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
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

        // プレイヤー更新
        this.entities.player.update(deltaTime, this.inputManager, GAME_CONFIG.CANVAS_HEIGHT);
        
        // 星更新
        for (const star of this.entities.stars) {
            star.update(deltaTime);
        }
        
        // エンティティ配列更新
        this.updateEntityArray(this.entities.bullets, deltaTime);
        this.updateEntityArray(this.entities.enemyBullets, deltaTime);
        this.updateEntityArray(this.entities.enemies, deltaTime);
        
        // 爆発エフェクト更新
        this.updateExplosions(deltaTime);
        
        // 敵生成システム
        this.updateEnemySpawning(deltaTime);
        this.updateEnemyShooting();
        
        // 当たり判定
        this.checkCollisions();
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

    updateExplosions(deltaTime) {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            this.explosions[i].update(deltaTime);
            if (!this.explosions[i].active) {
                this.explosions.splice(i, 1);
            }
        }
    }

    updateEnemySpawning(deltaTime) {
        this.enemySpawnTimer += deltaTime * 1000;
        
        if (this.enemySpawnTimer >= this.currentSpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            this.updateDifficulty();
        }
    }

    spawnEnemy() {
        const enemy = EnemyFactory.create(
            GAME_CONFIG.CANVAS_WIDTH,
            Math.random() * (GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.ENEMIES.HEIGHT)
        );
        this.entities.enemies.push(enemy);
    }

    updateEnemyShooting() {
        const currentTime = Date.now();
        
        for (const enemy of this.entities.enemies) {
            if (enemy.active && enemy.canShoot(currentTime)) {
                const bulletPos = enemy.shoot(currentTime);
                const bullet = new EnemyBullet(bulletPos.x, bulletPos.y);
                this.entities.enemyBullets.push(bullet);
            }
        }
    }

    updateDifficulty() {
        const difficultyLevel = Math.floor(this.gameState.getScore() / GAME_CONFIG.ENEMIES.DIFFICULTY_SCORE_THRESHOLD);
        const newInterval = Math.max(
            GAME_CONFIG.ENEMIES.SPAWN_INTERVAL * Math.pow(GAME_CONFIG.ENEMIES.DIFFICULTY_INCREASE_RATE, difficultyLevel),
            GAME_CONFIG.ENEMIES.MIN_SPAWN_INTERVAL
        );
        
        this.currentSpawnInterval = newInterval;
    }

    checkCollisions() {
        this.checkBulletEnemyCollisions();
        this.checkPlayerEnemyCollisions();
        this.checkPlayerEnemyBulletCollisions();
    }

    checkBulletEnemyCollisions() {
        const { bullets, enemies } = this.entities;
        
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.active) continue;

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.active) continue;

                if (checkCollision(bullet.getBounds(), enemy.getBounds())) {
                    this.addExplosion(bullet.x, bullet.y);
                    bullet.destroy();
                    
                    const destroyed = enemy.takeDamage(1);
                    if (destroyed) {
                        this.gameState.addScore(GAME_CONFIG.SCORE.POINTS_PER_ENEMY);
                    }
                    
                    break;
                }
            }
        }
    }

    checkPlayerEnemyCollisions() {
        const { player, enemies } = this.entities;
        
        for (const enemy of enemies) {
            if (!enemy.active) continue;
            
            if (checkCollision(player.getBounds(), enemy.getBounds())) {
                this.gameState.gameOver();
                return;
            }
        }
    }

    checkPlayerEnemyBulletCollisions() {
        const { player, enemyBullets } = this.entities;
        
        for (const bullet of enemyBullets) {
            if (!bullet.active) continue;
            
            if (checkCollision(player.getBounds(), bullet.getBounds())) {
                this.gameState.gameOver();
                return;
            }
        }
    }

    addExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
    }

    render() {
        this.clearScreen();
        this.renderStars();
        this.renderPlayer();
        this.renderBullets();
        this.renderEnemyBullets();
        this.renderEnemies();
        this.renderExplosions();
    }

    clearScreen() {
        this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderStars() {
        for (const star of this.entities.stars) {
            if (star.active) {
                star.draw(this.ctx);
            }
        }
    }

    renderPlayer() {
        if (this.entities.player.active) {
            this.entities.player.draw(this.ctx);
        }
    }

    renderBullets() {
        for (const bullet of this.entities.bullets) {
            if (bullet.active) {
                bullet.draw(this.ctx);
            }
        }
    }

    renderEnemyBullets() {
        for (const bullet of this.entities.enemyBullets) {
            if (bullet.active) {
                bullet.draw(this.ctx);
            }
        }
    }

    renderEnemies() {
        for (const enemy of this.entities.enemies) {
            if (enemy.active) {
                enemy.draw(this.ctx);
            }
        }
    }

    renderExplosions() {
        for (const explosion of this.explosions) {
            explosion.draw(this.ctx);
        }
    }

    gameLoop(timestamp) {
        if (!this.gameState.isActive() && this.animationId) {
            return;
        }
        
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        
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
        this.gameState.reset();
        this.entities.player.reset();
        
        clearArray(this.entities.bullets);
        clearArray(this.entities.enemies);
        clearArray(this.entities.enemyBullets);
        clearArray(this.entities.stars);
        clearArray(this.explosions);
        
        this.entities.stars.push(...Star.createStarField());
        
        this.enemySpawnTimer = 0;
        this.currentSpawnInterval = GAME_CONFIG.ENEMIES.SPAWN_INTERVAL;
        this.inputManager.reset();
        
        this.start();
    }

    destroy() {
        this.stop();
        this.inputManager.destroy();
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }
    
    const game = new Game(canvas);
    game.start();
    
    window.addEventListener('beforeunload', () => {
        game.destroy();
    });
});