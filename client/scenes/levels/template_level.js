import Phaser from "phaser";
import Alien from "../../gameobjects/alien";
import AlienGroup from "../../gameobjects/alien_group";
import AlienGrunt from "../../gameobjects/alien_grunt";
import LevelTimer from "../../gameobjects/level_timer";
import QuitButton from "../../gameobjects/quit_button";
import ScoreObject from "../../gameobjects/scoreObject";
import Turrets from "../../gameobjects/turret";
import Constants from "../../lib/constants";

export default class TemplateLevelScene extends Phaser.Scene {
    constructor() {
        super('templateLevelScene');
    }

    /**
     * Capture the next scene to progress to after selections are made. I typed
     * this for ease of use later
     * @param {{
     *  meta: {
     *   playerCount: number, 
     *   difficulty: number, 
     *   players: string[],
     *   currentPlayer: number
     *  }, 
     *  level: { 
     *   difficulty_multiplier: number[],
     *   objective: number,
     *   win_cond: {
     *       lives: number,
     *       time: number,
     *       kills: {
     *           grunt: number,
     *           mini_boss: number,
     *           boss: number
     *       }
     *   }
     *   powerups: boolean |
     *       {
     *           name: string,
     *           enabled: boolean
     *       }[],
     *   aliens: {
     *       grunt: {
     *           spawn: boolean,
     *           quantity: number,
     *           score: number
     *       },
     *       mini_boss: {
     *           spawn: boolean,
     *           quantity: number,
     *           score: number
     *       },
     *       boss: {
     *           spawn: boolean,
     *           quantity: number,
     *           score: number
     *       }
     *   }
     *  }
     *   assets: {
     *       background: string,
     *       hud: string,
     *       turret: string
     *   },
     *   scene: {
     *       type: string,
     *       cutscene: {
     *           open: string,
     *           close: string
     *       },
     *       previous: {
     *           name: string,
     *           type: string
     *       },
     *       next: {
     *           name: string,
     *           type: string
     *       }
     *       report: string
     *   },
     *   name: string
     * }} data
     */
    init(data) {
        // its as easy as 
        this.levelData = data;

        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        console.log("Initializing " + this.levelData.name + ".\nDifficulty: " 
                    + this.levelData.meta.difficulty + "\nPlayers: "
                    + this.levelData.meta.players.toString() + "\nCurrent Player: "
                    + this.levelData.meta.currentPlayer);
    }

    /**
     * Get all appropriate sounds (assume they're already cached)
     */
    preload() {
        /*
        TODO:
        - fetch explode sound, player damage sound (if lives exist),
        any background music, etc 
        - create any new animations
        - move all animation/sound creation to initial_load
        */

        // Explode Animation
        this.explode = this.anims.get('explode');

        this.sound.get('explode-3');
    }

    /**
     * Create all UI and logic!
     */
    create() {
        // UI
        this.initUI();

        // EndState
        this.initEndState();

        // Sprites
        this.initSprites();

        // Turrets
        this.initTurrets();

        // Powerups
        this.initPowerups();

        // Start
        this.startLevel();
    }

    /**
     * Uses provided data.assets to place images in correct places
     */
    initUI() {
        /*
        TODO:
        - add denotion of current player
        */
        let width = this.constants.Width, height = this.constants.Height;

       // Background
        const bg = this.add.image(width * 0.5, height * 0.5, this.levelData.assets.background);
        bg.setDisplaySize(width, height);

        // Hud
        const cockpit = this.add.image(width * 0.5, height * 0.5, this.levelData.assets.hud);
        cockpit.setDisplaySize(width, height);
        cockpit.setDepth(11);

        // Turrets
        this.turrets = new Turrets(this, this.constants, this.levelData.assets.turret);

        // Quit
        const quit = new QuitButton(this, {
            backMenu: (this.levelData.scene.type == 'ARCADE') ? 'arcadeMenu': 'savefileMenu',
            execFunc: () => { 
                this.cleanupLevel();
            },
            data: {
                meta: this.levelData.meta,
            }
        });
    }

