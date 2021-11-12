import Phaser from "phaser";
import Constants from "../../lib/constants";

/**
 * A scene which puts the game in limbo. This scene should be accessed when
 * bubba cannot play and needs help. this immediatley pauses the other scene.
 * It has a bit HELP, and then a continue button which resumes the previous scene,
 * and nothing else.
 */
export default class HelpScene extends Phaser.Scene {
    constructor() {
        super('helpMenu');
    }

    /**
     * 
     * @param {Phaser.Scene} data 
     */
    init(data) {
        this.levelData = data;
    }

    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height)

        const bg = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        bg.setOrigin(0.5).setDisplaySize(width, height).setTint(0x000)

        const title = this.add.text(width * 0.5, height * 0.35, 'H E L P', {
            fontFamily: 'impact-custom',
            fontSize: (height * 0.15) + "px",
            color: "#FFF"
        }).setOrigin(0.5);

        // continue
        const cB = this.add.image(width * 0.5, height * 0.7, '__WHITE');
        const cT = this.add.text(width * 0.5, height * 0.7, 'Continue?', this.constants.MenuButtonStyle("#000"));
        cB.setOrigin(0.5).setDisplaySize(width * 0.35, height* 0.2);
        cT.setOrigin(0.5);

        cB.setInteractive();
        cB.on('pointerover', () => {
            cB.setTint(this.constants.Red);
        }).on('pointerout', () => {
            cB.clearTint();
        });

        this.constants.HoverClick(this, cB, () => {
            this.scene.resume(this.levelData);
            this.scene.stop();
        });
    }
}