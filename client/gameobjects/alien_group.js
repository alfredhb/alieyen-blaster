import Phaser from 'phaser';
import Constants from '../lib/constants';
import TemplateLevelScene from '../scenes/levels/template_level';
import AlienProjectile from './alien_projectile';

export default class AlienGroup extends Phaser.GameObjects.Group {
    /**
     * @param {TemplateLevelScene} scene
     * @param {Phaser.Types.GameObjects.Group.GroupCreateConfig} config
     * @param {Constants} c
     */
    constructor(scene, config, c) {
        super(scene, config);

        scene.add.existing(this);

        this.scene.projectiles = this.scene.physics.add.group({
            classType: AlienProjectile,
            runChildUpdate: true,
        });
    }

    /**
     * sets this.maxSize to the correct max number of aliens based on difficulty multiplier
     */
    maxAliens() {
        let dM = this.scene.levelData.level.difficulty_multiplier[this.scene.levelData.meta.difficulty - 1];

        this.maxSize = Math.floor(this.maxSize * dM);
    }

    /**
    * Creates maxSize number of spawn timers and saves the spawn timer array into
    * this.alienTimers -> a 2D array [alienGruntTimers, miniBossTimers, BossTimers]
    *
    * @param {boolean?} canFire
    */
    createSpawnTimers(canFire) {
        this.maxAliens();

        this.alienTimers = [];
        this.aliensSpawned = 0;
        while (this.alienTimers.length < this.maxSize) {
            let alien = this.get(canFire);
            if (alien) {
                let spawnStartNext = () => {
                    alien.stop(); // stop animations
                    alien.launch();

                    this.aliensSpawned += 1;
                    if (this.aliensSpawned == this.alienTimers.length) {
                        return;
                    }

                    this.alienTimers[this.aliensSpawned].paused = false;
                }

                let delay = Phaser.Math.RND.between(100, 750);
                let alienTimer = this.scene.time.addEvent({
                    delay: delay,
                    callback: spawnStartNext,
                    callbackScope: this.scene,
                    loop: false,
                    paused: true,
                });

                this.alienTimers.push(alienTimer);
            }
        }

        // If maxSize is 0, will push an empty array for spacing
        this.scene.alienTimers.push(this.alienTimers);
    }

    /**
     * starts the first spawn timer for the alien
     */
    spawn() {
        if (this.alienTimers.length == 0) {
            return;
        }

        this.alienTimers[0].paused = false;
    }

    /**
     * Passes 'slowdown' event to the alien subclasses
     */
    slow(duration) {
        this.getChildren().forEach(a => {
            a.slow(duration);
        });
    }

    /**
     * Passes 'onehitko' event to the alien subclasses
     */
    onehitko() {
        let kills = [0, 0, 0];
        this.getChildren().forEach(a => {
            let kill = a.onehitko();
            for (let i = 0; i < 3; i++) {
                kills[i] += kill[i];
            }
        });
        return kills;
    }
}
