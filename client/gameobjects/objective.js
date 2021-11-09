import Phaser from "phaser";
import Constants from "../lib/constants";
import TemplateLevelScene from '../scenes/levels/template_level';

/**
 * Creates text in the top right which details what the objective is.
 */
export default class Objective extends Phaser.GameObjects.GameObject {
    /**
     * 
     * @param {TemplateLevelScene} scene 
     * @param {Constants} constants 
     * @param {number?} obj
     */
    constructor(scene, constants, obj) {
        super(scene);

        // Determine correct text
        let objNum = (obj != null) ? obj : scene.levelData.level.objective
        let text = "";
        switch(objNum) {
            // TIMED
            case 0:
                text = 'Kill the Aliens!!!'
                break;
                
            // LIVES
            case 1:
                text = 'Kill the Aliens Before They Attack!!!'
                break;

            // TIMEKILLS
            case 2:
                text = 'Kill the Aliens Before Time Runs Out!!!'
                break;

            // LIVEKILLS
            case 3:
                text = 'Kill All the Aliens Before They Attack!!!'
                break;

            // TIMELIVES
            case 4:
                text = 'Survive While Aliens Attack!!!'
                break;

            // UNKNOWN
            default:
                console.log("Unknown objective found for level " + this.levelData.name);
                break;
        }

        const objText = scene.add.text(
            constants.Width * 0.05, 
            constants.Height * 0.1, 
            text,
            constants.MenuButtonStyle()
        );
        objText.setWordWrapWidth(constants.Width * 0.3)
        objText.setOrigin(0, 0.5);
        objText.setDepth(11);
    }
}