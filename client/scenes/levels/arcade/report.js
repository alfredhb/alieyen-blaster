import { Meteor } from 'meteor/meteor';
import Phaser from "phaser";
import Constants from "../../../lib/constants";
import QuitButton from "../../../gameobjects/quit_button";
import AlienGrunt from "../../../gameobjects/alien_grunt";

export default class ArcadeReportScene extends Phaser.Scene {
    constructor() {
        super('arcadeReportScene');
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
     *      }
     *  }
     * }} data
     */
    init(data) {
        this.levelData = data;

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

        // Set Best Score
        this.bestScore = (this.levelScore1 > this.levelScore2) ?
            {score: this.levelScore1, player: this.players[0]} :
            {score: this.levelScore2, player: this.players[1]}

        // Fetch Highscore
        this.highscore = { player: "None", score: 0 };
        Meteor.call("getHighScore", 'arcade', 'timed', this.bestScore, (err, res) => {
            if (err != null) {
                console.log(err);
                return;
            }

            // Initialize highscore report once data is returned.
            const { width, height } = this.scale;
            this.highscore = res;
            this.highscoreReport(width, height);
            this.styleHighScorer(width, height);
        });

        // Specific level report card data
        console.log("initialized ReportScene for ", this.playerCount, " players")
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.get('menu-click'),
            arcadeTTS: this.sound.get('arcade'),
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

        // Add Alien Dummy
        this.initSprite(width, height);

        // Replay / Back Buttons
        this.navigationSection(width, height);

        // quit button
        const quitButton = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            data: {
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    players: this.players,
                }
            }
        });
    }

    update() {
        if (this.highscoreStar) {
            this.highscoreStar.rotation += 0.01;
        }
    }

    /**
     * Creates a black box with white outline to place buttons over
     * @param {number} width
     * @param {number} height
     */
    centerBox(width, height) {
        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.6505, height * 0.8255);
        centerOutline.setOrigin(0.5);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.65, height * 0.825);
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
                    this.menuSounds.levelCompleteTTS.play();
                }
            });
        } else {
            // Play levelfailed tts
        }
    }

    /**
     * Display score and accuracy from the previous level
     * @param {number} width
     * @param {number} height
     */
    levelReport(width, height) {
        let ttsArr = [];

        const score1Text = this.add.text(
            width * 0.275,
            height * 0.275,
            this.constants.Capitalize(this.players[0]) + "'s Score:",
            this.constants.MenuButtonStyle()
        );
        const score1Val = this.add.text(
            width * 0.675,
            height * 0.275,
            this.constants.ZeroPad(this.levelScore1, 4),
            this.constants.MenuButtonStyle("#FF0000")
        );
        score1Val.setOrigin(1, 0);
        ttsArr.push({text: score1Text, sound: this.sound.get(this.players[0])});

        if (this.playerCount == 2) {
            const score2Text = this.add.text(
                width * 0.275,
                height * 0.35,
                this.constants.Capitalize(this.players[1]) + "'s Score:",
                this.constants.MenuButtonStyle()
            );
            const score2Val = this.add.text(
                width * 0.675,
                height * 0.35,
                this.constants.ZeroPad(this.levelScore2, 4),
                this.constants.MenuButtonStyle("#FF0000")
            );
            score2Val.setOrigin(1, 0);
            ttsArr.push({text: score2Text, sound: this.sound.get(this.players[1])});
        }

        ttsArr.forEach(t => {
            t.text.setInteractive();

            t.text.on('pointerover', () => {
                if (!this.menuSounds.scoreTTS.isPlaying) {
                    t.sound.play();
                    this.menuSounds.scoreTTS.play({delay: 0.75})
                }
            })
        })
    }

    /**
     * Posts the Highscore for this level including player who accomplished it
     * @param {number} width
     * @param {number} height
     */
    highscoreReport(width, height) {
        const title = this.add.text(
            width * 0.5,
            height * .5,
            'HIGHSCORE',
            this.constants.MenuButtonStyle()
        );
        const highscorePlayer = this.add.text(
            width * 0.275,
            height * 0.575,
            this.constants.Capitalize(this.highscore.player) + ": ",
            this.constants.MenuButtonStyle()
        );
        const highscoreVal = this.add.text(
            width * 0.675,
            height * 0.575,
            this.constants.ZeroPad(this.highscore.score, 4),
            this.constants.MenuButtonStyle("#00FF00")
        );
        title.setName('highscore');
        highscorePlayer.setName(this.highscore.player);
        highscoreVal.setName('score');

        [title, highscorePlayer, highscoreVal].forEach(t => {
            title.setOrigin(0.5);

            t.setInteractive();
            t.on('pointerover', () => {
                this.sound.stopAll();
                this.sound.play(t.name);
            });
        });
    }

    /**
     * Places a spinning golden star to the left of the player who just set a highscore
     * or who's score matches their previous highscore
     * @param {number} width
     * @param {number} height
     */
    styleHighScorer(width, height) {
        if (this.bestScore.score != this.highscore.score ||
            this.bestScore.player != this.highscore.player) {
            return;
        }

        // Determine player who has best score and give them a lil star
        if (this.players[0] == this.bestScore.player) {
            this.highscoreStar = this.add.image(width * 0.225, height * 0.3, 'star');
        } else {
            this.highscoreStar = this.add.image(width * 0.225, height * 0.375, 'star');
        }
        this.highscoreStar.setDisplaySize(width * 0.05, width * 0.05);

        this.highscoreStar.setInteractive();
        this.highscoreStar.on('pointerover', () => {
            this.sound.stopAll();
            this.sound.play('new-highscore');
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
            alien.place(width * 0.725, height * 0.325);

            // set box interaction
            let box = this.add.image(width * 0.725, height * 0.4, '__WHITE');
            box.setDisplaySize(150, 200)
            box.setAlpha(0.01);
            box.setOrigin(0.5);

            box.setInteractive();
            this.constants.HoverClick(this, box, () => {
                this.sound.play('explode-3', { loop: false, volume: 0.25 });
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
     * Navigation which either replays the last level, or returns to the arcade menu
     * @param {number} width
     * @param {number} height
     */
    navigationSection(width, height) {
        const replayButton = this.add.image(width * 0.35, height * 0.8, '__WHITE');
        const arcadeButton = this.add.image(width * 0.65, height * 0.8, '__WHITE');
        const replayText = this.add.text(width * 0.35, height * 0.8, 'REPLAY', this.constants.MenuButtonStyle());
        const arcadeText = this.add.text(width * 0.65, height * 0.8, 'ARCADE', this.constants.MenuButtonStyle());
        replayText.setName(this.prevScene.name);
        arcadeText.setName('arcadeMenu');

        let buttons = [
            {button: replayButton, text: replayText, sound: this.menuSounds.replayTTS},
            {button: arcadeButton, text: arcadeText, sound: this.menuSounds.arcadeTTS},
        ];
        buttons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .25, height * 0.1);
            b.button.setOrigin(0.5);
            b.button.setTint(this.constants.Gray);
            b.text.setOrigin(0.5);

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(this.constants.Red);

                // Play TTS here
                if (!b.sound.isPlaying) {
                    b.sound.play();
                }
            }).on('pointerout', () => {
                b.button.setTint(this.constants.Gray);
            });
        });

        this.addClick(buttons);
    }

    /**
     * adds hover click for each navigation button. Replay sends to levelfactory
     * @param {{button: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text, sound: Phaser.Sound.BaseSound}[]} b 
     */
    addClick(b) {
        // hoverclick for replay
        this.constants.HoverClick(this, b[0].button, () => {
            this.menuSounds.menuClick.play();

            this.scene.start(
                (this.playerCount == 1) ? 'levelFactory': 'arcadeReadyScene',
                {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                        levelName: b[0].text.name,
                        currentPlayer: 0,
                    },
                    scene: {
                        prevScene: {
                            name: 'arcadeMenu',
                            type: 'ARCADE',
                        },
                        nextScene: {
                            name: this.levelData.scene.prevScene.name,
                            type: this.levelData.scene.prevScene.type
                        }
                    }
                }
            )
        });

        // hoverclick for arcade
        this.constants.HoverClick(this, b[1].button, () => {
            this.menuSounds.menuClick.play();

            this.scene.start(
                'arcadeMenu',
                {
                    meta: {
                        playerCount: this.playerCount,
                        difficulty: this.difficulty,
                        players: this.players,
                        currentPlayer: this.players[0],
                    }
                }
            )
        });
    }
}
