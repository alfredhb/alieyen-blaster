import { Meteor } from 'meteor/meteor';
import Phaser from "phaser";
import Constants from "../../../lib/constants";
import QuitButton from "../../../gameobjects/quit_button";
import HelpButton from '../../../gameobjects/help_button';
import AlienGrunt from "../../../gameobjects/alien_grunt";

export default class StoryReportScene extends Phaser.Scene {
    constructor() {
        super('storyReportScene');
    }

    /**
     * Capture the next scene to progress to after selections are made
     * @param {{
     *  meta: {
     *      playerCount: number, 
     *      difficulty: number, 
     *      players: string[]
     *  }, 
     *  level: {
     *      objective: number,
     *      objComplete: boolean,
     *      score1: number?, 
     *      score2: number?, 
     *      shotsFired: number,
     *  }, 
     *  scene: { 
     *      prevScene: { 
     *          name: string, 
     *          type: string
     *      }, 
     *      nextScene: { 
     *          name: string, 
     *          type: string
     *      },
     *      name: string
     *  }
     * }} data
     */
    init(data) {
        this.levelData = data;

        // prevSceneLevelName
        this.name = data.scene.name;

        // Set game metadata
        this.playerCount = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;
        this.players = data.meta.players;

        // Set level data
        this.levelScore1 = data.level.score1 | 0;
        this.levelScore2 = data.level.score2 | 0;
        // this.totalShots = data.level.shotsFired;

        // Set scene data
        this.prevScene = data.scene.prevScene;

        if (this.levelData.level.objComplete) {
            this.starsEarned = this.getStarCount(this.calculateScore());
            Meteor.call("saveLevelData", this.game.config.gameslot, this.name, this.starsEarned, (err, res) => {
                if (err != null) {
                    console.log(err);
                    return;
                }
    
                this.attachSlotData(res, true);
            });
        } else {
            Meteor.call('getSlotData', this.game.config.gameslot, (err, res) => {
                if (err != null) {
                    console.log(err);
                    return;
                }
    
                this.attachSlotData(res);
            })
        }

        // Specific level report card data
        console.log("initialized ReportScene for ", this.playerCount, " players")
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.get('menu-click'),
            storyTTS: this.sound.get('story'),
            levelCompleteTTS: this.sound.get('level-complete'),
            replayTTS: this.sound.get('replay'),
            scoreTTS: this.sound.get('score'),
        }

        // Init animations
        this.explode = this.anims.get('explode');
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
        this.levelReport(width, height);

        // place star outlines
        this.starOutlines(width, height);

        // Add Alien Dummy
        this.initSprite(width, height);

        // Replay / Back Buttons
        this.navigationSection(width, height);

