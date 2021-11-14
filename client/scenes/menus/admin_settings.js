import { Meteor } from 'meteor/meteor';
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

        const title = this.add.text(width * 0.5, height * 0.1, 'Admin Settings', {
            fontFamily: 'impact-custom',
            fontSize: (height * 0.15) + "px",
            color: "#FFF"
        }).setOrigin(0.5); // No TTS here

        // tts
        this.initTTSSettings(width, height);

        // savefile
        this.initSaveManagement(width, height);

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
        const title = this.add.text(width * 0.5, height * 0.275, 'Text to Speech Volume', {
            fontFamily: 'impact-custom',
            fontSize: (height * 0.075) + "px",
            color: "#FFF"
        }).setOrigin(0.5);

        // volume slider
        let track = this.add.rectangle(0 + width * 0.05, 0, width * 0.35, height * 0.03, 0xFFFFFF);
        let thumb = this.add.circle(0, 0, height * 0.035, this.constants.Red);
        const slider = this.rexUI.add.slider({
            x: width * 0.5,
            y: height * 0.425,
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
        const zero = this.add.text(width * 0.5 - width * 0.2, height * 0.36, '0%', this.constants.MenuButtonStyle());
        const one = this.add.text(width * 0.5, height * 0.36, '50%', this.constants.MenuButtonStyle());
        const two = this.add.text(width * 0.5 + width * 0.2, height * 0.36, '100%', this.constants.MenuButtonStyle());

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

    /**
     * a section which displays savefiles currently stored, their progress, and an option
     * to delete them
     * @param {number} width 
     * @param {number} height 
     */
    initSaveManagement(width, height) {
        // fetch save files
        Meteor.call('getSaveData', (err, res) => {
            if (err != null) {
                console.log(err);
            }

            // savefile title (menu size)
            const title = this.add.text(width * 0.5, height * 0.55, 'Remove Game Saves', {
                fontFamily: 'impact-custom',
                fontSize: (height * 0.075) + "px",
                color: "#FFF"
            }).setOrigin(0.5);

            this.addSaveSlots(res);
        });
    }

    /**
     * Adds a saveslot for each slot in slots with its save data, and a red X next 
     * to it to remove it
     * @param {any[]} slots 
     */
    addSaveSlots(slots) {
        const { width, height } = this.scale;

        for (let i = 0; i < slots.length; i++) {
            this.addSaveSlot(width, height, i, slots[i]);
        }
    }

    /**
     * adds a saveslot at i
     * @param {number} width 
     * @param {number} height 
     * @param {number} i 
     * @param {object} slot
     */
    addSaveSlot(width, height, i, slot) {
        const bg = this.add.image(width * 0.5, height * 0.65 + height * 0.07 * i, '__WHITE');
        bg.setDisplaySize(width * 0.5, height * 0.06).setOrigin(0.5);

        // decorate with data
        const title = this.add.text(width * 0.26, height * 0.65 + height * 0.07 * i,
            'Slot ' + slot._id[4], {
                fontFamily: 'impact-custom',
                color: "#0000FF",
                fontSize: (height * 0.055) + "px",
        }).setOrigin(0, 0.5);

        let closestLevel = "1 - 1";
        for (let level of slot.levels) {
            if (!level.complete) {
                closestLevel = level.name;
                break;
            }
        }

        const level = this.add.text(width * 0.5, height * 0.65 + height * 0.07 * i,
            closestLevel, {
                fontFamily: 'impact-custom',
                color: "#0000FF",
                fontSize: (height * 0.055) + "px",
        }).setOrigin(0, 0.5);

        const difficulty = this.add.text(width * 0.74, height * 0.65 + height * 0.07 * i,
            (slot.difficulty == 1) ? 'EASY' : (slot.difficulty == 2)
             ? 'MEDIUM' : 'HARD', {
                fontFamily: 'impact-custom',
                color: "#0000FF",
                fontSize: (height * 0.055) + "px",
        }).setOrigin(1, 0.5);

        // Add remove func
        const x = this.add.text(width * 0.8, height * 0.65 + height * 0.07 * i, 'X', {
            color: "#FF0000",
            fontSize: (height * 0.055) + "px",
            fontFamily: 'Georgia'
        }).setOrigin(0, 0.5);

        x.setInteractive();
        x.on('pointerover', () => {
            x.setColor('#FF69B4');
        }).on('pointerout', () => {
            x.setColor('#FF0000');
        }).on('pointerup', () => {
            this.sound.play('menu-click');

            // shift over data
            level.x = width *.35, difficulty.x = width * 0.59, title.x = width * 0.11;
            bg.x = width * 0.35, x.x = width * 0.615;
            let b = {bg: bg, l: level, d: difficulty, t: title, x: x};
            this.showRemoveSlotPrompt(width, height, b, slot)
        });
    }

    /**
     * replaces X with a "Are you sure? Yes, No" and on Yes, deletes the save 
     * and restarts the scene, on no, reverts to an x
     * @param {number} width 
     * @param {number} height 
     * @param {{bg: Phaser.GameObjects.Image, l: Phaser.GameObjects.Text, d: Phaser.GameObjects.Text, t: Phaser.GameObjects.Text, x: Phaser.GameObjects.Text}} x 
     * @param {any} slot 
     */
    showRemoveSlotPrompt(width, height, b, slot) {
        b.x.disableInteractive();
        b.x.setText("Are You Sure?");
        b.x.setFontFamily('impact-custom')

        const yes = this.add.text(b.x.x + width * 0.225, b.x.y, 'Yes', {
            color: "#00FF00",
            fontSize: (height * 0.055) + "px",
            fontFamily: 'impact-custom'
        }).setOrigin(0.5);

        const no = this.add.text(yes.x + width * 0.05, b.x.y, 'No', {
            color: "#FF0000",
            fontSize: (height * 0.055) + "px",
            fontFamily: 'impact-custom'
        }).setOrigin(0.5);
        
        yes.setInteractive();
        no.setInteractive();
        yes.on('pointerover', () => {
            yes.setColor('#90EE90'); //light green
        }).on('pointerout', () => {
            yes.setColor('#00FF00');
        }).on('pointerup', () => {
            yes.removeInteractive();
            this.sound.play('menu-click');

            // delete save
            Meteor.call('deleteSaveData', slot._id, (err, res) => {
                if (err != null) {
                    console.log(err);
                }

                this.scene.restart(this.levelData);
            });

        });
        
        no.on('pointerover', () => {
            no.setColor('#FF69B4'); //light green
        }).on('pointerout', () => {
            no.setColor('#FF0000');
        }).on('pointerup', () => {
            this.sound.play('menu-click');
            no.removeInteractive();
            no.destroy();
            yes.destroy();

            b.x.setInteractive();
            b.x.setText('X');
            b.x.setFontFamily('Georgia');

            // revert slot to og position
            b.l.x = width * 0.5;
            b.t.x = width * 0.26;
            b.d.x = width * 0.74;
            b.x.x = width * 0.8;
            b.bg.x = width * 0.5;
        });
    }
}