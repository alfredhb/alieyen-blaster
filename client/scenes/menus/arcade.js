import Phaser from 'phaser';
import Constants from '../../lib/constants';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data 
     */
    init(data) {
        this.players = data.meta.playerCount;
        this.difficulty = (data.meta.difficulty) ? data.meta.difficulty : 1; // easy unless returned from prev scene

        this.constants = new Constants();

        console.log("initialized ArcadeMenu for ", this.players, " players on difficulty ", this.difficulty)
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
        this.initTitle(width, height);

        // Buttons
        this.initButtons(width, height);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width 
     * @param {number} height 
     */
    initTitle(width, height) {
        const title = this.add.text(width * 0.5, height * 0.15, 'Arcade', this.constants.MenuTitleStyle());
        title.setOrigin(0.5);

        const titleSound = this.sound.add('arcade', { loop: false });

        // interactives
        title.setInteractive();
        title.on('pointerover', () => {
            if (!titleSound.isPlaying) {
                titleSound.play();
            }
        })
    }

    /**
     * Add buttons and listeners
     * @param {number} width 
     * @param {number} height 
     */
    initButtons(width, height) {
        // Difficulty Settings Button
        const difButton = this.add.image(width * 0.95, height * 0.07, '__WHITE').setDisplaySize(width * 0.05, width * 0.05);
        // const

        // Quit Button
        const quit = new QuitButton(this, {
            backMenu: 'gamemodeMenu',
            data: { 
                meta: {
                    playerCount: this.players 
                },
            },
        });

        // Timed button
        const tiButton = this.add.image(width * 0.25, height * 0.35, 'gameslot-button');
        const tiIcon = this.add.image(width * 0.25, height * 0.325, 'timed-button');
        const tiText = this.add.text(tiButton.x, height * 0.40, 'Timed', this.constants.MenuButtonStyle('#000000'));

        // Endless button
        const enButton = this.add.image(width * 0.75, height * 0.35, 'gameslot-button');
        const enIcon = this.add.image(width * 0.75, height * 0.325, 'endless-button');
        const enText = this.add.text(enButton.x, height * 0.40, 'Endless', this.constants.MenuButtonStyle('#000000'));

        // Lives Button
        const liButton = this.add.image(width * 0.25, height * 0.7, 'gameslot-button');
        const liIcon = this.add.image(width * 0.25, height * 0.675, 'endless-button');
        const liText = this.add.text(liButton.x, height * 0.75, 'Lives', this.constants.MenuButtonStyle('#000000'));

        // Gauntlet button
        const gaButton = this.add.image(width * 0.75, height * 0.7, 'gameslot-button');
        const gaIcon = this.add.image(width * 0.75, height * 0.675, 'gauntlet-button');
        const gaText = this.add.text(gaButton.x, height * 0.75, 'Gauntlet', this.constants.MenuButtonStyle('#000000'));

        this.buttons = [
            {button: tiButton, icon: tiIcon, text: tiText, sound: null},
            {button: enButton, icon: enIcon, text: enText, sound: null},
            {button: liButton, icon: liIcon, text: liText, sound: null},
            {button: gaButton, icon: gaIcon, text: gaText, sound: null},
        ].forEach(b => {
            b.button.setDisplaySize(width * .35, height * .25);
            b.text.setOrigin(0.5);
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);
                b.icon.setTint(0xFFF);
                b.text.setTint(0xFFF);
            });
            b.button.on('pointerout', () => {
                b.button.clearTint();
                b.icon.clearTint();
                b.text.clearTint();
            });
            b.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
            });
        });

        // Set action for specific buttons
        // TODO: move to inside forEach @ L106 using names.
        tiButton.on('pointerup', () => {
            this.scene.start('timedArcade',
                {
                    meta: {
                        playerCount: this.players,
                        difficulty: this.difficulty,
                    }
                }
            );
        });
        enButton.on('pointerup', () => {
            console.log('Unimplemented');
        });
    }
}
