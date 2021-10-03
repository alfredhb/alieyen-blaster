import Phaser from 'phaser';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width * 0.5, height * 0.5, 'arcade-bg').setDisplaySize(width, height)

        // Title
        this.add.text(width * 0.4, height * 0.1, 'Arcade', {
            fontFamily: "Lekton",
            fontSize: "50px",
            strokeThickness: 0,
        });
        
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        let textStyle = {
            fontSize: "50px",
            color: "#FFFFFF",
        }

        // Timed button
        const tiButton = this.add.image(width * 0.25, height * 0.35, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        this.add.text(tiButton.x, tiButton.y, 'Timed', textStyle).setOrigin(0.5);
    
        // Endless button
        const enButton = this.add.image(width * 0.75, height * 0.35, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        this.add.text(enButton.x, enButton.y, 'Endless', textStyle).setOrigin(0.5);

        // Lives Button
        const liButton = this.add.image(width * 0.25, height * 0.7, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        this.add.text(liButton.x, liButton.y, 'Timed', textStyle).setOrigin(0.5);
    
        // Gauntlet button
        const gaButton = this.add.image(width * 0.75, height * 0.7, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        this.add.text(gaButton.x, gaButton.y, 'Endless', textStyle).setOrigin(0.5);
    
        // Quit button
        const qButton = this.add.image(width * 0.95, height * 0.93, 'small-button').setDisplaySize(50, 50);
        this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);

        this.buttons = [tiButton, enButton, liButton, gaButton, qButton]
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
        tiButton.on('pointerup', () => {
            this.scene.start('timedArcade');
        });
        enButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
        qButton.on('pointerup', () => {
            this.scene.start('gamemodeMenu');
        });
    }
}
