import { UI_CONFIG } from '../utils/constants.js';

export class GameState {
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
        this.gameOverText.textContent = `${UI_CONFIG.GAME_OVER.CHARACTER}\nSCORE: ${this.score}`;
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