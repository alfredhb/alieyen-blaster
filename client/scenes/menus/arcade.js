import Phaser from 'phaser';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
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
        this.add.image(width * 0.5, height * 0.5, 'arcade-bg').setDisplaySize(width, height)

        // Title
        this.add.text(width * 0.5, height * 0.15, 'Arcade', {
            fontFamily: "Impact",
            fontSize: "100px",
            strokeThickness: 0,
        }).setOrigin(0.5);
        
        this.initButtons(width, height);
    }

    initButtons(width, height) {
        let textStyle = {
            fontFamily: "Impact",
            fontSize: "50px",
            color: "#FFFFFF",
        }

        // Quit Button
        const quit = new QuitButton(this, {
            backMenu: 'gamemodeMenu'
        });

        // Timed button
        const tiButton = this.add.image(width * 0.25, height * 0.35, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const tiText = this.add.text(tiButton.x, tiButton.y, 'Timed', textStyle).setOrigin(0.5);
    
        // Endless button
        const enButton = this.add.image(width * 0.75, height * 0.35, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const enText = this.add.text(enButton.x, enButton.y, 'Endless', textStyle).setOrigin(0.5);

        // Lives Button
        const liButton = this.add.image(width * 0.25, height * 0.7, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const liText = this.add.text(liButton.x, liButton.y, 'Lives', textStyle).setOrigin(0.5);
    
        // Gauntlet button
        const gaButton = this.add.image(width * 0.75, height * 0.7, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const gaText = this.add.text(gaButton.x, gaButton.y, 'Gauntlet', textStyle).setOrigin(0.5);

        this.buttons = [
            {button: tiButton, text: tiText, sound: null},
            {button: enButton, text: enText, sound: null},
            {button: liButton, text: liText, sound: null},
            {button: gaButton, text: gaText, sound: null},
        ];
        // Create Interactives
        for (let buttonObj of this.buttons) {
            buttonObj.button.setInteractive();

            buttonObj.button.on('pointerover', () => {
                buttonObj.button.setTint(0xFF0000);
                buttonObj.text.setTint(0xFFF);
            });
            buttonObj.button.on('pointerout', () => {
                buttonObj.button.clearTint();
                buttonObj.text.clearTint();
            });
            buttonObj.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
            });
        }

        // Set action for specific buttons
        // TODO: implement player count saving and other fntns
        tiButton.on('pointerup', () => {
            this.scene.start('preLevelMenu', 
                {
                    nextScene: 'timedArcade',
                    prevScene: {
                        scene: 'arcadeMenu',
                        type: 'ARCADE'
                    },
                }
            );
        });
        enButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
    }
}
