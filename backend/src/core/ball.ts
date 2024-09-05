export class Ball {
    x: number;
    y: number;
    speed: number;
    angle: number;

    constructor(initialX: number, initialY: number, initialSpeed: number, initialAngle: number) {
        this.x = initialX;
        this.y = initialY;
        this.speed = initialSpeed;
        this.angle = initialAngle;
    }

    updatePosition(deltaTime: number) { 
        const radians = this.angle * (Math.PI / 180);
        this.x += Math.cos(radians) * this.speed * deltaTime;
        this.y += Math.sin(radians) * this.speed * deltaTime;

    }

    checkWallColission(heigth: number) {
        if (this.y <= 0 || this.y >= heigth) {
            this.angle = 360 - this.angle;
        }
    }
}