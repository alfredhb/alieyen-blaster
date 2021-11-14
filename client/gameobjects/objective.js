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
                
            // LIVES (endless)
            case 1:
                text = 'Survive for as Long as You Can!!!'; //'Kill the Aliens Before They Attack!!!'
                break;

            // TIMEKILLS
            case 2:
                let sScore = scene.levelScore.getSuccessScore(scene.getMultiplier());
                text = 'Get a Score of  ' + sScore + '  Before Time Runs Out!!!'
                break;

            // LIVEKILLS
            case 3:
                text = 'Kill All the Aliens Before They Attack!!!'
                break;

            // TIMELIVES (score is killcount + numLives * scorecount)
            case 4:
                text = 'Survive Until Time Runs Out!!!'
                break;

            // UNKNOWN
            default:
                console.log("Unknown objective found for level " + this.levelData.name);
                break;
        }

        this.objText = scene.add.text(
            constants.Width * 0.05, 
            constants.Height * 0.1, 
            text,
            constants.MenuButtonStyle()
        );
        this.objText.setWordWrapWidth(constants.Width * 0.35)
        this.objText.setOrigin(0, 0.5);
        this.objText.setDepth(11);
    }
}