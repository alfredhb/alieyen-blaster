import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'bullet');

        scene.physics.add.existing(this);

        this.setDisplaySize(10, 175);
        this.setOrigin(0.5);
        this.setTint(0xFF0000);

        this.speed = Phaser.Math.GetSpeed(2500, 1);
    }

    fire (x, y, direction) {
        this.xSpeed = this.speed * Math.sin(direction) * 1000;
        this.ySpeed = -this.speed * Math.cos(direction) * 1000;

        this.setPosition(x, y - 50);
        this.setVelocity(this.xSpeed, this.ySpeed);
        this.setRotation(direction);

        this.setActive(true);
        this.setVisible(true);
    }

    update (time, delta) {
        if (this.y < -50) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    kill() {
        this.setActive(false);
        this.setVisible(false);
    }
}
