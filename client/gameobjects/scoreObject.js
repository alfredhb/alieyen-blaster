import Phaser from "phaser";
import Constants from "../lib/constants"
import TemplateLevelScene from "../scenes/levels/template_level";

/**
 * Creates a score counter and places it in the top right which tracks score
 * based on scene alien score data and kills
 */
export default class ScoreObject extends Phaser.GameObjects.GameObject {
    /**
     * @param {TemplateLevelScene} scene 
     * @param {Constants} c 
     */
    constructor(scene, c) {
        super(scene);

        // create score text
        this.text = scene.add.text(c.Width * 0.85, c.Height * 0.1, "Score: 000", c.MenuButtonStyle());
        this.text.setOrigin(0.5).setDepth(11);
        scene.add.existing(this);
    }

    preUpdate() {
        this.text.setText("Score: " + this.scene.constants.ZeroPad(this.calculateScore(), 3));
    }

    calculateScore() {
        this.score = 
        ((this.scene.kills.grunt * this.scene.levelData.level.aliens.grunt.score | 0) + 
        (this.scene.kills.miniBoss * this.scene.levelData.level.aliens.mini_boss.score | 0) + 
        (this.scene.kills.boss * this.scene.levelData.level.aliens.boss.score | 0));
        return this.score;
    }

    /**
     * The score required to succeed in a level, add extra cases here to provide
     * story levels a star rating
     * @param {number} m the difficultymultiplier
     * @returns {number}
     */
    getSuccessScore(m) {
        let score = 0;
        if (this.scene.levelData.level.aliens.grunt.spawn) {
            score += this.scene.levelData.level.aliens.grunt.score
                 * this.scene.levelData.level.win_cond.kills.grunt;
        } if (this.scene.levelData.level.aliens.mini_boss.spawn) {
            score += this.scene.levelData.level.aliens.mini_boss.score
                 * this.scene.levelData.level.win_cond.kills.mini_boss;
        } if (this.scene.levelData.level.aliens.boss.spawn) {
            score += this.scene.levelData.level.aliens.boss.score
                 * this.scene.levelData.level.win_cond.kills.boss;
        }
        return score * m;
    }
}