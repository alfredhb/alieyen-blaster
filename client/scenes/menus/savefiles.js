import Phaser from 'phaser';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene5 extends Phaser.Scene {
    constructor() {
        super('savefileMenu')
    }

    init(data) {
        this.players = data.meta.playerCount;

        console.log("initialized SafeFileMenu for ", this.players, " players")
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
        this.add.image(width * 0.5, height * 0.5, 'story-bg').setDisplaySize(width, height)

        // Title
        this.add.text(width * 0.4, height * 0.1, 'Game Slots', {
            fontFamily: "Impact",
            fontSize: "50px",
            strokeThickness: 0,
        });

        this.initButtons(width, height);
    }

    initButtons(width, height) {
        let textStyle = {
            fontSize: "50px",
            color: "#000000",
        }

        // Slot 1 button
        const slot1Button = this.add.image(width * 0.25, height * 0.35, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const slot1Text = this.add.text(slot1Button.x, slot1Button.y, 'Slot 1', textStyle).setOrigin(0.5);

        // Endless button
        const slot2Button = this.add.image(width * 0.75, height * 0.35, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const slot2Text = this.add.text(slot2Button.x, slot2Button.y, 'Slot 2', textStyle).setOrigin(0.5);

        // Lives Button
        const slot3Button = this.add.image(width * 0.25, height * 0.7, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const slot3Text = this.add.text(slot3Button.x, slot3Button.y, 'Slot 3', textStyle).setOrigin(0.5);

        // Gauntlet button
        const slot4Button = this.add.image(width * 0.75, height * 0.7, 'gameslot-button').setDisplaySize(width * .35, height * .25);
        const slot4Text = this.add.text(slot4Button.x, slot4Button.y, 'Slot 4', textStyle).setOrigin(0.5);

        // Quit button
        const qButton = new QuitButton(this, {
            backMenu: 'gamemodeMenu',
            data: { 
                meta: {
                    playerCount: this.players 
                },
            },
        });

        this.buttons = [
            {button: slot1Button, text: slot1Text, sound: null},
            {button: slot2Button, text: slot2Text, sound: null},
            {button: slot3Button, text: slot3Text, sound: null},
            {button: slot4Button, text: slot4Text, sound: null},
        ];
        // Create Interactives
        // TODO use game save file to determine what clicking each button does
        for (let buttonObj of this.buttons) {
            buttonObj.button.setInteractive();

            buttonObj.button.on('pointerover', () => {
                buttonObj.button.setTint(0x7878ff);
            });
            buttonObj.button.on('pointerout', () => {
                buttonObj.button.clearTint();
            });
            buttonObj.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
                console.log('Unimplemented');
            });
        }
    }
}
