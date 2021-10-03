import Phaser from 'phaser';

export default class MenuScene1 extends Phaser.Scene {
    
    constructor() {
        super('mainMenu')
    }

    preload() {
    }

    create() {
        const { width, height } = this.scale;
        
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        // Singlelplayer button
        const spButton = this.add.image(width * 0.25, height * 0.5, 'big-button').setDisplaySize(width * 0.5, height);
        this.add.text(spButton.x, spButton.y, 'Singlelplayer', {
            fontSize: "50px",
            color: "#FFFFFF"
        }).setOrigin(0.5);
    
        // Multiplayer button
        const mpButton = this.add.image(width * 0.75, height * 0.5, 'big-button').setDisplaySize(width * 0.5, height);
        this.add.text(mpButton.x, mpButton.y, 'Multiplayer', {
            fontSize: "50px",
            color: "#FFFFFF"
        }).setOrigin(0.5);
    
        // Quit button
        const qButton = this.add.image(width * 0.95, height * 0.93, 'small-button').setDisplaySize(50, 50);
        this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);

        this.buttons = [spButton, mpButton, qButton]
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
        spButton.on('pointerup', () => {
            this.scene.start('gamemodeMenu');
        });
        mpButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
        qButton.on('pointerup', () => {
            this.scene.start('startMenu');
        });
    }
}