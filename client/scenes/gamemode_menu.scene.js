import Phaser from 'phaser';

export default class GamemodeMenu extends Phaser.Scene {
    constructor() {
        super('gamemode')
    }

    create() {
        this.add.text(20, 20, 'Loading..')

        // setTimeout(() => {
        //     this.scene.start('game', 2000)
        // })
    }
}