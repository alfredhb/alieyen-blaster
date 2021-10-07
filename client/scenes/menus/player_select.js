/**
 * The menu seen in this slide: https://docs.google.com/presentation/d/1k2VFrhd0RngtsdU3UQYzQbVgNASu-717JjrWl4YOyiE/edit#slide=id.gf5b43401a7_0_6
 */

 import { ready } from "jquery";
 import Phaser from "phaser";
 import QuitButton from "../../gameobjects/quit_button";
 
 const titleStyle = {
    fontFamily: 'impact',
    fontSize: "75px",
    color: "#FFF"
 }
 const buttonStyle = {
    fontFamily: 'impact',
    fontSize: "50px",
    color: "#FFF"
 }
 
 export default class MenuScene8 extends Phaser.Scene {
    constructor() {
        super('playerSelectMenu');
    }
    
    // Initialize any scene vars
    init() {
        // player count - Used in all levels
        this.players = 0;

        // Re-initialize timer if it persists from previous instance of MenuScene8
        if (this.timer) {
            this.timer = this.time.addEvent({
                delay: 1000,
                callback: this.resolveFunc,
                callbackScope: this,
                loop: true,
                paused: true,
            });
        }
    }

    preload() {
        // All sounds to be loaded
        // TODO add TTS sounds here for 'players' , '1 player' , '2 player', 'start'
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {
        const { width, height } = this.scale;

        // BG
        const bg = this.add.image(width * 0.5, height * 0.5, 'space-bg');
        bg.setDisplaySize(width, height);

        // Input
        // TODO: Delete me
        this.cursor = this.input.activePointer;

        // Center Box
        this.centerBox(width, height);

        // Players Area
        this.playerSection(width, height);
        
        // Start Logic
        this.startSection(width, height);

        // Quit Button
        const quitButton = new QuitButton(this, {
            backMenu: 'startMenu',
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

    playerSection(width, height) {
        const playerText = this.add.text(width * 0.5, height * 0.325, 'PLAYERS', titleStyle);
        playerText.setOrigin(0.5);

        const onePlayerButton = this.add.image(width * 0.375, height * 0.45, '__WHITE');
        const twoPlayerButton = this.add.image(width * 0.625, height * 0.45, '__WHITE');
        const onePlayerText = this.add.text(width * 0.375, height * 0.45, '1 PLAYER', buttonStyle);
        const twoPlayerText = this.add.text(width * 0.625, height * 0.45, '2 PLAYER', buttonStyle);
        onePlayerText.setName('1');
        twoPlayerText.setName('2');

        let buttons = [
            {button: onePlayerButton, text: onePlayerText, sound: null},
            {button: twoPlayerButton, text: twoPlayerText, sound: null},
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
            }).on('pointerout', () => {
                if (!this.startReady()) {
                    b.button.setTint(0x808080);
                } else if (this.players != Number(b.text.name)) {
                    b.button.setTint(0x808080);
                } else {
                    b.button.setTint(0x0000FF);
                }
            }).on('pointerup', () => {
                // Set player count & show on button (clear old tints and set new)
                this.players = Number(b.text.name);
                buttons.forEach(b => b.button.setTint(0x808080));
                b.button.setTint(0x0000FF);

                // TODO: Remove me
                console.log("set player count to ", this.players)

                this.menuSounds.menuClick.play();
                this.styleStart();
            })
        });
    }

    startSection(width, height) {
        this.startButton = this.add.image(width * 0.5, height * 0.65, '__WHITE');
        this.startButton.setDisplaySize(width * 0.375, height * 0.12);
        this.startButton.setTint(0x808080);
        this.startButton.setOrigin(0.5);
        const startText = this.add.text(width * 0.5, height * 0.65, 'START', buttonStyle);
        startText.setOrigin(0.5);

        // Set interactiveness of button
        this.startButton.setInteractive();

        this.startButton.on('pointerover', () => {
            if (this.startReady()) {
                this.startButton.setTint(0xFF0000);
            }
        }).on('pointerout', () => {
            if (this.startReady()) {
                this.styleStart();
            } else {
                this.startButton.setTint(0x808080);
            }
        }).on('pointerup', () => {
            if (this.startReady()) {
                this.timer.remove();
                this.menuSounds.menuClick.play();
                this.scene.start(
                    'gamemodeMenu',
                    {
                        playerCount: this.players,
                    }
                );
            }
        });
    }
    
    startReady() {
        return this.players;
    }
    
    resolveFunc = () => {
        if (this.startButton.tintTopLeft == 0xFF0000) {
            this.startButton.setTint(0x0000FF);
        } else {
            this.startButton.setTint(0xFF0000);
        }
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
        this.startButton.setTint(0x0000FF);
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.resolveFunc,
            callbackScope: this,
            loop: true,
            paused: false,
        });
    }
 }