import Phaser from 'phaser';
import QuitButton from '../../gameobjects/quit_button';

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

        // Quit button
        const quit = new QuitButton(this, {
            backMenu: 'startMenu',
            execFunc: () => { return; }
        });

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

        this.buttons = [
            {button: storyButton, text: storyText, sound: storySound},
            {button: arcadeButton, text: arcadeText, sound: arcadeSound},
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
    }
}