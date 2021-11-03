import { Meteor } from 'meteor/meteor';
import Phaser from "phaser";
import Constatns from "../../lib/constants";

/**
 * This class fetches the associated DB level entry and compiles it into a data
 * object which is passed to the template scene for rendering
 */
export default class LevelFactory extends Phaser.Scene {
    constructor() {
        super('levelFactory');
    }

    /**
     * Capture the next scene to progress to after selections are made
     * @param {{meta: {playerCount: number, difficulty: number, players: string[]}, scene: { prevScene: { name: string, type: string}, nextScene: { name: string, type: string}}}} data
     */
    init(data) {
        // Metadata capture
        this.playerCount = data.meta.playerCount;
        this.players = data.meta.players;
        this.currentPlayer = this.players[0]; // TODO update with currentplayer logic
        this.difficulty = data.meta.difficulty;

        // Scene data capture
        this.prevScene = data.scene.prevScene; // The previous level / menu
        this.nextScene = data.scene.nextScene; // The scene to render

        // Retrieve level data
        Meteor.call('getLevelData', this.nextScene.name, (err, res) => {
            if (err != null) {
                console.log(err);
                return;
            }

            // Go to cutscene first
            if (res.scene.cutscene?.open) {
                this.scene.start(
                    res.scene.cutscene.open,
                    {
                        meta: {
                            playerCount: this.playerCount,
                            players: this.players,
                            currentPlayer: this.currentPlayer,
                            difficulty: this.difficulty
                        },
                        level: res.level,
                        assets: res.assets,
                        scene: res.scene
                    }
                )
            }

            this.scene.start(
                'templateLevelScene',
                {
                    meta: {
                        playerCount: this.playerCount,
                        players: this.players,
                        currentPlayer: this.currentPlayer,
                        difficulty: this.difficulty
                    },
                    level: res.level,
                    assets: res.assets,
                    scene: res.scene
                }
            )
        })
    }

    /**
     * Creates a loading screen which displays while we wait for server method to fetch
     */
    create() {
        const { width, height } = this.scale;

        const loadText = this.add.text(
            width * 0.5, 
            height * 0.5, 
            'Loading...',
            {
                fontSize: (height * 0.11) + "px",
                fontFamily: "impact-custom",
                align: "center",
            }
        );
        loadText.setOrigin(0.5);
    }
}