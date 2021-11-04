import Phaser from "phaser";
import Constants from "../lib/constants";

/**
 * Creates a level timer in scene and places it in the top middle. On completion
 * of timer, emits leveltimerover event
 */
export default class LevelTimer extends Phaser.GameObjects.GameObject {
    /**
     * @param {Phaser.Scene} scene 
     * @param {Constants} constants scene constants class
     * @param {number} time timer delay in miliseconds
     */
    constructor(scene, constants, time) {
        super(scene);

        // Create timer
        this.timer = scene.time.addEvent({
            delay: time,
            callback: () => { scene.events.emit('leveltimerover') },
            callbackScope: scene,
            loop: false,
            paused: true,
        });

        // Create Hud spot
        const bg = scene.add.image(constants.Width * 0.5, constants.Height * 0.1, '__WHITE');
        bg.setDisplaySize(constants.Width * 0.2, constants.Height * 0.075);
        bg.setOrigin(0.5);
        
        // Create timer text and val
        this.timerText = scene.add.text(
            constants.Width * 0.5,
            constants.Height * 0.1,
            'TIME: ',
            constants.TimerStyle(),
        );
        this.timerVal = scene.add.text(
            constants.Width * 0.525,
            constants.Height * 0.1,
            this.timer.getRemainingSeconds().toString().substr(0, 4),
            constants.TimerStyle(),
        );
        this.timerText.setDepth(11).setOrigin(1, 0.5);
        this.timerVal.setDepth(11).setOrigin(0, 0.5);

        // add self to scene
        scene.add.existing(this);
    }

    /**
     * updates timer text on scene.update()
     */
    preUpdate() {
        this.timerVal.setText(this.timer.getRemainingSeconds().toString().substr(0, 4));
    }

    startTimer() {
        this.timer.paused = false;
    }
}