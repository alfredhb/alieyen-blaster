/**
 * The menu seen in this slide: https://docs.google.com/presentation/d/1k2VFrhd0RngtsdU3UQYzQbVgNASu-717JjrWl4YOyiE/edit#slide=id.gf155f0bac5_0_40
 */

 import { ready } from "jquery";
 import Phaser from "phaser";
 import QuitButton from "../../gameobjects/quit_button";
 
 const titleStyle = {
     fontFamily: 'impact',
     fontSize: "75px",
     color: "#FFF"
 }
 const buttonStyle = {
     fontFamily: 'impact',
     fontSize: "50px",
     color: "#FFF"
 }
 
 export default class MenuScene9 extends Phaser.Scene {constructor() {
        super('difficultySelectMenu');
    }
    
    // Capture the next scene to progress to after selections are made
    init(data) {
        this.nextScene = data.nextScene;
        this.prevScene = data.prevScene; // {scene: string, type: enum{'ARCADE' || STORY'}

        // Game data holds player count in a central place
        this.difficulty = 0;
    }

    preload() {
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {       
        // Quit Button
        const quitButton = new QuitButton(this, {
            backMenu: this.prevScene.scene,
            execFunc: () => { if (this.timer) { this.timer.destroy() }}
        });
    }
 }