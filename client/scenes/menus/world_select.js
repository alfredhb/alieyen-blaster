import Phaser from 'phaser';
import Constants from '../../lib/constants';
import QuitButton from '../../gameobjects/quit_button';
import HelpButton from '../../gameobjects/help_button';
import DifficultyDisplay from '../../gameobjects/difficulty_display';

export default class WorldSelect extends Phaser.Scene {
    constructor() {
        super('worldSelectMenu');
    }

    /**
     * 
     * @param {{
     *  meta: {
     *      playerCount: number,
     *      players: string[],
     *      difficulty: number
     *  },
     *  levels: {
     *      name: string,
     *      complete: string 
     *  }[]
     * }} data 
     */
    init(data) {
        this.levelData = data;
        this.playerCount = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;
        this.players = data.meta.players;

        console.log("initialized worldSelectMenu for " + this.playerCount +
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
        }
    }

    /**
     * Creates bg, title, and 3 world buttons, worlds 2 and 3 are translucent since not done
     */
    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);
        
        // Background
        this.add.image(width * 0.5, height * 0.5, 'ship-bg').setDisplaySize(width, height);
    
        // Title
        this.initTitle(width, height);

        // Difficulty
        this.initDifficultyButton(width, height);

        // Tutorial
        this.initTutorialButton(width, height);

        // World Buttons
        this.initWorldButtons(width, height);

        const quit = new QuitButton(this, {
            backMenu: 'savefileMenu',
            data: {
                meta: {
                    playerCount: this.playerCount,
                    players: this.players,
                    difficulty: this.difficulty,
                }
            }
        });

        // Add help button
        this.help = new HelpButton(this);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width
     * @param {number} height
     */
    initTitle(width, height) {
        const title = this.add.text(width * 0.5, height * 0.15, 'World Select', this.constants.MenuTitleStyle("#000000"));
        title.setOrigin(0.5);

        const titleSound = this.sound.get('world-select');

        // interactives
        title.setInteractive();
        title.on('pointerover', () => {
            if (!titleSound.isPlaying) {
                titleSound.play({volume: this.game.config.ttsVolume});
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

        // add difficulty overlay
        this.diffText = new DifficultyDisplay(this, this.constants);
        this.diffText.diffText.setColor("#FF0000")

        // Add listener
        difButton.setInteractive();
        difButton.on('pointerover', () => {
            difButton.setTint(this.constants.Red);
            difIcon.setTint(0xFFF);

            if (!this.menuSounds.difficultyTTS.isPlaying){
                this.menuSounds.difficultyTTS.play({volume: this.game.config.ttsVolume});
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
                        name: 'worldSelectMenu',
                        type: 'STORY'
                    },
                    nextScene: {
                        name: 'worldSelectMenu',
                        type: 'STORY'
                    }
                },
                levels: this.levelData.levels
            });
            this.scene.stop(this); // stop itself
        });

    }

    /**
     * Places a tutorial button in the top left which on click, transitions to the
     * tutorial
     * @param {number} width 
     * @param {number} height 
     */
    initTutorialButton(width, height) {
        const tutB = this.add.image(width * 0.05, height * 0.07, '__WHITE');
        const tutT = this.add.text(width * 0.05, height * 0.07, 'T', this.constants.MenuButtonStyle("#000000"));
        tutB.setDisplaySize(width * 0.075, width * 0.075).setOrigin(0.5);
        tutT.setOrigin(0.5);

        let tutorialTTS = this.sound.get('tutorial');

        tutB.setInteractive();
        tutB.on('pointerover', () => {
            tutB.setTint(this.constants.Red);

            if (!tutorialTTS.isPlaying) {
                tutorialTTS.play({volume: this.game.config.ttsVolume});
            }
        }).on('pointerout', () => {
            tutB.clearTint();
        });

        this.constants.HoverClick(this, tutB, () => {
            this.menuSounds.menuClick.play({volume: this.game.config.sfxVolume});
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
                    levels: this.levelData.levels,
                    name: 'worldSelectMenu'
                }
            );
            this.scene.stop(this); // stop itself
        });

    }

    /**
     * Add buttons and listeners
     * @param {number} width
     * @param {number} height
     */
    initWorldButtons(width, height) {
        // world 1 button
        const w1B = this.add.image(width * 0.225, height * 0.55, 'world-1-button');
        const w1T = this.add.text(w1B.x, height * 0.55, 'World 1', this.constants.MenuButtonStyle('#000000'));
        w1B.setName('levelSelectMenu');
        w1T.setName(1);

        const w2B = this.add.image(width * 0.5, height * 0.55, 'world-2-button');
        const w2T = this.add.text(w2B.x, height * 0.55, 'World 2', this.constants.MenuButtonStyle('#000000'));
        w2B.setName('levelSelectMenu');
        w2T.setName(2);
        
        const w3B = this.add.image(width * 0.775, height * 0.55, 'world-3-button');
        const w3T = this.add.text(w3B.x, height * 0.55, 'World 3', this.constants.MenuButtonStyle('#000000'));
        w3B.setName('levelSelectMenu');
        w3T.setName(3);

        const [ w1, w2, w3, w1Stars, w2Stars, w3Stars ] = this.checkCompleted();
        this.buttons = [
            {button: w1B,  text: w1T, sound: this.sound.get('1'), complete: w1, fullStars: w1Stars, playable: true},
            {button: w2B,  text: w2T, sound: this.sound.get('2'), complete: w2, fullStars: w2Stars, playable: w1},
            {button: w3B,  text: w3T, sound: this.sound.get('3'), complete: w3, fullStars: w3Stars, playable: w2},
        ].forEach(b => {
            b.button.setDisplaySize(width * 0.25, height * 0.6);
            b.button.setOrigin(0.5);
            b.text.setOrigin(0.5);

            if (!b.playable) {
                b.button.setAlpha(0.5);
                b.text.setAlpha(0.5);
                return;
            } else if (b.complete) {
                let highlight = new Phaser.Geom.Rectangle(
                    b.button.x - width * 0.125,
                    b.button.y - height * 0.3,
                    width * 0.25,
                    height * 0.6
                );
                let gfx = this.add.graphics().setDepth(3);
                gfx.lineStyle(15, (b.fullStars == 15) ? this.constants.Gold : this.constants.Blue, 1);
                gfx.strokeRectShape(highlight)
            }

            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(this.constants.Red);
                b.text.setTint(0xFFF);

                // Play TTS
                if (!b.sound.isPlaying) {
                    b.sound.play({volume: this.game.config.ttsVolume});
                }
            });
            b.button.on('pointerout', () => {
                b.button.clearTint();
                b.text.clearTint();
            });

            this.constants.HoverClick(this, b.button, () => {
                this.levelData.meta["world"] = b.text.name;
                this.menuSounds.menuClick.play();
                this.scene.start(
                    b.button.name,
                    this.levelData
                );
                this.scene.stop(this); // stop itself
            })
        })
    }

    /**
     * Checks whether each world is completed
     * @returns {boolean[]}
     */
    checkCompleted() {
        let w1 = false, w2 = false, w3 = false;
        let stars = [0, 0, 0];
        for (let level of this.levelData.levels) {
            if (level.name == "1 - 5" && level.complete) w1 = true;
            if (level.name == "2 - 5" && level.complete) w2 = true;
            if (level.name == "3 - 5" && level.complete) w3 = true;
            stars[Number(level.name[0]) - 1] += (level?.stars) ? level.stars : 0;
        }
        let res = [ w1, w2, w3 ];
        stars.forEach(s => res.push(s));
        return res;
    }

}