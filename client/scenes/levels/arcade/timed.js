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

    Turret(turret, cooldownTimer, inCooldown, cooldownEffect) {
        this.turret = turret;
        this.cooldownTimer = cooldownTimer;
        this.inCooldown = inCooldown;
        this.cooldownEffect = cooldownEffect;
    }

    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data
     */
    init(data) {
        this.players = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;

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
        this.constants = new Constants(width, height);

        this.turrets = []
        this.levelFinished = false;

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
        this.timerVal.setText(this.timer.getRemainingSeconds().toString().substr(0,4));
        this.scoreText.setText("Score: " + this.constants.ZeroPad(this.score, 3));

        for (let id in this.turrets) {
            let turret = this.turrets[id];
            if (turret.cooldownTimer) {
                let progress = turret.cooldownTimer.getProgress();
                if (progress == 1) {
                    turret.cooldownEffect.visible = false;
                } else {
                    turret.cooldownEffect.visible = true;
                    let render = Math.floor(360 * progress);
                    turret.cooldownEffect.clear();
                    turret.cooldownEffect.fillStyle(0xFF0000, 0.4);
                    turret.cooldownEffect.moveTo(0, 0);
                    turret.cooldownEffect.arc(0, 0, 32, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(render - 90), true);
                    turret.cooldownEffect.fillPath();
                }
            }
        }

    }

    /**
     * Callback function when game timer runs out. Removes input listeners, timers
     * removes all sprites, transitions to score card scene with resulting score
     * and accuracy.
     */
    endLevel() {
        this.levelFinished = true;

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
     * Add both turrets
     * @param {*} width
     * @param {*} height
     */
     addTurrets(width, height) {
        this.addTurret(width * 0.05, height * 0.85);
        this.addTurret(width * 0.95, height * 0.85);
    }

    /**
     * TODO: Finish adding bullet physics, remove magic numbers, add 2 player logic
     * Adds two turrets one on each side of the screen. If this.players == 1, then
     * mousedown controlls both.
     * @param {number} x
     * @param {number} y
     */
    addTurret(x, y) {
        // Add Assets
        let id = this.turrets.length
        this.turrets.push({
            turret: this.add.image(x, y, 'turret-colored'),
            cooldownTimer: null,
            inCooldown: false,
            cooldownEffect: null
        });
        this.turrets[id].turret.setDisplaySize(50, 250);
        this.turrets[id].turret.setOrigin(0.5);
        this.turrets[id].turret.setDepth(10);

        // Add Bullets
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true,
        });

        // Add Rotation and Bullet Firing
        let fire = (pointer) => {
            this.input.removeListener('pointerdown');

            if (this.levelFinished) {
                return;
            }

            this.turrets[id].cooldownTimer = this.time.addEvent({
                delay: cooldownTime,
                callback: cooldownDone,
                callbackScope: this
            });

            // Rotate turret and fire only if within angle
            let angle = Phaser.Math.Angle.Between(this.turrets[id].turret.x, this.turrets[id].turret.y, pointer.x, pointer.y) + Math.PI / 2;
            if (!(Math.abs(angle) > 1.5)) {
                this.turrets[id].turret.setRotation(angle);
                this.addBullet(this.turrets[id].turret.x, this.turrets[id].turret.y, angle);
            }
        }

        // Add cooldown
        this.turrets[id].inCooldown = false;

        let cooldownTime = 500; // 0.5 sec
        let cooldownDone = () => {
            this.turrets[id].inCooldown = false;
            this.input.on('pointerdown', (pointer) => {
                fire(pointer);
            });
        }

        this.input.on('pointerdown', (pointer) => {
            fire(pointer);
        });

        this.turrets[id].cooldownEffect = this.add.graphics();
        this.turrets[id].cooldownEffect.setPosition(x, y);
        this.turrets[id].cooldownEffect.setDepth(20);
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
            bullet.setDepth(8);
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

        // Place Timer on Hud TIME: 0.00
        // TODO: place over actual spot
        // TODO: convert to const style for common texts
        this.timerText = this.add.text(
            width * 0.025,
            height * 0.915,
            'TIME:',
            this.constants.TimerStyle(),
        )
        this.timerVal = this.add.text(
            width * 0.1125,
            height * 0.915,
            this.timer.getRemainingSeconds().toString().substr(0,4),
            this.constants.TimerStyle(),
        );
        this.timerText.setDepth(11);
        this.timerVal.setDepth(11);
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
