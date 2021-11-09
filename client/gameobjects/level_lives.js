import Phaser from "phaser";
import Constants from "../lib/constants";

/**
 * Creates a level lives counter in scene and places it in the top middle. If all lives are
 * depleted, emits levelliveszero event
 */
export default class LevelLives extends Phaser.GameObjects.GameObject {
    /**
     * @param {Phaser.Scene} scene
     * @param {Constants} constants scene constants class
     * @param {number} lives number of lives to start with
     */
    constructor(scene, constants, lives) {
        super(scene);

        this.numLives = lives;

        // Create Hud spot
        const bg = scene.add.image(constants.Width * 0.5, constants.Height * 0.1, '__WHITE');
        bg.setDisplaySize(constants.Width * 0.2, constants.Height * 0.075);
        bg.setDepth(11).setOrigin(0.5);

        // Create lives text and val
        this.livesText = scene.add.text(
            constants.Width * 0.5,
            constants.Height * 0.1,
            'LIVES: ',
            constants.TimerStyle(),
        );
        this.livesVal = scene.add.text(
            constants.Width * 0.525,
            constants.Height * 0.1,
            this.numLives,
            constants.TimerStyle(),
        );
        this.livesText.setDepth(11).setOrigin(1, 0.5);
        this.livesVal.setDepth(11).setOrigin(0, 0.5);

        scene.events.on('playerhit', (damage) => {
            this.numLives -= damage;
            if (this.numLives <= 0) {
                scene.events.emit('levelliveszero');
            }
        });

        // add self to scene
        scene.add.existing(this);
    }

    /**
     * updates lives text on scene.update()
     */
    preUpdate() {
        this.livesVal.setText(this.numLives);
    }

    destroy() {
        this.scene.events.removeListener('playerhit');
    }
}
