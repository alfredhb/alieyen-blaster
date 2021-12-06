import Phaser from "phaser";
import Constants from "../lib/constants";
import Alien from "./alien";

const Base_Health = [15, 25, 35];
const Base_Shield = [20, 30, 50];

export default class AlienMini extends Alien {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene, canFire) {
        super(scene, -50, -50, 'alien-mini-boss');

        let { width, height } = scene.scale;
        this.constants = new Constants(width, height);

        this.staticTexture = (this.scene?.levelData?.assets?.mini_boss) ?
            this.scene.levelData.assets.mini_boss : 'alien-mini-boss'; //pull static texture from config
        if (this.scene?.levelData?.assets?.mini_boss) {
            this.staticTexture = (typeof(this.scene.levelData.assets.mini_boss) === "string") 
            ? this.scene.levelData.assets.mini_boss : this.scene.levelData.assets.mini_boss[0];
        }
        this.floatTexture = this.staticTexture + "-float";
        this.fireTexture = this.staticTexture + "-fire";

        scene.physics.add.existing(this);
        this.setInteractive();
        this.setPosition(width + 50, height + 50);
        this.setDisplaySize(width * 0.03, height * 0.05);
        this.body.setSize(this.displayWidth * 1, this.displayHeight * 1.5);
        this.setOffset(this.displayWidth * 2, this.displayHeight * 1.5);

        this.maxX = width + 65;
        this.maxY = height + 65;

        // for beta, this alien wont fire
        this.canFire = canFire || false;
        // hardcoded because mini boss 1 shouldn't fire
        if (this.staticTexture == 'alien-mini-boss') {
            this.canFire = false;
        }
        this.willFire = false;
        this.difficulty = scene.difficulty;

        this.dMultiplier;
        try { // use template level if that scene is it
            this.dMultiplier = scene.getMultiplier();
        } catch (e) {
            this.dMultiplier = this.constants.GetDifficultyMultiplier(this.difficulty);
        }

