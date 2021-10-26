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
     * @param {{meta: {playerCount: number, difficulty: number}, level: {score1: number, score2: number, shotsFired: number}, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}}} data
     */
    init(data) {
        // Set game metadata
        this.players = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;

        // Set level data
        this.levelScore1 = data.level.score1;
        this.levelScore2 = data.level.score2;
        // this.totalShots = data.level.shotsFired;

        // Set scene data
        this.prevScene = data.scene.prevScene;

        // Specific level report card data
        console.log("initialized ReportScene for ", this.players, " players")
        console.log(data);
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
            levelCompleteTTS: this.sound.add('level-complete', { loop: false }),
            scoreTTS: this.sound.add('score', { loop: false }),
            // accuracyTTS: this.sound.add('accuracy', { loop: false }),
            replayTTS: this.sound.add('replay', { loop: false }),
            arcadeTTS: this.sound.add('arcade', { loop: false }),
        }

        // Init animations
        this.explode = this.anims.create({
            key: 'explode',
            frames: [
                {key: 'ex-1', duration: 100},
                {key: 'ex-2', duration: 100},
                {key: 'ex-3', duration: 100},
            ],
            repeat: 1,
        });
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

        // Highscore Report
        //TODO use server method to load a saved highscore

        // Replay / Back Buttons
        this.navigationSection(width, height);

        // quit button
        const quitButton = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            data: {
                meta: {
                    playerCount: this.players,
                    difficulty: this.difficulty,
                }
            }
        })
    }

    /**
     * Creates a black box with white outline to place buttons over
     * @param {number} width
     * @param {number} height
     */
    centerBox(width, height) {
        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.6505, height * 0.7505);
        centerOutline.setOrigin(0.5);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.65, height * 0.75);
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
            height * 0.2,
            'Level Complete!',
            this.constants.MenuTitleStyle()
        );
        title.setOrigin(0.5);

        // Add TTS
        title.setInteractive();
        title.on('pointerover', () => {
            if (!this.menuSounds.levelCompleteTTS.isPlaying) {
                this.menuSounds.levelCompleteTTS.play();
            }
        })
    }

    /**
     * Display score and accuracy from the previous level
     * @param {number} width
     * @param {number} height
     */
    levelReport(width, height) {
        let ttsArr = [];

        const score1Text = this.add.text(width * 0.275, height * 0.35, 'PLAYER 1 SCORE :', this.constants.MenuButtonStyle());
        const score1Val = this.add.text(
            width * 0.675,
            height * 0.35,
            this.constants.ZeroPad(this.levelScore1, 4),
            this.constants.MenuButtonStyle("#FF0000")
        );
        score1Val.setOrigin(1, 0);
        ttsArr.push({text: score1Text, sound: this.menuSounds.scoreTTS});

        if (this.players === 2) {
            const score2Text = this.add.text(width * 0.275, height * 0.425, 'PLAYER 2 SCORE :', this.constants.MenuButtonStyle());
            const score2Val = this.add.text(
                width * 0.675,
                height * 0.425,
                this.constants.ZeroPad(this.levelScore2, 4),
                this.constants.MenuButtonStyle("#FF0000")
            );
            score2Val.setOrigin(1, 0);
            ttsArr.push({text: score2Text, sound: this.menuSounds.scoreTTS});
        }

        // Do we want to show accuracy if bubba will be using an eyetracker which
        // constantly fires bullets? -- Disabled for Alpha
        // const accuracyText = this.add.text(width * 0.275, height * 0.425, 'ACCURACY :', this.constants.MenuButtonStyle());
        // const accuracyVal = this.add.text(
        //     width * 0.675,
        //     height * 0.425,
        //     (this.levelScore / this.totalShots * 10).toString().substr(0,4) + "%",
        //     this.constants.MenuButtonStyle("#FF0000")
        // );
        // accuracyVal.setOrigin(1, 0);

        ttsArr.forEach(t => {
            t.text.setInteractive();

            t.text.on('pointerover', () => {
                if (!t.sound.isPlaying) {
                    t.sound.play();
                }
            })
        })
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
            alien.place(width * 0.725, height * 0.4);

            // set box interaction
            let box = this.add.image(width * 0.725, height * 0.4, '__WHITE');
            box.setDisplaySize(150, 200)
            box.setAlpha(0.01);
            box.setOrigin(0.5);

            box.setInteractive();
            box.on('pointerup', () => {
                alien.play('explode');
                alien.on('animationcomplete', () => {
                    setTimeout(() => {
                        alien.play('float');
                    }, 300);
                })
            })
        }
    }

    /**
     * Navigation which either replays the last level, or returns to the arcade menu
     * @param {number} width
     * @param {number} height
     */
    navigationSection(width, height) {
        const replayButton = this.add.image(width * 0.375, height * 0.75, '__WHITE');
        const arcadeButton = this.add.image(width * 0.625, height * 0.75, '__WHITE');
        const replayText = this.add.text(width * 0.375, height * 0.75, 'REPLAY', this.constants.MenuButtonStyle());
        const arcadeText = this.add.text(width * 0.625, height * 0.75, 'ARCADE', this.constants.MenuButtonStyle());
        replayText.setName(this.prevScene.name);
        arcadeText.setName('arcadeMenu');

        let buttons = [
            {button: replayButton, text: replayText, sound: this.menuSounds.replayTTS},
            {button: arcadeButton, text: arcadeText, sound: this.menuSounds.arcadeTTS},
        ];
        buttons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .2, height * 0.08);
            b.button.setOrigin(0.5);
            b.button.setTint(0x808080);
            b.text.setOrigin(0.5);

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);

                // Play TTS here
                if (!b.sound.isPlaying) {
                    b.sound.play();
                }
            }).on('pointerout', () => {
                b.button.setTint(0x808080);
            }).on('pointerup', () => {
                this.menuSounds.menuClick.play();

                // Transition to different scene based on text name
                this.scene.start(b.text.name,
                    {
                        meta: {
                            playerCount: this.players,
                            difficulty: this.difficulty,
                        }
                    }
                )
            })
        });
    }
}
