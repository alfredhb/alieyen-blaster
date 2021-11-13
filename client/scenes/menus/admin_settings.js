import Phaser from "phaser";
import QuitButton from "../../gameobjects/quit_button";
import Constants from "../../lib/constants";

/**
 * A scene exists only in the start menu and contains admin settings (more coming soon)
 * Features:
 * Enable / Disable / Volume control for TTS
 * Remove existing game saves
 */
 export default class AdminSettings extends Phaser.Scene {
    constructor() {
        super('adminSettingsMenu');
    }

    /**
     * 
     * @param {Phaser.Scene} data 
     */
    init(data) {
        this.levelData = data;
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });     
    }

    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height)

        const bg = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        bg.setOrigin(0.5).setDisplaySize(width, height).setTint(0x000);

        const title = this.add.text(width * 0.5, height * 0.15, 'Admin Settings', {
            fontFamily: 'impact-custom',
            fontSize: (height * 0.15) + "px",
            color: "#FFF"
        }).setOrigin(0.5); // No TTS here

        this.initTTSSettings(width, height);

        const qButton = new QuitButton(this, {execFunc: () => {
            this.scene.resume(this.levelData, );
            this.scene.stop();
        }})
    }

    /**
     * Creates a section which handles global volume of tts. Maybe use a slider
     * to show volume of text to speech (jquery slider or rexUI slider oooo)
     * @param {number} width 
     * @param {number} height 
     */
    initTTSSettings(width, height) {
        // tts title (menu size)
        const title = this.add.text(width * 0.5, height * 0.35, 'Text to Speech Volume', {
            fontFamily: 'impact-custom',
            fontSize: (height * 0.075) + "px",
            color: "#FFF"
        }).setOrigin(0.5);

        // volume slider
        let track = this.add.rectangle(0 + width * 0.05, 0, width * 0.35, height * 0.03, 0xFFFFFF);
        let thumb = this.add.circle(0, 0, height * 0.035, this.constants.Red);
        const slider = this.rexUI.add.slider({
            x: width * 0.5,
            y: height * 0.5,
            width: width * 0.45,
            height: height * 0.03,
            orientation: 0,
            track: track,
            thumb: thumb,
            gap: 0.1,
            value: this.game.config.ttsVolume,
            // input: 'drag',
            valuechangeCallback: (v) => {
                this.updateTTSVolume(v) 
            }
        });
        slider.layout();

        // place text markers
        const zero = this.add.text(width * 0.5 - width * 0.2, height * 0.435, '0%', this.constants.MenuButtonStyle());
        const one = this.add.text(width * 0.5, height * 0.435, '50%', this.constants.MenuButtonStyle());
        const two = this.add.text(width * 0.5 + width * 0.2, height * 0.435, '100%', this.constants.MenuButtonStyle());

        zero.setOrigin(0.5);
        one.setOrigin(0.5);
        two.setOrigin(0.5);
    }

    /**
     * sets the playback volume for all tts sounds to this value by setting its
     * value in the game config after normalizing it ( 0.5 == 1, 1 == 2, 0 / mute = 0.01 )
     * tts can never be silent just in case there are 'complete' listeners for them
     * @param {number} value 
     */
    updateTTSVolume(value) {
        if (Math.abs(value - this.game.config.ttsVolume) > 0.12) return; // slider jumped rather than dragged
        this.game.config.ttsVolume = (value == 0) ? (value + 0.01) : value;
    }
}