import Phaser from 'phaser';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    preload() {
        this.assetLocations = [
            // Backgrounds
            {key: "arcade-bg", path: "background/background3.png"},
            {key: "space-bg", path: "background/background1.png"},
            {key: "story-bg", path: "background/background2.png"},
            // Buttons
            {key: "arcade-button", path: "buttons/arcade_no_text.png"},
            {key: "story-button", path: "buttons/story_no_text.png"}
        ]
        this.assetsLoaded = 0;
    }

    create() {
        this.add.text(20, 20, 'Loading...')

        if (this.assetLocations.length == 0) {
            this.scene.start('startMenu');
        }

        // load all assets
        
        // Load images (assets)
        // // this.textures.addBase64('big-button', bigButton);
        // this.load.image('small-button', 'assets/particles/red.png');
        for (let asset of this.assetLocations) {
            this.textures.once('addtexture', () => {
                this.assetsLoaded += 1;

                // show asset has loaded.
                this.add.text(20, 20 + 10 * this.assetsLoaded, 'added texture: ' + asset.key)
                this.add.image(80, 20 + 10 * this.assetsLoaded, asset.key).setDisplaySize(20, 20);
                console.log("added texture: ", asset.key)

                if (this.assetsLoaded == this.assetLocations.length) {
                    setTimeout(() => {
                        this.scene.start('startMenu');
                    }, 2000);
                }
            })

            Meteor.call("loadAsset", asset.path, (err, res) => {
                if (err != null) {
                    console.log(err);
                    return;
                }

                let data = "data:image/png;base64," + res;
                this.textures.addBase64(asset.key, data);
            });
        }
    }
}