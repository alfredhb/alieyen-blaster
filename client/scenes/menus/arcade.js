import Phaser from 'phaser';

export default class MenuScene3 extends Phaser.Scene {
    constructor() {
        super('arcadeMenu')
    }

    create() {
        this.add.text(20, 20, 'Loading..')

        // setTimeout(() => {
        //     this.scene.start('game', 2000)
        // })
    }
}