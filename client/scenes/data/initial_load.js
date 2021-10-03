import Phaser from 'phaser';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    preload() {
        this.load.setBaseURL('https://labs.phaser.io');

        this.imageAssets = [
            // Backgrounds
            {key: "arcade-bg", path: "background/background3.png"},
            {key: "space-bg", path: "background/background1.png"},
            {key: "story-bg", path: "background/background2.png"},
            // Buttons
            {key: "arcade-button", path: "buttons/arcade_no_text.png"},
            {key: "gameslot-button", path: "buttons/game_slot.png"},
            {key: "story-button", path: "buttons/story_no_text.png"}
        ]
        this.soundAssets = [
            {key: "menu-click", path: "assets/audio/kyobi/wavs/menuClick.wav"},
        ]
        this.imagesLoaded = 0;

        // load all assets
        // TODO: Parallelization?
        
        // Load images
        if (this.imageAssets.length == 0) {
            this.scene.start('startMenu');
        }

        for (let asset of this.imageAssets) {
            this.textures.once('addtexture', () => {
                this.imagesLoaded += 1;

                // show asset has loaded.
                this.add.text(20, 20 + 10 * this.imagesLoaded, 'added texture: ' + asset.key)
                this.add.image(80, 20 + 10 * this.imagesLoaded, asset.key).setDisplaySize(20, 20);
                console.log("added texture: ", asset.key)

                if (this.imagesLoaded == this.imageAssets.length) {
                    setTimeout(() => {
                        this.scene.start('startMenu');
                    }, 2000);
                }
            })

            Meteor.call("loadImageAsset", asset.path, (err, res) => {
                if (err != null) {
                    console.log(err);
                    return;
                }

                let data = "data:image/png;base64," + res;
                this.textures.addBase64(asset.key, data);
            });
        }

        // Load Sounds
        for (let asset of this.soundAssets) {
            this.load.audio(asset.key, asset.path);
        }
    }

    create() {
        this.add.text(20, 20, 'Loading...')
    }
}