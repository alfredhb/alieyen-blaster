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
     * @param {string?} customText
     */
    constructor(scene, constants, obj, customText) {
        super(scene);

        // Determine correct text
        let objNum = (obj != null) ? obj : scene.levelData.level.objective
        let text = "";
        let sScore = 0;
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
                sScore = scene.levelScore.getSuccessScore(scene.getMultiplier());
                text = 'Get a Score of  ' + sScore + '  Before Time Runs Out!!!'
                break;

            // LIVEKILLS
            case 3:
                sScore = scene.levelScore.getSuccessScore(scene.getMultiplier());
                text = 'Survive and Get a Score of ' + sScore + '!!!';
                break;

            // TIMELIVES (score is killcount + numLives * scorecount)
            case 4:
                text = 'Survive Until Time Runs Out!!!'
                break;

            // GAUNTLET (score is killcount + numLives * scorecount)
            case 5:
                text = 'Survive the Gauntlet!!!'
                break;

            // UNKNOWN
            default:
                console.log("Unknown objective found for level " + this.levelData.name);
                break;
        }
        if (customText?.length) text = customText

        this.objText = scene.add.text(
            constants.Width * 0.05, 
            constants.Height * 0.1, 
            text,
            constants.MenuButtonStyle()
        );
        this.objText.setWordWrapWidth(constants.Width * 0.25)
        this.objText.setOrigin(0, 0.5);
        this.objText.setDepth(11);
    }
}