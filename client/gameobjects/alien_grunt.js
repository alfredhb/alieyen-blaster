import Phaser from "phaser";

export default class AlienGrunt extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, -50, -50, 'alien-grunt');
        let { width, height } = scene.scale;

        // Add to physics and to canvas
        scene.physics.add.existing(this);
        this.setPosition(width + 50, height + 50);
        this.setDisplaySize(100, 130)
        this.setOrigin(0.5);

        this.maxX = width + 50;
        this.maxY = height + 50;
    }

    // Randomly choose height, and direction
    // TODO: add vertical speed modifiers and constraints so aliens don't hit ship
    //      make speed and rotation depend on difficulty (a number)
    launch(difficulty) {
        this.speed = Phaser.Math.GetSpeed(Phaser.Math.RND.between(200, 500), 1);
        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let height = Math.random() * this.maxY * 0.65;
        this.xSpeed = direction * this.speed * 1000;
        this.ySpeed = 0 * 1000;
        
        this.setPosition((direction > 0) ? -50 : this.maxX, height);
        this.setVelocity(this.xSpeed, this.ySpeed);
        this.setActive(true);
        this.setVisible(true);

        this.deadVal = false;
    }

    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) {
            this.setActive(false);
            this.setVisible(false);

            // any respawn logic
            this.deadVal = true;
        }
    }

    // Play sprite death animation & sound?
    destroy() {
        this.deadVal = true;

        // play animation
        this.play('explode');
        this.on('animationcomplete', () => {
            this.setVisible(false);
            this.setActive(false);

            // any respawn logic
        });
    }

    dead() {
        return this.deadVal
    }
}