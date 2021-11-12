import Phaser from 'phaser';
import QuitButton from '../../gameobjects/quit_button';
import HelpButton from '../../gameobjects/help_button';
import Constants from '../../lib/constants';

export default class MenuScene2 extends Phaser.Scene {
    constructor() {
        super('gamemodeMenu')
    }
    
    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number, players: string[]}, level: {any}?, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}?}} data 
     */
    init(data) {
        this.playerCount = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;
        this.players = data.meta.players || [];

        if (!this.players.length) {
            console.log("Players Not Passed Back!!");
        }

        console.log("initialized GamemodeMenu for ", this.playerCount, " players being: ", this.players.toString())
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
        this.constants = new Constants(width, height);
        
        this.initButtons(width, height);

        // Add help button
        this.help = new HelpButton(this);
    }

    /**
     * Creates all 3 buttons and sets the interactions with them
     * @param {number} width 
     * @param {number} height 
     */
    initButtons(width, height) {
        let textStyle = {
            fontFamily: "impact-custom",
            fontSize: (height * 0.11) + "px",
            color: "#FFFFFF",
        }

        // Quit button - Interactions set in constructor
        const quit = new QuitButton(this, {
            backMenu: 'playerSelectMenu',
            data: {
                meta: {
                    playerCount: this.playerCount,
                    difficulty: this.difficulty,
                    // Don't pass back player selection to player_select.js
                }
            }
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
                b.button.setTint(this.constants.Red);
                b.text.setTint(0xFFF);

                // Play if not playing already
                if (!b.sound.isPlaying) {
                    b.sound.play();
                }

            }).on('pointerout', () => {
                b.button.clearTint();
                b.text.clearTint();

            });

            // Add hoverclick and normal click
            this.constants.HoverClick(this, b.button, () => {
                this.menuSounds.menuClick.play();
                this.scene.start(
                    b.text.name,
                    {
                        meta: {
                            playerCount: this.playerCount,
                            difficulty: this.difficulty,
                            players: this.players,
                        }
                    }
                );
                this.scene.stop(this); // stop itself
            });
        });
    }
}