/**
 * The menu seen in this slide: https://docs.google.com/presentation/d/1k2VFrhd0RngtsdU3UQYzQbVgNASu-717JjrWl4YOyiE/edit#slide=id.gf5b43401a7_0_6
 */

import Phaser from "phaser";
import QuitButton from "../../../gameobjects/quit_button";

const titleStyle = {
    fontFamily: 'impact',
}

export default class ArcadeScene0 extends Phaser.Scene {
    constructor() {
        super('preLevelArcade');
    }
    
    // Capture the next scene to progress to after selections are made
    init(data) {
        this.nextScene = data.nextScene;
    }

    preload() {
        this.menuSounds = {
            menuClick = this.sound.add('menu-click', { loop: false, volume: 0.5 }),
        }
    }

    create() {
        const { width, height } = this.scale;

        // BG
        const bg = this.add.image(width * 0.5, height * 0.5, 'arcade-bg');
        bg.setDisplaySize(width, height);

        // Input
        this.cursor = this.input.activePointer;

        // Center Box (black, slightly opaque)
        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.5, height * 0.75);
        center.setAlpha(0.5);
        center.setTint(0x000000);
        center.setOrigin(0.5);

        // Players area
        const playerText = this.add.text(width * 0.5, height * 0.35, 'PLAYERS')

        // Difficulty Area

        // Start Logic

        // Quit Button
        const quitButton = new QuitButton(this, 'arcadeMenu');
    }
}