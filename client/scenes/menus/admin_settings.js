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

        this.bg = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        this.bg.setOrigin(0.5).setDisplaySize(width, height).setTint(0x000);

        const title = this.add.text(width * 0.5, height * 0.1, 'Admin Settings', {
            fontFamily: 'impact-custom',
            fontSize: (height * 0.15) + "px",
            color: "#FFF"
        }).setOrigin(0.5); // No TTS here

        // savefile
        // this.initSaveManagement(width, height);

        // Init content
        this.initVolumeContent(width, height);
        this.initEyeInputContent(width, height);
        this.initSavefileContent(width, height);

        // Add tabs
        this.initTabs(width, height);

        const qButton = new QuitButton(this, {
            backMenu: this.levelData,
            // cutscene: true, // to resume the last scene
            execFunc: () => {
                //TODO: update mongoDB entries for all settings
                this.updateSettings();
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
        const dwtT = this.add.text(width * 0.315, height * 0.3625, "Dwell Speed", this.constants.MenuButtonStyle());
        const dwtN = this.add.text(width * 0.85, height * 0.3625, (this.game.config.dwellTime * 5) + "s", this.constants.MenuButtonStyle());
        const dwtS = this.rexUI.add.slider({
            x: width * .66,
            y: height * 0.3625,
            width: width * 0.275,
            height: height * 0.03,
            orientation: 0,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.02, 0xFFFFFF),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.025, this.constants.Pink),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.04, this.constants.Red),
            gap: 0.05,
            value: this.game.config.dwellTime,

            valuechangeCallback: (v) => {
                this.updateDwellTime(v, dwtN);
            }
        }).layout();

        // Cursor Size
        const crsBG = this.rexUI.add.roundRectangle(width * 0.6, height * 0.6375, width * 0.6, height * 0.25, 20);
        const crsT = this.add.text(width * 0.315, height * 0.6375, "Cursor Size", this.constants.MenuButtonStyle());
        let adjustedSize = this.game.config.cursorSize * 100;
        const crsC = this.rexUI.add.roundRectangle(
            width * 0.85,
            height * 0.6375, 
            null, 
            null, 
            adjustedSize / 2, 
            this.constants.Green); 
        const crsS = this.rexUI.add.slider({
            x: width * .66,
            y: height * 0.6375,
            width: width * 0.275,
            height: height * 0.03,
            orientation: 0,
            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.02, 0xFFFFFF),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.025, this.constants.Pink),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, height * 0.04, this.constants.Red),
            gap: 0.1,
            value: this.game.config.cursorSize,

            valuechangeCallback: (v) => {
                this.updateCursorSize(v, crsC);
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
                s: crsS,
                c: crsC
            }
        }
    }

    initSavefileContent(width, height, show) {
        const sfBG = this.rexUI.add.roundRectangle(width * 0.6, height * 0.5, width * 0.6, height * 0.525, 20);
        const sfT = this.add.text(width * 0.6, height * 0.3, "Delete Save Files", this.constants.MenuButtonStyle());

        sfBG.setStrokeStyle(10, this.constants.LightBlue, 1);
        sfT.setOrigin(0.5);

        // fetch and style save slots
        this.menus = [];
        Meteor.call('getSaveData', (err, res) => {
            if (err != null) {
                console.log(err);
            }

            this.addSaveSlots(width, height, res.slots);
            if (show) {
                this.hideTabContent();
                this.showTabContent(this.selectedTabInd);
            }
        });

        this.saveFile = {
            bg: sfBG,
            t: sfT,
            s: [], // where to save the savefile group of button / content
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
                this.toggleVolumeContent(0);
                break;
            case 1:
                this.toggleEyeInputContent(0);
                break;
            case 2:
                this.toggleSavefileContent(0);
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
                this.toggleVolumeContent(2);
                break;
            case 1:
                this.toggleEyeInputContent(2);
                break;
            case 2:
                this.toggleSavefileContent(2);
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
        this.eyeInput.crs.c.setDepth(v);
        this.eyeInput.dwt.s.setDepth(v).setEnable(v != 0);
        this.eyeInput.crs.s.setDepth(v).setEnable(v != 0);
    }

    toggleSavefileContent(v) {
        this.saveFile.bg.setDepth(v);
        this.saveFile.t.setDepth(v);
        this.saveFile.s.forEach(slot => {
            slot.bg.setDepth(v);
            slot.t.setDepth(v);
            slot.l.setDepth(v);
            slot.d.setDepth(v);
            slot.x.setDepth(v);
            if (v) { 
                slot.x.setInteractive();
            } else {
                slot.x.disableInteractive();
            }
        })
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
        this.game.config.sfxVolume = (value == 0) ? (value + 0.001) : value;
    }

    /**
     * sets the playback volume for all tts sounds to this value by setting its
     * value in the game config after normalizing it ( 0.5 == 1, 1 == 2, 0 / mute = 0.01 )
     * tts can never be silent just in case there are 'complete' listeners for them
     * @param {number} value 
     */
    updateTTSVolume(value) {
        if (Math.abs(value - this.game.config.ttsVolume) > 0.12) return; // slider jumped rather than dragged
        this.game.config.ttsVolume = (value == 0) ? (value + 0.001) : value;
    }

    /**
     * sets the dell time for hover clicks
     * @param {number} value 
     */
     updateDwellTime(value, text) {
        if (Math.abs(value - this.game.config.dwellTime) > 0.12) return; // slider jumped rather than dragged
        this.game.config.dwellTime = (Math.round(value * 20) / 20).toFixed(2); // round to nearest factor of 1/2
        text.setText((this.game.config.dwellTime * 5) + "s");
    }

    /**
     * Sets the width and height of cursor to value and updates its radius
     * @param {number} value 
     * @param {rexUI.roundRectangle} cursor 
     */
    updateCursorSize(value, cursor) {
        if (Math.abs(value - this.game.config.cursorSize) > 0.12) return;
        this.game.config.cursorSize = (value == 0) ? 0.05 : value;

        // update preview
        let size = Math.round(this.game.config.cursorSize * 20) * 5;
        cursor.setDisplaySize(size, size);

        // update actual cursor
        let cursorURL = this.constants.CursorPath + (size) + ".png";
        this.game.config.cursorStyle = "url(" + cursorURL + ") " + (size / 2 - 1) + " " + (size / 2 - 1) + ", pointer";
        this.game.events.emit("cursorsizeset");
    }

    /**
     * Adds a saveslot for each slot in slots with its save data, and a red X next 
     * to it to remove it
     * @param {number} width 
     * @param {number} height 
     * @param {any[]} slots 
     */
    addSaveSlots(width, height, slots) {
        for (let i = 0; i < slots.length; i++) {
            this.addSaveSlot(width, height, i, slots[i]);
        }
    }

    /**
     * Adds a saveslot at i, and returns all components of it so its visibility
     * can be toggled later
     * @param {number} width 
     * @param {number} height 
     * @param {number} i 
     * @param {object} slot 
     */
    addSaveSlot(width, height, i, slot) {
        let textStyle = {
            fontFamily: 'impact-custom',
            color: '#000000',
            fontSize: (height * 0.045) + "px",
        };
        let slotHeight = height * (0.4 + i * 0.095);
        const bg = this.rexUI.add.roundRectangle(width * 0.6, slotHeight, width * 0.5, height * 0.08, 15, 0xFFFFFF);

        const title = this.add.text(width * 0.4, slotHeight, 'Slot ' + slot._id[4], textStyle);

        let closestLevel = "1 - 1";
        let completedLevels = 0;
        for (let level of slot.levels) {
            if (!level.complete) {
                closestLevel = level.name;
                break;
            }
            completedLevels += 1;
        }
        if (completedLevels == 16) {
            closestLevel = "Completed"
        }
        const level = this.add.text(width * 0.55, slotHeight, closestLevel, textStyle);

        const difficulty = this.add.text(width * 0.7, slotHeight, (slot.difficulty == 1)
        ? 'EASY' : (slot.difficulty == 2) ? 'MEDIUM' : 'HARD', textStyle);

        const x = this.add.text(width * 0.8, slotHeight, 'X', {
            color: "#FF0000",
            fontSize: (height * 0.045) + "px",
            fontFamily: 'Georgia'
        });

        title.setOrigin(0, 0.5);
        level.setOrigin(0.5, 0.5);
        difficulty.setOrigin(0.5, 0.5);
        x.setOrigin(0, 0.5);

        // Add interaction to X
        x.setInteractive();
        let menu = undefined;
        x.on('pointerup', (pointer) => {
            // create popup menu
            if (menu === undefined) {
                menu = this.createFileMenu(pointer.x, pointer.y, (button) => {
                    this.sound.play('menu-click', { volume: this.game.config.sfxVolume });
                    if (button.text == 'Cancel') {
                        menu.collapse();
                        menu = undefined
                        return;
                    }
        
                    // remove save data
                    Meteor.call('deleteSaveData', slot._id, (err, res) => {
                        if (err != null) {
                            console.log(err);
                        }
                        
                        menu.collapse();
                        menu = undefined;
                        this.hideTabContent();
                        this.initSavefileContent(width, height, true);
                    });
                });
            } else if (!menu.isInTouching(pointer)) {
                menu.collapse();
                menu = undefined;
            }
        });

        // Add interaction to bg to close window
        this.input.on('pointerdown', (pointer) => {
            if (menu && !menu.isInTouching(pointer)) {
                menu.collapse();
                menu = undefined;
            }
        });
        x.disableInteractive();

        this.saveFile.s.push({
            bg: bg,
            t: title,
            l: level,
            d: difficulty,
            x: x
        });
    }

    /**
     * Creates a popup menu which expands at x, y containing 'Remove', 'Cancel'.
     * Remove calls removal of save slot, cancel closes the popup
     * @param {number} x 
     * @param {number} y 
     * @param {function} onClick
     */
    createFileMenu(x, y, onClick) {
        const { width, height } = this.scale;

        const menu = this.rexUI.add.menu({
            x: x,
            y: y,
            orientation: 'y',
            items: [{ name: 'Remove' }, { name: 'Cancel' }],
            createButtonCallback: (item, i) => {
                const rect = this.rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFFFFFF);
                rect.setStrokeStyle(5, this.constants.Blue, 1);

                return this.rexUI.add.label({
                    background: rect,
                    text: this.add.text(0, 0, item.name, {
                        fontFamily: 'impact-custom',
                        fontSize: (height * 0.045) + "px",
                        color: (i) ? "#000000" : "#FF0000"
                    }),
                    space: {
                        left: 10,
                        right: 10, 
                        top: 10,
                        bottom: 10,
                    }
                })
            },
            easeIn: {
                duration: 250,
                orientation: 'y'
            },
            easeOut: {
                duration: 250,
                orientation: 'y',
            }
        });
        menu.setDepth(2);

        // add interactions here
        menu.on('button.click', (button) => onClick(button));

        return menu;
    }

    /**
     * Calls setters for all settings to persist them to db
     */
    updateSettings() {
        // save volume
        Meteor.call("setVolume", this.game.config.sfxVolume, this.game.config.ttsVolume, (err) => {
            if (err != null) {
                console.log(err);
                return;
            }
        });
        
        // save dwell time
        Meteor.call("setDwellTime", this.game.config.dwellTime, (err) => {
            if (err != null) {
                console.log(err);
                return;
            }
        });

        // save cursor size
        Meteor.call("setCursorSize", this.game.config.cursorSize, (err) => {
            if (err != null) {
                console.log(err);
                return;
            }
        });
    }
}