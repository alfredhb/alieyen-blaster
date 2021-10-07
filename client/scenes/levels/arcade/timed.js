import Phaser from 'phaser';
import AlienGrunt from '../../../gameobjects/alien_grunt';
import Bullet from '../../../gameobjects/bullet'
import QuitButton from '../../../gameobjects/quit_button';

const alien_grunt_score = 10;

// TODO: move to separate file
const zeroPad = (num, places) => String(num).padStart(places, '0')

// Build Assuming Singleplayer
export default class ArcadeScene1 extends Phaser.Scene {
    constructor() {
        super('timedArcade')
    }

    // Includes the player selection & difficulty selection made in preLevelArcade
    init(data) {
        this.playerCount = data.playerCount;
        this.difficulty = data.difficulty;
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {
        const { width, height } = this.scale;

        // Init Selection Menu


        // Transition to Level

        // Level Content
        // Init Graphics (background, hud, quit)
        this.initHud(width, height);

        // Init Tutorial Screen (overlay)

        // Add Game logic
        this.initTimer(width, height);
        this.initSprites();

        // TODO: remove this
        // Temporary timer start and aliens
        this.score = 0;
        this.timer.paused = false;
        this.alienTimers[0].paused = false;
    }

    update() {
        // Update Timer Text
        this.timerText.setText(this.timer.getRemainingSeconds().toString().substr(0,4));
        this.scoreText.setText("Score: " + zeroPad(this.score, 3));
    }

    // HUD METHODS
    /**
     * Initializes all player / static graphic components
     * @param {number} width 
     * @param {number} height 
     */
    initHud(width, height) {
        // Add Background
        const bg = this.add.image(width * 0.5, height * 0.5, 'space-bg').setDisplaySize(width, height);

        this.cursor = this.input.activePointer;

        // Add Cockpit

        // Add Tracking turret
        this.addTurret(width, height);

        // Add Score counter & ending score card
        this.addScoreCounter(width, height);

        // Quit button
        const quit = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            execFunc: () => { if (this.timer) { this.timer.destroy() }},
        });
    }

    /**
     * TODO: Finish adding bullet physics, remove magic numbers, replace turret icon
     * @param {number} width 
     * @param {number} height 
     */
    addTurret(width, height) {
        // Add Asset
        this.turret = this.add.isotriangle(width * 0.5, height * 0.9, 96, 64, false, 0xFFF).setDisplaySize(25, 125);
        this.turret.setOrigin(0.5);
        this.turret.setDepth(10);

        // Add Bullets
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
        });

        // Add Rotation and Bullet Firing
        this.input.on('pointerdown', (pointer) => {
            // Rotate turret and fire only if within angle
            let angle = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, pointer.x, pointer.y) + Math.PI / 2;
            if (Math.abs(angle) > 1.2) {
                return;
            }

            this.turret.setRotation(angle);

            // Create Bullet
            this.addBullet(angle);
        });
    }

    /**
     * Adds a bullet as long as one can be added, with a collision function which
     * removes the colliding alien and increments score.
     * @param {number} angle
     */
    addBullet(angle) {
        let collisionFunc = (bullet, alien) => {
            console.log("collided!");
            if (alien.active) {
                alien.destroy();
                this.score += alien_grunt_score;
            }
        }

        let bullet = this.bullets.get();
        if (bullet) {
            // Add collider here
            let overlapper = this.physics.add.overlap(
                bullet, 
                this.aliens,
                collisionFunc,
                null, 
                this
            );
            bullet.fire(this.turret.x, this.turret.y + 50, angle);
        }
    }

    /**
     * Adds a score counter location, must be updated by updates
     * @param {number} width 
     * @param {number} height 
     */
    addScoreCounter(width, height) {
        this.scoreText = this.add.text(
            width * 0.8,
            height * 0.1,
            "Score: " + zeroPad(this.score, 3),
            {
                fontFamily: "impact",
                fontSize: "50px",
                color: "#FFF",
            });
    }

    /**
     * Create a final score card detailing how many points scored, and what
     * the points come from, and option to restart or quit
     * @param {number} width 
     * @param {number} height 
     */
    addScoreTitleCard(width, height) {
        return;
    }

    // GAME LOGIC METHODS
    /**
     * Create a time (ms), timer which calls resolveFunc on completion
     * @param {number} width 
     * @param {number} height 
     */
    initTimer(width, height) {
        // Create Timer Event
        let time = 10000; // 5 sec
        let resolveFunc = () => {
            this.input.removeListener('pointerdown');
            console.log("removed listener... which is it?");

            // Stop Aliens spawn
            // Start Score Calc and Display Logic
            console.log("Scored: ", this.score);
            console.log("Max Score: ", this.alienTimers.length * 10);
        }
        this.timer = this.time.addEvent({
            delay: time,
            callback: resolveFunc,
            callbackScope: this,
            loop: false,
            paused: true,
        });

        // Place Timer on Hud
        // TODO: place over actual spot
        // TODO: convert to const style for common texts
        this.timerText = this.add.text(
            width * 0.1,
            height * 0.9,
            this.timer.getRemainingSeconds().toString().substr(0,4), {
                fontFamily: "impact",
                fontSize: "50px",
                color: "#FFF",
        });
    }

    initSprites() {
        // Create Alien group - only 5 can by visible at one time
        this.aliens = this.physics.add.group({
            classType: AlienGrunt,
            runChildUpdate: true,
            maxSize: 25,
        });

        // Total delay of all aliens should be half of duration of timer
        // Create a list of timers which on end, spawn an alien
        this.alienTimers = [];
        this.ailensSpawned = 0;
        let totalDelay = 0;
        while (totalDelay < (this.timer.getOverallRemaining() / 2)) {
            let alien = this.aliens.get();
            let spawnStartNext = () => {
                alien.launch(this.difficulty);

                this.ailensSpawned += 1;
                if (this.ailensSpawned == this.alienTimers.length) {
                    return;
                }

                // Start next timer
                this.alienTimers[this.ailensSpawned].paused = false;
            };

            let delay = Phaser.Math.RND.between(100, 1000);
            let alienTimer = this.time.addEvent({
                delay: delay,
                callback: spawnStartNext,
                callbackScope: this,
                loop: false,
                paused: true,
            })

            this.alienTimers.push(alienTimer);

            // Increment delay
            totalDelay += delay;
            console.log(totalDelay);
        }
    }
}