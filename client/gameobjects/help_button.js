
import Phaser from "phaser";
import Constants from "../lib/constants";

export default class HelpButton extends Phaser.GameObjects.Group {
    /**
     * a button which pauses the scene entirely and takes the user to the help menu
     * @param {Phaser.Scene} scene 
     * @param {{execFunc: function?}?} config
     */
    constructor(scene, config) {
        super(scene);

        const { width, height } = scene.scale;
        this.constants = new Constants(width, height);

        const button = scene.add.image(width * 0.025, height * 0.96, '__WHITE');
        button.setDisplaySize(width * 0.05, width * 0.05);
        button.setDepth(25);
        const text = scene.add.text(button.x, button.y, '+', {
            color: "#0000FF",
            fontSize: (height * 0.085) + "px",
            strokeThickness: 3,
            stroke: "#0000FF",
        }).setOrigin(0.5);
        text.setDepth(25);
        const clickSound = scene.sound.get('menu-click');

        // Add interactives
        button.setInteractive();
        button.on('pointerover', () => {
            button.setTint(this.constants.Blue);
            text.setTint(0x000);
        });
        button.on('pointerout', () => {
            button.clearTint();
            text.clearTint();
        });
        
        // Add hoverclick and normal click
        this.constants.HoverClick(scene, button, () => {
            this.scene.sound.stopAll();
            clickSound.play({ volume: this.scene.game.config.sfxVolume });
            
            if (config?.execFunc) { config.execFunc(); }
            
            scene.scene.pause(scene);
            this.scene.scene.launch('helpMenu', scene);
            return;
        });
    }
}