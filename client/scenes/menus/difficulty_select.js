/**
 * The menu seen in this slide: https://docs.google.com/presentation/d/1k2VFrhd0RngtsdU3UQYzQbVgNASu-717JjrWl4YOyiE/edit#slide=id.gf155f0bac5_0_40
 */
import { Meteor } from 'meteor/meteor';
import Phaser from "phaser";
import Constants from "../../lib/constants";
import QuitButton from "../../gameobjects/quit_button";

export default class MenuScene9 extends Phaser.Scene {constructor() {
        super('difficultySelectMenu');
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number}, level: {any}, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}}} data 
     */
    init(data) {
        this.nextScene = data.scene.nextScene;
        this.prevScene = data.scene.prevScene; // {scene: string, type: enum{'ARCADE' || STORY'}

        this.players = data.meta.playerCount;

        // Game data holds player count in a central place
        Meteor.call("getDifficulty", (err, res) => {
            if (err != null) {
                console.log(err);
                this.difficulty = 1;
            }

            this.difficulty = res;
            console.log("fetched difficulty as " + this.difficulty);
        })
        
        if (this.timer) {
            this.timer = this.time.addEvent({
                delay: 1000,
                callback: this.invertColors,
                callbackScope: this,
                loop: true,
                paused: true,
            });
        }
    }

    preload() {
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
            difficultyTTS: this.sound.add('difficulty', { loop: false }),
            easyTTS: this.sound.add('easy', { loop: false }),
            mediumTTS: this.sound.add('medium', { loop: false }),
            hardTTS: this.sound.add('hard', { loop: false }),
            startTTS: this.sound.add('start', { loop: false }),
        }
    }

    create() {      
        const { width, height } = this.scale;

        // Add constants
        this.constants = new Constants(width, height);

        // BG
        const bg = this.add.image(
            width * 0.5,
            height * 0.5,
            (this.prevScene.type == 'ARCADE') ? 'arcade-bg' : 'story-bg',
        );
        bg.setDisplaySize(width, height);
        
        // Input
        this.cursor = this.input.activePointer;

        // Center Box
        this.centerBox(width, height);

        // Title
        this.initTitle(width, height);

        // Difficulty Area
        this.difficultySection(width, height);

        // Start Logic
        this.startSection(width, height);

        // Quit Button
        const quitButton = new QuitButton(this, {
            backMenu: this.prevScene.name,
            data: {
                meta: {
                    playerCount: this.players,
                    difficulty: this.difficulty,
                }
            },
            execFunc: this.persistDifficulty
        });
    }

    centerBox(width, height) {
        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.6505, height * 0.5505);
        centerOutline.setOrigin(0.5);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.65, height * 0.55);
        center.setTint(0x000000);
        center.setOrigin(0.5);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width 
     * @param {number} height 
     */
    initTitle(width, height) {
        const difficultyText = this.add.text(width * 0.5, height * 0.325, 'DIFFICULTY', this.constants.MenuTitleStyle());
        difficultyText.setOrigin(0.5);

        // interactives
        difficultyText.setInteractive();
        difficultyText.on('pointerover', () => {
            if (!this.menuSounds.difficultyTTS.isPlaying) {
                this.menuSounds.difficultyTTS.play();
            }
        });

    }

    difficultySection(width, height) {
        const difficultyText = this.add.text(width * 0.5, height * 0.325, 'DIFFICULTY', this.constants.MenuTitleStyle());
        difficultyText.setOrigin(0.5);

        const easyButton = this.add.image(width * 0.325, height * .45, '__WHITE');
        const mediumButton = this.add.image(width * 0.5, height * .45, '__WHITE');
        const hardButton = this.add.image(width * 0.675, height * .45, '__WHITE');
        const easyText = this.add.text(width * 0.325, height * 0.45, 'EASY', this.constants.MenuButtonStyle());
        const mediumText = this.add.text(width * 0.5, height * 0.45, 'MEDIUM', this.constants.MenuButtonStyle());
        const hardText = this.add.text(width * 0.675, height * 0.45, 'HARD', this.constants.MenuButtonStyle());
        easyText.setName('1');
        mediumText.setName('2');
        hardText.setName('3');
        
        let buttons = [
            {button: easyButton, text: easyText, sound: this.menuSounds.easyTTS},
            {button: mediumButton, text: mediumText, sound: this.menuSounds.mediumTTS},
            {button: hardButton, text: hardText, sound: this.menuSounds.hardTTS},
        ];
        buttons.forEach(b => {
            // Style Button
            b.button.setDisplaySize(width * 0.15, height * 0.08);
            b.button.setOrigin(0.5);
            b.button.setTint(this.constants.Gray);
            b.text.setOrigin(0.5);

            if (this.difficulty == Number(b.text.name)) {
                b.button.setTint(this.constants.Blue);
            }

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(this.constants.Red);

                // Play TTS here
                if (!b.sound.isPlaying){ 
                    b.sound.play();
                }
            }).on('pointerout', () => {
                if (!this.difficulty) {
                    b.button.setTint(this.constants.Gray);
                } else if (this.difficulty != Number(b.text.name)) {
                    b.button.setTint(this.constants.Gray);
                } else {
                    b.button.setTint(this.constants.Blue);
                }
            });

            // Add hoverclick and normal click
            this.constants.HoverClick(this, b.button, () => {
                // Set difficulty & show on button (clear old tints and set new)
                this.difficulty = Number(b.text.name);
                buttons.forEach(b => b.button.setTint(this.constants.Gray));
                b.button.setTint(this.constants.Blue);

                this.menuSounds.menuClick.play();
                this.styleStart();
            });
        });
    }

    startSection(width, height) {
        this.startButton = this.add.image(width * 0.5, height * 0.65, '__WHITE');
        this.startButton.setDisplaySize(width * 0.375, height * 0.12);
        this.startButton.setTint(this.constants.Gray);
        this.startButton.setOrigin(0.5);
        const startText = this.add.text(width * 0.5, height * 0.65, 'START', this.constants.MenuButtonStyle());
        startText.setOrigin(0.5);

        // Set interactiveness of button
        this.startButton.setInteractive();

        this.startButton.on('pointerover', () => {
            if (this.startReady()) {
                this.startButton.setTint(this.constants.Red);

                if (!this.menuSounds.startTTS.isPlaying) {
                    this.menuSounds.startTTS.play();
                }
            }
        }).on('pointerout', () => {
            if (this.startReady()) {
                this.styleStart();
            } else {
                this.startButton.setTint(this.constants.Gray);
            }
        });

        // Add hoverclick and normal click
        this.constants.HoverClick(this, this.startButton, () => {
            if (this.startReady()) {
                this.timer.remove();
                this.persistDifficulty();

                this.menuSounds.menuClick.play();
                this.scene.start(
                    this.nextScene.name,
                    {
                        meta: {
                            playerCount: this.players,
                            difficulty: this.difficulty,
                        }
                    }
                );
            }
        })
    }
    
    startReady() {
        return this.difficulty;
    }
    
    invertColors = () => {
        if (this.startButton.tintTopLeft == this.constants.Red) {
            this.startButton.setTint(this.constants.Blue);
        } else {
            this.startButton.setTint(this.constants.Red);
        }
    }

    /**
     * Saves set difficulty to db
     * @param {number} d 
     */
    persistDifficulty = () => {
        Meteor.call("setDifficulty", this.difficulty, (err, res) => {
            if (err != null) {
                console.log(err);
            }

            console.log((res) ? "successfully set difficulty to " + this.difficulty 
            : "difficulty already set to " + this.difficulty);
        })
    }

    // Periodically change color of startButton as long as both players and difficulty are set
    styleStart() {
        if (!this.startReady()) {
            return;
        }
        // If timer already created, or persists from previous instance of this scene
        if (this.timer) {
            this.timer.paused = false; //start the timer?
            return;
        }

        // Create timer which strobes start button from red to green
        this.startButton.setTint(this.constants.Blue);
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.invertColors,
            callbackScope: this,
            loop: true,
            paused: false,
        });
    }
 }