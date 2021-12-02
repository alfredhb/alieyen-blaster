import Phaser from "phaser";
import Constants from "../../lib/constants";

export default class Health extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        super(scene, -50, -50, 'full-heart-outline');

        const { width, height } = scene.scale;
        this.constants = new Constants(width, height);
        this.difficulty = this.scene.levelData.meta.difficulty;
        
        // Add to physics and canvas
        scene.physics.add.existing(this);
        this.setInteractive();
        this.setPosition(width * 0.5, height + 50);
        this.setDisplaySize(width * 0.09, width * 0.09);
        this.setSize(this.width * 0.9, this.height * 0.9);
        this.setOrigin(0.5);

        this.maxX = width + 65;
        this.maxY = height + 65;
        
        // Whether player has tagged the powerup
        this.hit = false;
    }

    /**
     * update position and determine respawn if offscreen
     * @param {number} time 
     * @param {numer} delta 
     */
    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) {
            this.setActive(false);
            this.setVisible(false);

            // respawn logic
            this.launch();
        }
    } 

    /**
     * Determine when to fire the powerup, what speed, and from what height.
     * Powerups move faster in harder difficulties XD
     */
    launch() {
        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let y = Math.random() * this.maxY * 0.5 + 75;
        this.speed = this.constants.GetSpeed(this.difficulty);
        this.xSpeed = direction * this.speed * 1000;

        // spawn the powerup based on the above consts
        let spawnFunc = () => {
            this.removeListener('animationcomplete')
            this.setPosition((direction > 0) ? -45 : this.maxX - 5, y);
            this.setVelocity(this.xSpeed, 0);
            this.setActive(true);
            this.setVisible(true);
            this.hit = false;
        }

        this.spawnTimer = this.scene.time.addEvent({
            delay: this.scene.levelData.level.powerup_spawnrate * this.difficulty, //spawn at 3 or 6 or 9 sec
            callback: spawnFunc,
            callbackScope: this,
            loop: false,
            paused: true,
        });
    }

    /**
     * start the spawnTimer
     */
    spawn() {
        this.spawnTimer.paused = false;
    }

    /**
     * Bullet collided with health. Emit healplayer with heal amount the sprite is
     * worth. 
     */
    collisionFunc(p, b) {
        if (this.hit) return;
        if (!b.active) return;
        
        b.kill();
        this.scene.events.emit('healplayer', (1 /* amount to heal */));

        this.destruct();
    }

    /**
     * play a collision animation,
     */
    destruct() {
        this.hit = true;

        /*
        TODO:
        - add hit sound
        - play hit animation
        - hide and move content on animationcomplete
        */
        this.scene.sound.play('collect-powerup', { volume: this.scene.game.config.sfxVolume });
        this.play('collect-powerup-animation');
        this.on('animationcomplete', () => {
            this.setVelocity(0);
            this.setPosition(this.constants.Width * 0.5, this.maxY);
            this.setVisible(false);
            this.setActive(false);

            // Respawn it after spawn time
            this.setTexture('full-heart-outline')
            this.launch();
        });
    }
}
