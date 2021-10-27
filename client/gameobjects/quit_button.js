import Phaser from "phaser";
import Constants from "../lib/constants";

export default class QuitButton extends Phaser.GameObjects.Group {
    /**
     * Creates a quit button which returns user to 'backMenu' on click, passes
     * along data to the next scene and executes any provided execFunc
     * @param {Phaser.Scene} scene 
     * @param {{execFunc: function, backMenu: string, data: object}} config 
     */
    constructor(scene, config) {
        super(scene);

        const { width, height } = scene.scale;
        this.constants = new Constants(width, height);

        const button = scene.add.image(width * 0.95, height * 0.93, '__WHITE');
        button.setDisplaySize(width * 0.05, width * 0.05);
        button.setDepth(25);
        const text = scene.add.text(button.x, button.y, 'X', {
            color: "#FF0000",
            fontSize: (height * 0.085) + "px",
            strokeThickness: 3,
            stroke: "#FF0000",
        }).setOrigin(0.5);
        text.setDepth(25);
        const clickSound = scene.sound.add('menu-click', { loop: false, volume : 0.5});
        const hoverSound = scene.sound.add('quit', { loop: false });

        // Add interactives
        button.setInteractive();
        button.on('pointerover', () => {
            button.setTint(this.constants.Red);
            text.setTint(0xFFF);

            if (!hoverSound.isPlaying) {
                hoverSound.play();
            }
        });
        button.on('pointerout', () => {
            button.clearTint();
            text.clearTint();
        });
        
        // Add hoverclick and normal click
        this.constants.HoverClick(scene, button, () => {
            clickSound.play();
            if (config.execFunc) { config.execFunc(); }
            scene.scene.start(config.backMenu, config.data);
        })
    }
}