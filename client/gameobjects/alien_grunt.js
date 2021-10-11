import Phaser from "phaser";

export default class AlienGrunt extends Phaser.Physics.Arcade.Sprite {
    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        super(scene, -50, -50, 'alien-grunt-1-1');
        let { width, height } = scene.scale;

        // Add to physics and to canvas 
        scene.physics.add.existing(this);
        this.setPosition(width + 50, height + 50);
        this.setDisplaySize(130, 175)
        this.setSize(this.width * 0.75, this.height * 0.75);
        this.setOrigin(0.5);

        this.maxX = width + 65;
        this.maxY = height + 65;
        this.difficulty = scene.difficulty;

        // Add Animation
        this.anims.create({
            key: 'float',
            frames: [
                {key: 'alien-grunt-1-1'},
                {key: 'alien-grunt-1-2'},
                {key: 'alien-grunt-1-3'},
                {key: 'alien-grunt-1-2'},
            ],
            frameRate: 3,
            repeat: -1,
        });
    }

    update(time, delta) {
        if (this.x < -50 || this.x > this.maxX) {
            this.setActive(false);
            this.setVisible(false);

            // Respawn logic
            this.deadVal = true;
            this.respawn();   
        }
    }

    // Randomly choose height, and direction
    // TODO: add vertical speed modifiers and constraints so aliens don't hit ship
    //      make speed and rotation depend on difficulty (a number)
    launch() {
        let direction = (Math.random() >= 0.5) ? 1 : -1;
        let height = Math.random() * this.maxY * 0.5 + 75; // Random height + 100px offset
        this.speed = Phaser.Math.GetSpeed(Phaser.Math.RND.between(200, 500), 1);
        this.xSpeed = direction * this.speed * 1000;
        this.ySpeed = 0 * 1000;
        
        this.setPosition((direction > 0) ? -50 : this.maxX, height);
        this.setVelocity(this.xSpeed, this.ySpeed);
        this.anims.play('float');
        this.setActive(true);
        this.setVisible(true);

        this.deadVal = false;
    }

    /**
     * places the sprite statically at x y and makes it visible and active
     * @param {number} x 
     * @param {number} y 
     */
    place(x, y) {
        this.setPosition(x, y);
        this.setDisplaySize(150, 200);
        this.anims.play('float');
        this.setActive(true);
        this.setVisible(true);
    }

    // TODO Bug allowing aliens to respawn after this.scene.levelDone flag is set
    // and the alien is killed
    // Play sprite death animation & sound?
    kill() {
        this.deadVal = true;

        // play animation
        this.play('explode');
        this.on('animationcomplete', () => {
            this.setVisible(false);
            this.setActive(false);

            // Respawn logic
            this.respawn();
        });
    }

    dead() {
        return this.deadVal
    }

    respawn() {
        setTimeout(() => {
            // Check if level finished in the 300ms
            if (this == null) {
                return;
            }

            this.stop();
            this.launch();
        }, 300);
    }
}