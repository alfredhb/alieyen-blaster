import Phaser from "phaser";
import QuitButton from "../../gameobjects/quit_button";
import Constants from "../../lib/constants";

export default class ReportScene extends Phaser.Scene {
    constructor() {
        super('reportScene');
    }

    init(data) {
        this.players = data.meta.playerCount;
        this.difficulty = data.meta.difficulty;

        this.levelScore = data.level.score;
        this.totalShots = data.level.shotsFired;

        this.constants = new Constants()

        // Specific level report card data
        console.log("initialized ReportScene for ", this.players, " players")
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5}),
        }
    }

    create() {
        const { width, height } = this.scale;

        // Init BG
        const bg = this.add.image(
            width * 0.5,
            height * 0.5,
            'space-bg',
        );
        bg.setDisplaySize(width, height);
        
        // Init Center Section (black w white border)
        this.centerBox(width, height);

        // Init report data 
        // title ()
        const title = this.add.text(width * 0.5, height * 0.3, this.constants.MenuTitleStyle())

        // score breakdown + accuracy

        // return to arcade button 

        // replay game button

        // quit button
        const quitButton = new QuitButton(this, {
            backMenu: 'arcadeMenu',
            data: {
                meta: {
                    playerCount: this.players,
                    difficulty: this.difficulty,
                }
            }
        })
    }

    centerBox(width, height) {
        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.6505, height * 0.7505);
        centerOutline.setOrigin(0.5);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.65, height * 0.75);
        center.setTint(0x000000);
        center.setOrigin(0.5);
    }
}