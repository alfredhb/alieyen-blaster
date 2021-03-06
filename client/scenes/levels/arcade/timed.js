import Phaser from 'phaser';
import Constants from '../../../lib/constants';
import AlienGrunt from '../../../gameobjects/alien_grunt';
import Bullet from '../../../gameobjects/bullet'
import QuitButton from '../../../gameobjects/quit_button';

const alien_grunt_score = 10;

// add level reset, input changes, turrets no longer need to be separated by input

class Turret {
    constructor(turret, cooldownTimer, inCooldown, cooldownEffect) {
        this.turret = turret;
        this.cooldownTimer = cooldownTimer;
        this.inCooldown = inCooldown;
        this.cooldownEffect = cooldownEffect;
    }
}

// Build Assuming Singleplayer
export default class ArcadeScene1 extends Phaser.Scene {
    constructor() {
        super('timedArcade')
    }

    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number, players: string[]}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data
     */
    init(data) {
        this.playerCount = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;
        this.players = data.meta.players; // [0] == player1, [1] ?== player2 |'bubba' means eye tracking

        this.scores = data.hasOwnProperty("level") ? [data.level.score1, 0] : [0, 0]
        this.turn = data.hasOwnProperty("level") ? data.level.turn : 0;

        // Level Data
        this.pointers = [];
        this.bullets = []; // # entries for # players
        this.turrets = []; // # entries for # players
        this.totalShots = 0;
        this.levelFinished = false;

        console.log("initialized TimedMenu for " + this.playerCount + " players.\n"
        + "Player 1 is: " + this.players[0] + ((this.playerCount == 2) ?
        (", Player 2 is: " + this.players[1]) : ""));
    }

    preload() {
        // Load Sounds
        this.levelSounds = {
            menuClick: this.sound.get('menu-click'),
            explode: this.sound.get('explode-3'),
        }

    }

    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

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

        this.scoreText.setText("Score: " + this.constants.ZeroPad(this.scores[this.turn], 3));

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
                    turret.cooldownEffect.fillStyle(this.constants.Red, 0.4);
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
        // this.aliens.getChildren().forEach(a => a.play('explode'));
        this.aliens.getChildren().forEach(a => a.leave());

        setTimeout(() => {
            try {
                this.aliens.destroy(false, true);
                this.bullets.forEach(b => b.destroy(false, true));
            } catch (e) {
                // Catch any errors thrown here and log.
                console.log(e);
            }

            if (this.turn == 0 && this.playerCount == 2) {
                this.scene.start('arcadeReadyScene', {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                        levelName: 'timedArcade',
                    },
                    level: {
                        score1: this.scores[0],
                        score2: 0,
                        shotsFired: this.totalShots,
                        turn: 1,
                    },
                    scene: {
                        prevScene: {
                            name: 'timedArcade',
                            type: 'ARCADE',
                        }
                    }
                });
            } else {
                // Transition to report card scene TODO
                this.scene.start('arcadeReportScene', {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                    },
                    level: {
                        score1: this.scores[0],
                        score2: this.scores[1],
                        shotsFired: this.totalShots,
                    },
                    scene: {
                        prevScene: {
                            name: 'timedArcade',
                            type: 'ARCADE',
                        }
                    }
                });
            }
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

        // Quit button
        const quit = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            execFunc: () => { if (this.timer) { this.timer.destroy() }},
            data: {
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    players: this.players,
                }
            },
        });

        this.scoreText = this.add.text(width * 0.1, height * 0.1, "Score: 000", this.constants.MenuButtonStyle()).setOrigin(0.5);
        this.scoreText.setDepth(10);

    }

    /**
     * Add both turrets
     * @param {number} width
     * @param {number} height
     */
     addTurrets(width, height) {
        let event = (this.players[this.turn] == 'bubba') ? 'pointermove' : 'pointerup';
        this.addTurret(width * 0.05, height * 0.85, event);
        this.addTurret(width * 0.95, height * 0.85, event);
    }

    /**
     * TODO: Finish adding bullet physics, remove magic numbers, add 2 player logic
     * Adds two turrets one on each side of the screen. If this.players == 1, then
     * mousedown controlls both.
     * @param {number} x
     * @param {number} y
     * @param {string} pointerEvent
     */
    addTurret(x, y, pointerEvent) {
        // Add Assets
        let id = this.turrets.length;
        this.turrets.push(new Turret(
            this.add.image(x, y, 'turret-colored'),
            null,
            false,
            null
        ));
        this.turrets[id].turret.setDisplaySize(50, 250);
        this.turrets[id].turret.setOrigin(0.5);
        this.turrets[id].turret.setDepth(10);

        // Add Bullets
        this.bullets.push(
            this.physics.add.group({
                classType: Bullet,
                runChildUpdate: true,
            })
        );

        // Add Rotation and Bullet Firing
        let fire = (pointer) => {
            this.input.removeListener(pointerEvent)

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
                this.addBullet(id, this.turrets[id].turret.x, this.turrets[id].turret.y, angle);
            }
        }

        let captureInputCallback = () => {
            // Use correct turret pointerdata
            // if (pointerEvent == 'pointermove') {
            //     fire(this.pointers[id]);
            //     return;
            // }
            this.input.on(pointerEvent, (pointer) => {
                fire(this.input.activePointer);
            });
        }

        // Add cooldown
        this.turrets[id].inCooldown = false;

        let cooldownTime = 500; // 0.5 sec
        let cooldownDone = () => {
            this.turrets[id].inCooldown = false;
            captureInputCallback();
        }

        captureInputCallback();

        this.turrets[id].cooldownEffect = this.add.graphics();
        this.turrets[id].cooldownEffect.setPosition(x, y);
        this.turrets[id].cooldownEffect.setDepth(20);
    }

    /**
     * Adds a bullet as long as one can be added, with a collision function which
     * removes the colliding alien and increments score.
     * @param {number} turret_id
     * @param {number} x position of turret
     * @param {number} y position of turret
     * @param {number} angle
     */
    addBullet(turret_id, x, y, angle) {
        let bullet = this.bullets[turret_id].get(this.players[this.turn]);
        if (bullet) {
            // Add collider here
            let overlapper = this.physics.add.overlap(
                bullet,
                this.aliens,
                this.collisionFunc,
                null, /* whether to call collisionfunc */
                this /* callback scope */
            );
            bullet.fire(turret_id, x, y + 50, angle);

            // Inc total shot count
            this.totalShots += 1;
            bullet.setDepth(8);
        }
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
        this.explode = this.anims.get('explode');
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

            this.scores[this.turn] += alien_grunt_score;
        }
    }
}
