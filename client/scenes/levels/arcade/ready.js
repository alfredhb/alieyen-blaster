import Phaser from "phaser";
import Constants from "../../../lib/constants";
import QuitButton from "../../../gameobjects/quit_button";
import HelpButton from '../../../gameobjects/help_button';

export default class ArcadeReadyScene extends Phaser.Scene {
    constructor() {
        super('arcadeReadyScene');
    }

    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number, players: string[], levelName: string}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}}} data
     */
    init(data) {
        // Set game metadata
        this.playerCount = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;
        this.players = data.meta.players;
        this.levelName = data.meta.levelName;

        // Set current Player
        this.turn = data.meta.hasOwnProperty("currentPlayer") ? data.meta.currentPlayer : 0;
        data.meta.currentPlayer = this.turn;

        this.readyData = data;

        // Specific level report card data
        console.log("initialized ReadyScene for ", this.playerCount, " players");
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.get('menu-click'),
            arcadeTTS: this.sound.get('arcade'),
            readyToPlayTTS: this.sound.get('ready-to-play'),
            playTTS: this.sound.get('play'),
        }
    }

    /**
     * Handles element placement: bg, center box, title, report, sprite, navigation, quit
     */
    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        // Init BG
        const bg = this.add.image(width * 0.5, height * 0.5, 'space-bg');
        bg.setDisplaySize(width, height);

        // Init Center Section (black w white border)
        this.centerBox(width, height);

        // Init report data
        this.initTitle(width, height);

        // score breakdown + accuracy
        this.readySection(width, height);

        // Replay / Back Buttons
        this.navigationSection(width, height);

        // quit button
        const quitButton = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            data: {
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    players: this.players,
                }
            }
        });

        // Add help button
        this.help = new HelpButton(this);
    }

    /**
     * Creates a black box with white outline to place buttons over
     * @param {number} width
     * @param {number} height
     */
    centerBox(width, height) {
        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.7505, height * 0.505);
        centerOutline.setOrigin(0.5);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.75, height * 0.5);
        center.setTint(0x000000);
        center.setOrigin(0.5);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width
     * @param {number} height
     */
    initTitle(width, height) {
        const title = this.add.text(
            width * 0.5,
            height * 0.325,
            'Ready?',
            this.constants.MenuTitleStyle()
        );
        title.setOrigin(0.5);

        // Add TTS
        title.setInteractive();
        title.on('pointerover', () => {
            if (!this.menuSounds.readyToPlayTTS.isPlaying) {
                this.menuSounds.readyToPlayTTS.play({volume: this.game.config.ttsVolume});
            }
        })
    }

    /**
     * Display score and accuracy from the previous level
     * @param {number} width
     * @param {number} height
     */
    readySection(width, height) {
        let ttsArr = [];

        const turnText = this.add.text(
            width * 0.5,
            height * 0.45,
            this.constants.Capitalize(this.players[this.turn]) + "'s Turn!",
            this.constants.MenuButtonStyle()
        );
        turnText.setOrigin(0.5);
        ttsArr.push({text: turnText, sound: this.sound.get(this.players[this.turn])});

        ttsArr.forEach(t => {
            t.text.setInteractive();

            t.text.on('pointerover', () => {
                t.sound.play({volume: this.game.config.ttsVolume});
            })
        })
    }

    /**
     * Navigation which either replays the last level, or returns to the arcade menu
     * @param {number} width
     * @param {number} height
     */
    navigationSection(width, height) {
        const playButton = this.add.image(width * 0.325, height * 0.65, '__WHITE');
        const arcadeButton = this.add.image(width * 0.675, height * 0.65, '__WHITE');
        const playText = this.add.text(width * 0.325, height * 0.65, 'PLAY', this.constants.MenuButtonStyle());
        const arcadeText = this.add.text(width * 0.675, height * 0.65, 'ARCADE', this.constants.MenuButtonStyle());
        playText.setName(this.levelName);
        arcadeText.setName('arcadeMenu');

        let buttons = [
            {button: playButton, text: playText, sound: this.menuSounds.playTTS},
            {button: arcadeButton, text: arcadeText, sound: this.menuSounds.arcadeTTS},
        ];
        buttons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .3, height * 0.125);
            b.button.setOrigin(0.5);
            b.button.setTint(this.constants.Gray);
            b.text.setOrigin(0.5);

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(this.constants.Red);

                // Play TTS here
                if (!b.sound.isPlaying) {
                    b.sound.play({volume: this.game.config.ttsVolume});
                }
            }).on('pointerout', () => {
                b.button.setTint(this.constants.Gray);
            });

            // Add hoverclick and normal click
            this.constants.HoverClick(this, b.button, () => {
                this.menuSounds.menuClick.play();

                // Transition to different scene based on text name
                this.scene.start(
                    (b.text.name == this.readyData.scene.nextScene.name) ? 'levelFactory' : b.text.name, 
                    this.readyData
                );
                this.scene.stop(this); // stop itself
            })
        });
    }
}
