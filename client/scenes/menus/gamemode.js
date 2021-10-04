import Phaser from 'phaser';

export default class MenuScene2 extends Phaser.Scene {
    constructor() {
        super('gamemodeMenu')
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {
        const { width, height } = this.scale;
        
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        let textStyle = {
            fontFamily: "Impact",
            fontSize: "100px",
            color: "#FFFFFF",
        }

        // Story button
        const storyButton = this.add.image(width * 0.25, height * 0.5, 'story-button').setDisplaySize(width * 0.5, height);
        const storyText = this.add.text(storyButton.x, storyButton.y, 'Story', textStyle).setOrigin(0.5);
        // TODO: set to TTS of text
        const storySound = this.menuSounds.menuClick;
    
        // Arcade button
        const arcadeButton = this.add.image(width * 0.75, height * 0.5, 'arcade-button').setDisplaySize(width * 0.5, height);
        const arcadeText = this.add.text(arcadeButton.x, arcadeButton.y, 'Arcade', textStyle).setOrigin(0.5);
        // TODO: set to TTS of text
        const arcadeSound = this.menuSounds.menuClick;
    
        // Quit button
        const qButton = this.add.image(width * 0.95, height * 0.93, '__WHITE').setDisplaySize(width * 0.05, width * 0.05);
        const qText = this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "50px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);
        const qSound = this.menuSounds.menuClick;

        this.buttons = [
            {button: storyButton, text: storyText, sound: storySound},
            {button: arcadeButton, text: arcadeText, sound: arcadeSound},
            {button: qButton, text: qText, sound: qSound},
        ]
        // Create Interactives
        for (let buttonObj of this.buttons) {
            buttonObj.button.setInteractive();

            buttonObj.button.on('pointerover', () => {
                buttonObj.button.setTint(0xFF0000);
                buttonObj.text.setTint(0xFFF);

                // TODO: Add buttonObj.sound.play() when TTS is added of them
            })
            buttonObj.button.on('pointerout', () => {
                buttonObj.button.clearTint();
                buttonObj.text.clearTint();
            })
        }

        // Set action for specific buttons
        // TODO: implement player count saving and other fntns
        storyButton.on('pointerup', () => {
            this.menuSounds.menuClick.play();
            this.scene.start('savefileMenu');
        });
        arcadeButton.on('pointerup', () => {
            this.menuSounds.menuClick.play();
            this.scene.start('arcadeMenu');
        });
        qButton.on('pointerup', () => {
            qSound.play();
            this.scene.start('startMenu');
        });
    }
}