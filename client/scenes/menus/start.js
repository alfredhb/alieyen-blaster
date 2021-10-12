import Phaser from 'phaser';

export default class MenuScene4 extends Phaser.Scene {
    constructor() {
        super('startMenu')
    }

    preload() {
        // Load Sounds
        this.menuSounds = {
            menuClick: this.sound.add('menu-click', { loop: false, volume: .5 }),
            titleTTS: this.sound.add('title', { loop: false }),
            playTTS: this.sound.add('play', { loop: false }),
            quitTTS: this.sound.add('quit', { loop: false }),
        }
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width * 0.5, height * 0.5, 'space-bg').setDisplaySize(width, height);

        this.initTitle(width, height);

        // Buttons
        this.initButtons(width, height);
    }

    /**
     * Add title and interactive listener which plays tts
     * @param {number} width 
     * @param {number} height 
     */
    initTitle(width, height) {
        // Title
        const title = this.add.text(width * 0.5, height * 0.15, 'Ali-eye-n Blaster 3000', {
            fontFamily: "Impact",
            fontSize: (width / 11) + "px",
            strokeThickness: 0,
            color: "#FFFFFF",
            aligh: 'center',
        }).setOrigin(0.5);
        
        // interactives
        title.setInteractive();
        title.on('pointerover', () => {
            if (!this.menuSounds.titleTTS.isPlaying) {
                this.menuSounds.titleTTS.play();
            }
        })
    }

    initButtons(width, height) {
        // Play Button
        const plButton = this.add.image(width * 0.5, height * 0.7, '__WHITE').setDisplaySize(width * 0.25, height * 0.25);
        const plText = this.add.text(plButton.x, plButton.y, 'Play!', {
            fontFamily: "Impact",
            color: "#FF0000",
            fontSize: "50px",
        }).setOrigin(0.5);
        const plSound = this.menuSounds.playTTS;

        // Quit Button
        const qButton = this.add.image(width * 0.95, height * 0.93, '__WHITE').setDisplaySize(width * 0.05, width * 0.05);
        const qText = this.add.text(qButton.x, qButton.y, 'X', {
            color: "#FF0000",
            fontSize: "75px",
            strokeThickness: 3,
			stroke: '#FF0000',
        }).setOrigin(0.5);
        const qSound = this.menuSounds.quitTTS;

        this.buttons = [
            {button: plButton, text: plText, sound: plSound},
            {button: qButton, text: qText, sound: qSound}
        ];
        // Create Interactives
        for (let buttonObj of this.buttons) {
            buttonObj.button.setInteractive();

            buttonObj.button.on('pointerover', () => {
                buttonObj.button.setTint(0xFF0000);
                buttonObj.text.setTint(0xFFF);

                // Play if not playing already
                if (!buttonObj.sound.isPlaying) {
                    buttonObj.sound.play();
                }
            });
            buttonObj.button.on('pointerout', () => {
                buttonObj.button.clearTint();
                buttonObj.text.clearTint();
            });
            buttonObj.button.on('pointerup', () => {
                this.menuSounds.menuClick.play();
            })
        }

        // Set action for specific buttons
        plButton.on('pointerup', () => {
            this.scene.start('playerSelectMenu');
        });
        qButton.on('pointerup', () => {
            console.log('Unimplemented');
            qSound.play();
        });
    }

    /**
     * Adds a listener / timer to bObj with this behavior:
     * User hovers over button coninuously for 5 seconds, during that time, 
     * button sound is played on loop, after 5 seconds, the button is clicked.
     * @param {{button: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text, sound: Phaser.Sound.BaseSound}} bObj 
     */
    hoverClick(bObj) {
        // TODO: Beta
        // must be used for all buttons, so also move this to separate file

        return;
    }
}
