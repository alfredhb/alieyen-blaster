import Phaser from 'phaser';

export default class ArcadeScene1 extends Phaser.Scene {
    constructor() {
        super('timedArcade')
    }

    create() {
        this.add.text(20, 20, 'Loading..')

        // setTimeout(() => {
        //     this.scene.start('game', 2000)
        // })
    }
}