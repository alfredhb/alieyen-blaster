import { Meteor } from 'meteor/meteor';
import Phaser from 'phaser';
import HelpButton from '../../gameobjects/help_button';
import Constants from '../../lib/constants';

export default class MenuScene4 extends Phaser.Scene {
    constructor() {
        super('startMenu')
    }

    /**
     * Loads up game data such as difficulty from DB and passes along to future scenes
     */
    init() {
        // Set default game configs if unavailable from db
        if (!this.game.config.sfxVolume) this.game.config.sfxVolume = 0.5;
        if (!this.game.config.ttsVolume) this.game.config.ttsVolume = 0.5;
        if (!this.game.config.dwellTime) this.game.config.dwellTime = 0.2;
        if (!this.game.config.cursorSize) this.game.config.cursorSize = 0.4;

        Meteor.call("getDifficulty", (err, res) => {
            if (err != null) {
                console.log(err);
                this.difficulty = 1;
            }

            this.difficulty = res;
        });
        Meteor.call("getVolume", (err, res) => {
            if (err != null) {
                console.log(err);
                return;
            }

            this.game.config.sfxVolume = res.sfx;
            this.game.config.ttsVolume = res.tts;
        });
        Meteor.call("getDwellTime", (err, res) => {
            if (err != null) {
                console.log(err);
                return;
            }

            this.game.config.dwellTime = res;
        });
        Meteor.call("getCursorSize", (err, res) => {
            if (err != null) {
                console.log(err);
                return;
            }

            this.game.config.cursorSize = res;

            // set cursorSize
            let size = Math.round(this.game.config.cursorSize * 20) * 5;
            let cursorURL = this.constants.CursorPath + (size) + ".png";
            this.game.config.cursorStyle = "url(" + cursorURL + ") " + (size / 2 - 1) + " " + (size / 2 - 1) + ", pointer";
            this.game.events.emit("cursorsizeset");
        });
    }

    /**
     * Preload function to run before Create();
     */
    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.get('menu-click'),
            titleTTS: this.sound.get('title'),
            playTTS: this.sound.get('play'),
            quitTTS: this.sound.get('quit'),
        }
    }

    /**
     * Handles element placing on scene including background, title, and buttons
     */
    create() {
        const { width, height } = this.scale; //Canvas dimensions

        // Constants
        this.constants = new Constants(width, height);

        // Background
        this.add.image(width * 0.5, height * 0.5, 'space-bg').setDisplaySize(width, height);

        // Title
        this.initTitle(width, height);

        // Buttons
        this.initButtons(width, height);

        // Add help button
        this.help = new HelpButton(this);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width 
     * @param {number} height 
     */
    initTitle(width, height) {
        // Title
        const title = this.add.text(width * 0.5, height * 0.15, 'Ali-eye-n Blaster 3000', {
            fontFamily: "impact-custom",
            fontSize: (width / 11) + "px",
            strokeThickness: 0,
            color: "#FFFFFF",
            aligh: 'center',
        }).setOrigin(0.5);
        
        // interactives
        title.setInteractive();
        title.on('pointerover', () => {
            if (!this.menuSounds.titleTTS.isPlaying) {
                this.menuSounds.titleTTS.play({volume: this.game.config.ttsVolume});
            }
        })
    }

    /**
     * Creates play and quit button and sets interactivity
     * @param {number} width 
     * @param {number} height 
     */
    initButtons(width, height) {
        // Play Button
        const plButton = this.add.image(width * 0.5, height * 0.7, '__WHITE').setDisplaySize(width * 0.35, height * 0.25);
        const plText = this.add.text(plButton.x, plButton.y, 'Play!', {
            fontFamily: "impact-custom",
            color: "#FF0000",
            fontSize: (height * 0.055) + "px",
        }).setOrigin(0.5);
        const plSound = this.menuSounds.playTTS;
        const plFunc = () => {
            this.menuSounds.menuClick.play({ volume: this.game.config.sfxVolume });
            this.scene.start(
                'playerSelectMenu',
                {
                    meta: {
                        difficulty: this.difficulty
                    }
                }
            );
            this.scene.stop(this); // stop itself
        };

        // Quit Button
        const qButton = this.add.image(width * 0.95, height * 0.93, '__WHITE').setDisplaySize(width * 0.075, width * 0.075);
        const qText = this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: (height * 0.085) + "px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);
        const qSound = this.menuSounds.quitTTS;
        const qFunc = () => {
            console.log('Unimplemented');
            qSound.play({volume: this.game.config.ttsVolume});
        };

        this.buttons = [
            {button: plButton, text: plText, sound: plSound, func: plFunc},
            {button: qButton, text: qText, sound: qSound, func: qFunc}
        ].forEach(b => {
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(this.constants.Red);
                b.text.setTint(0xFFF);

                // Play if not playing already
                if (!b.sound.isPlaying) {
                    b.sound.play({volume: this.game.config.ttsVolume});
                }
            });
            b.button.on('pointerout', () => {
                b.button.clearTint();
                b.text.clearTint();
            });

            // Add hoverclick and normal click
            this.constants.HoverClick(this, b.button, b.func)
        });

        this.addSettings(width, height);
    }

    /**
     * Opens the hidden admin settings menu. This is only meant to be accessible
     * by craig, so no accessibility is available for bubba and leah
     * @param {number} width 
     * @param {number} height 
     */
    addSettings(width, height) {
        // Hidden settings button
        const sButton = this.add.image(width * 0.95, height * 0.07, '__WHITE');
        sButton.setDisplaySize(width * 0.075, width * 0.075).setTint(0x000).setAlpha(0.15);

        sButton.setInteractive();
        sButton.on('pointerup', () => {
            this.menuSounds.menuClick.play({ volume: this.game.config.sfxVolume });

            this.scene.launch('adminSettingsMenu', this);
            this.scene.stop(this);
            return;
        });
    }
}
