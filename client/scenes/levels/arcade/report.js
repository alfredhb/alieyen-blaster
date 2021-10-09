import Phaser from "phaser";
import QuitButton from "../../gameobjects/quit_button";
import Constants from "../../lib/constants";

export default class ArcadeReportScene extends Phaser.Scene {
    constructor() {
        super('arcadeReportScene');
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
        const title = this.add.text(
            width * 0.5,
            height * 0.3,
            'Level Complete!',
            this.constants.MenuTitleStyle()
        );

        // score breakdown + accuracy

        // Replay / Back Buttons
        this.navigationSection(width, height);

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

    /**
     * Navigation which either replays the last level, or returns to the arcade menu
     * @param {number} width 
     * @param {number} height 
     */
    navigationSection(width, height) {
        const playerText = this.add.text(width * 0.5, height * 0.325, 'PLAYERS', this.constants.MenuTitleStyle());
        playerText.setOrigin(0.5);

        const onePlayerButton = this.add.image(width * 0.375, height * 0.45, '__WHITE');
        const twoPlayerButton = this.add.image(width * 0.625, height * 0.45, '__WHITE');
        const onePlayerText = this.add.text(width * 0.375, height * 0.45, '1 PLAYER', this.constants.MenuButtonStyle());
        const twoPlayerText = this.add.text(width * 0.625, height * 0.45, '2 PLAYER', this.constants.MenuButtonStyle());
        onePlayerText.setName('1');
        twoPlayerText.setName('2');

        let buttons = [
            {button: onePlayerButton, text: onePlayerText, sound: null},
            {button: twoPlayerButton, text: twoPlayerText, sound: null},
        ];
        buttons.forEach(b => {
            // Style buttons
            b.button.setDisplaySize(width * .2, height * 0.08);
            b.button.setOrigin(0.5);
            b.button.setTint(0x808080);
            b.text.setOrigin(0.5);

            // Make Interactive
            b.button.setInteractive();

            b.button.on('pointerover', () => {
                b.button.setTint(0xFF0000);

                // Play TTS here
            }).on('pointerout', () => {
                if (!this.startReady()) {
                    b.button.setTint(0x808080);
                } else if (this.players != Number(b.text.name)) {
                    b.button.setTint(0x808080);
                } else {
                    b.button.setTint(0x0000FF);
                }
            }).on('pointerup', () => {
                // Set player count & show on button (clear old tints and set new)
                this.players = Number(b.text.name);
                buttons.forEach(b => b.button.setTint(0x808080));
                b.button.setTint(0x0000FF);

                // TODO: Remove me
                console.log("set player count to ", this.players)

                this.menuSounds.menuClick.play();
                this.styleStart();
            })
        });
    }
}