import { INPUT_KEYS } from '../utils/constants.js';

export class InputManager {
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
            case INPUT_KEYS.UP:
                return 'UP';
            case INPUT_KEYS.DOWN:
                return 'DOWN';
            case INPUT_KEYS.SHOOT:
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

    removeListener(action, callback) {
        if (this.listeners[action]) {
            const index = this.listeners[action].indexOf(callback);
            if (index > -1) {
                this.listeners[action].splice(index, 1);
            }
        }
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