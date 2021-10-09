import Phaser from 'phaser';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
    }

    init(data) {
        this.players = data.meta.playerCount;
        this.difficulty = (data.meta.difficulty) ? data.meta.difficulty : 1; // easy unless returned from prev scene

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
            color: "#000000",
        }

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
        const tiText = this.add.text(tiButton.x, tiButton.y, 'Timed', textStyle);

        // Endless button
        const enButton = this.add.image(width * 0.75, height * 0.35, 'gameslot-button');
        const enText = this.add.text(enButton.x, enButton.y, 'Endless', textStyle);

        // Lives Button
        const liButton = this.add.image(width * 0.25, height * 0.7, 'gameslot-button');
        const liText = this.add.text(liButton.x, liButton.y, 'Lives', textStyle);

        // Gauntlet button
        const gaButton = this.add.image(width * 0.75, height * 0.7, 'gameslot-button');
        const gaText = this.add.text(gaButton.x, gaButton.y, 'Gauntlet', textStyle);

        this.buttons = [
            {button: tiButton, text: tiText, sound: null},
            {button: enButton, text: enText, sound: null},
            {button: liButton, text: liText, sound: null},
            {button: gaButton, text: gaText, sound: null},
        ].forEach(b => {
            b.button.setDisplaySize(width * .35, height * .25);
            b.text.setOrigin(0.5);
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);
                b.text.setTint(0xFFF);
            });
            b.button.on('pointerout', () => {
                b.button.clearTint();
                b.text.clearTint();
            });
            b.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
            });
        });

        // Set action for specific buttons
        // TODO: implement player count saving and other fntns
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
