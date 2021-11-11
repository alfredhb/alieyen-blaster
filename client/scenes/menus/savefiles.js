import { Meteor } from 'meteor/meteor';
import Phaser, { ScaleModes } from 'phaser';
import Constants from '../../lib/constants';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene5 extends Phaser.Scene {
    constructor() {
        super('savefileMenu')
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number, players: string[]}, level: {any}, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}}} data 
     */
    init(data) {
        this.playerCount = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;
        this.players = data.meta.players;

        if (!this.players.length) {
            console.log("Players Not Passed Back!!");
        }

        // fetch save files
        Meteor.call("getSaveData", (err, res) => {
            if (err != null) {
                console.log(err);
            }

            for (let slot of res) {
                // style a full slot
                this.styleFullSlot(slot);
            }
            for (let i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].text.text == "Empty") this.setButtonInteraction({}, i);
            }
        });

        console.log("initialized GamemodeMenu for ", this.playerCount, " players being: ", this.players.toString())
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.get('menu-click'),
        }
    }

    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        // Background
        this.add.image(width * 0.5, height * 0.5, 'story-bg').setDisplaySize(width, height)

        // Title
        const title = this.add.text(width * 0.5, height * 0.15, 'Game Slots', this.constants.MenuTitleStyle());
        title.setOrigin(0.5);
        

        this.initButtons(width, height);
    }

    /**
     * moves slot text to top right, places difficulty count in top left (of button), and displays
     * closes incomplete level, with a star count for each completed level below it
     * @param {{
     *  _id: string,
     *  levels:
     *      {
     *          name: string,
     *          complete: boolean
     *      }[]],
     *  difficulty: number
     * }} slot 
     */
    styleFullSlot(slot) {
        let width = this.constants.Width, height = this.constants.Height;
        let slotButton = this[slot._id + "Button"];
        
        // Move slot name to top left
        this[slot._id + "Text"].setPosition(slotButton.x - width * 0.12, slotButton.y - height * 0.12
        ).setOrigin(0.5, 0).setText("Slot " + slot._id[4]);

        // Place Difficulty to top Right
        this[slot._id + "Diff"] = this.add.text(
            slotButton.x + width * 0.165,
            slotButton.y - height * 0.12,
            (slot.difficulty == 1) ? "EASY" : (slot.difficulty == 2) ? 
            "MEDIUM" : "HARD",
            {
                fontFamily: "impact-custom",
                fontSize: (height * 0.055) + "px",
                color: "#0000FF",
                align: "right"
            }
        ).setOrigin(1, 0);

        // Place Closest incomplete level in center and star for each complete
        let closestLevel = "1 - 1";
        for (let i = 0; i < slot.levels.length; i++) {
            if (!slot.levels[i].complete) {
                closestLevel = slot.levels[i].name;
                break;
            }

            // place star
            let star = this.add.image(
                slotButton.x - width * 0.12 + width * 0.055 * i,
                slotButton.y + height * 0.12,
                'star'
            ).setDisplaySize(width * 0.05, width * 0.05).setOrigin(0.5, 1);
        }
        this[slot._id + "World"] = this.add.text(slotButton.x, slotButton.y, closestLevel, this.constants.MenuButtonStyle("#000000")
        ).setOrigin(0.5);

        this.setButtonInteraction(slot, slot._id[4] - 1);
    }

    initButtons(width, height) {
        // Slot 1 button
        this.slot1Button = this.add.image(width * 0.25, height * 0.35, 'gameslot-button');
        this.slot1Text = this.add.text(this.slot1Button.x, this.slot1Button.y, 'Empty', this.constants.MenuButtonStyle('#000000'));
 
        // Slot 2 button
        this.slot2Button = this.add.image(width * 0.75, height * 0.35, 'gameslot-button');
        this.slot2Text = this.add.text(this.slot2Button.x, this.slot2Button.y, 'Empty', this.constants.MenuButtonStyle('#000000'));

        // Slot 3 button
        this.slot3Button = this.add.image(width * 0.25, height * 0.7, 'gameslot-button');
        this.slot3Text = this.add.text(this.slot3Button.x, this.slot3Button.y, 'Empty', this.constants.MenuButtonStyle('#000000'));

        // Slot 4 button
        this.slot4Button = this.add.image(width * 0.75, height * 0.7, 'gameslot-button');
        this.slot4Text = this.add.text(this.slot4Button.x, this.slot4Button.y, 'Empty', this.constants.MenuButtonStyle('#000000'));

        // Quit button
        const qButton = new QuitButton(this, {
            backMenu: 'gamemodeMenu',
            data: { 
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    players: this.players,
                },
            },
        });

        this.buttons = [
            {button: this.slot1Button, text: this.slot1Text, sound: null},
            {button: this.slot2Button, text: this.slot2Text, sound: null},
            {button: this.slot3Button, text: this.slot3Text, sound: null},
            {button: this.slot4Button, text: this.slot4Text, sound: null},
        ];
        this.buttons.forEach(b => {
            b.button.setDisplaySize(width * .35, height * .25);
            b.text.setOrigin(0.5)
        });
    }

    /**
     * Sets interactivity of buttons after slot data is loaded
     * @param {*} slot
     * @param {number} id
     */
    setButtonInteraction(slot, id) {
        let b = this.buttons[id];
        b.button.setInteractive();

        b.button.on('pointerover', () => {
            b.button.setTint(this.constants.Red);
        });
        b.button.on('pointerout', () => {
            b.button.clearTint();
        });

        // Transition to tutorial
        if (b.text.text == "Empty") {
            this.constants.HoverClick(this, b.button, () => {
                this.menuSounds.menuClick.play();
                console.log('Playing Tutorial');

                // create a save entry and transition
                this.createNewSave(id);
            });
        } else {
            // transition to level select!
            this.constants.HoverClick(this, b.button, () => {
                this.menuSounds.menuClick.play();

                this.scene.start(
                    'worldSelectMenu',
                    {
                        meta: {
                            difficulty: slot.difficulty,
                            players: this.players,
                            playerCount: this.playerCount
                        },
                        levels: slot.levels,
                    }
                )
            });
        }
    }

    /**
     * Creates a new db entry for the given slotID with _id slot{{slotId+1}}.
     * if one exists, log an error for further investigation.
     * @param {number} slotId 
     * @returns {*} a slot object
     */
    createNewSave(slotId) {
        Meteor.call("setSaveData", slotId, (err, res) => {
            if (err != null) {
                console.log(err);
                return;
            }

            this.scene.start(
                (this.playerCount == 1) ? 'timedTutorialScene' : 'storyReadyScene',
                {
                    meta: {
                        difficulty: this.difficulty,
                        players: this.players,
                        currentPlayer: 0,
                        playerCount: this.playerCount,
                        levelName: 'timedTutorialScene'
                    },
                    level: {
                        difficulty_multiplier: [1, 1.5, 2],
                        powerup_spawnrate: 500,
                        aliens: {
                            grunt: {
                                score: 10,
                            },
                            mini_boss: {
                                score: 10,
                            },
                            boss: {
                                score: 10,
                            },
                        }
                    },
                    scene: {
                        nextScene: {
                            name: 'worldSelectMenu',
                            type: 'STORY',
                        }
                    },
                    levels: res.levels,
                    name: 'worldSelectMenu'
                }
            )
        });
    }
}
