import Phaser from 'phaser';

export default class Scene2 extends Phaser.Scene {
    constructor() {
        super('gamemodeMenu')
    }

    create() {
        this.add.text(20, 20, 'Loading..')

        // setTimeout(() => {
        //     this.scene.start('game', 2000)
        // })
    }
}