    /**
     * Produces the proper endstate logic based on data.level.objective and win 
     * conditions.
     */
    initEndState() {
        /*
        TODO:
        - create endTimer for TIMED, TIMEKILLS, TIMELIVES
        - create liveCounter logiv for LIVES, LIVEKILLS, TIMELIVES
        - call any end animations needed
        */
        switch (this.levelData.level.objective) {
            // TIMED
            case 0:
                this.levelTimer = new LevelTimer(this, this.constants, this.levelData.level.win_cond.time);
                this.levelScore = new ScoreObject(this, this.constants);

                // listen for leveltimerover if one doesn't already exist
                if (!this.events.listenerCount('leveltimerover')) {
                    this.events.addListener('leveltimerover', () => {
                        this.endLevel();
                    });
                }
                break;
                
            // LIVES
            case 1:
                console.log("LIVES mode unimplemented");
                break;

            // TIMEKILLS
            case 2:
                console.log("TIMEKILLS mode unimplemented");
                break;

            // LIVEKILLS
            case 3:
                console.log("LIVEKILLS mode unimplemented");
                break;

            // TIMELIVES
            case 4:
                console.log("TIMELIVES mode unimplemented");
                break;

            // UNKNOWN
            default:
                console.log("Unknown objective found for level " + this.levelData.name);
                break;
        }

        // Initilize Kill Tracking
        this.kills = {
            grunt: 0,
            miniBoss: 0,
            boss: 0,
        };
    }

    /**
     * uses provided data.levels.aliens along with data.level.objective and related
     * content to create alien groups with determined spawn and respawn behavior
     */
    initSprites() {
        /*
        TODO:
        - create alien groups for each type of alien to spawn in the level
        - determine num aliens visible using difficulty multiplier
        - determine initial alien spawn timers
        - provide alien spawn with proper damage boolean based on objective
        */

        this.aliens = [];
        this.alienTimers = [];

        let gruntData = this.levelData.level.aliens.grunt;
        this.aliens.push(
            new AlienGroup(this, {
                classType: AlienGrunt,
                runChildUpdate: true,
                maxSize: (gruntData.spawn) ? gruntData.quantity : 0
            }, this.constants)
        );

        // Create alien spawntimers
        this.aliens.forEach(a => {
            a.createSpawnTimers();
        });
    }

    /**
     * Creates turret logic which fires the appropriate colored bullet, and deals
     * the correct damage to aliens and provides the correct score
     */
    initTurrets() {
        /**
         * Callback function when a bullet and an alien overlap. If alien is alive, bullet
         * and bullet is active, then deal x damage to alien allowing respawn and 
         * increment respective score
         * @param {Phaser.Physics.Arcade.Sprite} bullet 
         * @param {Alien} alien 
         */
        let collisionFunc = (bullet, alien) => {
            /* 
            TODO:
            - integrate damage into aliens - refactor kill() to damage() which calls kill()
            */
            if (alien.dead() || !bullet.active) {
                return;
            }

            bullet.kill();
            let dead = alien.damage();
            if (dead) {
                this.sound.play('explode-3');
                switch(alien.getType()) {
                    case 1:
                        this.kills.miniBoss += 1;
                        break;
                    case 2:
                        this.kills.boss += 1;
                        break;
                    default:
                        this.kills.grunt += 1; 
                
                }
            }
        }
        this.aliens.forEach(a => {
            this.turrets.addFireListener(a, collisionFunc);
        })
    }

    /**
     * Checks data for enabled powerups and calls their respective initializers
     * causing them to spawn in the level
     */
    initPowerups() {
        /*
        TODO: 
        - create powerups as gameobjects & groups such that spawning is handled elsewhere
        - for each powerup, create it, and push to this.powerups[]
        */
       console.log("initPowerups Unimplemented");
    }

    /**
     * Called after initialization is done. Begins alien and powerup spawning
     *  and timer (if one exists).
     */
    startLevel() {
        /*
        TODO:
        - call this.powerup.foreach.spawn() or something (win_cond dependent)
        - start level timer if it exists
        */
        // Start Level Timers for specific modes
        switch (this.levelData.level.objective) {
            // TIME based
            case 0:
            case 2:
            case 4:
                this.levelTimer.startTimer();
                break;

            default:
                // no action necessary
                break;
        }

        // Start each alien's first spawn timer
        this.aliens.forEach(a => a.spawn());
    }

