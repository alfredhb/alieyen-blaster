import Phaser from 'phaser';
import Constants from '../../lib/constants';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene5 extends Phaser.Scene {
    constructor() {
        super('savefileMenu')
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number?}, level: {any}, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}}} data 
     */
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
        this.constants = new Constants(width, height);

        // Background
        this.add.image(width * 0.5, height * 0.5, 'story-bg').setDisplaySize(width, height)

        // Title
        const title = this.add.text(width * 0.5, height * 0.15, 'Game Slots', this.constants.MenuTitleStyle());
        title.setOrigin(0.5);
        

        this.initButtons(width, height);
    }

    initButtons(width, height) {
        // Slot 1 button
        const slot1Button = this.add.image(width * 0.25, height * 0.35, 'gameslot-button');
        const slot1Text = this.add.text(slot1Button.x, slot1Button.y, 'Slot 1', this.constants.MenuButtonStyle('#000000'));

        // Slot 2 button
        const slot2Button = this.add.image(width * 0.75, height * 0.35, 'gameslot-button');
        const slot2Text = this.add.text(slot2Button.x, slot2Button.y, 'Slot 2', this.constants.MenuButtonStyle('#000000'));

        // Slot 3 button
        const slot3Button = this.add.image(width * 0.25, height * 0.7, 'gameslot-button');
        const slot3Text = this.add.text(slot3Button.x, slot3Button.y, 'Slot 3', this.constants.MenuButtonStyle('#000000'));

        // Slot 4 button
        const slot4Button = this.add.image(width * 0.75, height * 0.7, 'gameslot-button');
        const slot4Text = this.add.text(slot4Button.x, slot4Button.y, 'Slot 4', this.constants.MenuButtonStyle('#000000'));

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
        this.buttons.forEach(b => {
            b.button.setDisplaySize(width * .35, height * .25);
            b.text.setOrigin(0.5);
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0x7878ff);
            });
            b.button.on('pointerout', () => {
                b.button.clearTint();
            });
            b.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
                console.log('Unimplemented');
            });
        });
    }
}
