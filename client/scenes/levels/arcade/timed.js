import Phaser from 'phaser';
import AlienGrunt from '../../../gameobjects/alien_grunt';
import Bullet from '../../../gameobjects/bullet'
import QuitButton from '../../../gameobjects/quit_button';

// Build Assuming Singleplayer
export default class ArcadeScene1 extends Phaser.Scene {
    constructor() {
        super('timedArcade')
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {
        const { width, height } = this.scale;
        this.add.text(20, 20, 'Loading..')

        // Init Graphics (background, hud, quit)
        this.initHud(width, height);

        // Init Tutorial Screen (overlay)

        // Add Game logic
        this.initTimer(width, height);
        this.initSprites();
        this.initCollisions();

        // TODO: remove this
        // Temporary timer start and aliens
        this.score = 0;
        this.timer.paused = false;
        this.alienTimers[0].paused = false;
    }

    update() {
        // Update Timer Text
        this.timerText.setText(this.timer.getRemainingSeconds().toString().substr(0,4));
    }

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

        // Add Time
        this.initTimer();

        // Add Score

        // Quit button
        const quit = new QuitButton(this, 'arcadeMenu');
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

            let bullet = this.bullets.get();
            if (bullet) {
                bullet.fire(this.turret.x, this.turret.y + 50, angle);
            }
        })
    }

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
            this.colliderFunc.destroy();
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
                alien.launch(1);

                this.ailensSpawned += 1;
                if (this.ailensSpawned + 1 == this.alienTimers.length) {
                    return;
                }

                // Start next timer
                this.alienTimers[this.ailensSpawned + 1].paused = false;
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

    // Initialize a collider between bullet and alien sprite types
    // Destroy the alien on collision and increment a score var
    initCollisions(width, height) {
        // Alien dies, bullet continues
        let collisionFunc = (obj1, obj2) => {
            this.score += 10;

            obj2.destroy();
            console.log("alien killed, score: ", this.score)
        }

        this.physics.world = this.physics.world.setBounds(0, 0, width, height, false, false, false, false);

        // this.collisionFunc = this.physics.add.collider(
        //     this.bullets,
        //     this.aliens,
        //     collisionFunc,
        //     true, 
        //     this
        // );

        this.colliderFunc = this.physics.add.overlap(
            this.bullets,
            this.aliens,
            collisionFunc,
            null,
            this
        );
        console.log(this.bullets, this.aliens, this.colliderFunc);
    }
}