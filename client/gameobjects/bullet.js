import Phaser from "phaser";

export default class Bullet extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(scene);

        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = Phaser.Math.GetSpeed(1000, 1);
    }

    fire (x, y, direction) {
        this.setPosition(x, y - 50);
        this.setAngle(direction);
        this.setRotation(direction);

        this.setActive(true);
        this.setVisible(true);
    }

    update (time, delta) {
        this.y -= this.speed * delta;

        if (this.y < -50) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}