        // Add help button
        this.help = new HelpButton(this);
    }

    /**
     * saves the slot data to transitionary components and adds interactivity
     * @param {object} data 
     * @param {boolean} objComplete
     */
    attachSlotData(data, objComplete) {
        this.levelData.levels = data.levels
        
        this.addClick(this.buttons);

        // add completed stars
        if (objComplete) {
            this.placeStars();
        }

        // quit button
        const quitButton = new QuitButton(this, {
            backMenu: 'levelSelectMenu',
            data: {
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    players: this.players,
                    world: this.levelData.meta.world
                },
                levels: this.levelData.levels
            }
        });
    }

    update() {
    }

    /**
     * Creates a black box with white outline to place buttons over
     * @param {number} width
     * @param {number} height
     */
    centerBox(width, height) {
        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.7505, height * 0.8255);
        centerOutline.setOrigin(0.5);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.75, height * 0.825);
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
            height * 0.175,
            (this.levelData.level.objComplete) ? 'Level Complete!' : 'You Lost!',
            this.constants.MenuTitleStyle()
        );
        title.setOrigin(0.5);

        // Add TTS
        title.setInteractive();
        if (this.levelData.level.objComplete) {
            title.on('pointerover', () => {
                if (!this.menuSounds.levelCompleteTTS.isPlaying) {
                    this.menuSounds.levelCompleteTTS.play({volume: this.game.config.ttsVolume});
                }
            });
        } else {
            // Play levelfailed tts
        }
    }

    /**
     * If level.liveScore exists for players, then increases the scores for each
     * and returns the values
     * @returns {number[]}
     */
    calculateScore() {
        let scores = [];
        for (let i = 0; i < this.levelData.meta.playerCount; i++) {
            let score = this["levelScore" + (i + 1)];
            let lives = this.levelData.level["liveScore" + (i + 1)];

            score += (lives > 0) ? lives * 100 : 0;
            scores.push(score);
        }

        return scores;
    }

    /**
     * Reads the star thresholds from level data and compares them to the best
     * score in scores. returns the highest star count achieved. star thresholds
     * are multiplied with difficulty.
     * TODO: update star thresholds to match difficulty
     * @param {number[]} scores 
     * @returns {number}
     */
    getStarCount(scores) {
        let bestScore = 0;
        for (let score of scores) {
            bestScore = (score > bestScore) ? score : bestScore;
        }

        let multiplier = this.levelData.level?.difficulty_multiplier[this.levelData.meta.difficulty - 1];
        if (!multiplier > 0) multiplier = 1; // failed to get multiplier

        let stars = 1; // start with one star if completed 
        for (let star_t of this.levelData.level.star_threshold) {
            if (star_t * multiplier <= bestScore) stars += 1; // only increment if bestScore exceeds the threshold
        }

        return stars;
    }

    /**
     * Display score and accuracy from the previous level
     * @param {number} width
     * @param {number} height
     */
    levelReport(width, height) {
        let ttsArr = [];

        this.playerScoresVals = [];
        const score1Text = this.add.text(
            width * 0.2,
            height * 0.275,
            this.constants.Capitalize(this.players[0]) + "'s Score:",
            this.constants.MenuButtonStyle()
        );
        const score1Val = this.add.text(
            width * 0.775,
            height * 0.275,
            this.constants.ZeroPad(this.levelScore1, 4),
            this.constants.MenuButtonStyle("#FF0000")
        );
        score1Val.setOrigin(1, 0);
        this.playerScoresVals.push(score1Val);
        ttsArr.push({text: score1Text, sound: this.sound.get(this.players[0])});

        if (this.playerCount == 2) {
            const score2Text = this.add.text(
                width * 0.2,
                height * 0.35,
                this.constants.Capitalize(this.players[1]) + "'s Score:",
                this.constants.MenuButtonStyle()
            );
            const score2Val = this.add.text(
                width * 0.775,
                height * 0.35,
                this.constants.ZeroPad(this.levelScore2, 4),
                this.constants.MenuButtonStyle("#FF0000")
            );
            score2Val.setOrigin(1, 0);
            this.playerScoresVals.push(score2Val);
            ttsArr.push({text: score2Text, sound: this.sound.get(this.players[1])});
        }

        this.placeLivesScore(width, height);

        ttsArr.forEach(t => {
            t.text.setInteractive();

            t.text.on('pointerover', () => {
                if (!this.menuSounds.scoreTTS.isPlaying) {
                    t.sound.play({volume: this.game.config.ttsVolume});
                    this.menuSounds.scoreTTS.play({
                        volume: this.game.config.ttsVolume,
                        delay: 0.75
                    })
                }
            })
        })
    }

    /**
     * Places star outlines where stars would go if earned. This is done regardless
     * of completion of level to show how many stars can be earned.
     * @param {number} width 
     * @param {number} height 
     */
    starOutlines(width, height) {
        let o1 = this.add.image(width * 0.5, height * 0.55, 'star-outline');
        let o2 = this.add.image(width * 0.37, height * 0.55, 'star-outline');
        let o3 = this.add.image(width * 0.63, height * 0.55, 'star-outline');

        [o1, o2, o3].forEach(o => {
            o.setDisplaySize(width * 0.125,width * 0.125);
            o.setOrigin(0.5);
        });
    }

    /**
     * Places a star over each outline if it was earned on a 350ms timer.
     * also plays collect powerup sound effect for each
     */
    placeStars() {
        let width = this.constants.Width, height = this.constants.Height;
        for (let i = 0; i < this.starsEarned; i++) {
            setTimeout(() => {
                this.sound.play('collect-powerup', { volume: this.game.config.sfxVolume });

                let star = this.add.image(width * 0.37 + i * width * 0.13, height * 0.55, 'star');
                star.setDisplaySize(width * 0.125, width * 0.125);
                star.setOrigin(0.5);
            }, i * 350);
        }
    }

    // Add life score counter --> places it between name and score, then plays
    // an animation showing how much score increases per life person had
    /**
     * Requires level.liveScore# to exist for each player. Places num lives as
     * icons to the left of score and animates score increasing for each life left.
     * After updating all scores, checks for best score and updates starcount if 
     * the result is more than already gained
     * @param {number} width 
     * @param {number} height 
     */
    placeLivesScore(width, height) {
        // place lives.
        let lives = [];
        for (let i = 0; i < this.levelData.meta.playerCount; i++) {
            let pLives = [];
            let lifeHeight = height * 0.275 + i * height * 0.075;

            let numLives = this.levelData.level["liveScore" + (i + 1)];
            for (let j = 0; j < numLives; j++) {
                let life = this.add.sprite(width * 0.65 - j * width * 0.056, lifeHeight, 'full-heart-outline');
                life.setDisplaySize(width * 0.055, width * 0.055).setOrigin(1, 0.125);
                pLives.push(life);
            }

            lives.push(pLives);
        }

        // Animate lives
        setTimeout(() => {
            for (let i = 0; i < lives.length; i ++) {
                // play powerup animation and sound, and hide life, then increment
                // associated player score
                for (let j = lives[i].length - 1; j >= 0; j--) {
                    lives[i][j].on('animationcomplete', () => {
                        lives[i][j].setDepth(-1);

                        this.addLifeScore(i);

                        // play next powerup
                        if (j - 1 >= 0) {
                            lives[i][j - 1].play('collect-powerup-animation');
                        }
                        else if (lives.length > 1) {
                            if (lives[0].length > lives[1].length && i == 0) {
                                console.log("update star count");
                            } else if (lives[0].length <= lives[1].length && i == 1) {
                                console.log("update star count");
                            }
                        } else console.log("update star count");
                    });
                }
            }
            lives.forEach(pL => {
                if (pL.length) pL[pL.length - 1].play('collect-powerup-animation')
            });
        }, 500);
    }

    /**
     * Adds one life's score to playerscoreVal and animates it
     * @param {number} i index of player
     */
    addLifeScore(i) {
        this["levelScore" + (i + 1)] += 100;
        this.playerScoresVals[i].setText(this.constants.ZeroPad(this["levelScore" + (i + 1)], 4));
        this.playerScoresVals[i].setColor("#FFFFFF");
        let reColor = this.time.addEvent({
            delay: 350,
            callback: () => {this.playerScoresVals[i].setColor("#FF0000")},
            callbackScope: this,
            paused: false,
            repeat: false
        });
    }

    /**
     * Creates an alien grunt which can be clicked to explode for fun (dummy)
     * click agent is invisible box behind alien?
     * @param {number} width
     * @param {number} height
     */
    initSprite(width, height) {
        // Create Alien
        let aliens = this.physics.add.group({
            classType: AlienGrunt,
            runChildUpdate: true,
            maxSize: 1,
        });

        let alien = aliens.get();
        if (alien) {
            alien.place(width * 0.825, height * 0.325);

            // set box interaction
            let box = this.add.image(width * 0.825, height * 0.325, '__WHITE');
            box.setDisplaySize(width * 0.03, height * 0.05)
            box.setAlpha(0.01);
            box.setOrigin(0.5);

            box.setInteractive();
            this.constants.HoverClick(this, box, () => {
                this.sound.play('explode-3', { loop: false, volume: 0.25 * this.game.config.sfxVolume });
                alien.play('explode');
                alien.on('animationcomplete', () => {
                    setTimeout(() => {
                        alien.play('alien-grunt-float');
                    }, 300);
                })
            });
        }
    }

    /**
     * Navigation which either replays the last level, or returns to the levelselect menu
     * @param {number} width
     * @param {number} height
     */
    navigationSection(width, height) {
        const replayButton = this.add.image(width * 0.325, height * 0.775, '__WHITE');
        const continueButton = this.add.image(width * 0.675, height * 0.775, '__WHITE');
        const replayText = this.add.text(width * 0.325, height * 0.775, 'REPLAY', this.constants.MenuButtonStyle());
        const continueText = this.add.text(width * 0.675, height * 0.775, 'CONTINUE', this.constants.MenuButtonStyle());
        replayText.setName(this.prevScene.name);
        continueText.setName('levelSelectMenu');

        this.buttons = [
            {button: replayButton, text: replayText, sound: this.menuSounds.replayTTS},
            {button: continueButton, text: continueText, sound: this.menuSounds.storyTTS},
        ];
        this.buttons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .3, height * 0.175);
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
        });
    }

    /**
     * adds hover click for each navigation button. Replay sends to levelfactory
     * @param {{button: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text, sound: Phaser.Sound.BaseSound}[]} b 
     */
    addClick(b) {
        // hoverclick for replay
        this.constants.HoverClick(this, b[0].button, () => {
            this.menuSounds.menuClick.play({ volume: this.game.config.sfxVolume });
            this.scene.start(
                (this.playerCount == 1) ? 'levelFactory': 'storyReadyScene',
                {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                        levelName: b[0].text.name,
                        currentPlayer: 0,
                        world: this.name[5], // in case meta.world is unpopulated
                    },
                    scene: {
                        prevScene: {
                            name: 'levelSelectMenu',
                            type: 'STORY',
                        },
                        nextScene: {
                            name: this.levelData.scene.prevScene.name,
                            type: this.levelData.scene.prevScene.type
                        }
                    },
                    levels: this.levelData.levels
                }
            );
            this.scene.stop(this); // stop itself
        });

        // hoverclick for story
        this.constants.HoverClick(this, b[1].button, () => {
            this.menuSounds.menuClick.play({ volume: this.game.config.sfxVolume });
        
            let world = (this.name[5] == 'B') ? "worldSelectMenu" : 'levelSelectMenu';

            this.scene.start(
                world,
                {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                        currentPlayer: this.players[0],
                        world: this.name[5],
                    },
                    levels: this.levelData.levels
                }
            );
            this.scene.stop(this); // stop itself
        });
    }
}
