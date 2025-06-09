import { GAME_CONFIG } from '../utils/constants.js';

export class RenderSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.setupCanvas();
    }

    setupCanvas() {
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    }

    render(entities, collisionSystem) {
        this.clearScreen();
        this.renderStars(entities.stars);
        this.renderPlayer(entities.player);
        this.renderBullets(entities.bullets);
        this.renderEnemyBullets(entities.enemyBullets);
        this.renderEnemies(entities.enemies);
        collisionSystem.drawExplosions(this.ctx);
    }

    clearScreen() {
        this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderStars(stars) {
        for (const star of stars) {
            if (star.active) {
                star.draw(this.ctx);
            }
        }
    }

    renderPlayer(player) {
        if (player.active) {
            player.draw(this.ctx);
        }
    }

    renderBullets(bullets) {
        for (const bullet of bullets) {
            if (bullet.active) {
                bullet.draw(this.ctx);
            }
        }
    }

    renderEnemyBullets(enemyBullets) {
        for (const bullet of enemyBullets) {
            if (bullet.active) {
                bullet.draw(this.ctx);
            }
        }
    }

    renderEnemies(enemies) {
        for (const enemy of enemies) {
            if (enemy.active) {
                enemy.draw(this.ctx);
            }
        }
    }

    // Performance optimization: Only render changed areas
    renderDirtyRegions(entities, dirtyRegions) {
        for (const region of dirtyRegions) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.rect(region.x, region.y, region.width, region.height);
            this.ctx.clip();
            
            // Clear and render only this region
            this.ctx.fillStyle = GAME_CONFIG.BACKGROUND_COLOR;
            this.ctx.fillRect(region.x, region.y, region.width, region.height);
            
            // Render entities that intersect with this region
            this.renderEntitiesInRegion(entities, region);
            
            this.ctx.restore();
        }
    }

    renderEntitiesInRegion(entities, region) {
        // This would need intersection testing for each entity
        // For now, we'll render all entities as the optimization
        // would require more complex region tracking
        this.render(entities);
    }
}