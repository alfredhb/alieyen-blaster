import Phaser from 'phaser';
import Constants from '../../lib/constants';
import QuitButton from '../../gameobjects/quit_button';
import HelpButton from '../../gameobjects/help_button';
import DifficultyDisplay from '../../gameobjects/difficulty_display';

export default class LevelSelect extends Phaser.Scene {
    constructor() {
        super('levelSelectMenu');
    }

    /**
     * 
     * @param {{
     *  meta: {
     *      playerCount: number,
     *      players: string[],
     *      difficulty: number,
     *      currentPlayer: number,
     *      world: number,
     *  },
     *  levels: {
     *      name: string,
     *      complete: string 
     *  }[]
     * }} data 
     */
    init(data) {
        this.levelData = data;
        this.difficulty = data.meta.difficulty
        this.playerCount = data.meta.playerCount
        this.players = data.meta.players;
        this.currentPlayer = data.meta.currentPlayer;

        this.world = data.meta.world;

        console.log("initialized levelSelectMenu as World " + this.world + 
        " for " + this.playerCount + " players  players being: " + 
        this.players.toString() + " on difficulty " + this.difficulty);
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

    update(time, delta) {
        if (this.stars.length) {
            this.stars.forEach(s => s.rotation += 0.01);
        }
    }

    /**
     * Creates bg, title, and 3 world buttons, worlds 2 and 3 are translucent since not done
     */
    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);
        
        // Background
        const bg = this.add.image(width * 0.5, height * 0.5, ('world-' + this.world + '-ship-bg'));
        bg.setDisplaySize(width, height);
    
        // Title
        this.initTitle(width, height);

        // Difficulty
        this.initDifficultyButton(width, height);

        this.initLevelButtons(width, height);

