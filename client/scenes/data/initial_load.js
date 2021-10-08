import Phaser from 'phaser';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');

        this.localImageAssets = [
            // Backgrounds
            {key: "arcade-bg", path: "background/background3.png"},
            {key: "space-bg", path: "background/background1.png"},
            {key: "story-bg", path: "background/background2.png"},
            // Buttons
            {key: "arcade-button", path: "buttons/arcade_no_text.png"},
            {key: "gameslot-button", path: "buttons/game_slot.png"},
            {key: "story-button", path: "buttons/story_no_text.png"},
            // Characters
            {key: "alien-grunt", path: "characters/green_alien_1.png"},
            {key: "alien-boss", path: "characters/boss_min_1.png"},
            // Animation frames
            {key: "ex-1", path: "features/ex1.png"},
            {key: "ex-2", path: "features/ex2.png"},
            {key: "ex-3", path: "features/ex3.png"},

        ]
        this.onlineImageAssets = [
            {key: 'bullet', path: 'assets/sprites/bullet.png'},
        ]
        this.soundAssets = [
            {key: "menu-click", path: "assets/audio/kyobi/wavs/menuClick.wav"},
        ]
        this.imagesLoaded = 0;

        // load all assets
        // TODO: Parallelization?
        this.addLoadListener();
        
        // Load Local Images
        this.loadLocalImages();

        // Load Online Images
        this.loadOnlineImages();
        
        // Load Sounds
        for (let asset of this.soundAssets) {
            this.load.audio(asset.key, asset.path);
        }
    }

    // Must listen for all textures to be loaded before continuing into game
    addLoadListener() {
        const { width, height } = this.scale;
        let totalAssets = (this.localImageAssets.length + this.onlineImageAssets.length);
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
        if (this.localImageAssets.length == 0) {
            return;
        }

        for (let asset of this.localImageAssets) {
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
        for (let asset of this.onlineImageAssets) {
            this.load.image(asset.key, asset.path);
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