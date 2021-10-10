import Phaser from 'phaser';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    preload() {
        // this.load.setCORS('anonymous');
        this.load.setBaseURL('https://labs.phaser.io');

        // Enumerate assets
        this.localImages = [
            // Backgrounds
            {key: "arcade-bg", path: "background/background3.png"},
            {key: "space-bg", path: "background/background1.png"},
            {key: "story-bg", path: "background/background2.png"},
            // Buttons
            {key: "arcade-button", path: "buttons/arcade_no_text.png"},
            {key: "gameslot-button", path: "buttons/game_slot.png"},
            {key: "story-button", path: "buttons/story_no_text.png"},
            {key: 'timed-button', path: "features/clock.png"},
            {key: 'endless-button', path: "features/infinity.png"},
            {key: 'lives-button', path: "features/heart.png"},
            {key: 'gauntlet-button', path: "features/alien.png"},
            // Characters
            {key: "alien-boss", path: "characters/boss_min_1.png"},
            // Animation frames
            {key: "ex-1", path: "features/ex1.png"},
            {key: "ex-2", path: "features/ex2.png"},
            {key: "ex-3", path: "features/ex3.png"},
            {key: "alien-grunt-1-1", path: "characters/green_alien_1_1.png"},
            {key: "alien-grunt-1-2", path: "characters/green_alien_1_2.png"},
            {key: "alien-grunt-1-3", path: "characters/green_alien_1_3.png"},

        ]
        this.onlineImages = [
            {key: 'bullet', path: 'assets/sprites/bullet.png'},
        ]
        this.localSounds = [
            // TTS
            {key: 'arcade', path: 'tts/arcade.mp3'},
            {key: 'quit', path: 'tts/quit.mp3'},
            {key: 'play', path: 'tts/play.mp3'},
            {key: 'story', path: 'tts/story.mp3'},
            // Sprite sounds
            {key: 'explode-1', path: 'sprite/explosion-1.mp3'},
            {key: 'explode-2', path: 'sprite/explosion-2.mp3'},
            {key: 'explode-3', path: 'sprite/explosion-3.mp3'},
        ]
        this.onlineSounds = [
            {key: "menu-click", path: "assets/audio/kyobi/wavs/menuClick.wav"},
        ]
        this.imagesLoaded = 0;

        // load all assets
        // TODO: Parallelization?
        this.addLoadListener();

        // Load Local Sounds
        this.loadLocalSounds();
        
        // Load Online Sounds
        for (let asset of this.onlineSounds) {
            this.load.audio(asset.key, asset.path);
        }
        
        // Load Local Images
        this.loadLocalImages();

        // Load Online Images
        this.loadOnlineImages();
    }

    // Must listen for all textures to be loaded before continuing into game
    addLoadListener() {
        const { width, height } = this.scale;
        let totalAssets = (this.localImages.length + this.onlineImages.length);
        let loadBlockWidth = (width * 0.45) / totalAssets

        this.textures.on('addtexture', (key, texture) => {
            const loadBlock = this.add.image(
                width * 0.275 + loadBlockWidth * this.imagesLoaded,
                height * 0.5,
                '__WHITE'
            ).setDisplaySize(loadBlockWidth, width * 0.025);
            loadBlock.setOrigin(0, 0.5);
            loadBlock.setTint(0xFF0000);
            loadBlock.setDepth(10);

            this.imagesLoaded += 1;
            if (this.imagesLoaded == totalAssets) {
                setTimeout(() => {
                    this.scene.start('startMenu');
                }, 2000);
            }
        })
    }

    loadLocalImages() {
        if (this.localImages.length == 0) {
            return;
        }

        for (let asset of this.localImages) {
            Meteor.call("loadImageAsset", asset.path, (err, res) => {
                if (err != null) {
                    console.log(err);
                    return;
                }

                let data = "data:image/png;base64," + res;
                this.textures.addBase64(asset.key, data);
            });
        }
    }

    loadOnlineImages() {
        for (let asset of this.onlineImages) {
            this.load.image(asset.key, asset.path);
        }
    }

    // Local Sounds would use this.sound.decode([{data: base64, key: id}])
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

    create() {
        const { width, height } = this.scale;
        
        // Loading Text
        const loadText = this.add.text(width * 0.5, height * 0.35, 'Loading...', {
            fontSize: "100px",
            fontFamily: "impact",
            align: "center",
        });
        loadText.setOrigin(0.5);

        // LoadBar generation
        const loadBar = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        loadBar.setDisplaySize(width * 0.5, width * 0.05);
        loadBar.setOrigin(0.5);
    }
}