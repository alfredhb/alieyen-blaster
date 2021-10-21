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

        console.log("initialized ArcadeMenu for ", this.players, " players on difficulty ", this.difficulty)
    }

    /**
     * Preload function to run before Create();
     */
    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
            difficultyTTS: this.sound.add('difficulty', { loop: false }),
            timedTTS: this.sound.add('timed', { loop: false }),
            endlessTTS: this.sound.add('endless', { loop: false }),
            livesTTS: this.sound.add('lives', { loop: false }),
            bossBattleTTS: this.sound.add('boss-battle', { loop: false }),
        }
    }

    /**
     * Handles element placement: bg, title, difficulty button, level buttons
     */
    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        // Background
        this.add.image(width * 0.5, height * 0.5, 'arcade-bg').setDisplaySize(width, height)

        // Title
        this.initTitle(width, height);

        // Difficulty
        this.initDifficultyButton(width, height);

        // Buttons
        this.initLevelButtons(width, height);
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
     * Places a difficulty settings menu in top right which on click, transitions
     * to 'difficultySelectMenu'
     * @param {number} width 
     * @param {number} height 
     */
    initDifficultyButton(width, height) {
        // Difficulty Settings Button
        const difButton = this.add.image(width * 0.95, height * 0.07, '__WHITE');
        const difIcon = this.add.image(width * 0.95, height * 0.07, 'difficulty-button');
        difButton.setDisplaySize(width * 0.05, width * 0.05);
        difButton.setOrigin(0.5);
        difIcon.setDisplaySize(width * 0.04, width * 0.04);
        difIcon.setOrigin(0.5);

        // Add listener
        difButton.setInteractive();
        difButton.on('pointerover', () => {
            difButton.setTint(0xFF0000);
            difIcon.setTint(0xFFF);

            if (!this.menuSounds.difficultyTTS.isPlaying){
                this.menuSounds.difficultyTTS.play();
            }
        }).on('pointerout', () => {
            difButton.clearTint();
            difIcon.clearTint();
        }).on('pointerup', () => {
            this.menuSounds.menuClick.play();
            this.scene.start('difficultySelectMenu', {
                meta: {
                    playerCount: this.players,
                },
                scene: {
                    prevScene: {
                        name: 'arcadeMenu',
                        type: 'ARCADE'
                    },
                    nextScene: {
                        name: 'arcadeMenu',
                        type: 'ARCADE'
                    }
                },
            });
        })

    }

    /**
     * Add buttons and listeners
     * @param {number} width 
     * @param {number} height 
     */
    initLevelButtons(width, height) {
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
        const tiText = this.add.text(tiButton.x, height * 0.425, 'Timed', this.constants.MenuButtonStyle('#000000'));

        // Endless button
        const enButton = this.add.image(width * 0.75, height * 0.35, 'gameslot-button');
        const enIcon = this.add.image(width * 0.75, height * 0.325, 'endless-button');
        const enText = this.add.text(enButton.x, height * 0.425, 'Endless', this.constants.MenuButtonStyle('#000000'));

        // Lives Button
        const liButton = this.add.image(width * 0.25, height * 0.7, 'gameslot-button');
        const liIcon = this.add.image(width * 0.25, height * 0.675, 'lives-button');
        const liText = this.add.text(liButton.x, height * 0.775, 'Lives', this.constants.MenuButtonStyle('#000000'));

        // Boss Battle button
        const bbButton = this.add.image(width * 0.75, height * 0.7, 'gameslot-button');
        const bbIcon = this.add.image(width * 0.75, height * 0.675, 'gauntlet-button');
        const bbText = this.add.text(bbButton.x, height * 0.775, 'Boss Battle', this.constants.MenuButtonStyle('#000000'));

        this.buttons = [
            {button: tiButton, icon: tiIcon, text: tiText, sound: this.menuSounds.timedTTS},
            {button: enButton, icon: enIcon, text: enText, sound: this.menuSounds.endlessTTS},
            {button: liButton, icon: liIcon, text: liText, sound: this.menuSounds.livesTTS},
            {button: bbButton, icon: bbIcon, text: bbText, sound: this.menuSounds.bossBattleTTS},
        ].forEach(b => {
            b.button.setDisplaySize(width * .35, height * .25);
            b.icon.setDisplaySize(height * 0.15, height * 0.15);
            b.text.setOrigin(0.5);
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);
                b.icon.setTint(0xFFF);
                b.text.setTint(0xFFF);

                // Play TTS
                if (!b.sound.isPlaying) {
                    b.sound.play();
                }
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
