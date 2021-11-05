import Phaser from "phaser";
import QuitButton from "../../gameobjects/quit_button";
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
     *   }
     * }} data
     */
    init(data) {
        // its as easy as 
        this.levelData = data;

        const { width, height } = this.scale;
        this.constants = new Constants(width, height);
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
        */
    }

    /**
     * Create all UI and logic!
     */
    create() {
        //UI
        this.initUI();

    }

    /**
     * Uses provided data.assets to place images in correct places
     */
    initUI() {
        /*
        TODO:
        - place a timer and/or lives counter in appropriate spot based on data.objective + win_cond
        - place any score counter in appropriate spot based on data.objective
        - add denotion of current player
        - create execFunc for quit once timers are realized
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
        const lTurret = this.add.image(width * 0.05, height * 0.85, this.levelData.assets.turret);
        const rTurret = this.add.image(width * 0.95, height * 0.85, this.levelData.assets.turret);
        this.turrets = [lTurret, rTurret];
        this.turrets.forEach(t => {
            t.setDisplaySize(width * 0.025, height * 0.25);
            t.setOrigin(0.5);
            t.setDepth(10);
        })

        // Quit
        const quit = new QuitButton(this, {
            backMenu: (this.levelData.scene.type == 'ARCADE') ? 'arcadeMenu': 'savefileMenu',
            execFunc: () => { console.log("unimplemented execFunc!") },
            data: {
                meta: this.levelData.meta,
            }
        });
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
    }

    /**
     * Creates turret logic which fires the appropriate colored bullet, and deals
     * the correct damage to aliens and provides the correct score
     */
    initTurrets() {
        /*
        TODO:
        - create turret listeners which move based on data.currentPlayer's input method
        - add collision func for individual alien groups which kill and increment respective scores
        - add cooldown timer to turrets preventing spam firing
        - add bullet logic which fires a correctly colored bullet
        */
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
        - transition to close cutscene if it exists and:
        - transition to report screen with appropriate data such that another LF
        call can take place
        - destroy all active listeners and sprites
        - call any end animations needed
        - ensure garbage is collected so that this template can be used again
        */
    }

    /**
     * Called after initialization is done. Begins alien and powerup spawning
     *  and timer (if one exists).
     */
    startLevel() {
        /*
        TODO:
        - start first alien tiemr
        - call this.powerup.foreach.spawn() or something (win_cond dependent)
        - start level timer if it exists
        - allow turrets to fire
        */
    }
}