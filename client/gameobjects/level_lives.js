import Phaser from "phaser";
import Constants from "../lib/constants";

/**
 * Creates a level lives counter in scene and places it in the top middle. If all lives are
 * depleted, emits levelliveszero event
 */
export default class LevelLives extends Phaser.GameObjects.GameObject {
    /**
     * @param {Phaser.Scene} scene
     * @param {Constants} constants scene constants class
     * @param {number} lives number of lives to start with
     */
    constructor(scene, constants, lives) {
        super(scene);

        this.numLives = lives;

        // Create Hud spot
        const bg = scene.add.image(constants.Width * 0.5, constants.Height * 0.9, '__WHITE');
        bg.setDisplaySize(constants.Width * 0.1 * lives, constants.Height * 0.15);
        bg.setDepth(11).setOrigin(0.5);

        // Create lives icons for each life
        this.lives = [];
        for (let i = 0; i < this.numLives; i++) {
            let life = this.scene.add.sprite(
                bg.x + constants.Width * 0.005 - bg.displayWidth / 2 + (i) * constants.Width * 0.1,
                constants.Height * 0.9,
                'full-heart');
            life.setDisplaySize(constants.Width * 0.09, constants.Width * 0.09);
            life.setOrigin(0, 0.5);
            this.lives.push(life);

            this.addLife(i);
        }

        /**
         * add hit listener
         */
        scene.events.on('playerhit', (damage) => {
            this.numLives -= damage;

            // remove lives
            for (let i = this.numLives; i < this.numLives + damage; i++) {
                if (i >= 0) this.removeLife(i);
            }
        });

        /**
         * add heal listener
         */
        scene.events.on('healplayer', (health) => {
            if (this.numLives < lives) {
                for (let i = this.numLives; i < this.numLives + health; i++) {
                    console.log(this.numLives, lives, health);
                    if (i >= lives) break;

                    this.addLife(i);
                }
                this.numLives = (this.numLives + health > lives) ? lives : this.numLives + health;
            }
        });

        // add self to scene
        scene.add.existing(this);
    }

    /**
     * shows the life at index i TODO: add an animation
     * @param {number} i
     */
    addLife(i) {
        if (this.lives[i].depth > 0) return;

        this.lives[i].setDepth(12)
        this.lives[i].play('add-heart').on('animationcomplete', () => {
            this.lives[i].off('animationcomplete');
            this.lives[i].setTexture('full-heart');
        })
    }

    /**
     * plays the heartbreak animation for the i'th life and hides it
     * @param {number} i
     */
    removeLife(i) {
        if (this.lives[i].depth < 0) return;

        this.lives[i].play('lose-heart').on('animationcomplete', () => {
            this.lives[i].off('animationcomplete');

            this.lives[i].setDepth(-1);
            // check if last life
            if (i == 0) {
                this.scene.events.emit('levelliveszero');
            }
        });
    }

    destroy() {
        this.scene.events.removeListener('playerhit');
        this.scene.events.removeListener('playerheal');
    }
}
