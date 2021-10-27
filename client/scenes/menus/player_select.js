/**
 * The menu seen in this slide: https://docs.google.com/presentation/d/1k2VFrhd0RngtsdU3UQYzQbVgNASu-717JjrWl4YOyiE/edit#slide=id.gf5b43401a7_0_6
 */
 import Phaser from "phaser";
 import Constants from "../../lib/constants";
 import QuitButton from "../../gameobjects/quit_button";

 export default class MenuScene8 extends Phaser.Scene {
    constructor() {
        super('playerSelectMenu');
    }

    /**
     * Initialize any scene vars
     * @param {{meta: {playerCount: number, difficulty: number}}} data
     */
    init(data) {
        // player count - Used in all levels
        this.players = (data.meta.playerCount) ? data.meta.playerCount : 0;
        this.difficulty = data.meta.difficulty;

        // Re-initialize timer if it persists from previous instance of MenuScene8
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

    /**
     * Preload function to run before Create();
     */
    preload() {
        // All sounds to be loaded
        // TODO add TTS sounds here for 'players' , '1 player' , '2 player', 'start'
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
            playersTTS: this.sound.add('players', { loop: false }),
            onePlayerTTS: this.sound.add('1-player', { loop: false }),
            twoPlayerTTS: this.sound.add('2-player', { loop: false }),
            startTTS: this.sound.add('start', { loop: false }),
        }
    }

    /**
     * Handles element creation - bg, title, player selection buttons, start button, quit
     */
    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        // BG
        const bg = this.add.image(width * 0.5, height * 0.5, 'space-bg');
        bg.setDisplaySize(width, height);

        // Center Box
        this.centerBox(width, height);

        // Title
        this.initTitle(width, height);

        // Players Area
        this.playerSection(width, height);

        // Start Logic
        this.startSection(width, height);

        // Quit Button
        const quitButton = new QuitButton(this, {
            backMenu: 'startMenu',
        });
    }

    /**
     * Creates a black box with white outline to place buttons over
     * @param {number} width
     * @param {number} height
     */
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
        const playerText = this.add.text(width * 0.5, height * 0.325, 'PLAYERS', this.constants.MenuTitleStyle());
        playerText.setOrigin(0.5);

        // interactives
        playerText.setInteractive();
        playerText.on('pointerover', () => {
            if (!this.menuSounds.playersTTS.isPlaying) {
                this.menuSounds.playersTTS.play();
            }
        });

    }

    /**
     * Creates 1 and 2 player buttons and adds interactivity. On selecting a button,
     * sets this.players to 1 or 2 and causes start button to strobe red/blue
     * @param {number} width
     * @param {number} height
     */
    playerSection(width, height) {
        const onePlayerButton = this.add.image(width * 0.375, height * 0.45, '__WHITE');
        const twoPlayerButton = this.add.image(width * 0.625, height * 0.45, '__WHITE');
        const onePlayerText = this.add.text(width * 0.375, height * 0.45, '1 PLAYER', this.constants.MenuButtonStyle());
        const twoPlayerText = this.add.text(width * 0.625, height * 0.45, '2 PLAYER', this.constants.MenuButtonStyle());
        onePlayerText.setName('1');
        twoPlayerText.setName('2');

        let buttons = [
            {button: onePlayerButton, text: onePlayerText, sound: this.menuSounds.onePlayerTTS},
            {button: twoPlayerButton, text: twoPlayerText, sound: this.menuSounds.twoPlayerTTS},
        ];
        buttons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .2, height * 0.08);
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
                if (!this.startReady()) {
                    b.button.setTint(this.constants.Gray);
                } else if (this.players != Number(b.text.name)) {
                    b.button.setTint(this.constants.Gray);
                } else {
                    b.button.setTint(this.constants.Blue);
                }
            });

            // Add hoverclick and normal click
            this.constants.HoverClick(this, b.button, () => {
                // Set player count & show on button (clear old tints and set new)
                this.players = b.text.name;
                buttons.forEach(b => b.button.setTint(this.constants.Gray));
                b.button.setTint(this.constants.Blue);
    
                this.menuSounds.menuClick.play();
                this.styleStart();
            });
        });
    }

    /**
     * Creates start button and adds interactivity. If this.players is set,
     * then start button can be interacted with and clicked to transition to 'gamemodeMenu'
     * @param {number} width
     * @param {number} height
     */
    startSection(width, height) {
        this.startButton = this.add.image(width * 0.5, height * 0.65, '__WHITE');
        this.startButton.setDisplaySize(width * 0.375, height * 0.12);
        this.startButton.setTint(this.constants.Gray);
        this.startButton.setOrigin(0.5);
        const startText = this.add.text(
            width * 0.5,
            height * 0.65,
            'START',
            this.constants.MenuButtonStyle()
        );
        startText.setOrigin(0.5);

        // Set interactiveness of button
        this.startButton.setInteractive();

        this.startButton.on('pointerover', () => {
            if (this.startReady()) {
                this.startButton.setTint(this.constants.Red);

                // Play tts if start is ready
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
                this.menuSounds.menuClick.play();
                this.scene.start(
                    'gamemodeMenu',
                    {
                        meta: {
                            playerCount: this.players, // TODO add player handling in later scenes
                            difficulty: this.difficulty,
                        }
                    }
                );
            }
        });
    }

    /**
     * If this.players is nonzero
     * @returns {boolean}
     */
    startReady() {
        return this.players;
    }

    /**
     * Toggles startbutton color between blue and red
     */
    invertColors = () => {
        if (this.startButton.tintTopLeft == this.constants.Red) {
            this.startButton.setTint(this.constants.Blue);
        } else {
            this.startButton.setTint(this.constants.Red);
        }
    }

    /**
     * If this.players is set, then creates a timer which changes the color of
     * the start button every 1 second between blue and red
     * @returns {void}
     */
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
