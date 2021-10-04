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
        this.textures.on('addtexture', (key, texture) => {
            this.imagesLoaded += 1;

            // show asset has loaded.
            this.add.text(20, 20 + 10 * this.imagesLoaded, 'added texture: ' + key)
            this.add.image(80, 20 + 10 * this.imagesLoaded, key).setDisplaySize(20, 20);
            console.log("added texture: ", key)

            if (this.imagesLoaded == this.localImageAssets.length) {
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
        this.load.image('bullet', 'assets/sprites/bullet.png');
    }

    create() {
        this.add.text(20, 20, 'Loading...')
    }
}