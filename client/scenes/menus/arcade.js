import Phaser from 'phaser';
import Constants from '../../lib/constants';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
    }

    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number, players: string[]}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data
     */
    init(data) {
        this.playerCount = Number(data.meta.playerCount);
        this.difficulty = data.meta.difficulty; // easy unless returned from prev scene
        this.players = data.meta.players;

        console.log("initialized ArcadeMenu for " + this.playerCount +
        " players  players being: " + this.players.toString() + " on difficulty "
        + this.difficulty);
    }

    /**
     * Preload function to run before Create();
     */
    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.get('menu-click'),
            difficultyTTS: this.sound.get('difficulty'),
            timedTTS: this.sound.get('timed'),
            endlessTTS: this.sound.get('endless'),
            livesTTS: this.sound.get('lives'),
            bossBattleTTS: this.sound.get('boss-battle'),
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

        // Quit Button
        const quit = new QuitButton(this, {
            backMenu: 'gamemodeMenu',
            data: {
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    players: this.players,
                },
            },
        });
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width
     * @param {number} height
     */
    initTitle(width, height) {
        const title = this.add.text(width * 0.5, height * 0.15, 'Arcade', this.constants.MenuTitleStyle());
        title.setOrigin(0.5);

        const titleSound = this.sound.get('arcade');

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
        difButton.setDisplaySize(width * 0.075, width * 0.075);
        difButton.setOrigin(0.5);
        difIcon.setDisplaySize(width * 0.055, width * 0.055);
        difIcon.setOrigin(0.5);

        // Add listener
        difButton.setInteractive();
        difButton.on('pointerover', () => {
            difButton.setTint(this.constants.Red);
            difIcon.setTint(0xFFF);

            if (!this.menuSounds.difficultyTTS.isPlaying){
                this.menuSounds.difficultyTTS.play();
            }
        }).on('pointerout', () => {
            difButton.clearTint();
            difIcon.clearTint();
        });

        // Add hoverclick and normalclick
        this.constants.HoverClick(this, difButton, () => {
            this.menuSounds.menuClick.play();
            this.scene.start('difficultySelectMenu', {
                meta: {
                    playerCount: this.playerCount,
                    players: this.players
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
        });

    }

    /**
     * Add buttons and listeners
     * @param {number} width
     * @param {number} height
     */
    initLevelButtons(width, height) {

        // Timed button
        const tiButton = this.add.image(width * 0.25, height * 0.35, 'gameslot-button');
        const tiIcon = this.add.image(width * 0.25, height * 0.325, 'timed-button');
        const tiText = this.add.text(tiButton.x, height * 0.425, 'Timed', this.constants.MenuButtonStyle('#000000'));
        tiText.setName('levelFactory');
        tiIcon.setName('timedLevelArcade');

        // OldTimed
        // const tiButton = this.add.image(width * 0.25, height * 0.35, 'gameslot-button');
        // const tiIcon = this.add.image(width * 0.25, height * 0.325, 'timed-button');
        // const tiText = this.add.text(tiButton.x, height * 0.425, 'old timed', this.constants.MenuButtonStyle('#000000'));
        // tiText.setName('timedArcade');

        // Endless button
        const enButton = this.add.image(width * 0.75, height * 0.35, 'gameslot-button');
        const enIcon = this.add.image(width * 0.75, height * 0.325, 'endless-button');
        const enText = this.add.text(enButton.x, height * 0.425, 'Endless', this.constants.MenuButtonStyle('#000000'));
        enText.setName('levelFactory');
        enIcon.setName('endlessLevelArcade');

        // Lives Button
        const liButton = this.add.image(width * 0.25, height * 0.7, 'gameslot-button');
        const liIcon = this.add.image(width * 0.25, height * 0.675, 'lives-button');
        const liText = this.add.text(liButton.x, height * 0.775, 'Lives', this.constants.MenuButtonStyle('#000000'));
        liText.setName('levelFactory'); // TODO: change me
        liIcon.setName('livesLevelArcade');

        // Boss Battle button
        const bbButton = this.add.image(width * 0.75, height * 0.7, 'gameslot-button');
        const bbIcon = this.add.image(width * 0.75, height * 0.675, 'gauntlet-button');
        const bbText = this.add.text(bbButton.x, height * 0.775, 'Boss Battle', this.constants.MenuButtonStyle('#000000'));
        bbText.setName('arcadeMenu'); // TODO: change me

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
                b.button.setTint(this.constants.Red);
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

            // Add Hoverclick and normal click
            this.constants.HoverClick(this, b.button, () => {
                this.menuSounds.menuClick.play();
                this.scene.start(
                    (this.playerCount == 1) ? b.text.name : "arcadeReadyScene",
                    {
                        meta: {
                            playerCount: this.playerCount,
                            difficulty: this.difficulty,
                            players: this.players,
                            levelName: b.text.name,
                            currentPlayer: 0,
                        },
                        scene: {
                            prevScene: {
                                name: 'arcadeMenu',
                                type: 'ARCADE',
                            },
                            nextScene: {
                                name: b.icon.name,
                                type: 'ARCADE'
                            }
                        }
                    }
                );
            })
        });
    }
}
