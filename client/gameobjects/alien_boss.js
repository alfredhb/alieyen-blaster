import Constants from "../lib/constants";
import Alien from "./alien";

const BASE_HEALTH = 100;

export default class AlienBoss extends Alien {    
    /**
     * @param {Phaser.Scene} scene
     */
     constructor(scene) {
        super(scene, -50, -50, 'alien-boss');

        let { width, height } = scene.scale;
        this.constants = new Constants(width, height);

        this.staticTexture = 'alien-boss';
        this.floatTexture = 'alien-boss-float';
        this.fireTexture = 'alien-boss-fire';
        this.stunTexture = 'alien-boss-stun';

        scene.physics.add.existing(this);
        this.setInteractive();
        this.setPosition(width + 50, height + 50);
        this.setDisplaySize(width * 0.03, height * 0.05);
        this.body.setSize(width * 0.2, height * 0.1, false);
        this.setOffset(this.displayWidth * 1.5, this.displayHeight * 1.5);

        this.maxX = width + 65;
        this.maxY = height + 65;
        this.difficulty = scene.difficulty;

        this.dMultiplier;
        try { // use template level if that scene is it
            this.dMultiplier = scene.getMultiplier();
        } catch (e) {
            this.dMultiplier = this.constants.GetDifficultyMultiplier(this.difficulty);
        }

        this.willFire = false;
    }

    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) { // reverse speed direction
            this.willFire = (Math.random() >= 0.3) ? false : true;
            this.xSpeed *= -1;
            this.setVelocity(this.xSpeed, 0);
            this.shield.setVelocity(this.xSpeed, 0);
            this.flipX = !this.flipX; // set correct orientation
        }

        // handle firing
        if (this.willFire && Math.abs(this.x - this.constants.Width / 2) < 100) {
            this.fire();
            this.willFire = false;
        }
    }

    launch() {
        this.hp = Math.round(BASE_HEALTH * this.dMultiplier);

        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let y = this.constants.Height * 0.3;
        this.speed = this.constants.GetSpeed(this.difficulty);
        this.xSpeed = direction * this.speed * 1000;

        this.x = (direction > 0) ? -50 : this.maxX;
        this.setPosition(this.x, y);
        this.setVelocity(this.xSpeed, 0);
        this.anims.play(this.floatTexture);
        this.setActive(true);
        this.setVisible(true);
        this.flipX = direction;

        // give an infinite shield
        this.shield = this.scene.physics.add.sprite(this.x, this.y, 'mini-boss-shield');
        this.shield.setPosition(this.x, y);
        this.shield.setVelocity(this.xSpeed, 0);
        this.shield.setActive(true);
        this.shield.setVisible(true);

        // healthbar
        this.placeHealthbar();
    }

    fire() {
        if (this.deadVal || this.emped) {
            return;
        }

        // Stop moving and begin animation
        this.setVelocity(0, 0);
        this.toggleShield(0);
        this.anims.play({
            key: this.fireTexture,
            frameRate: (this.difficulty == 3) ? (20 / 4.3) : (this.difficulty == 2) ? (20 / 5.3) : 3
        });
        this.on('animationcomplete', () => {
            this.off('animationcomplete');
            this.anims.play(this.floatTexture);
            this.setVelocity(this.xSpeed, 0);
            this.toggleShield(this.xSpeed);
        });

        this.addProjectile();
    }

    /**
    * Adds a projectile to this scene. BOSS DEALS 3 HP
    */
   addProjectile() {
       this.projectile = this.scene.projectiles.get(this.constants.Width, this.constants.Height, this.dMultiplier, 3);
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
        if (this.shield.visible) {
            this.scene.sound.play('armor-dink', { volume: this.scene.game.config.sfxVolume });
            return; // no damage if not empd
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
     * kill the alien and return true
     */
    kill() {
        this.deadVal = true;

        // let projectile handle killed alien
        if (this.projectile && this.projectile.alienKilled()) {
            this.projectile.destroy();
        }

        this.play({ key: 'explode', loop: false, repeat: 4 });
        this.on('animationcomplete', () => {
            this.off('animationcomplete');
            this.setVisible(false);
            this.setActive(false);
            this.shield.setVisible(false);
            this.shield.setActive(false);

            this.mobName.destroy(true);

            setTimeout(() => {
                this.scene.events.emit('bosskilled');
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
        return 2; //boss!
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

    emp(duration) {
        // Destroy projectile if empd
        if (this.projectile) {
            this.projectile.chargeSound.stop();
            this.projectile.destroy();
        }

        if (this.empTimer && this.empTimer.getProgress() < 1) {
            this.empTimer.delay += duration;
            return;
        }

        this.empTimer = this.scene.time.addEvent({
            delay: duration,
            callback: () => {
                this.emped = false;
                // set different texture
                this.anims.play(this.floatTexture);
                this.setVelocity(this.xSpeed, 0);
                this.toggleShield(this.xSpeed);

                // play powerup sound sound
                this.scene.sound.play('power-up', { volume: this.scene.game.config.sfxVolume });
            }
        });

        this.scene.sound.play('power-down', { volume: 1.5 * this.scene.game.config.sfxVolume });
        setTimeout(() => {
            this.emped = true;
            this.setVelocity(0);
            this.toggleShield(0);
            this.anims.play({
                key: this.stunTexture,
                frameRate: (18 * 1000 / duration)
            });
        }, 500)

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
        const backbar = this.scene.add.image(
            this.constants.Width * 0.5,
            this.constants.Height * 0.1,
            '__WHITE'
        );
        backbar.setDisplaySize(this.constants.Width * 0.35, this.constants.Height * 0.04);
        backbar.setDepth(11).setOrigin(0.5);

        // place title
        this.mobName = this.scene.add.text(
            this.constants.Width * 0.5, 
            this.constants.Height * 0.15,
            'Glorber',
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

        // place infinite shield
        this.shieldbar = this.scene.add.image(
            this.constants.Width * 0.5,
            this.constants.Height * 0.1,
            '__WHITE'
        );
        this.shieldbar.setDisplaySize(this.constants.Width * 0.34, this.constants.Height * 0.035);
        this.shieldbar.setDepth(11).setOrigin(0.5).setAlpha(0.8).setTint(this.constants.LightBlue);
    }

    /**
     * shows or hides the shield depending on its visibility
     */
    toggleShield(xspeed) {
        this.shield.setVisible((xspeed) ? true : false);
        this.shield.setVelocity(xspeed, 0);
        this.shieldbar.setDepth((xspeed) ? 12 : 0);
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
}