export class GameObject {
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

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    destroy() {
        this.active = false;
    }

    isOutOfBounds(canvasWidth, canvasHeight) {
        return this.x + this.width < 0 || 
               this.x > canvasWidth || 
               this.y + this.height < 0 || 
               this.y > canvasHeight;
    }
}