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
        this.playerCount = (data.meta.playerCount) ? data.meta.playerCount : 0;
        this.difficulty = data.meta.difficulty;
        
        // List of player objects {{button, text, sound}}
        this.players = [];

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
            bubbaTTS: this.sound.add('bubba', { loop: false }),
            friendTTS: this.sound.add('friend', { loop: false }),
            leahTTS: this.sound.add('leah', { loop: false }),
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
            allPlayerSelTTS: this.sound.add('players-selected', { loop: false }),
            playersTTS: this.sound.add('players', { loop: false }),
            onePlayerTTS: this.sound.add('1-player', { loop: false }),
            twoPlayerTTS: this.sound.add('2-player', { loop: false }),
            readyTTS: this.sound.add('ready-to-play', { loop: false }),
            startTTS: this.sound.add('start', { loop: false }),
            selTTS: this.sound.add('selected', { loop: false }),
            selAlreadyTTS: this.sound.add('selected-already', { loop: false }),
            whop1TTS: this.sound.add('who-p1', { loop: false }),
            whop2TTS: this.sound.add('who-p2', { loop: false }),
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

        // Init person section
        this.initPersonSection(width, height);
        this.personTitleInteraction();
        this.personButtonInteraction(width, height);

        // Center Box
        this.centerBox(width, height);

        // Title
        this.initTitle(width, height);

        // Players Area
        this.initPlayerSection(width, height);
        this.playerSectionInteraction(width, height);


        // Start Logic
        this.initStartSection(width, height);
        this.startSectionInteraction();

        // Quit Button
        const quitButton = new QuitButton(this, {
            backMenu: 'startMenu',
        });
    }

    /**
     * TODO PERSON SELECTION
     * 
     * adjust turret controls based on players
     * 
     * Distinct colors: Bubba: Green, Leah: Red, Friend: Blue
     */


    /**
     * Creates all person section components behind the centerbox to be revealed
     * when a number of players is selected.
     * @param {number} width 
     * @param {number} height 
     */
    initPersonSection(width, height) {
        // Person Title
        this.p1Text = this.add.text(width * 0.5, height * 0.475, 'WHO IS PLAYER 1?', this.constants.MenuTitleStyle());
        this.p2Text = this.add.text(width * 0.5, height * 0.475, 'WHO IS PLAYER 2?', this.constants.MenuTitleStyle());
        this.readyText = this.add.text(width * 0.5, height * 0.475, 'READY TO PLAY', this.constants.MenuTitleStyle());
        this.p1Text.setOrigin(0.5);
        this.p2Text.setOrigin(0.5);
        this.readyText.setOrigin(0.5);

        // Person Buttons
        const bubbaButton = this.add.image(width * 0.325, height * 0.6, '__WHITE');
        const leahButton = this.add.image(width * 0.5, height * 0.6, '__WHITE');
        const friendButton = this.add.image(width * 0.675, height * 0.6, '__WHITE');
        const bubbaText = this.add.text(width * 0.325, height * 0.6, 'Bubba', this.constants.MenuButtonStyle());
        const leahText = this.add.text(width * 0.5, height * 0.6, 'Leah', this.constants.MenuButtonStyle());
        const friendText = this.add.text(width * 0.675, height * 0.6, 'Friend', this.constants.MenuButtonStyle());
        bubbaButton.setName(this.constants.Green);
        bubbaText.setName("Bubba");
        leahButton.setName(this.constants.Red);
        leahText.setName("Leah");
        friendButton.setName(this.constants.Blue);
        friendText.setName("Friend");

        // TODO add correct TTS
        this.personButtons = [
            {button: bubbaButton, text: bubbaText, sound: this.menuSounds.bubbaTTS},
            {button: leahButton, text: leahText, sound: this.menuSounds.leahTTS},
            {button: friendButton, text: friendText, sound: this.menuSounds.friendTTS},
        ];
    }

    /**
     * Adds tts interaction to all person titles
     */
    personTitleInteraction() {
        [
            {text: this.p1Text, sound: this.menuSounds.whop1TTS},
            {text: this.p2Text, sound: this.menuSounds.whop2TTS},
            {text: this.readyText, sound: this.menuSounds.readyTTS},
        ].forEach(t => {
            t.text.setInteractive();
            t.text.on('pointerover', () => {
                if (t.text.depth > 0 && !t.sound.isPlaying) {
                    t.sound.play();
                }
            });
        });
    }

    /**
     * Adds interactions to person buttons created
     * @param {number} width 
     * @param {number} height 
     */
    personButtonInteraction(width, height) { 
        this.personButtons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .15, height * 0.08);
            b.button.setOrigin(0.5);
            b.button.setTint(this.constants.Gray);
            b.text.setOrigin(0.5);

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(this.constants.Red);

                // Play TTS here
                if (b.button.depth > 0 && !b.sound.isPlaying) {
                    b.sound.play();
                }
            }).on('pointerout', () => {
                // If button is a chosen player, leave it highlighted
                if (this.players.find(p => p.text.name == b.text.name)) {
                    b.button.setTint(b.button.name);
                } else {
                    b.button.setTint(this.constants.Gray);
                }
            });

            // Add player to this.players if not already added
            this.constants.HoverClick(this, b.button, () => {
                if (this.playerCount <= this.players.length) {
                    // Play TTS like All players selected
                    this.sound.pauseAll();
                    this.menuSounds.allPlayerSelTTS.play();
                    return;
                }
                if (this.players.find(p => p.text.name == b.text.name)) {
                    // Play TtS like player already selected
                    this.sound.pauseAll();
                    this.menuSounds.selAlreadyTTS.play()
                    return;
                }

                this.personButtons.forEach(
                    b => b.button.setTint(this.constants.Gray)
                ); // Clear tint

                this.players.push(b);
                this.players.forEach(p => p.button.setTint(p.button.name));
    
                this.menuSounds.menuClick.play();

                // Play tts like 'bubba selected'
                this.menuSounds.selTTS.play({delay: 0.25});

                // Style start if all players accounted for, else show next title
                if (this.playerCount == this.players.length) {
                    this.p1Text.setDepth(-1);
                    this.p2Text.setDepth(-1);
                    this.readyText.setDepth(2);
                    this.menuSounds.readyTTS.play({delay: 0.5});
                    this.styleStart();
                } else {
                    this.p1Text.setDepth(-1);
                    this.p2Text.setDepth(2);
                }
            });
        });
    }

    /**
     * Creates a black box with white outline to place buttons over
     * @param {number} width
     * @param {number} height
     */
    centerBox(width, height) {
        this.centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        this.centerOutline.setDisplaySize(width * 0.6505, height * 0.5505);
        this.centerOutline.setOrigin(0.5);

        this.center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        this.center.setDisplaySize(width * 0.65, height * 0.55);
        this.center.setTint(0x000000);
        this.center.setOrigin(0.5);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width
     * @param {number} height
     */
    initTitle(width, height) {
        this.playerText = this.add.text(width * 0.5, height * 0.325, 'PLAYERS', this.constants.MenuTitleStyle());
        this.playerText.setOrigin(0.5);

        // interactives
        this.playerText.setInteractive();
        this.playerText.on('pointerover', () => {
            if (!this.menuSounds.playersTTS.isPlaying) {
                this.menuSounds.playersTTS.play();
            }
        });

    }

    /**
     * Expands center section to display person selection
     * @param {number} width 
     * @param {number} height 
     */
    promptPersonSelection(width, height) {
        // Expand center section
        this.centerOutline.setDisplaySize(width * 0.6505, height * 0.8505);
        this.center.setDisplaySize(width * 0.65, height * 0.85);

        // Move up player text
        this.playerText.setPosition(this.playerText.x, height * 0.175);
        this.playerButtons.forEach(b => {
            b.button.setPosition(b.button.x, height * 0.3);
            b.text.setPosition(b.text.x, height * 0.3);
        });

        // Move down start text
        this.startButton.setPosition(this.startButton.x, height * 0.8);
        this.startText.setPosition(this.startText.x, height * 0.8);

        // Show person section and flash colors
        this.p2Text.setDepth(-1);
        this.readyText.setDepth(-1);
        this.p1Text.setDepth(2);
        this.personButtons.forEach(b => {
            b.button.setDepth(2);
            b.text.setDepth(2);

            this.constants.FlashColor(this, b.button, this.constants.Gray, 750)
        });

        // Clear this.players and clear startstyle
        this.players = [];
        this.startButton.setTint(this.constants.Gray);
        if (this.timer) this.timer.paused = true;
    }

    /**
     * Creates 1 and 2 player buttons
     * @param {number} width
     * @param {number} height
     */
    initPlayerSection(width, height) {
        const onePlayerButton = this.add.image(width * 0.375, height * 0.45, '__WHITE');
        const twoPlayerButton = this.add.image(width * 0.625, height * 0.45, '__WHITE');
        const onePlayerText = this.add.text(width * 0.375, height * 0.45, '1 PLAYER', this.constants.MenuButtonStyle());
        const twoPlayerText = this.add.text(width * 0.625, height * 0.45, '2 PLAYER', this.constants.MenuButtonStyle());
        onePlayerText.setName('1');
        twoPlayerText.setName('2');

        this.playerButtons = [
            {button: onePlayerButton, text: onePlayerText, sound: this.menuSounds.onePlayerTTS},
            {button: twoPlayerButton, text: twoPlayerText, sound: this.menuSounds.twoPlayerTTS},
        ];
    }

    /**
     * Adds interactions to player buttons created. On selecting a playercount,
     * user is asked to select players prior to being able to start
     * @param {number} width 
     * @param {number} height 
     */
    playerSectionInteraction(width, height) {
        this.playerButtons.forEach(b => {
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
                if (!this.playerNumSelected()) {
                    b.button.setTint(this.constants.Gray);
                } else if (this.playerCount != Number(b.text.name)) {
                    b.button.setTint(this.constants.Gray);
                } else {
                    b.button.setTint(this.constants.Blue);
                }
            });

            // Add hoverclick and normal click
            this.constants.HoverClick(this, b.button, () => {
                this.promptPersonSelection(width, height);
                
                // Set player count & show on button (clear old tints and set new)
                this.playerCount = b.text.name;
                this.playerButtons.forEach(b => b.button.setTint(this.constants.Gray));
                b.button.setTint(this.constants.Blue);
    
                this.menuSounds.menuClick.play();
            });
        });
    }

    /**
     * Creates start button
     * @param {number} width
     * @param {number} height
     */
    initStartSection(width, height) {
        this.startButton = this.add.image(width * 0.5, height * 0.65, '__WHITE');
        this.startButton.setDisplaySize(width * 0.375, height * 0.12);
        this.startButton.setTint(this.constants.Gray);
        this.startButton.setOrigin(0.5);
        this.startText = this.add.text(
            width * 0.5,
            height * 0.65,
            'START',
            this.constants.MenuButtonStyle()
        );
        this.startText.setOrigin(0.5);

    }

    /**
     * Adds interaction to start button. If this.players is set,
     * then start button can be interacted with and clicked to transition to 'gamemodeMenu'
     */
    startSectionInteraction() {
        // Set interactiveness of button
        this.startButton.setInteractive();

        this.startButton.on('pointerover', () => {
            if (this.playersSelected()) {
                this.startButton.setTint(this.constants.Red);

                // Play tts if start is ready
                if (!this.menuSounds.startTTS.isPlaying) {
                    this.menuSounds.startTTS.play();
                }
            }
        }).on('pointerout', () => {
            if (this.playersSelected()) {
                this.styleStart();
            } else {
                this.startButton.setTint(this.constants.Gray);
            }
        });

        // Add hoverclick and normal click
        this.constants.HoverClick(this, this.startButton, () => {
            if (this.playersSelected()) {
                this.timer.remove();
                this.menuSounds.menuClick.play();
                this.scene.start(
                    'gamemodeMenu',
                    {
                        meta: {
                            playerCount: this.playerCount, // TODO add player handling in later scenes
                            difficulty: this.difficulty,
                            players: this.players.map(x => x.text.name)
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
    playerNumSelected() {
        return this.playerCount;
    }

    /**
     * If all players are selected
     * @returns {boolean}
     */
    playersSelected() {
        return this.playerNumSelected() && this.playerCount == this.players.length;
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
        if (!this.playerNumSelected()) {
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
