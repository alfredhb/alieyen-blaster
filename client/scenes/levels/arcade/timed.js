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
    }

    initHud(width, height) {
        // Add Background
        const bg = this.add.image(width * 0.5, height * 0.5, 'space-bg').setDisplaySize(width, height);

        this.cursor = this.input.activePointer;

        // Add Cockpit

        // Add Tracking turret
        this.addTurret(width, height);

        // Add Time

        // Add Score

        // Quit button
        const quit = new QuitButton(this, 'arcadeMenu');
    }

    // TODO: Finish adding bullet physics, remove magic numbers, replace turret icon
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
}