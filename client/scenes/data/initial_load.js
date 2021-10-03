import Phaser from 'phaser';

export default class DataScene1 extends Phaser.Scene {
    constructor() {
        super('initialLoad')
    }

    preload() {
        this.assetLocations = [
            {key: "arcade-bg", path: "background/arcade_background.png"},
            {key: "space-bg", path: "background/space_background.png"},
            {key: "story-bg", path: "background/story_background.png"}
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
                console.log("added texture : " + asset.key )
                this.assetsLoaded += 1;

                if (this.assetsLoaded == this.assetLocations.length) {
                    this.scene.start('startMenu');
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