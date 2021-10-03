import Phaser from 'phaser';

export default class MenuScene4 extends Phaser.Scene {
    constructor() {
        super('startMenu')
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width * 0.5, height * 0.5, 'space-bg').setDisplaySize(width, height)

        // Title
        this.add.text(width * 0.5, height * 0.1, 'Ali-eye-n Blaster 3000', {
            fontFamily: "Lekton",
            fontSize: "50px",
            strokeThickness: 0,
            color: "#FFFFFF"
        }).setOrigin(0.5);

        // Buttons
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        // Play Button
        const plButton = this.add.image(width * 0.5, height * 0.7, '__WHITE').setDisplaySize(450, 250);
        const plText = this.add.text(plButton.x, plButton.y, 'Play!', {
            color: "#FF0000",
            fontSize: "50px",
        }).setOrigin(0.5);
        const plSound = this.menuSounds.menuClick;

        // Quit Button
        const qButton = this.add.image(width * 0.95, height * 0.93, '__WHITE').setDisplaySize(50, 50);
        const qText = this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);
        const qSound = this.menuSounds.menuClick;

        this.buttons = [
            {button: plButton, text: plText, sound: plSound},
            {button: qButton, text: qText, sound: qSound}
        ];
        // Create Interactives
        for (let buttonObj of this.buttons) {
            buttonObj.button.setInteractive();

            buttonObj.button.on('pointerover', () => {
                buttonObj.button.setTint(0xFF0000);
                buttonObj.text.setTint(0xFFF);
                // buttonObj.sound.play(); // Play the saved sound
            });
            buttonObj.button.on('pointerout', () => {
                buttonObj.button.clearTint();
                buttonObj.text.clearTint();
            });
            buttonObj.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
            })
        }

        // Set action for specific buttons
        plButton.on('pointerup', () => {
            this.scene.start('gamemodeMenu');
        });
        qButton.on('pointerup', () => {
            console.log('Unimplemented');
            qSound.play()
        });
    }
}
