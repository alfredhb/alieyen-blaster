import Phaser from 'phaser';
import Constants from '../../../lib/constants';
import AlienGrunt from '../../../gameobjects/alien_grunt';
import Bullet from '../../../gameobjects/bullet'
import QuitButton from '../../../gameobjects/quit_button';

const alien_grunt_score = 10;

// Build Assuming Singleplayer
export default class ArcadeScene1 extends Phaser.Scene {
    constructor() {
        super('timedArcade')
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data 
     */
    init(data) {
        this.players = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;

        this.constants = new Constants();
        this.score = 0;
        this.totalShots = 0;

        console.log("initialized TimedMenu for ", this.players, " players")
    }

    preload() {
        // Load Sounds
        this.levelSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
            explode: this.sound.add('explode-3', { loop: false, volume: 0.35 }),
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
        this.initAnimations();

        // TODO: remove this
        // Temporary timer start and aliens
        this.timer.paused = false;
        this.alienTimers[0].paused = false;
    }

    update() {
        // Update Timer Text
        this.timerText.setText(this.timer.getRemainingSeconds().toString().substr(0,4));
        this.scoreText.setText("Score: " + this.constants.ZeroPad(this.score, 3));
    }

    /**
     * Callback function when game timer runs out. Removes input listeners, timers
     * removes all sprites, transitions to score card scene with resulting score
     * and accuracy.
     */
    endLevel() {
        this.input.removeListener('pointerdown');

        // Destroy timers
        this.timer.destroy();
        this.alienTimers.forEach(t => t.destroy());

        // Kill all sprites
        this.aliens.getChildren().forEach(a => a.play('explode'));

        setTimeout(() => {
            try {
                this.aliens.destroy(false, true);
                this.bullets.destroy(false, true);
            } catch (e) {
                // Catch any errors thrown here and log.
                console.log(e);
            }

            // Start Score Calc and Display Logic TODO remove me
            console.log("Scored: ", this.score);

            // Transition to report card scene TODO
            this.scene.start('arcadeReportScene', {
                meta: {
                    playerCount: this.players,
                    difficulty: this.difficulty,
                },
                level: {
                    score: this.score,
                    shotsFired: this.totalShots,
                },
                scene: {
                    prevScene: {
                        name: 'timedArcade',
                        type: 'ARCADE',
                    }
                }
            }
            )
        }, 300);
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

        // Add Cockpit TODO
        const cockpit = this.add.image(width * 0.5, height * 0.5, 'arcade-hud').setDisplaySize(width, height);
        cockpit.setDepth(11);

        // Add Tracking turret
        this.addTurrets(width, height);

        // Add Score counter & ending score card
        this.addScoreCounter(width, height);

        // Quit button
        const quit = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            execFunc: () => { if (this.timer) { this.timer.destroy() }},
            data: { 
                meta: {
                    playerCount: this.players,
                    difficulty: this.difficulty,
                }
            },
        });
    }

    /**
     * TODO: Finish adding bullet physics, remove magic numbers, add 2 player logic
     * Adds two turrets one on each side of the screen. If this.players == 1, then
     * mousedown controlls both.
     * @param {number} width 
     * @param {number} height 
     */
    addTurrets(width, height) {
        // Add Assets
        this.turretLeft = this.add.image(width * 0.05, height * 0.9, 'turret-colored');
        this.turretLeft.setDisplaySize(50, 250);
        this.turretLeft.setOrigin(0.5);
        this.turretLeft.setDepth(10);

        this.turretRight = this.add.image(width * 0.95, height * 0.9, 'turret-colored');
        this.turretLeft.setDisplaySize(50, 250);
        this.turretLeft.setOrigin(0.5);
        this.turretLeft.setDepth(10);

        // Add Bullets
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
        });

        // Add Rotation and Bullet Firing
        this.input.on('pointerdown', (pointer) => {
            // Rotate turret and fire only if within angle
            let angleLeft = Phaser.Math.Angle.Between(this.turretLeft.x, this.turretLeft.y, pointer.x, pointer.y) + Math.PI / 2;
            if (!(Math.abs(angleLeft) > 1.5)) {
                this.turretLeft.setRotation(angleLeft);
                this.addBullet(this.turretLeft.x, this.turretRight.y, angleLeft);
            }

            // Rotate turret and fire only if within angle
            let angleRight = Phaser.Math.Angle.Between(this.turretRight.x, this.turretRight.y, pointer.x, pointer.y) + Math.PI / 2;
            if (!(Math.abs(angleRight) > 1.5)) {
                this.turretRight.setRotation(angleRight);
                this.addBullet(this.turretRight.x, this.turretRight.y, angleRight);
            }
        });
    }

    /**
     * Adds a bullet as long as one can be added, with a collision function which
     * removes the colliding alien and increments score.
     * @param {number} x position of turret
     * @param {number} y position of turret
     * @param {number} angle
     */
    addBullet(x, y, angle) {
        let bullet = this.bullets.get();
        if (bullet) {
            // Add collider here
            let overlapper = this.physics.add.overlap(
                bullet, 
                this.aliens,
                this.collisionFunc,
                null, 
                this
            );
            bullet.fire(x, y + 50, angle);

            // Inc total shot count
            this.totalShots += 1;
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
            "Score: " + this.constants.ZeroPad(this.score, 3),
            this.constants.MenuButtonStyle()
        );
        this.scoreText.setDepth(10);
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
        let time = 10000; // 10 sec
        this.timer = this.time.addEvent({
            delay: time,
            callback: this.endLevel,
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
            this.timer.getRemainingSeconds().toString().substr(0,4),
            this.constants.MenuButtonStyle("0x000000")
        );
        this.timerText.setDepth(11);
    }

    /**
     * Returns the max number of aliens to create depending on difficulty
     */
    maxAliens() {
        switch (this.difficulty) {
            case 1:
                return 5;
            case 2:
                return 7;
            case 3:
                return 10;
            default:
                return 5;
        }
    }

    /**
     * Creates alien physics group and generates this.maxAliens children with
     * timers for when they are set to initially spawn.
     */
    initSprites() {
        // Create Alien group - only 5 can by visible at one time
        this.aliens = this.physics.add.group({
            classType: AlienGrunt,
            runChildUpdate: true,
            maxSize: this.maxAliens(), // Max aliens on the screen at once
        });

        // Total delay of all aliens should be half of duration of timer
        // Create a list of timers which on end, spawn an alien
        this.alienTimers = [];
        this.ailensSpawned = 0;
        while (this.alienTimers.length < this.maxAliens()) {
            let alien = this.aliens.get();
            if (alien) {
                let spawnStartNext = () => {
                    alien.stop(); // stop animations
                    alien.launch();

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
            }
        }
    }

    /**
     * Create any global animations unrelated to a specific sprite
     */
    initAnimations() {
        this.explode = this.anims.create({
                key: 'explode', 
                frames: [
                    {key: 'ex-1'},
                    {key: 'ex-2'},
                    {key: 'ex-3'},
                ], 
                repeat: 1,
            });
    }

    /**
     * Callback function when a bullet and an alien overlap. if the alien is
     * alive and the bullet is active, then destroy the alien (allowing respawn)
     * and increment score
     * @param {Phaser.Physics.Arcade.Sprite} bullet 
     * @param {Phaser.Physics.Arcade.Sprite} alien 
     */
    collisionFunc(bullet, alien) {
        if (!alien.dead() && bullet.active) {
            this.levelSounds.explode.play();
            bullet.kill();
            alien.kill();
            
            this.score += alien_grunt_score;
        }
    }
}