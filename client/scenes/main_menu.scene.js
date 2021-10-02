import Phaser from 'phaser';

export default class MainMenu extends Phaser.Scene {
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