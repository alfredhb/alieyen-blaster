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
        // Story button
        const storyButton = this.add.image(width * 0.25, height * 0.5, 'story-button').setDisplaySize(width * 0.5, height);
        this.add.text(storyButton.x, storyButton.y, 'Story', {
            fontSize: "50px",
            color: "#FFFFFF"
        }).setOrigin(0.5);
    
        // Arcade button
        const arcadeButton = this.add.image(width * 0.75, height * 0.5, 'arcade-button').setDisplaySize(width * 0.5, height);
        this.add.text(arcadeButton.x, arcadeButton.y, 'Arcade', {
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

        this.buttons = [storyButton, arcadeButton, qButton]
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
        storyButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
        arcadeButton.on('pointerup', () => {
            this.scene.start('arcadeMenu');
        });
        qButton.on('pointerup', () => {
            this.scene.start('startMenu');
        });
    }
}