/**
 * The menu seen in this slide: https://docs.google.com/presentation/d/1k2VFrhd0RngtsdU3UQYzQbVgNASu-717JjrWl4YOyiE/edit#slide=id.gf155f0bac5_0_40
 */

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
 
 export default class MenuScene9 extends Phaser.Scene {constructor() {
        super('difficultySelectMenu');
    }
    
    // Capture the next scene to progress to after selections are made
    init(data) {
        this.nextScene = data.nextScene;
        this.prevScene = data.prevScene; // {scene: string, type: enum{'ARCADE' || STORY'}
        this.players = data.players;

        // Game data holds player count in a central place
        this.difficulty = 0;
        
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
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {      
        const { width, height } = this.scale;

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

        // Difficulty Area
        this.difficultySection(width, height);

        // Start Logic
        this.startSection(width, height);

        

        // Quit Button
        const quitButton = new QuitButton(this, {
            backMenu: this.prevScene.scene,
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

    difficultySection(width, height) {
        const difficultyText = this.add.text(width * 0.5, height * 0.325, 'DIFFICULTY', titleStyle);
        difficultyText.setOrigin(0.5);

        const easyButton = this.add.image(width * 0.325, height * .45, '__WHITE');
        const mediumButton = this.add.image(width * 0.5, height * .45, '__WHITE');
        const hardButton = this.add.image(width * 0.675, height * .45, '__WHITE');
        const easyText = this.add.text(width * 0.325, height * 0.45, 'EASY', buttonStyle);
        const mediumText = this.add.text(width * 0.5, height * 0.45, 'MEDIUM', buttonStyle);
        const hardText = this.add.text(width * 0.675, height * 0.45, 'HARD', buttonStyle);
        easyText.setName('1');
        mediumText.setName('2');
        hardText.setName('3');
        
        let buttons = [
            {button: easyButton, text: easyText, sound: null},
            {button: mediumButton, text: mediumText, sound: null},
            {button: hardButton, text: hardText, sound: null},
        ];
        buttons.forEach(b => {
            // Style Button
            b.button.setDisplaySize(width * 0.15, height * 0.08);
            b.button.setOrigin(0.5);
            b.button.setTint(0x808080);
            b.text.setOrigin(0.5);

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);

                // Play TTS here
            }).on('pointerout', () => {
                if (!this.difficulty) {
                    b.button.setTint(0x808080);
                } else if (this.difficulty != Number(b.text.name)) {
                    b.button.setTint(0x808080);
                } else {
                    b.button.setTint(0x0000FF);
                }
            }).on('pointerup', () => {
                // Set difficulty & show on button (clear old tints and set new)
                this.difficulty = Number(b.text.name);
                buttons.forEach(b => b.button.setTint(0x808080));
                b.button.setTint(0x0000FF);

                // TODO: Remove me
                console.log("set difficulty to ", this.difficulty)

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
                    this.nextScene,
                    {
                        players: this.players,
                        difficulty: this.difficulty,
                    }
                );
            }
        });
    }
    
    startReady() {
        return this.difficulty;
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