    /**
     * Called when endstate is reached as satisfied by objective. Determines which
     * endstate is reached: success, fail, neutral, and transitions to correct
     * cutscene and report
     */
    endLevel() {
        /*
        TODO:
        - add success / fail cutscene options to schema
        - handle cutscene to report transition
        - if STORY, tranistion to report and update current player for nxt level
        - make sure report loads correct data based on endstate (game over / level complete)
        */
        this.cleanupLevel();

        // append objComplete to leveldata
        this.levelData.level.objComplete = this.checkObjective(); // boolean (if wincondition is satisfied)
        if (!this.levelData.level.objComplete) {
            /*
            Objective failed! - transition to any held cutscene, if so, carry over
            report data as well ensuring objective was failed. Else transition directly to report
            */

            // ends with scene start
        }

        /*
        Objective Success! - transition to any held end cutscene, if so, carry over
        report data as well. else transition directly to typ specific report
        */
        
        if (this.levelData.scene?.cutscene?.close) {
            // play close cutscene, ends with scene start, set current player to next
        }

        this.transitionScene();
    }

    /**
     * Whether objective was satisfied
     * @returns {boolean}
     */
    checkObjective() {
        switch (this.levelData.level.objective) {
            // TIMED
            case 0:
                this.calculateScore();
                return true; // timer is out, neutral result
                
            // LIVES
            case 1:
                console.log("LIVES mode unimplemented");
                return false; // Check lives count to be nonzero

            // TIMEKILLS
            case 2:
                console.log("TIMEKILLS mode unimplemented");
                return false; // timer is out && kills match

            // LIVEKILLS
            case 3:
                console.log("LIVEKILLS mode unimplemented");
                return false; // check lives count to be nonzero && kills satisfied

            // TIMELIVES
            case 4:
                console.log("TIMELIVES mode unimplemented");
                return false; // check lives count to be nonzero && timer is out

            // UNKNOWN
            default:
                console.log("Unknown objective found for level " + this.levelData.name);
                return false;
        }
    }
    
    /**
     * Either transitions to report if currentplayer is last player OR storymode,
     * else reloads the same scene with currentplayer += 1
     */
    transitionScene() {
        // reload same scene with new player
        if (this.levelData.meta.playerCount != 1 && this.levelData.meta.currentPlayer == 0 
                && this.levelData.scene.type == 'ARCADE') {
            this.scene.start(
                'arcadeReadyScene', {
                    meta: {
                        playerCount: this.levelData.meta.playerCount,
                        difficulty: this.levelData.meta.difficulty, 
                        players: this.levelData.meta.players,
                        currentPlayer: 1,
                        levelName: 'levelFactory',
                    },
                    level: this.levelData.level, // pass score
                    scene: {
                        prevScene: { 
                            name: 'arcadeMenu',
                            type: 'ARCADE',
                        },
                        nextScene: {
                            name: this.levelData.name,
                            type: this.levelData.scene.type
                        }
                    }
                }
            )
            return;
        }

        this.scene.start(
            this.levelData.scene.report,
            {
                meta: this.levelData.meta,
                level: this.levelData.level,
                scene: {
                    prevScene: {
                        name: this.levelData.name,
                        type: this.levelData.scene.type,
                    },
                    nextScene: this.levelData.scene.next,
                }
            }
        );
    }

    /**
     * Calculates level score based on kills and appends it to the correct score
     * value of this.leveldata.level.score# based on current player
     */
    calculateScore() {
        this.levelData.level['score' + (this.levelData.meta.currentPlayer + 1)] = this.levelScore.calculateScore();
        console.log(this.levelData.level);
        return;
    }

    /**
     * Calls destructors on all scene data which would interfere with a new level
     * being placed over when LevelFactory transitions here again
     */
    cleanupLevel() {
        /* 
        TODO:
        - delete placed images
        - delete powerups
        */
        // remove event listeners
        try{
            this.input.removeAllListeners();
        } catch (e) {
            console.log(e);
        }

        // remove overlappers
        try {
            this.bulletColliders.forEach(c => c.destroy());
        } catch (e) {
            console.log(e);
        }

        // destroy bullets
        try {
            this.bullets.destroy(false, true);
        } catch (e) {
            console.log(e);
        }

        // destroy level timer
        if (this.levelTimer) {
            this.levelTimer.destroy();
            this.time.removeAllEvents();
        }

        // destroy spawntimers
        this.alienTimers.forEach(tArr => {
            tArr.forEach(t => t.destroy());
        });

        // destroy aliens
        this.aliens.forEach(aGroup => {
            try {
                aGroup.getChildren().forEach(a => a.leave());
                aGroup.destroy(false, true);
            } catch (e) {
                console.log(e);
            }
        });
    }
}
