import Phaser from "phaser";
import Constants from "../lib/constants";
import Alien from "./alien";

export default class AlienMini extends Alien {
    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene, canFire) {
        super(scene, -50, -50, 'alien-mini-boss');

        let { width, height } = scene.scale;
        this.constants = new Constants(width, height);

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
        this.difficulty = scene.difficulty;

        this.dMultiplier;
        try { // use template level if that scene is it
            this.dMultiplier = scene.getMultiplier();
        } catch (e) {
            this.dMultiplier = this.constants.GetDifficultyMultiplier(this.difficulty);
        }
        this.shieldHP = 20 * this.dMultiplier;
        this.hp = 15 * this.dMultiplier;
        this.shieldBreak1 = 12 * this.dMultiplier;
        this.shieldBreak2 = 7 * this.dMultiplier;

        this.anims.get('mini-boss-float');
    }

    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) { // reverse speed direction
            this.xSpeed *= -1;
            this.setVelocity(this.xSpeed, 0);
            this.shield.setVelocity(this.xSpeed, 0);
        } 

        // no fire stuff yet
    }

    /**
     * Launch alien from a random side of the screen and random height.
     * If canFire, then the alien has a 34% chance of stopping at a random space
     * in middle half of screen and firing a bomb at the player.
     */
    launch() {
        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let y = Math.random() * this.maxY * 0.5 + 75;
        this.speed = this.constants.GetSpeed(this.difficulty);
        this.xSpeed = direction * this.speed * 1000;
        
        this.x = (direction > 0) ? -50 : this.maxX;
        this.setPosition(this.x, y);
        this.setVelocity(this.xSpeed, 0);
        this.anims.play('mini-boss-float');
        this.setActive(true);
        this.setVisible(true);

        // no fire

        // give a shield + hp
        this.shield = this.scene.physics.add.sprite(this.x, this.y, 'mini-boss-shield');
        this.shield.setPosition(this.x, y);
        this.shield.setVelocity(this.xSpeed, 0);
        this.shield.setActive(true);
        this.shield.setVisible(true);
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
        this.anims.play('alien-mini-boss-float');
        
        this.setActive(true);
        this.setVisible(true);
    }

    fire() {
        return;
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
        if (this.hp <= 0) {
            return this.kill();
        }
        this.scene.sound.play('take-damage');

        return false;
    }

    /**
     * damages shield with d and applies the correct fram to show its health
     */
    damageShield(d) {
        this.shieldHP -= d;
        if (this.shieldHP <= 0) {
            this.scene.sound.play('glass-break');
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
        this.scene.sound.play('armor-dink');

        return false;
    }

    /**
     * kill the alien and return true
     */
    kill() {
        this.deadVal = true;

        this.play('explode', { loop: false, volume: 0.25 });
        this.on('animationcomplete', () => {
            this.off('animationcomplete');
            this.setVisible(false);
            this.setActive(false);

            setTimeout(() => {
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
}