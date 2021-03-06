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
        
        this.diffBg = scene.add.image(
            constants.Width * 0.825,
            constants.Height * 0.07,
            '__WHITE'
        ).setOrigin(0.5).setDisplaySize(constants.Width * 0.15, constants.Height * 0.075);
        this.diffText = scene.add.text(
            constants.Width * 0.825,
            constants.Height * 0.07,
            (scene.difficulty == 1) ? "EASY" : (scene.difficulty == 2) ? 
                "MEDIUM" : "HARD",
            {
                fontFamily: "impact-custom",
                fontSize: (constants.Height * 0.055) + "px",
                color: "#0000FF",
                align: "right"
            }
        ).setOrigin(0.5);

        // set tts interaction
        let diffSound = scene.sound.get('difficulty');
        let sound = scene.sound.get((scene.difficulty == 1) ? 'easy' : (scene.difficulty == 2
                ? 'medium' : 'hard' ));

        this.diffBg.setInteractive();
        this.diffBg.on('pointerover', () => {
            if (diffSound.isPlaying && sound.isPlaying) return;
            diffSound.play({volume: this.scene.game.config.ttsVolume});
            diffSound.on('complete', () => {
                diffSound.off('complete');
                sound.play({volume: this.scene.game.config.ttsVolume});
            })
        });

        scene.add.existing(this);
    }
}