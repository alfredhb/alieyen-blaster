import Phaser from 'phaser';

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
        this.add.image(width * 0.5, height * 0.5, 'space-bg').setDisplaySize(width, height)

        // Add Cockpit

        // Add Time

        // Add Score

        // Quit button
        const qButton = this.add.image(width * 0.95, height * 0.93, 'small-button').setDisplaySize(50, 50);
        const qText = this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);
        const qSound = this.menuSounds.menuClick;

        qButton.setInteractive()
        .on('pointerover', () => {
            qButton.setTint(0xFF0000);
            qText.setTint(0xFFF);
            // buttonObj.sound.play(); // Play the saved sound
        }).on('pointerout', () => {
            qButton.clearTint();
            qText.clearTint();
        }).on('pointerup', () => {
            qSound.play();
            this.scene.start('arcadeMenu');
        })
    }
}