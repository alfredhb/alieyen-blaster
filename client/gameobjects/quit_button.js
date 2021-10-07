import Phaser from "phaser";

export default class QuitButton extends Phaser.GameObjects.Group {
    constructor(scene, config) {
        super(scene);

        const { width, height } = scene.scale;
        const button = scene.add.image(width * 0.95, height * 0.93, '__WHITE');
        button.setDisplaySize(width * 0.05, width * 0.05);
        button.setDepth(10);
        const text = scene.add.text(button.x, button.y, 'X', {
            color: "#FF0000",
            fontSize: "75px",
            strokeThickness: 3,
            stroke: "#FF0000",
        }).setOrigin(0.5);
        text.setDepth(11);
        const clickSound = scene.sound.add('menu-click', { loop: false, volume : 0.5});

        // Add interactives
        button.setInteractive();
        button.on('pointerover', () => {
            button.setTint(0xFF0000);
            text.setTint(0xFFF);
        });
        button.on('pointerout', () => {
            button.clearTint();
            text.clearTint();
        });
        button.on('pointerup', () => {
            clickSound.play();
            if (config.execFunc) { config.execFunc(); }
            scene.scene.start(config.backMenu);
        })
    }
}