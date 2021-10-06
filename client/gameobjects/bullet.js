import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'bullet');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDisplaySize(5, 75);
        this.setOrigin(0.5);
        this.setTint(0xFF0000);

        this.speed = Phaser.Math.GetSpeed(1500, 1);
    }

    fire (x, y, direction) {
        this.xSpeed = this.speed * Math.sin(direction) * 1000;
        this.ySpeed = -this.speed * Math.cos(direction) * 1000;

        this.setPosition(x, y - 50);
        this.setVelocity(this.xSpeed, this.ySpeed);
        this.setAngle(direction);
        this.setRotation(direction);

        this.setActive(true);
        this.setVisible(true);
    }

    update (time, delta) {
        // this.x += this.xSpeed * delta;
        // this.y += this.ySpeed * delta;

        if (this.y < -50) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
