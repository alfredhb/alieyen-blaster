import Phaser from 'phaser';
import QuitButton from '../../gameobjects/quit_button';

export default class MenuScene2 extends Phaser.Scene {
    constructor() {
        super('gamemodeMenu')
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number?}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data 
     */
    init(data) {
        this.players = data.meta.playerCount;

        console.log("initialized GamemodeMenu for ", this.players, " players")
    }

    /**
     * Preload function to run before Create();
     */
    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5 }),
            arcade: this.sound.add('arcade', { loop: false }),
            story: this.sound.add('story', { loop: false }),
        }
    }

    /**
     * Handles element placing on scene
     */
    create() {
        const { width, height } = this.scale;
        
        this.initButtons(width, height);
    }

    /**
     * Creates all 3 buttons and sets the interactions with them
     * @param {number} width 
     * @param {number} height 
     */
    initButtons(width, height) {
        let textStyle = {
            fontFamily: "Impact",
            fontSize: (height * 0.11) + "px",
            color: "#FFFFFF",
        }

        // Quit button - Interactions set in constructor
        const quit = new QuitButton(this, {
            backMenu: 'playerSelectMenu'
        });

        // Story button
        const storyButton = this.add.image(width * 0.25, height * 0.5, 'story-button');
        const storyText = this.add.text(storyButton.x, storyButton.y, 'Story', textStyle);
        storyText.setName('savefileMenu');
        const storySound = this.menuSounds.story;
    
        // Arcade button
        const arcadeButton = this.add.image(width * 0.75, height * 0.5, 'arcade-button');
        const arcadeText = this.add.text(arcadeButton.x, arcadeButton.y, 'Arcade', textStyle);
        arcadeText.setName('arcadeMenu');
        const arcadeSound = this.menuSounds.arcade;

        this.buttons = [
            {button: storyButton, text: storyText, sound: storySound},
            {button: arcadeButton, text: arcadeText, sound: arcadeSound},
        ]
        // Create Interactives
        this.buttons.forEach(b => {
            b.button.setDisplaySize(width * 0.5, height);
            b.text.setOrigin(0.5);
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);
                b.text.setTint(0xFFF);

                // Play if not playing already
                if (!b.sound.isPlaying) {
                    b.sound.play();
                }

            }).on('pointerout', () => {
                b.button.clearTint();
                b.text.clearTint();

            }).on('pointerup', () => {
                this.menuSounds.menuClick.play();
                this.scene.start(
                    b.text.name,
                    {
                        meta: {
                            playerCount: this.players,
                        }
                    }
                );

            });
        });
    }
}