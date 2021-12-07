import { Meteor } from 'meteor/meteor';
import Phaser from 'phaser';
import Constants from '../../lib/constants';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    /**
     * Preload function to run before Create();
     */
    preload() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        // Enumerate assets
        const path = "https://storage.googleapis.com/alieyen-blaster/public/"
        this.onlineImages = [
            {"key": "arcade-bg",          "path": path + "assets/background/background2.png"},
            {"key": "space-bg",           "path": path + "assets/background/background1.png"},
            {"key": "story-bg",           "path": path + "assets/background/background2.png"},
            {"key": "ship-bg",            "path": path + "assets/background/ship_bg.jpg"},
            {"key": "world-1-ship-bg",    "path": path + "assets/background/ship_bg_world_1.jpg"},
            {"key": "world-2-ship-bg",    "path": path + "assets/background/ship_bg_world_2.jpg"},
            {"key": "world-3-ship-bg",    "path": path + "assets/background/ship_bg_world_3.jpg"},
            {"key": "world-1-bg",         "path": path + "assets/background/world_1_bg.png"},
            {"key": "arcade-hud",         "path": path + "assets/background/arcade_hud.png"},
            {"key": "ship-hud",           "path": path + "assets/background/ship_hud.png"},
            {"key": "world-1-button",     "path": path + "assets/buttons/world_1_button.jpg"},
            {"key": "world-2-button",     "path": path + "assets/buttons/world_2_button.jpg"},
            {"key": "world-3-button",     "path": path + "assets/buttons/world_3_button.jpg"},
            {"key": "arcade-button",      "path": path + "assets/buttons/arcade_no_text.png"},
            {"key": "difficulty-button",  "path": path + "assets/features/gear.png"},
            {"key": "gameslot-button",    "path": path + "assets/buttons/game_slot.png"},
            {"key": "story-button",       "path": path + "assets/buttons/story_no_text.png"},
            {"key": "timed-button",       "path": path + "assets/features/clock.png"},
            {"key": "endless-button",     "path": path + "assets/features/infinity.png"},
            {"key": "lives-button",       "path": path + "assets/features/heart.png"},
            {"key": "gauntlet-button",    "path": path + "assets/features/alien.png"},
            {"key": "alien-boss",         "path": path + "assets/characters/boss_in_ship.png"},
            {"key": "alien-mini-boss",    "path": path + "assets/characters/boss_min_1.png"},
            {"key": "alien-mini-boss-2",  "path": path + "assets/characters/mini_boss_2.png"},
            {"key": "alien-mini-boss-3",  "path": path + "assets/characters/mini_boss_3.png"},
            {"key": "mini-boss-shield",   "path": path + "assets/characters/mini_boss_shield.png"},
            {"key": "turret-colored",     "path": path + "assets/features/turret_col.png"},
            {"key": "turret-speed-up",    "path": path + "assets/features/turret_col_outline.png"},
            {"key": "turret-autoaim",     "path": path + "assets/features/turret_col_autoaim.png"},
            {"key": "alien-bomb",         "path": path + "assets/features/alien_bomb.png"},
            {"key": "full-heart",         "path": path + "assets/features/full_heart.png"},
            {"key": "full-heart-outline", "path": path + "assets/features/full_heart_outline.png"},
            {"key": "shield-outline",     "path": path + "assets/features/shield_outline.png"},
            {"key": "shield-placed",      "path": path + "assets/features/shield_placed.png"},
            {"key": "speed-up",           "path": path + "assets/features/speed-up.png"},
            {"key": "slow",               "path": path + "assets/features/slow.png"},
            {"key": "lightning",          "path": path + "assets/features/lightning.png"},
            {"key": "frozen",             "path": path + "assets/features/frozen.png"},
            {"key": "onehitko",           "path": path + "assets/features/onehitko.png"},
            {"key": "autoaim",            "path": path + "assets/features/autoaim.png"},
            {"key": "empty-heart",        "path": path + "assets/features/empty_heart.png"},
            {"key": "star",               "path": path + "assets/features/star.png"},
            {"key": "star-outline",       "path": path + "assets/features/star_outline.png"},
            {"key": "alien-grunt",        "path": path + "assets/characters/green_alien_1_1.png"},
            {"key": "alien-grunt-2",      "path": path + "assets/characters/alien_grunt_2.png"},
            {"key": "alien-grunt-3",      "path": path + "assets/characters/alien_grunt_3.png"},
            {"key": "mentor-happy",       "path": path + "assets/characters/mentor_happy.png"},
            {"key": "mentor-side",        "path": path + "assets/characters/mentor_side.png"},
       ];

       /**
        * @attributes {string} key
        * @attributes {string} path
        * @attributes {Phaser.Sound.SoundConfig} config
        */
        this.onlineSounds = [
            {"key": "menu-click",       "path": path + "sounds/sprite/men-click.wav",            "config": { loop: false, volume: 0.5 }},
            {"key": "collect-powerup",  "path": path + "sounds/sprite/powerup-2.wav",            "config": { loop: false }},
            {"key": "power-up",         "path": path + "sounds/sprite/power-up.wav",           "config": { loop: false }},
            {"key": "power-down",       "path": path + "sounds/sprite/power-down.wav",         "config": { loop: false }},
            {"key": "1",                "path": path + "sounds/tts/1.mp3",                       "config": { loop: false }},
            {"key": "2",                "path": path + "sounds/tts/2.mp3",                       "config": { loop: false }},
            {"key": "3",                "path": path + "sounds/tts/3.mp3",                       "config": { loop: false }},
            {"key": "4",                "path": path + "sounds/tts/4.mp3",                       "config": { loop: false }},
            {"key": "5",                "path": path + "sounds/tts/5.mp3",                       "config": { loop: false }},
            {"key": "1-player",         "path": path + "sounds/tts/1_player.mp3",                "config": { loop: false }},
            {"key": "2-player",         "path": path + "sounds/tts/2_player.mp3",                "config": { loop: false }},
            {"key": "accuracy",         "path": path + "sounds/tts/accuracy.mp3",                "config": { loop: false }},
            {"key": "players-selected", "path": path + "sounds/tts/all-players-selected.mp3",    "config": { loop: false }},
            {"key": "title",            "path": path + "sounds/tts/alien_blaster_3000.mp3",      "config": { loop: false }},
            {"key": "arcade",           "path": path + "sounds/tts/arcade.mp3",                  "config": { loop: false }},
            {"key": "boss-battle",      "path": path + "sounds/tts/boss_battle.mp3",             "config": { loop: false }},
            {"key": "bubba",            "path": path + "sounds/tts/bubba.mp3",                   "config": { loop: false }},
            {"key": "difficulty",       "path": path + "sounds/tts/difficulty.mp3",              "config": { loop: false }},
            {"key": "easy",             "path": path + "sounds/tts/easy.mp3",                    "config": { loop: false }},
            {"key": "empty",            "path": path + "sounds/tts/empty.mp3",                   "config": { loop: false }},
            {"key": "endless",          "path": path + "sounds/tts/endless.mp3",                 "config": { loop: false }},
            {"key": "friend",           "path": path + "sounds/tts/friend.mp3",                  "config": { loop: false }},
            {"key": "game-slots",       "path": path + "sounds/tts/game_slots.mp3",              "config": { loop: false }},
            {"key": "hard",             "path": path + "sounds/tts/hard.mp3",                    "config": { loop: false }},
            {"key": "help",             "path": path + "sounds/tts/help.mp3",                    "config": { loop: false }},
            {"key": "highscore",        "path": path + "sounds/tts/highscore.mp3",               "config": { loop: false }},
            {"key": "leah",             "path": path + "sounds/tts/leah.mp3",                    "config": { loop: false }},
            {"key": "level",            "path": path + "sounds/tts/level.mp3",                   "config": { loop: false }},
            {"key": "level-complete",   "path": path + "sounds/tts/level_complete.mp3",          "config": { loop: false }},
            {"key": "lives",            "path": path + "sounds/tts/lives.mp3",                   "config": { loop: false }},
            {"key": "medium",           "path": path + "sounds/tts/medium.mp3",                  "config": { loop: false }},
            {"key": "new-highscore",    "path": path + "sounds/tts/new-highscore.mp3",           "config": { loop: false }},
            {"key": "no",               "path": path + "sounds/tts/no.mp3",                      "config": { loop: false }},
            {"key": "play",             "path": path + "sounds/tts/play.mp3",                    "config": { loop: false }},
            {"key": "players",          "path": path + "sounds/tts/players.mp3",                 "config": { loop: false }},
            {"key": "quit",             "path": path + "sounds/tts/quit.mp3",                    "config": { loop: false }},
            {"key": "ready-to-play",    "path": path + "sounds/tts/ready-to-play.mp3",           "config": { loop: false }},
            {"key": "replay",           "path": path + "sounds/tts/replay.mp3",                  "config": { loop: false }},
            {"key": "selected",         "path": path + "sounds/tts/selected.mp3",                "config": { loop: false }},
            {"key": "selected-already", "path": path + "sounds/tts/selected-already.mp3",        "config": { loop: false }},
            {"key": "slot-1",           "path": path + "sounds/tts/slot_1.mp3",                  "config": { loop: false }},
            {"key": "slot-2",           "path": path + "sounds/tts/slot_2.mp3",                  "config": { loop: false }},
            {"key": "slot-3",           "path": path + "sounds/tts/slot_3.mp3",                  "config": { loop: false }},
            {"key": "slot-4",           "path": path + "sounds/tts/slot_4.mp3",                  "config": { loop: false }},
            {"key": "score",            "path": path + "sounds/tts/score.mp3",                   "config": { loop: false }},
            {"key": "start",            "path": path + "sounds/tts/start.mp3",                   "config": { loop: false }},
            {"key": "story",            "path": path + "sounds/tts/story.mp3",                   "config": { loop: false }},
            {"key": "timed",            "path": path + "sounds/tts/timed.mp3",                   "config": { loop: false }},
            {"key": "tutorial",         "path": path + "sounds/tts/tutorial.mp3",                "config": { loop: false }},
            {"key": "who-p1",           "path": path + "sounds/tts/who-is-player-1.mp3",         "config": { loop: false }},
            {"key": "who-p2",           "path": path + "sounds/tts/who-is-player-2.mp3",         "config": { loop: false }},
            {"key": "world",            "path": path + "sounds/tts/world.mp3",                 "config": { loop: false }},
            {"key": "world-select",     "path": path + "sounds/tts/world_select.mp3",            "config": { loop: false }},
            {"key": "yes",              "path": path + "sounds/tts/yes.mp3",                     "config": { loop: false }},
            {"key": "glass-break",      "path": path + "sounds/sprite/glass_break.mp3",          "config": { loop: false, volume: 0.5 }},
            {"key": "oof-damage",       "path": path + "sounds/sprite/oof.wav",                  "config": { loop: false }},
            {"key": "take-damage",      "path": path + "sounds/sprite/8bit_damage.wav",          "config": { loop: false, volume: 1.5 }},
            {"key": "armor-dink",       "path": path + "sounds/sprite/dink.wav",                 "config": { loop: false }},
            {"key": "energy-charge",    "path": path + "sounds/sprite/energy-charge.mp3",        "config": { loop: false }},
            {"key": "energy-blast",     "path": path + "sounds/sprite/energy-blast.mp3",         "config": { loop: false }},
            {"key": "explode-1",        "path": path + "sounds/sprite/explosion-1.mp3",          "config": { loop: false }},
            {"key": "explode-2",        "path": path + "sounds/sprite/explosion-2.mp3",          "config": { loop: false }},
            {"key": "explode-3",        "path": path + "sounds/sprite/explosion-3.mp3",          "config": { loop: false, volume: 0.35 }},
            // Voicelines
            {"key": "time-tutorial-1",      "path": path + "sounds/voicelines/timed-tutorial/L_1.m4a",       "config": { loop: false, seek: 0.8 }},
            {"key": "time-tutorial-2",      "path": path + "sounds/voicelines/timed-tutorial/L_2.m4a",       "config": { loop: false, seek: 1.2 }},
            {"key": "time-tutorial-3",      "path": path + "sounds/voicelines/timed-tutorial/L_3.m4a",       "config": { loop: false, seek: 1 }},
            {"key": "time-tutorial-4",      "path": path + "sounds/voicelines/timed-tutorial/L_4.m4a",       "config": { loop: false, seek: 0.6 }},
            {"key": "time-tutorial-5-1",    "path": path + "sounds/voicelines/timed-tutorial/L_5_1.m4a",     "config": { loop: false, seek: 0.4 }},
            {"key": "time-tutorial-5-2",    "path": path + "sounds/voicelines/timed-tutorial/L_5_2.m4a",     "config": { loop: false, seek: 0.6 }},
            {"key": "time-tutorial-6",      "path": path + "sounds/voicelines/timed-tutorial/L_6.m4a",       "config": { loop: false, seek: 0.6 }},
            {"key": "time-tutorial-7",      "path": path + "sounds/voicelines/timed-tutorial/L_7.m4a",       "config": { loop: false, seek: 0.8 }},
            {"key": "time-tutorial-8",      "path": path + "sounds/voicelines/timed-tutorial/L_8.m4a",       "config": { loop: false, seek: 0.9 }},
            {"key": "time-tutorial-9-1",    "path": path + "sounds/voicelines/timed-tutorial/L_9_1.m4a",     "config": { loop: false, seek: 0.7 }},
            {"key": "time-tutorial-9-2",    "path": path + "sounds/voicelines/timed-tutorial/L_9_2.m4a",     "config": { loop: false, seek: 0.3 }},
            {"key": "time-tutorial-10-1",   "path": path + "sounds/voicelines/timed-tutorial/L_10_1.m4a",    "config": { loop: false, seek: 0.6 }},
            {"key": "time-tutorial-10-2",   "path": path + "sounds/voicelines/timed-tutorial/L_10_2.m4a",    "config": { loop: false, seek: 0.8 }},
            {"key": "time-tutorial-11",     "path": path + "sounds/voicelines/timed-tutorial/L_11.m4a",      "config": { loop: false, seek: 0.6 }},
            {"key": "time-tutorial-12",     "path": path + "sounds/voicelines/timed-tutorial/L_12.m4a",      "config": { loop: false, seek: 0.7 }},
            {"key": "time-tutorial-13",     "path": path + "sounds/voicelines/timed-tutorial/L_13.m4a",      "config": { loop: false, seek: 0.4 }},
            {"key": "time-tutorial-14",     "path": path + "sounds/voicelines/timed-tutorial/L_14.m4a",      "config": { loop: false, seek: 0.6 }},
        ]

        // Loading Text
        const loadText = this.add.text(width * 0.5, height * 0.35, 'Loading...', {
            fontSize: (height * 0.11) + "px",
            fontFamily: "impact-custom",
            align: "center",
        });
        loadText.setOrigin(0.5);

        // LoadBar generation
        const loadBar = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        loadBar.setDisplaySize(width * 0.5, width * 0.05);
        loadBar.setOrigin(0.5);

        // LoadBlock generation
        this.addLoadListener(width, height);

        // Load online Images
        for (let image of this.onlineImages) {
            this.load.image(image.key, image.path);
        }

        // Load Online Sounds
        for (let sound of this.onlineSounds) {
            this.load.audio(sound.key, sound.path);
        }

        // Load Sprite Sheet
        this.loadSpriteSheets();
    }

    /**
     * Adds a load listener for which waits for the 'addtexture' event which signifies
     * a local image was successfully loaded. Then it adds a load progress bit,
     * and if all images have been loaded, then transitions scenes to 'startMenu'
     * @param {number} width
     * @param {number} height
     */
    addLoadListener(width, height) {
        this.assetsLoaded = 0;
        this.totalAssets = this.onlineImages.length + 20/* # of spritesheets */;
        let loadBlockWidth = (width * 0.45) / this.totalAssets;

        this.textures.on('addtexture', (k, t) => {
            const loadBlock = this.add.image(
                width * 0.275 + loadBlockWidth * this.assetsLoaded,
                height * 0.5,
                '__WHITE'
            )
            loadBlock.setDisplaySize(loadBlockWidth, width * 0.025);
            loadBlock.setOrigin(0, 0.5);
            loadBlock.setTint(this.constants.Red);
            loadBlock.setDepth(10);

            this.assetsLoaded += 1;
            if (this.assetsLoaded == this.totalAssets) {
                setTimeout(() => {
                    this.scene.start('startMenu');
                }, 1000);
            }
        });
    }

    /**
     * Loads any sprite sheets stored in GCS with custom frame width/height
     */
    loadSpriteSheets() {
        // Cursor-fill
        this.load.spritesheet(
            'cursor-fill-2',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/features/cursor-sheet-v2.png',
            { frameWidth: 40, frameHeight: 40 },
        );

        this.load.spritesheet(
            'mini-boss-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/mini_boss_float_sheet.png',
            { frameWidth: 228, frameHeight: 218 },
        );

        this.load.spritesheet(
            'mini-boss-2-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/mini_boss_2_float_sheet.png',
            { frameWidth: 258, frameHeight: 198 },
        );

        this.load.spritesheet(
            'mini-boss-3-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/mini_boss_3_float_sheet.png',
            { frameWidth: 230, frameHeight: 190 },
        );

        this.load.spritesheet(
            'boss-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/alien_boss_float_spritesheet.png',
            { frameWidth: 440, frameHeight: 300 },
        );

        this.load.spritesheet(
            'boss-stun-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/alien_boss_stun_spritesheet.png',
            { frameWidth: 440, frameHeight: 300 },
        );

        this.load.spritesheet(
            'mini-boss-shield-break-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/mini_boss_shield_break_sheet.png',
            { frameWidth: 228, frameHeight: 218 },
        );

        // Alien Grunt Fire Animations
        this.load.spritesheet(
            'alien-grunt-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/alien_grunt_float_spritesheet.png',
            { frameWidth: 114, frameHeight: 160 },
        );

        // Alien Grunt Fire Animations
        this.load.spritesheet(
            'alien-grunt-2-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/alien_grunt_2_float_spritesheet.png',
            { frameWidth: 182, frameHeight: 172 },
        );

        // Alien Grunt Fire Animations
        this.load.spritesheet(
            'alien-grunt-3-float-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/alien_grunt_3_float_spritesheet.png',
            { frameWidth: 176, frameHeight: 170 },
        );

        // Alien Grunt Fire Animations
        this.load.spritesheet(
            'alien-grunt-fire-sheet-easy',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/green_alien_fire_114_160_small.png',
            { frameWidth: 114, frameHeight: 160 },
        );

        // Alien Grunt Fire Animations
        this.load.spritesheet(
            'mini-boss-2-fire-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/mini_boss_2_fire_sheet.png',
            { frameWidth: 258, frameHeight: 198 },
        );

        // Alien Grunt Fire Animations
        this.load.spritesheet(
            'mini-boss-3-fire-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/mini_boss_3_fire_sheet.png',
            { frameWidth: 230, frameHeight: 200 },
        );

        this.load.spritesheet(
            'boss-fire-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/characters/alien_boss_fire_spritesheet.png',
            { frameWidth: 440, frameHeight: 300 },
        );

        this.load.spritesheet(
            'lose-heart-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/features/broken_heart_spritesheet.png',
            { frameWidth: 128, frameHeight: 128 },
        );

        this.load.spritesheet(
            'add-heart-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/features/add_heart_spritesheet.png',
            {frameWidth: 128, frameHeight: 128},
        );

        this.load.spritesheet(
            'lose-shield-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/features/shield_break_spritesheet.png',
            { frameWidth: 384, frameHeight: 128 },
        );

        this.load.spritesheet(
            'add-shield-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/features/shield_add_spritesheet.png',
            { frameWidth: 384, frameHeight: 128 },
        );

        this.load.spritesheet(
            'explode-sheet',
            'https://storage.googleapis.com/alieyen-blaster/public/assets/features/explode_spritesheet.png',
            { frameWidth: 200, frameHeight: 200 },
        );

        this.load.spritesheet(
            'collect-powerup-sheet',
            "https://storage.googleapis.com/alieyen-blaster/public/assets/features/collect_powerup_spritesheet.png",
            { frameWidth: 128, frameHeight: 128 },
        );
    }

    // Local Sounds would use this.sound.decode([{data: base64, key: id}])
    /**
     * ARCHIVED - Possible use for native TTS
     * Adds all sounds in this.localSounds to game.sounds SoundManager
     * @returns {void}
     */
    loadLocalSounds() {
        if (this.localSounds.length == 0) {
            return;
        }

        for (let asset of this.localSounds) {
            Meteor.call("loadSoundAsset", asset.path, (err, res) => {
                if (err != null) {
                    console.log(err);
                    return;
                }

                this.sound.decodeAudio(asset.key, res);
            })
        }
    }

    /**
     * Rather than having individual scenes add the sounds they want to the soundManager, add them here and then
     * retrieve them later so as to reduce unnecessary caching. Use Get along with any sound config to retreive
     * sound based on its level
     */
    cacheSounds() {
        //Add all sound keys in online sounds with any provided config
        for (let sound of this.onlineSounds) {
            this.sound.add(sound.key, sound.config | {});
        }
    }

    /**
     * Create animations from loaded spritesheets
     */
    createAnimations() {
        // Cursor animation
        this.anims.create({
            key: 'cursor-fill-animation-2',
            frames: this.anims.generateFrameNumbers('cursor-fill-2', { start: 0 }),
            frameRate: 20,
            repeat: 0,
        });

        this.anims.create({
            key: 'alien-boss-stun',
            frames: this.anims.generateFrameNumbers('boss-stun-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'alien-mini-boss-float',
            frames: this.anims.generateFrameNumbers('mini-boss-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'alien-mini-boss-2-float',
            frames: this.anims.generateFrameNumbers('mini-boss-2-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'alien-mini-boss-3-float',
            frames: this.anims.generateFrameNumbers('mini-boss-3-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'alien-boss-float',
            frames: this.anims.generateFrameNumbers('boss-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'mini-boss-shield-break',
            frames: this.anims.generateFrameNumbers('mini-boss-shield-break-sheet', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        this.anims.create({
            key: 'alien-grunt-float',
            frames: this.anims.generateFrameNumbers('alien-grunt-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'alien-grunt-2-float',
            frames: this.anims.generateFrameNumbers('alien-grunt-2-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        this.anims.create({
            key: 'alien-grunt-3-float',
            frames: this.anims.generateFrameNumbers('alien-grunt-3-float-sheet', { start: 0 }),
            frameRate: 3,
            repeat: -1,
        });

        // Alien Grunt Animations
        this.anims.create({
            key: 'alien-mini-boss-2-fire',
            frames: this.anims.generateFrameNumbers('mini-boss-2-fire-sheet', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        // Alien Grunt Animations
        this.anims.create({
            key: 'alien-mini-boss-3-fire',
            frames: this.anims.generateFrameNumbers('mini-boss-3-fire-sheet', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        this.anims.create({
            key: 'alien-boss-fire',
            frames: this.anims.generateFrameNumbers('boss-fire-sheet', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        // Alien Grunt Animations
        this.anims.create({
            key: 'alien-grunt-fire',
            frames: this.anims.generateFrameNumbers('alien-grunt-fire-sheet-easy', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        this.anims.create({
            key: 'lose-heart',
            frames: this.anims.generateFrameNumbers('lose-heart-sheet', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        this.anims.create({
            key: 'add-heart',
            frames: this.anims.generateFrameNumbers('add-heart-sheet', { start: 0 }),
            frameRate: 6,
            repeat: 0,
        });

        this.anims.create({
            key: 'lose-shield',
            frames: this.anims.generateFrameNumbers('lose-shield-sheet', { start: 0 }),
            frameRate: 3,
            repeat: 0,
        });

        this.anims.create({
            key: 'add-shield',
            frames: this.anims.generateFrameNumbers('add-shield-sheet', { start: 0 }),
            frameRate: 6,
            repeat: 0,
        });

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explode-sheet', { start: 0 }),
            frameRate: 9,
            repeat: 1,
        });

        this.anims.create({
            key: 'collect-powerup-animation',
            frames: this.anims.generateFrameNumbers('collect-powerup-sheet', { start: 0 }),
            frameRate: 4,
            repeat: 1,
        });
    }

    // After spritesheets are loaded, creates the animations from them
    create() {
        this.createAnimations();

        this.cacheSounds();
    }
}
