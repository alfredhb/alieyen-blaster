import Phaser from "phaser";
import Constants from "../lib/constants";
import Alien from "./alien";

export default class AlienGrunt extends Alien {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene, canFire) {
        super(scene, -50, -50, 'alien-grunt-1-1');

        let { width, height } = scene.scale;
        this.constants = new Constants(width, height);

        this.staticTexture = (this.scene?.levelData?.assets?.grunt) ? 
            this.scene.levelData.assets.grunt : 'alien-grunt'; //pull static texture from config
        if (this.scene?.levelData?.assets?.grunt) {
            this.staticTexture = (typeof(this.scene.levelData.assets.grunt) === "string") 
            ? this.scene.levelData.assets.grunt : this.scene.levelData.assets.grunt[0];
        }
        this.floatTexture = this.staticTexture + "-float";
        this.fireTexture = this.staticTexture + "-fire";

        this.slowMultiplier = 0.25;
        this.slowed = false;
        this.fired = false;

        // Add to physics and to canvas
        scene.physics.add.existing(this);
        this.setInteractive();
        this.setPosition(width + 50, height + 50);
        this.setDisplaySize(width * 0.03, height * 0.05);
        // if later grunt textures, then reduce size further
        if (this.staticTexture != 'alien-grunt') {
            this.setDisplaySize(width * 0.01, height * 0.015);
        }

        this.body.setSize(this.displayWidth * 0.7, this.displayHeight * 1.5);
        this.body.setOffset(this.displayWidth * 1.1, this.displayHeight);

        this.maxX = width + 65;
        this.maxY = height + 65;

        /**
         * Difficulty must affect:
         * 1. Speed that aliens move - done
         * 2. Whether aliens stop and continue moving (da jukes)
         * 3. How quickly aliens charge up to fire - done
         * 4. How many aliens spawn (handled elsewhere)
         */
        this.canFire = canFire || false;
        this.difficulty = scene.difficulty;
        this.dMultiplier = this.constants.GetDifficultyMultiplier(this.difficulty);
        if (scene.levelData?.level.difficulty_multiplier) {
            this.difficulty = scene.levelData.meta.difficulty
            this.dMultiplier = scene.levelData.level.difficulty_multiplier[this.difficulty - 1];
        }

        // Create frozen alien for slow powerup
        this.frozen = scene.add.sprite(0, 0, 'frozen');
        this.setPosition(width + 50, height + 50);
        this.frozen.setDisplaySize(width * 0.1, height * 0.15);
        this.frozen.setDepth(13);
        this.frozen.setAlpha(0.65);
        this.frozen.setVisible(false);
        if (this.slowed) {
            this.frozen.setVisible(true);
        }

