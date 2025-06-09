import { Game } from './core/Game.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }
    
    // Initialize and start the game
    const game = new Game(canvas);
    game.start();
    
    // Handle page visibility changes to pause/resume game
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, we could pause the game here if needed
        } else {
            // Page is visible again
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        game.destroy();
    });
});