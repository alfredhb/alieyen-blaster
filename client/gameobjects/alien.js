import Phaser from "phaser";

export default class Alien extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene
     * @param {boolean} canFire
     */
    constructor(scene, canFire) {
        super(scene);
        // abstract class abstractificatino
        if (this.constructor == Alien) {
            throw new Error("Abstract Classes can't be instantiated");
        }
    }

    update(time, delta) {
        // updateFunc
    }

    /**
     * Launches sprite accross the screen horizontally with random speed based
     * on difficulty
     */
    launch() {
        throw new Error ("Method 'launch()' must be implemented.")
    }

    /**
     * Places the sprite at x and y
     * @param {number} x 
     * @param {number} y 
     */
    place(x, y) {
        throw new Error ("Method 'place()' must be implemented.")
    }

    /**
     * Alien charges an attack and fires at the ship. On hitting, emits 'playerhit'
     */
    fire() {
        throw new Error ("Method 'fire()' must be implemented.")
    }

    /**
     * Deals d damage to alien. If alien were to drop below its HP, then kills it
     * and returns true
     * @param {number} d
     * @returns {boolean} true on alien death
     */
    damage(d) {
        throw new Error ("Method 'damage()' must be implemented.")
    }

    /**
     * Kills the alien and cleans up and attacks
     */
    kill() {
        throw new Error ("Method 'kill()' must be implemented.")
    }

    /**
     * @returns {boolean} if the alien is dead
     */
    dead() {
        throw new Error ("Method 'dead()' must be implemented.")
    }

    /**
     * Causes the alien to leave the scene (separate animation to kill)
     */
    leave() {
        throw new Error ("Method 'leave()' must be implemented.")
    }

    /**
     * @returns {number} type of alien: grunt = 0, mini_boss = 1, boss = 2
     */
    getType() {
        throw new Error ("Method 'getType()' must be implemented.")
    }
}
