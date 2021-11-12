import { Meteor } from 'meteor/meteor';
import Phaser from "phaser";

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
     * @param {{
     * meta: {
     *  playerCount: number, 
     *  difficulty: number, 
     *  players: string[],
     *  world: number?,
     *  currentPlayer: number?
     * }, 
     *  level: any?,
     *  scene: { 
     *      prevScene: { 
     *          name: string, 
     *          type: string
     *  }, 
     *      nextScene: { 
     *          name: string, 
     *          type: string
     *      }
     *  }
     * }} data
     */
    init(data) {
        // Metadata capture
        this.playerCount = data.meta.playerCount;
        this.players = data.meta.players;
        this.currentPlayer = data.meta?.currentPlayer | 0;
        this.difficulty = data.meta.difficulty;

        // Scene data capture
        this.prevScene = data.scene.prevScene; // The previous level / menu
        this.nextScene = data.scene.nextScene; // The scene to render

        // Retrieve level data
        Meteor.call('getLevelData', this.nextScene.name, (err, res) => {
            if (err != null) {
                console.log(err);

                this.scene.start(
                    (data.scene.nextScene.type == 'ARCADE') ? 'arcadeMenu' : 'levelSelectMenu', 
                    {
                        meta: {
                            playerCount: this.playerCount,
                            players: this.players,
                            difficulty: this.difficulty,
                            world: data.meta.world // undefined if type == ARCADE
                        },
                        levels: data.levels
                    })

                return;
            }

            // if data.level has previous score, save it
            if (data?.level?.hasOwnProperty("score" + (this.currentPlayer))) {
                res.level["score" + (this.currentPlayer)] = data.level["score" + (this.currentPlayer)]; 
            }
            // if data.level has previous liveScore, save it
            if (data?.level?.hasOwnProperty("liveScore" + (this.currentPlayer))) {
                res.level["liveScore" + (this.currentPlayer)] = data.level["liveScore" + (this.currentPlayer)];
            }

            // Go to cutscene first
            if (res.scene.cutscene?.open) {
                try {
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
                            scene: res.scene,
                            name: this.nextScene.name
                        }
                    )
                    return;
                } catch (e) {
                    // unable to load cutscene
                    console.log(e);
                }
            }

            this.scene.start(
                'templateLevelScene',
                {
                    meta: {
                        playerCount: this.playerCount,
                        players: this.players,
                        currentPlayer: this.currentPlayer,
                        difficulty: this.difficulty,
                        world: data.meta.world // undefined if type == ARCADE
                    },
                    level: res.level,
                    levels: data.levels,
                    assets: res.assets,
                    scene: res.scene,
                    name: this.nextScene.name
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