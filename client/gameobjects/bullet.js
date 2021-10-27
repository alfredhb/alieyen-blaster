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

    /**
     * Fires a bullet from x, y with angle direction and velocity determined by
     * this.speed split into its x and y components. Sets as visible and active
     * for collisions
     * @param {number} turret_id
     * @param {number} x
     * @param {number} y
     * @param {number} direction angle in radians
     */
    fire (turret_id, x, y, direction) {
        this.turret_id = turret_id;

        this.xSpeed = this.speed * Math.sin(direction) * 1000;
        this.ySpeed = -this.speed * Math.cos(direction) * 1000;

        this.setPosition(x, y - 50);
        this.setVelocity(this.xSpeed, this.ySpeed);
        this.setRotation(direction);

        this.setActive(true);
        this.setVisible(true);
    }

    /**
     * Checks whether bullet is out of frame, if so then sets it to false and
     * unable to collide.
     * @param {number} time
     * @param {number} delta
     */
    update (time, delta) {
        if (this.y < -50) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    /**
     * Sets bullet to inactive and uninteractible
     */
    kill() {
        this.setActive(false);
        this.setVisible(false);
    }
}
