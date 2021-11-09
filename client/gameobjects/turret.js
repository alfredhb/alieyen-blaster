import Phaser from 'phaser';
import Constants from '../lib/constants';
import TemplateLevelScene from '../scenes/levels/template_level';
import Bullet from './bullet';

class Turret {
    /**
     * @param {Constants} c
     * @param {Phaser.GameObjects.Image} turret
     * @param {Phaser.Time.TimerEvent} cooldownTimer
     * @param {boolean} inCooldown
     * @param {Phaser.GameObjects.Graphics} cooldownEffect
     */
    constructor(c, turret, cooldownTimer, inCooldown, cooldownEffect) {
        this.constants = c;
        this.cooldownTime = 500; // 500 ms

        this.turret = turret;
        this.cooldownTimer = cooldownTimer;
        this.inCooldown = inCooldown;
        this.cooldownEffect = cooldownEffect;
    }

    /**
     * swaps this.cooldownTime between 500ms and 100ms and swap tints of turret
     */
    toggleCooldownTime() {
        this.cooldownTime = (this.cooldownTime == 100) ? 500 : 100;
        this.cooldownTimer.delay = this.cooldownTime;

        this.turret.setTexture((this.cooldownTime == 100) ? 'turret-speed-up' : 'turret-colored');
    }

    /**
     * Applies cooldown effect on turret if the cooldown timer is active
     */
    styleCooldown() {
        if (!this.cooldownTimer) {
            return;
        }

        let progress = this.cooldownTimer.getProgress();
        if (progress == 1) {
            this.cooldownEffect.visible = false;
            return;
        }

        this.cooldownEffect.visible = true;
        let render = Math.floor(360 * progress);
        this.cooldownEffect.clear();
        this.cooldownEffect.moveTo(0, 0);
        this.cooldownEffect.fillStyle(this.constants.Red, 0.4);
        this.cooldownEffect.arc(0, 0, 32,
            Phaser.Math.DegToRad(270),
            Phaser.Math.DegToRad(render - 90),
            true
        );
        this.cooldownEffect.fillPath();
    }
}

/**
 * Creates two turrets in the scene using provided assetfiles and adds listeners
 * to input events based on current player, bullets colored based on current player,
 * and collision listeners all stored to scene scope to be accessible there
 */
export default class Turrets extends Phaser.GameObjects.GameObject {
    /**
     *
     * @param {TemplateLevelScene} scene
     * @param {Constants} constants
     * @param {string} asset
     */
    constructor(scene, constants, asset) {
        super(scene);

        // Create Turret images
        const lTurret = scene.add.image(constants.Width * 0.05, constants.Height * 0.85, asset);
        const rTurret = scene.add.image(constants.Width * 0.95, constants.Height * 0.85, asset);
        this.turrets = [];
        [lTurret, rTurret].forEach(t => {
            t.setDisplaySize(constants.Width * 0.025, constants.Height * 0.25);
            t.setOrigin(0.5);
            t.setDepth(10);

            this.turrets.push(new Turret(constants, t, null, false, null));
        });
        this.turrets.forEach(t => {
            // Add cooldown graphics
            t.cooldownEffect = scene.add.graphics();
            t.cooldownEffect.setPosition(t.turret.x, t.turret.y);
            t.cooldownEffect.setDepth(11);
        })

        this.currentPlayer = this.scene.levelData.meta.players[this.scene.levelData.meta.currentPlayer]

        // Init
        this.scene.bullets = this.scene.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
        });
        this.scene.bulletColliders = [];

        // Add to scene
        scene.add.existing(this);
    }

    /**
     * Update content for turrets including cooldown effects
     */
    preUpdate() {
        this.turrets.forEach(t => t.styleCooldown());
    }

    /**
     * adds event listener to scene which fires the turrets. Collision func is
     * used to handle bullet / alien collisions
     * @param {Phaser.GameObjects.Group[]} aliens
     * @param {function} collisionFunc
     */
    addFireListener(aliens, collisionFunc) {
        let pointerEvent = (this.currentPlayer == 'bubba') ? 'pointermove' : 'pointerup';
        this.scene.input.on(pointerEvent, () => {
            if (this.turrets[0].inCooldown || this.turrets[1].inCooldown) {
                return;
            }

            this.fire(aliens, collisionFunc);
        });
    }

    /**
     * fires both turrets at the given activepointer location and adds cooldown
     * timers
     * @param {Phaser.GameObjects.Group[]} aliens
     * @param {function} collisionFunc
     */
    fire(aliens, collisionFunc) {
        this.turrets.forEach(t => {
            // Add cooldown timer
            t.cooldownTimer = this.scene.time.addEvent({
                delay: t.cooldownTime,
                callback: () => {
                    t.inCooldown = false;
                },
                callbackScope: this.scene,
                paused: true
            });

            // Rotate turret and fire only if within angle
            let angle = Phaser.Math.Angle.Between(
                    t.turret.x, t.turret.y,
                    this.scene.input.activePointer.x,
                    this.scene.input.activePointer.y
                ) + Math.PI / 2;
            if (!(Math.abs(angle) > 1.5)) {
                // place turret in cooldown
                t.inCooldown = true;
                t.cooldownTimer.paused = false;

                t.turret.setRotation(angle);
                this.addBullet(t, angle, aliens, collisionFunc);
            }
        });
    }

    /**
     * Adds a bullet and adds overlapper listener for all alien types spawning
     * in the level as captured by this.scene.aliens array of aliengroup types
     * @param {Turret} t
     * @param {number} angle
     * @param {Phaser.GameObjects.Group[]} aliens
     * @param {function} collisionFunc
     */
    addBullet(t, angle, aliens, collisionFunc) {
        let bullet = this.scene.bullets.get(this.currentPlayer);
        if (bullet) {
            // Add collider for each alien type
            this.scene.bulletColliders.push(this.scene.physics.add.overlap(
                bullet,
                aliens,
                collisionFunc,
                null,
                this.scene
            ));
            bullet.fire(null, t.turret.x, t.turret.y + 50, angle);
            bullet.setDepth(8);
        }
    }

    /**
     * array of turret images
     * @returns {Phaser.GameObjects.Image[]}
     */
    getTurrets() {
        return this.turrets;
    }

    /**
     * Called when scene receives 'increaseturretspeed' event. This reduces the
     * cooldown delay for turrets to 0.1 seconds for duration. If the timer is already
     * active when another powerup is received, then appends the duration of the timer
     * @param {number} duration time in ms
     */
    increaseTurretSpeed(duration) {
        if (this.speedupTimer && this.speedupTimer.getProgress() < 1) {
            this.speedupTimer.delay += duration;
            return;
        }

        // Create speedupTimer with duration and toggle cooldown time
        this.speedupTimer = this.scene.time.addEvent({
            delay: duration,
            callback: () => {
                this.turrets.forEach(t => t.toggleCooldownTime());
            },
            callbackScope: this,
            paused: false
        });
        this.turrets.forEach(t => t.toggleCooldownTime());
    }
}
