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

        this.maxLives = lives;
        this.numLives = lives;
        this.shielded = false;

        // Create Hud spot
        const bg = scene.add.image(constants.Width * 0.5, constants.Height * 0.9, '__WHITE');
        bg.setDisplaySize(constants.Width * 0.1 * lives, constants.Height * 0.15);
        bg.setDepth(11).setOrigin(0.5);

        // Create shield cover
        this.shieldCover = scene.add.sprite(constants.Width * 0.5, constants.Height * 0.9, 'shield-placed');
        this.shieldCover.setDisplaySize(constants.Width * 0.1 * lives, constants.Height * 0.15);
        this.shieldCover.setDepth(13).setOrigin(0.5);
        this.shieldCover.setVisible(false);

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
            if (this.shielded) {
                this.scene.sound.play('armor-dink', { volume: this.scene.game.config.sfxVolume }); // U.S. spelling... USA! USA! USA!
                return;
            };
            this.scene.sound.play('oof-damage', { volume: this.scene.game.config.sfxVolume }); // real sound take-damage
            this.numLives -= damage;

            // remove lives
            for (let i = this.numLives; i < this.numLives + damage; i++) {
                if (i >= 0) this.removeLife(i);
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

    /**
     * Called when scene receives 'healplayer' event. This heals the player by the specified amount
     * of health.
     * @param {number} health number of lives to heal
     */
    healLives(health) {
        if (this.numLives < this.maxLives) {
            for (let i = this.numLives; i < this.numLives + health; i++) {
                if (i >= this.maxLives) break;
                if (this.lives[i] == undefined) break; // Short circuit if lives have already been removed

                this.addLife(i);
            }
            this.numLives = (this.numLives + health > this.maxLives) ? this.maxLives : this.numLives + health;
        }
    }

    /**
     * Called when scene receives 'shieldplayer' event. This shields the player from taking damage
     * If the timer is already active when another powerup is received, then appends the duration
     * of the timer
     * @param {number} duration time in ms
     */
     shieldLives(duration) {
        if (this.shieldTimer && this.shieldTimer.getProgress() < 1) {
            this.shieldTimer.delay += duration;
            return;
        }

        // Create speedupTimer with duration and toggle cooldown time
        this.shieldTimer = this.scene.time.addEvent({
            delay: duration,
            callback: () => {
                this.shielded = false;
                this.scene.sound.play('glass-break', { volume: this.scene.game.config.sfxVolume });
                this.shieldCover.play('lose-shield').on('animationcomplete', () => {
                    this.shieldCover.setTexture('shield-placed');
                    this.shieldCover.setVisible(false);
                });
            },
            callbackScope: this,
            paused: false
        });
        this.shielded = true;
        this.shieldCover.setVisible(true);
    }

    destroy() {
        this.scene.events.removeListener('playerhit');
        this.scene.events.removeListener('playerheal');
    }
}
