import Phaser from "phaser";

export default class Powerup extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        super(scene);

        // abstract class abstractification
        if (this.constructor == Powerup) {
            throw new Error("Abstract Classes can't be instantiated");
        }
    }

    update(time, delta) {
        // updatefunc
    }

    /**
     * Launches sprite accross the screen horizontally with random speed based
     * on difficulty
     */
    launch() {
        throw new Error ("Method 'launch()' must be implemented.")
    }

    /**
     * What to do when a bullet collides with it (emit a specific event and destroy)
     */
    collisionFunc() {
        throw new Error("Method 'collisionFunc()' must be implemented.")
    }

    /**
     * Any collision specific animations / sounds to play specific to the powerup
     * (NOT to objects listining to the powerup's events)
     */
    destruct() {
        throw new Error("Method 'destruct()' must be implemented.")
    }
}