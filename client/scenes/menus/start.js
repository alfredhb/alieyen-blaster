import Phaser from 'phaser';

export default class MenuScene4 extends Phaser.Scene {
    constructor() {
        super('startMenu')
    }

    create() {
        const { width, height } = this.scale;

        // Background

        // Title
        this.add.text(width * 0.5, height * 0.1, 'Ali-eye-n Blaster 3000', {
            fontFamily: "Lekton",
            fontSize: "50px",
            strokeThickness: 0,
            color: "#FFFFFF"
        }).setOrigin(0.5);

        this.initButtons(width, height);
    }

    initButtons(width, height) {
        // Play Button
        const plButton = this.add.image(width * 0.5, height * 0.7, 'big-button').setDisplaySize(450, 250);
        this.add.text(plButton.x, plButton.y, 'Play!', {
            color: "#FFFFFF"
        }).setOrigin(0.5);

        // Quit Button
        const qButton = this.add.image(width * 0.95, height * 0.93, 'small-button').setDisplaySize(50, 50);
        this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);

        this.buttons = [plButton, qButton]
        // Create Interactives
        for (let button of this.buttons) {
            button.setInteractive();

            button.on('pointerover', () => {
                button.setTint(0x7878ff);
            })
            button.on('pointerout', () => {
                button.clearTint();
            })
        }

        // Set action for specific buttons
        // TODO: implement player count saving and other fntns
        plButton.on('pointerup', () => {
            this.scene.start('mainMenu');
        });
        qButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
    }
}
