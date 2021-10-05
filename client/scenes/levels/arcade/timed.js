import Phaser from 'phaser';
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

        // TODO: remove this
        // Temporary timer start
        this.timer.paused = false;
    }

    update() {
        // Update Timer Text
        this.timerText.setText(Math.floor(this.timer.getRemainingSeconds() * 100) / 100);
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
        this.bullets = this.add.group({
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
        let time = 5000; // 5 sec
        let resolveFunc = () => {
            this.input.removeListener('pointerdown');
            console.log("removed listener... which is it?");
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
            Math.floor(this.timer.getRemainingSeconds() * 100) / 100,
            {
                fontFamily: "impact",
                fontSize: "50px",
                color: "#FFF",
            });
        this.timerText.setOrigin(0.5);
    }

    // spawnAliens()
}