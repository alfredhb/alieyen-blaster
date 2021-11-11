import Phaser from "phaser";
import Constants from "../lib/constants";

/**
 * Creates a text saying the current difficulty and places it next to the gear
 * icon that would change it
 */
export default class DifficultyDisplay extends Phaser.GameObjects.GameObject {
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Constants} constants 
     */
    constructor(scene, constants) {
        super(scene);

        if (scene.difficulty == null) return; // don't place anything
        
        this.diffText = scene.add.text(
            constants.Width * 0.9,
            constants.Height * 0.07,
            (scene.difficulty == 1) ? "EASY" : (scene.difficulty == 2) ? 
                "MEDIUM" : "HARD",
            {
                fontFamily: "impact-custom",
                fontSize: (constants.Height * 0.055) + "px",
                color: "#00FF00",
                align: "right"
            }
        ).setOrigin(1, 0.5);

        scene.add.existing(this);
    }
}