        const quit = new QuitButton(this, {
            backMenu: 'worldSelectMenu',
            data: this.levelData
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
        const title = this.add.text(width * 0.5, height * 0.15, ('World ' + this.world), this.constants.MenuTitleStyle("#000000"));
        title.setOrigin(0.5);

        const titleSound = this.sound.get('world-' + this.world);

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
                    currentPlayer: this.currentPlayer,
                    players: this.players,
                    world: this.world,
                },
                scene: {
                    prevScene: {
                        name: 'levelSelectMenu',
                        type: 'STORY'
                    },
                    nextScene: {
                        name: 'levelSelectMenu',
                        type: 'STORY'
                    }
                },
                levels: this.levelData.levels
            });
            this.scene.stop(this); // stop itself
        });

    }

    /**
     * Places 5 level buttons numbered {{world}} - [1 - 5] signifying each
     * level in the world. (1st row 3, 2nd row 2)
     * gray out levels which are inaccessible, outline in green and place a star
     * on each completed one, and outline in red the next incomplete
     * @param {number} width
     * @param {number} height
     */
    initLevelButtons(width, height) {
        const l1B = this.add.image(width * 0.21, height * 0.45, 'gameslot-button');
        const l1T = this.add.text(l1B.x, l1B.y, (this.world) + ' - 1', this.constants.MenuButtonStyle("#000000"));
        l1B.setName('levelFactory');
        l1T.setName('world' + this.world + 'level1');
        
        const l2B = this.add.image(width * 0.5, height * 0.45, 'gameslot-button');
        const l2T = this.add.text(l2B.x, l2B.y, (this.world) + ' - 2', this.constants.MenuButtonStyle("#000000"));
        l2B.setName('levelFactory');
        l2T.setName('world' + this.world + 'level2');
        
        const l3B = this.add.image(width * 0.79, height * 0.45, 'gameslot-button');
        const l3T = this.add.text(l3B.x, l3B.y, (this.world) + ' - 3', this.constants.MenuButtonStyle("#000000"));
        l3B.setName('levelFactory');
        l3T.setName('world' + this.world + 'level3');
        
        const l4B = this.add.image(width * 0.325, height * 0.7, 'gameslot-button');
        const l4T = this.add.text(l4B.x, l4B.y, (this.world) + ' - 4', this.constants.MenuButtonStyle("#000000"));
        l4B.setName('levelFactory');
        l4T.setName('world' + this.world + 'level4');
        
        const l5B = this.add.image(width * 0.675, height * 0.7, 'gameslot-button');
        const l5T = this.add.text(l5B.x, l5B.y, (this.world) + ' - 5', this.constants.MenuButtonStyle("#000000"));
        l5B.setName('levelFactory');
        l5T.setName('world' + this.world + 'level5');

        this.buttons = [
            {button: l1B, text: l1T, sound: this.sound.get('slot-1')},
            {button: l2B, text: l2T, sound: this.sound.get('slot-2')},
            {button: l3B, text: l3T, sound: this.sound.get('slot-3')},
            {button: l4B, text: l4T, sound: this.sound.get('slot-4')},
            {button: l5B, text: l5T, sound: this.sound.get('slot-1')},
        ];
        
        this.stars = [];
        this.addLevelButtonInteraction(width, height);
    }

    /**
     * Styles level buttons and adds interactivity
     * @param {number} width 
     * @param {number} height 
     */
    addLevelButtonInteraction(width, height) {
        this.buttons.forEach(b => {
            b.button.setDisplaySize(width * 0.25, height * 0.2);
            b.button.setOrigin(0.5);
            b.text.setOrigin(0.5);
        });

        // Put a green outline and star around each compelted level,
        // put a red outline around next incomplete level
        // set alpha of rest as partial and uninteractable
        for (let i = 0; i < this.levelData.levels.length; i++) {
            if (this.levelData.levels[i].complete) {
                this.styleActiveButton(width, height, i, true);

            } else if ((i > 0 && this.levelData.levels[i - 1].complete) || i == 0) {
                this.styleActiveButton(width, height, i, false);

            } else {
                this.buttons[i].button.setAlpha(0.75);
                this.buttons[i].text.setAlpha(0.5);
            }
        }
    }

    /**
     * places green outline and star for complete, and red outline for incomplete
     * @param {number} width 
     * @param {number} height 
     * @param {number} index 
     * @param {boolean} complete 
     */
    styleActiveButton(width, height, index, complete) {
        let b = this.buttons[index];
        let highlight = new Phaser.Geom.Rectangle(
            b.button.x - width * 0.125,
            b.button.y - height * 0.1,
            width * 0.25,
            height * 0.2);
        let gfx = this.add.graphics().setDepth(3);

        gfx.lineStyle(15, (complete) ? this.constants.Blue : this.constants.Red, 1);
        gfx.strokeRectShape(highlight);

        // TODO: Make score translate to stars - a threshold gives you more (max 3) seen in report
        // add star
        if (complete) {
            let star = this.add.image(b.button.x + width * 0.0625, b.button.y, 'star');
            star.setDisplaySize(width * 0.05, width * 0.05);
            star.setOrigin(0.5);
            this.stars.push(star);
        }

        b.button.setInteractive();

        b.sound = (complete) ? this.sound.get('level-complete') : b.sound;
        b.button.on('pointerover', () => {
            b.button.setTint(this.constants.Red);
            b.text.setTint(0xFFF);

            // Play TTS
            if (complete) {
                let s = this.sound.get('level-complete');
                if (s.isPlaying) return;
                s.play({volume: this.game.config.ttsVolume});
            } else {
                this.playLevelTTS(index + 1);
            }
        }).on('pointerout', () => {
            b.button.clearTint();
            b.text.clearTint();
        });

        // add level play
        this.constants.HoverClick(this, b.button, () => {
            this.menuSounds.menuClick.play();
            this.scene.start(
                (this.playerCount == 1) ? b.button.name : 'storyReadyScene',
                {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                        levelName: b.button.name,
                        currentPlayer: 0,
                        world: this.world,
                    },
                    scene: {
                        prevScene: {
                            name: 'levelSelectMenu',
                            type: 'STORY',
                        },
                        nextScene: {
                            name: b.text.name,
                            type: 'STORY'
                        }
                    },
                    levels: this.levelData.levels
                }
            );
            this.scene.stop(this); // stop itself
        })
    }

    /**
     * plays the tts for levelNum by stitching level + levelnum
     * @param {number} levelNum 
     */
    playLevelTTS(levelNum) {
        let level = this.sound.get('level');
        if (level.isPlaying) return;

        let num = this.sound.get(String(levelNum));
        level.play({volume: this.game.config.ttsVolume});
        level.on('complete', () => {
            level.off('complete');
            num.play({volume: this.game.config.ttsVolume});
        });
    }
}