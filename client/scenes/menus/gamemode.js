import Phaser from 'phaser';

export default class MenuScene2 extends Phaser.Scene {
    constructor() {
        super('gamemodeMenu')
    }

    preload() {
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width * 0.3, height * 0.1, 'Select Gamemode', {
            fontFamily: "Lekton",
            fontSize: "50px",
            strokeThickness: 0,
        });
        
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        // Singlelplayer button
        const stButton = this.add.image(width * 0.3, height * 0.6, 'big-button').setDisplaySize(250, 350);
        this.add.text(stButton.x, stButton.y, 'Story', {
            color: "#000000"
        }).setOrigin(0.5);
    
        // Multiplayer button
        const arButton = this.add.image(width * 0.7, height * 0.6, 'big-button').setDisplaySize(250, 350);
        this.add.text(arButton.x, arButton.y, 'Arcade', {
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

        this.buttons = [stButton, arButton, qButton]
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
        stButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
        arButton.on('pointerup', () => {
            this.scene.start('arcadeMenu');
        });
        qButton.on('pointerup', () => {
            this.scene.start('mainMenu');
        });
    }
}