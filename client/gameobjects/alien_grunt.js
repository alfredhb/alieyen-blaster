import Phaser from "phaser";

export default class AlienGrunt extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene);

        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, '__DEFAULT');
        this.maxX = scene.scale[0] + 50;
        this.speed = Phaser.Math.GetSpeed(Math.random() * 500, 1);
    }

    // Randomly choose height, and direction
    // TODO: add vertical speed modifiers and constraints so aliens don't hit ship
    //      make speed and rotation depend on difficulty (a number)
    launch(difficulty) {
        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let height = Math.random(0) * this.scene.scale[1] * 0.8;
        this.xSpeed = direction * this.speed;
        this.ySpeed = 0;
        
        this.setPosition((direction > 0) ? -50: this.maxX + 50 , height);
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
}