        this.currentBoss = (this.scene?.currentBoss) ? this.scene.currentBoss : 0;
    }

    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) { // reverse speed direction
            this.willFire = (Math.random() >= 0.5) ? false : true;
            this.xSpeed *= -1;
            this.setVelocity(this.xSpeed, 0);
            this.shield.setVelocity(this.xSpeed, 0);
            this.flipX = !this.flipX;
        }

        // handle firing
        if (this.willFire && Math.abs(this.x - this.constants.Width / 2) < 100) {
            this.fire();
            this.willFire = false;
        }

    }

    /**
     * Launch alien from a random side of the screen and random height.
     * If canFire, then the alien has a 34% chance of stopping at a random space
     * in middle half of screen and firing a bomb at the player.
     */
    launch() {
        this.shieldHP = Math.round(Base_Shield[this.currentBoss] * this.dMultiplier); //Ensure whole numbers
        this.hp = Math.round(Base_Health[this.currentBoss] * this.dMultiplier);
        this.shieldBreak1 = this.shieldHP * 0.66;
        this.shieldBreak2 = this.shieldHP * 0.33;

        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let y = Math.random() * this.maxY * 0.5 + 75;
        this.speed = this.constants.GetSpeed(this.difficulty);
        this.xSpeed = direction * this.speed * 1000;

        this.x = (direction > 0) ? -50 : this.maxX;
        this.setPosition(this.x, y);
        this.setVelocity(this.xSpeed, 0);
        this.anims.play(this.floatTexture);
        this.setActive(true);
        this.setVisible(true);
        this.flipX = direction;

        // no fire

        // give a shield + hp
        this.shield = this.scene.physics.add.sprite(this.x, this.y, 'mini-boss-shield');
        this.shield.setPosition(this.x, y);
        this.shield.setVelocity(this.xSpeed, 0);
        this.shield.setActive(true);
        this.shield.setVisible(true);

        // healthbar
        this.placeHealthbar();
    }

    /**
     * places the sprite statically at x y and makes it visible and active
     * @param {number} x
     * @param {number} y
     */
    place(x, y) {
        this.setPosition(x, y);
        this.setDisplaySize(
            this.constants.Width * 0.05,
            this.constants.Height * 0.07
        );
        this.anims.play(this.floatTexture);

        this.setActive(true);
        this.setVisible(true);
    }

    /**
     * returns the correct spritesheet based on difficulty
     */
     getFireAnimation() {
        return {
            key: this.fireTexture,
            frameRate: (this.difficulty == 3) ? (24 / 4.3) :
                    (this.difficulty == 2) ? (24 / 5.3) : 3
        }
    }

    /**
     * Fires at the player's ship
     *
     * Requires: alien is not dead (signifying it's in flight)
     * Requires: alien has canFire as true meaning it can fire
     * Requires: different animations for charge- different frame num so
     *              easy, med, hard charge times are all represented correctly
     */
     fire() {
        if (this.deadVal || !this.canFire) {
            return;
        }

        // Stop moving and begin animation
        this.setVelocity(0, 0);
        if (this.shield.active) {
            this.shield.setVelocity(0, 0);
        }
        this.anims.play(this.getFireAnimation());
        this.on('animationcomplete', () => {
            this.off('animationcomplete');
            this.anims.play(this.floatTexture);
            this.setVelocity(this.xSpeed, 0);
            if (this.shield.active) {
                this.shield.setVelocity(this.xSpeed, 0);
            }
        });

        this.addProjectile();
    }

     /**
     * Adds a projectile to this scene.
     */
    addProjectile() {
        this.projectile = this.scene.projectiles.get(this.constants.Width, this.constants.Height, this.dMultiplier, 2);
        if (this.projectile) {
            this.projectile.fire(this.x, this.y + this.height * 0.75);
        }
    }

    /**
     * deal damage to this.hp. If 0, kill the alien and return true, else return
     * false. A shield soaks up damage if it exists
     * @param {number} d
     */
    damage(d) {
        if (this.shieldHP > 0) {
            return this.damageShield(d);
        }

        this.hp -= d;
        this.reduceHealthBar(d);

        if (this.hp <= 0) {
            return this.kill();
        }
        this.scene.sound.play('take-damage', { volume: this.scene.game.config.sfxVolume });

        return false;
    }

    /**
     * damages shield with d and applies the correct fram to show its health
     */
    damageShield(d) {
        this.shieldHP -= d;
        this.reduceShieldBar(d);

        if (this.shieldHP <= 0) {
            this.scene.sound.play('glass-break', { volume: this.scene.game.config.sfxVolume });
            setTimeout(() => {
                this.shield.setActive(false);
                this.shield.setVisible(false);
            }, 1000);
            return false;
        } else if (this.shieldHP <= this.shieldBreak2 && this.shieldHP + d > this.shieldBreak2) {
            this.shield.setTexture('mini-boss-shield-break-sheet', 2);
        } else if (this.shieldHP <= this.shieldBreak1 && this.shieldHP + d > this.shieldBreak1) {
            this.shield.setTexture('mini-boss-shield-break-sheet', 1);
        }
        this.scene.sound.play('armor-dink', { volume: this.scene.game.config.sfxVolume });

        return false;
    }

    /**
     * kill the alien and return true
     */
    kill() {
        this.deadVal = true;

        // let projectile handle killed alien
        if (this.projectile && this.projectile.alienKilled()) {
            this.projectile.destroy();
        }

        this.play({ key: 'explode', loop: false, repeat: 2 });
        this.on('animationcomplete', () => {
            this.off('animationcomplete');
            this.setVisible(false);
            this.setActive(false);

            this.mobName.destroy(true);
            this.healthbar.destroy(true);

            setTimeout(() => {
                // Respawn boss as new dude if it's still miniboss type
                this.scene.currentBoss += 1;
                this.canFire = true;
                if (this.scene?.currentBoss < 3) {
                    this.currentBoss = this.scene.currentBoss;
                    this.staticTexture = this.scene.levelData.assets.mini_boss[this.currentBoss];
                    this.floatTexture = this.staticTexture + "-float";
                    this.fireTexture = this.staticTexture + "-fire";
                    this.deadVal = false;
                    this.launch();
                }

                this.scene.events.emit('minibosskilled');
            }, 1000);
        });

        return this.deadVal;
    }

    /**
     * If alien is dead
     * @returns {boolean}
     */
    dead() {
        return this.deadVal;
    }

    /**
     * Causes alien to 'exit' level without exploding or playing any sound effects
     * Places alien underneath player and invisible to allow any active bombs to
     * continue moving
     * @param {boolean?} respawn
     */
    leave() {
        return false;
    }

    /**
     * @returns {number} type of alien
     */
    getType() {
        return 1;
    }

    /**
     * Called when scene receives 'slowaliens' event. Causes aliens to slow down
     * If the timer is already active when another powerup is received, then appends the duration
     * of the timer
     * @param {number} duration time in ms
     */
    slow(duration) {
        // we don't want bosses to be affected by this powerup
        return;
    }

    /**
     * Called when scene receives 'onehitko' event. Kills aliens
     */
    onehitko() {
        // we don't want bosses to be affected by this powerup
        return [0, 0, 0];
    }

    /**
     * Places a healthbar for this alien at the top of the screen in place of
     * the timer (maybe below the timer if that is part of an objective?).
     * The healthbar begins blue and displays the alien's name, then as shield
     * is destroyed, the shield depletes and shows health which eventually leaves too.
     */
    placeHealthbar() {
        // place backbar
        this.healthbar = this.scene.add.image(
            this.constants.Width * 0.5,
            this.constants.Height * 0.1,
            '__WHITE'
        );
        this.healthbar.setDisplaySize(this.constants.Width * 0.35, this.constants.Height * 0.04);
        this.healthbar.setDepth(11).setOrigin(0.5);

        // place title
        this.mobName = this.scene.add.text(
            this.constants.Width * 0.5, 
            this.constants.Height * 0.15,
            this.getName(),
            this.constants.MenuButtonStyle()
        );
        this.mobName.setDepth(11).setOrigin(0.5);

        // place healthbar
        this.healthpips = [];
        let healthpipSize = this.constants.Width * 0.34 / this.hp;
        for (let i = 0; i < this.hp; i++) {
            let healthpip = this.scene.add.image(
                this.constants.Width * 0.33 + i * healthpipSize,
                this.constants.Height * 0.1,
                '__WHITE'
            );
            healthpip.setDisplaySize(healthpipSize, this.constants.Height * 0.035);
            healthpip.setDepth(11).setOrigin(0, 0.5).setTint(0xFF0000);

            this.healthpips.push(healthpip);
        }

        // place shieldbar
        this.shieldpips = [];
        let shieldpipSize = this.constants.Width * 0.34 / this.shieldHP;
        for (let i = 0; i < this.shieldHP; i++) {
            let shieldpip = this.scene.add.image(
                this.constants.Width * 0.33 + i * shieldpipSize,
                this.constants.Height * 0.1,
                '__WHITE'
            );
            shieldpip.setDisplaySize(shieldpipSize, this.constants.Height * 0.035);
            shieldpip.setDepth(11).setOrigin(0, 0.5).setTint(this.constants.LightBlue);

            this.shieldpips.push(shieldpip);
        }
    }

    /**
     * for gauntlet -- if this.scene.currentBoss, then returns the correct name
     */
    getName() {
        if (this.scene?.currentBoss) {
            switch(this.scene.currentBoss) {
                case 0: {
                    return 'General';
                }
                case 1: {
                    return 'Commander';
                }
                case 2: {
                    return 'Chancellor';
                }
            }
        }
        return (this.staticTexture == 'alien-mini-boss-2') ? 'Commander' :
            (this.staticTexture == 'alien-mini-boss-3') ? 'Chancellor' : 'General';
    }

    /**
     * Destroys and pops d pips from this.healthpips. if it's empty, then stops
     * @param {number} d
     */
    reduceHealthBar(d) {
        for (let i = 0; i < d; i++) {
            let pip = this.healthpips.pop();
            if (!pip) {
                break;
            }

            pip.destroy(true);
        }
    }

    /**
     * Destroys and pops d pips from this.shieldpips. if it's empty, then stops
     * @param {number} d
     */
    reduceShieldBar(d) {
        for (let i = 0; i < d; i++) {
            let pip = this.shieldpips.pop();
            if (!pip) {
                break;
            }

            pip.destroy(true);
        }
    }
}
