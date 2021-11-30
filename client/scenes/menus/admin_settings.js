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
        // this.initTTSSettings(width, height);

        // savefile
        // this.initSaveManagement(width, height);

        // Init content
        this.initVolumeContent(width, height);
        this.initEyeInputContent(width, height);

        // Add tabs
        this.initTabs(width, height);

        const qButton = new QuitButton(this, {
            backMenu: this.levelData,
            cutscene: true, // to resume the last scene
            execFunc: () => {
                //TODO: update mongoDB entries for all settings
            }
        })
    }

    /**
     * Creates content for volume section including sfx and tts volume slider
     * sections which update mongo meta files ON EXIT. Then hides them and disables
     * interaction
     * @param {number} width 
     * @param {number} height 
     */
    initVolumeContent(width, height) {
        // SFX
        const sfxBG = this.rexUI.add.roundRectangle(width * 0.6, height * 0.3625, width * 0.6, height * 0.25, 20);
        const sfxT = this.add.text(width * 0.325, height * 0.3625, "Sound FX", this.constants.MenuButtonStyle());
        const sfxSlider = this.rexUI.add.slider({
            x: width * .725,
            y: height * 0.3625,
            width: width * 0.275,
            height: height * 0.03,
            orientation: 0,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.02, 0xFFFFFF),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.025, this.constants.Pink),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.04, this.constants.Red),
            gap: 0.1,
            value: this.game.config.sfxVolume,

            valuechangeCallback: (v) => {
                this.updateSFXVolume(v);
            }
        }).layout();

        // TTS
        const ttsBG = this.rexUI.add.roundRectangle(width * 0.6, height * 0.6375, width * 0.6, height * 0.25, 20);
        const ttsT = this.add.text(width * 0.325, height * 0.6375, "Text to Speech", this.constants.MenuButtonStyle());
        const ttsSlider = this.rexUI.add.slider({
            x: width * .725,
            y: height * 0.6375,
            width: width * 0.275,
            height: height * 0.03,
            orientation: 0,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.02, 0xFFFFFF),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.025, this.constants.Pink),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.04, this.constants.Red),
            gap: 0.1,
            value: this.game.config.ttsVolume,

            valuechangeCallback: (v) => {
                this.updateTTSVolume(v)
            }
        }).layout();

        sfxBG.setStrokeStyle(10, this.constants.LightBlue, 1);
        ttsBG.setStrokeStyle(10, this.constants.LightBlue, 1);

        sfxT.setOrigin(0, 0.5);
        ttsT.setOrigin(0, 0.5);

        // Save values for later toggling
        this.volume = {
            sfx: {
                bg: sfxBG,
                t: sfxT,
                s: sfxSlider
            },
            tts: {
                bg: ttsBG,
                t: ttsT,
                s: ttsSlider
            }
        }
    }

    /**
     * Creates content for eye input section including dwell time and cursor size slider
     * sections which update mongo meta files ON EXIT. Then hides them and disables
     * interaction
     * @param {number} width 
     * @param {number} height 
     */
    initEyeInputContent(width, height) {
        // Dwell Time
        const dwtBG = this.rexUI.add.roundRectangle(width * 0.6, height * 0.3625, width * 0.6, height * 0.25, 20);
        const dwtT = this.add.text(width * 0.325, height * 0.3625, "Dwell Speed", this.constants.MenuButtonStyle());
        const dwtN = this.add.text(width * 0.85, height * 0.3625, (this.game.config.dwellTime * 5) + "s", this.constants.MenuButtonStyle());
        const dwtS = this.rexUI.add.slider({
            x: width * .675,
            y: height * 0.3625,
            width: width * 0.275,
            height: height * 0.03,
            orientation: 0,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.02, 0xFFFFFF),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.025, this.constants.Pink),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.04, this.constants.Red),
            gap: 0.1,
            value: this.game.config.dwellTime,

            valuechangeCallback: (v) => {
                this.updateDwellTime(v, dwtN);
            }
        }).layout();

        // Cursor Size
        const crsBG = this.rexUI.add.roundRectangle(width * 0.6, height * 0.6375, width * 0.6, height * 0.25, 20);
        const crsT = this.add.text(width * 0.325, height * 0.6375, "Cursor Size", this.constants.MenuButtonStyle());
        const crsS = this.rexUI.add.slider({
            x: width * .675,
            y: height * 0.6375,
            width: width * 0.275,
            height: height * 0.03,
            orientation: 0,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.02, 0xFFFFFF),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.025, this.constants.Pink),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.04, this.constants.Red),
            gap: 0.1,
            value: this.game.config.ttsVolume,

            valuechangeCallback: (v) => {
                this.updateTTSVolume(v);
            }
        }).layout();

        dwtBG.setStrokeStyle(10, this.constants.LightBlue, 1);
        crsBG.setStrokeStyle(10, this.constants.LightBlue, 1);

        dwtT.setOrigin(0, 0.5);
        crsT.setOrigin(0, 0.5);
        dwtN.setOrigin(0.5);

        // Save values for later toggling
        this.eyeInput = {
            dwt: {
                bg: dwtBG,
                t: dwtT,
                s: dwtS,
                n: dwtN
            },
            crs: {
                bg: crsBG,
                t: crsT,
                s: crsS
            }
        }
    }

    /**
     * Creates a 3 tabbed UI for admin settings to be placed in
     * @param {number} width 
     * @param {number} height 
     */
    initTabs(width, height) {
        // make panel
        let rect = this.rexUI.add.roundRectangle(width * 0.1, height * 0.3, width * 0.7, height * 0.6, 20, 0x808080);
        rect.setStrokeStyle(10, this.constants.Blue, 1).setDepth(1);

        // make tabs
        this.tabs = this.rexUI.add.tabs({
            x: width * 0.5,
            y: height * 0.5,
            panel: rect,
            leftButtons: [
                this.createTabButton(width, height, 'Volume', true, 'volume'),
                this.createTabButton(width, height, 'Eye Input', false, 'controls'),
                this.createTabButton(width, height, 'Save Files', false, 'savefiles'),
            ],
            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
                leftButtonsOffset: 20,
                leftButton: 10
            }
        }).layout();
        this.tabs.on('button.click', this.handleTabClick, this);

        this.selectedTabInd = 0;

        // show selectedTabInd contents
        this.showTabContent(this.selectedTabInd);
    }

    /**
     * Pulls correct tab content to show from button name and colors the correct
     * button blue from tabs.
     * @param {rexUI.Label} b button
     * @param {string} g groupname
     * @param {number} i index of button in tab group
     */
    handleTabClick(b, g, i) {
        if (this.selectedTabInd == i) return;

        // Toggle tabs
        this.toggleTabColor(b);

        // Hide old content
        this.hideTabContent();

        // Show new Content
        this.showTabContent(i);

        // update selected tab
        this.selectedTabInd = i;
    }

    /**
     * Colors the current selected tab as gray and b's tab as blue
     * @param {rexUI.Label} b 
     */
    toggleTabColor(b) {
        this.tabs.childrenMap.leftButtons[this.selectedTabInd].backgroundChildren[0].setFillStyle(this.constants.Gray);

        b.backgroundChildren[0].setFillStyle(this.constants.Blue);
    }

    /**
     * hides the tab content for this.selectedTabInd
     */
    hideTabContent() {
        switch(this.selectedTabInd) {
            case 0:
                console.log("hide volume buttons / sliders and disable interaction");
                this.toggleVolumeContent(0);
                break;
            case 1:
                console.log("hide eye tracking sliders and disable interaction");
                this.toggleEyeInputContent(0);
                break;
            case 2:
                console.log("hide savefile removal buttons and disable interaction");
                break;
            default:
                console.log("nothing to hide");
                break;
        }
    }

    /**
     * Shows the tab content for i
     * @param {number} i 
     */
    showTabContent(i) {
        switch(i) {
            case 0:
                console.log("show volume buttons / sliders and enable interaction");
                this.toggleVolumeContent(2);
                break;
            case 1:
                console.log("show eye tracking sliders and enable interaction");
                this.toggleEyeInputContent(2);
                break;
            case 2:
                console.log("show savefile removal buttons and enable interaction");
                break;
            default:
                console.log("nothing to hide");
                break;
        }
    }

    /**
     * sets depth of volume content to v and enables / disables sliders
     * @param {number} v 
     */
    toggleVolumeContent(v) {
        this.volume.sfx.bg.setDepth(v);
        this.volume.tts.bg.setDepth(v);
        this.volume.sfx.t.setDepth(v);
        this.volume.tts.t.setDepth(v);
        this.volume.sfx.s.setDepth(v).setEnable(v != 0);
        this.volume.tts.s.setDepth(v).setEnable(v != 0);
    }

    /**
     * sets depth of volume content to v and enables / disables sliders
     * @param {number} v 
     */
    toggleEyeInputContent(v) {
        this.eyeInput.dwt.bg.setDepth(v);
        this.eyeInput.crs.bg.setDepth(v);
        this.eyeInput.dwt.t.setDepth(v);
        this.eyeInput.crs.t.setDepth(v);
        this.eyeInput.dwt.n.setDepth(v);
        this.eyeInput.dwt.s.setDepth(v).setEnable(v != 0);
        this.eyeInput.crs.s.setDepth(v).setEnable(v != 0);
    }

    /**
     * TODO: remove name param if unused
     * @param {number} width 
     * @param {number} height 
     * @param {string} text 
     * @param {boolean} selected 
     */
    createTabButton(width, height, text, selected, name) {
        return this.rexUI.add.label({
            width: width * 0.2,
            height: height * 0.1,
            background: this.rexUI.add.roundRectangle(0, 0, 0, 0, { tl: 20, bl: 20}, 
                (selected) ? this.constants.Blue : this.constants.Gray),
            text: this.add.text(0, 0, text, this.constants.MenuButtonStyle()),
            space: {
                left: 10,
                right: 10,
            },
            align: 'center',
            name: name
        });
    }

    /**
     * sets the playback volume for all sfx sounds to this value by setting its
     * value in the game config after normalizing it ( 0.5 == 1, 1 == 2, 0 / mute = 0.01 )
     * sfx can never be silent just in case there are 'complete' listeners for them
     * @param {number} value 
     */

    updateSFXVolume(value) {
        if (Math.abs(value - this.game.config.sfxVolume) > 0.12) return; // slider jumped rather than dragged
        this.game.config.sfxVolume = (value == 0) ? (value + 0.01) : value;
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
     * sets the dell time for hover clicks
     * @param {number} value 
     */
     updateDwellTime(value, text) {
        if (Math.abs(value - this.game.config.dwellTime) > 0.12) return; // slider jumped rather than dragged
        this.game.config.dwellTime = (Math.round(value * 10) / 10).toFixed(1); // round to nearest factor of 1/2
        text.setText((this.game.config.dwellTime * 5) + "s");
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