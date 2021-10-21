import { Meteor } from 'meteor/meteor';
import Phaser from 'phaser';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    /**
     * Preload function to run before Create();
     */
    preload() {
        const { width, height } = this.scale;

        // Enumerate assets
        this.onlineImages = [
            {"key": "arcade-bg",          "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/background/background2.png"},
            {"key": "space-bg",           "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/background/background1.png"},
            {"key": "story-bg",           "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/background/background2.png"},
            {"key": "arcade-hud",         "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/background/arcade_hud.png"},
            {"key": "arcade-button",      "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/buttons/arcade_no_text.png"},
            {"key": "difficulty-button",  "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/gear.png"},
            {"key": "gameslot-button",    "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/buttons/game_slot.png"},
            {"key": "story-button",       "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/buttons/story_no_text.png"},
            {"key": "timed-button",       "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/alien.png"},
            {"key": "endless-button",     "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/infinity.png"},
            {"key": "lives-button",       "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/heart.png"},
            {"key": "gauntlet-button",    "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/alien.png"},
            {"key": "alien-boss",         "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/characters/boss_min_1.png"},
            {"key": "turret-colored",     "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/turret_col.png"},
            {"key": "ex-1",               "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/ex1.png"},
            {"key": "ex-2",               "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/ex1.png"},
            {"key": "ex-3",               "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/features/ex3.png"},
            {"key": "alien-grunt-1-1",    "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/characters/green_alien_1_1.png"},
            {"key": "alien-grunt-1-2",    "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/characters/green_alien_1_2.png"},
            {"key": "alien-grunt-1-3",    "path": "https://storage.googleapis.com/alieyen-blaster/public/assets/characters/green_alien_1_3.png"}
        ]

        this.onlineSounds = [
            {"key": "menu-click",       "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/sprite/men-click.wav"},
            {"key": "1-player",         "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/1_player.mp3"},
            {"key": "2-player",         "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/2_player.mp3"},
            {"key": "accuracy",         "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/accuracy.mp3"},
            {"key": "title",            "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/alien_blaster_3000.mp3"},
            {"key": "arcade",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/arcade.mp3"},
            {"key": "boss-battle",      "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/boss_battle.mp3"},
            {"key": "difficulty",       "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/difficulty.mp3"},
            {"key": "easy",             "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/easy.mp3"},
            {"key": "endless",          "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/endless.mp3"},
            {"key": "game-slots",       "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/game_slots.mp3"},
            {"key": "hard",             "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/hard.mp3"},
            {"key": "level-complete",   "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/level_complete.mp3"},
            {"key": "lives",            "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/lives.mp3"},
            {"key": "medium",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/medium.mp3"},
            {"key": "play",             "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/play.mp3"},
            {"key": "players",          "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/players.mp3"},
            {"key": "quit",             "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/quit.mp3"},
            {"key": "replay",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/replay.mp3"},
            {"key": "slot-1",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/slot_1.mp3"},
            {"key": "slot-2",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/slot_2.mp3"},
            {"key": "slot-3",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/slot_3.mp3"},
            {"key": "slot-4",           "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/slot_4.mp3"},
            {"key": "score",            "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/score.mp3"},
            {"key": "start",            "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/start.mp3"},
            {"key": "story",            "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/story.mp3"},
            {"key": "timed",            "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/tts/timed.mp3"},
            {"key": "explode-1",        "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/sprite/explosion-1.mp3"},
            {"key": "explode-2",        "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/sprite/explosion-2.mp3"},
            {"key": "explode-3",        "path": "https://storage.googleapis.com/alieyen-blaster/public/sounds/sprite/explosion-3.mp3"}
        ]
        
        // Loading Text
        const loadText = this.add.text(width * 0.5, height * 0.35, 'Loading...', {
            fontSize: (height * 0.11) + "px",
            fontFamily: "impact",
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
        this.totalAssets = this.onlineImages.length;
        let loadBlockWidth = (width * 0.45) / this.totalAssets;

        this.textures.on('addtexture', (k, t) => {
            const loadBlock = this.add.image(
                width * 0.275 + loadBlockWidth * this.assetsLoaded,
                height * 0.5,
                '__WHITE'
            )
            loadBlock.setDisplaySize(loadBlockWidth, width * 0.025);
            loadBlock.setOrigin(0, 0.5);
            loadBlock.setTint(0xFF0000);
            loadBlock.setDepth(10);
            
            this.assetsLoaded += 1;
            if (this.assetsLoaded == this.totalAssets) {
                setTimeout(() => {
                    this.scene.start('startMenu');
                }, 1000);
            }
        });
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
}