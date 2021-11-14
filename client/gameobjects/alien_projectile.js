import Phaser from "phaser";
import Constants from "../lib/constants";

export default class AlienProjectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, width, height, dMultiplier) {
        super(scene, 0, 0, 'alien-bomb');
        this.constants = new Constants(width, height);

        this.dMultiplier = dMultiplier;

        scene.physics.add.existing(this);

        this.setTint(this.constants.LightBlue);
        this.setDisplaySize(5, 5);

        this.chargeSound = this.scene.sound.get('energy-charge');
    }

    /**
     * Fires a projectile and sets as visible and active
     */
    fire(x, y) {
        this.setActive(true);
        this.setVisible(true);

        this.setPosition(x, y);
        this.setDisplaySize(5, 5);

        this.chargeSound.play();
    }

    /**
     * Handles updates for alien projectiles.
     * @param {number} time
     * @param {number} delta
     */
    update(time, delta) {
        this.handleProjectile();
    }

    /**
     * an update function for alien's projectile. Charges up to width size scene.width * 0.028
     * at rate variable with difficulty, then updates position downward until it
     * reaches the cockpit emitting a player damage event captured by the level
     * and captured by the alien
     */
    handleProjectile() {
        if (!this.visible) {
            return;
        }

        if (this.y >= this.constants.Height * 0.85) {
            this.setVisible(false);
            this.scene.events.emit('playerhit', 1 /* alien grunt deals 1 damage */);
        }

        if (this.displayWidth < this.constants.Width * 0.055) {
            this.setDisplaySize(
                this.displayWidth + 0.3 * this.dMultiplier,
                this.displayWidth + 0.3 * this.dMultiplier,
            );

            // Swap audio events
            if (this.displayWidth >= this.constants.Width * 0.055) {
                this.chargeSound.stop();
                this.scene.sound.get('energy-blast').play()
            }
        } else if (this.displayWidth >= this.constants.Width * 0.055
            && this.y < this.constants.Height) {
            this.setPosition(this.x, this.y + 2.5);
        }
    }

    /**
     * Handle projectile when alien is killed. If still charging, kill the projectile.
     * @returns {boolean} whether to destroy the projectile or not
     */
    alienKilled() {
        if (this.displayWidth < this.constants.Width * 0.055) {
            this.kill()
            return true;
        }
        return false
    }

    /**
     * Sets projectile to inactive and uninteractible
     */
    kill() {
        this.chargeSound.stop();
        this.setActive(false);
        this.setVisible(false);
    }
}