        // Add Animation
        this.anims.get(this.floatTexture);
    }

    /**
     * Update function which runs every tick and updates object position
     * @param {number} time
     * @param {number} delta
     */
    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) {
            this.setActive(false);
            this.setVisible(false);

            // Respawn logic
            this.deadVal = true;
            this.respawn();
        }

        if (this.doesFire && Math.abs(this.x - this.stopLoc) < 5) {
            this.fire();
            this.doesFire = false;
        }

        this.frozen.setPosition(this.x, this.y);
    }

    /**
     * Launch alien from a random side of the screen and random height.
     * If canFire, then the alien has a 34% chance of stopping at a random space
     * in middle half of screen and firing a bomb at the player.
     */
    launch() {
        this.updateTextures();

        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let y = Math.random() * this.maxY * 0.5 + 75;
        this.speed = this.constants.GetSpeed(this.difficulty);
        this.xSpeed = direction * this.speed * 1000;
        if (this.slowed) {
            this.xSpeed = this.xSpeed * this.slowMultiplier;
        }
        this.ySpeed = 0 * 1000;

        this.x = (direction > 0) ? -50 : this.maxX;
        this.setPosition(this.x, y);
        this.setVelocity(this.xSpeed, this.ySpeed);
        this.anims.play(this.floatTexture);
        this.setActive(true);
        this.setVisible(true);
        this.flipX = direction;

        // Alien fires 34% of the time. If firing, then creates a timer which
        // stops when alien should be over its zone and makes it fire
        // TODO: make associated with difficulty
        if (this.canFire && Math.random() > 0.66) {
            this.stopLoc = Phaser.Math.RND.between(
                this.constants.Width * 1 / 4,
                this.constants.Width * 3 / 4
            );
            this.doesFire = true;
        }
        this.fired = false;

        this.deadVal = false;

        if (this.slowed) {
            this.frozen.setVisible(true);
        }
    }

    /**
     * places the sprite statically at x y and makes it visible and active
     * @param {number} x
     * @param {number} y
     */
    place(x, y) {
        this.setPosition(x, y);
        this.setDisplaySize(
            this.constants.Width * 0.03,
            this.constants.Height * 0.05
        );
        this.anims.play(this.floatTexture);

        this.setActive(true);
        this.setVisible(true);
    }

    /**
     * Fires at the player's ship
     *
     * Requires: alien is not dead (signifying it's in flight)
     * Requires: alien grunt has canFire as true meaning it can fire
     * Requires: different animations for charge- different frame num so
     *              easy, med, hard charge times are all represented correctly
     */
    fire() {
        if (this.deadVal || !this.canFire) {
            return;
        }

        this.fired = true;

        // Stop moving and begin animation
        this.setVelocity(0, 0);
        this.anims.play(this.getFireAnimation());
        this.on('animationcomplete', () => {
            this.off('animationcomplete');
            this.leave(true /* respawn */);
        });

        this.addProjectile();
    }

     /**
     * Adds a projectile to this scene.
     */
    addProjectile() {
        this.projectile = this.scene.projectiles.get(this.constants.Width, this.constants.Height, this.dMultiplier, 1);
        if (this.projectile) {
            this.projectile.fire(this.x, this.y + this.height * 0.75);
        }
    }

    damage(d) {
        return this.kill();
    }

    // Kill alien and its attack if it was charging
    kill() {
        this.deadVal = true;

        this.frozen.setVisible(false);

        // let projectile handle killed alien
        if (this.projectile && this.projectile.alienKilled()) {
            this.projectile.destroy();
        }

        // Stop any charge sound and play animation
        this.play('explode', { loop: false, volume: 0.25 * this.scene.game.config.sfxVolume });
        this.on('animationcomplete', () => {
            this.setVisible(false);
            this.setActive(false);

            // Respawn logic
            this.respawn();
        });

        setTimeout(() => {
            this.scene.events.emit('gruntkilled');
        }, 1000);
        return this.deadVal;
    }

    /**
     * If alien is dead
     * @returns {boolean}
     */
    dead() {
        return this.deadVal
    }

    /**
     * After 300ms, stops any sprite animations and calls launch()
     */
    respawn() {
        setTimeout(() => {
            // Check if level finished in the 300ms
            if (this == null) {
                return;
            }

            this.stop();
            this.removeListener('animationcomplete');
            this.launch();
        }, 300);
    }

    /**
     * Causes alien to 'exit' level without exploding or playing any sound effects
     * Places alien underneath player and invisible to allow any active bombs to
     * continue moving
     * @param {boolean?} respawn
     */
    leave(respawn) {
        // TODO: play an animation specific to leaving the level

        this.setVelocity(0);
        this.setPosition(this.maxX, this.maxy);
        this.setVisible(false);

        if (respawn) {
            this.respawn();
        }
    }

    /**
     * returns the spritesheet with correct framerate based on difficulty
     */
    getFireAnimation() {
        return {
            key: this.fireTexture,
            frameRate: (this.difficulty == 3) ? (24 / 4.3) :
                    (this.difficulty == 2) ? (24 / 5.3) : 3
        }
    }

    /**
     * if scene has currentBoss, then updates texutes to current asset.
     * Also disables firing for aliens past first type
     */
    updateTextures() {
        if (this.scene?.currentBoss) {
            if (this.scene.currentBoss > 0) this.canFire = false;

            this.staticTexture = this.scene.levelData.assets.grunt[this.scene.currentBoss];
            this.floatTexture = this.staticTexture + "-float";
            this.fireTexture = this.staticTexture + "-fire";
        }

        if (this.staticTexture === undefined) {
            // this.leave(false);
            // this.setVelocity(0);
            this.destroy(true);
            console.log("unable to find static texture for grunt");
        }
    }

    /**
     * @returns {number} type of alien
     */
    getType() {
        return 0; // alien grunt
    }

    /**
     * Called when scene receives 'slowaliens' event. Causes aliens to slow down
     * If the timer is already active when another powerup is received, then appends the duration
     * of the timer
     * @param {number} duration time in ms
     */
    slow(duration) {
        if (this.slowTimer && this.slowTimer.getProgress() < 1) {
            this.slowTimer.delay += duration;
            return;
        }

        // Create slowdown timer with duration and toggle cooldown time
        this.slowTimer = this.scene.time.addEvent({
            delay: duration,
            callback: () => {
                this.slowed = false;
                this.frozen.setVisible(false);
                if (!this.fired) {
                    this.xSpeed = this.xSpeed / this.slowMultiplier;
                    this.setVelocity(this.xSpeed, this.ySpeed);
                }
                this.scene.sound.play('glass-break', { volume: 0.2  * this.scene.game.config.sfxVolume });
            },
            callbackScope: this,
            paused: false
        });

        this.slowed = true;
        this.frozen.setVisible(true);

        if (!this.fired) {
            this.xSpeed = this.xSpeed * this.slowMultiplier;
            this.setVelocity(this.xSpeed, this.ySpeed);
        }
    }

    /**
     * Called when scene receives 'onehitko' event. Kills aliens
     */
    onehitko() {
        let kills = [0, 0, 0];
        kills[this.getType()] = 1;
        this.kill();
        return kills;
    }
}
