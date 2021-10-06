import Phaser from "phaser";

export default class AlienGrunt extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene);
        let { width, height } = scene.scale;

        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, '__WHITE');
        this.setDisplaySize(100, 130)
        this.setOrigin(0.5);

        this.maxX = width + 50;
        this.maxY = height + 50;
        this.speed = Phaser.Math.GetSpeed(Phaser.Math.RND.between(300, 700), 1);
    }

    // Randomly choose height, and direction
    // TODO: add vertical speed modifiers and constraints so aliens don't hit ship
    //      make speed and rotation depend on difficulty (a number)
    launch(difficulty) {
        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let height = Math.random() * this.maxY * 0.65;
        this.xSpeed = direction * this.speed;
        this.ySpeed = 0;
        
        this.setPosition((direction > 0) ? -50 : this.maxX, height);
        this.setActive(true);
        this.setVisible(true);
    }

    update(time, delta) {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;

        if (this.x < -50 || this.x > this.maxX) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    // Play sprite death animation & sound?
    destroy() {
        this.setActive(false);
        this.setVisible(false);
    }
}