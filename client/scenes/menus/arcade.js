import Phaser from 'phaser';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width * 0.4, height * 0.1, 'Arcade', {
            fontFamily: "Lekton",
            fontSize: "50px",
            strokeThickness: 0,
        });
        
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        // Singlelplayer button
        const tiButton = this.add.image(width * 0.3, height * 0.6, 'big-button').setDisplaySize(200, 200);
        this.add.text(tiButton.x, tiButton.y, 'Timed', {
            color: "#000000"
        }).setOrigin(0.5);
    
        // Multiplayer button
        const enButton = this.add.image(width * 0.7, height * 0.6, 'big-button').setDisplaySize(200, 200);
        this.add.text(enButton.x, enButton.y, 'Endless', {
            color: "#000000"
        }).setOrigin(0.5);
    
        // Quit button
        const qButton = this.add.image(width * 0.95, height * 0.93, 'small-button').setDisplaySize(50, 50);
        this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);

        this.buttons = [tiButton, enButton, qButton]
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
