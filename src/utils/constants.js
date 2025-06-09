export const GAME_CONFIG = {
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

export const UI_CONFIG = {
    SCORE_DISPLAY: {
        FONT_SIZE: 20,
        COLOR: 'white',
        FONT_FAMILY: 'sans-serif'
    },
    
    GAME_OVER: {
        FONT_SIZE: 120,
        COLOR: '#ff0000',
        CHARACTER: '終'
    }
};

export const INPUT_KEYS = {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    SHOOT: ' '
};