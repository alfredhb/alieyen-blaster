import Phaser from 'phaser';

export default class Scene1 extends Phaser.Scene {
    constructor() {
        super('mainMenu')
    }

    create() {
        this.add.text(20, 20, 'Loading..')

        // setTimeout(() => {
        //     this.scene.start('game', 2000)
        // })
    }
}