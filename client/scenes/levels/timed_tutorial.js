import Phaser from "phaser";
import Constants from "../../lib/constants";
import QuitButton from "../../gameobjects/quit_button";
import Turrets from "../../gameobjects/turret";
import LevelTimer from "../../gameobjects/level_timer";
import ScoreObject from "../../gameobjects/scoreObject";
import Objective from "../../gameobjects/objective";
import AlienGrunt from "../../gameobjects/alien_grunt";
import AlienGroup from "../../gameobjects/alien_group";
import SpeedUp from "../../gameobjects/powerups/speedup";


/**
 * I'm ashamed to admit this, but the next 500 lines is the most spaghetti shit
 * you may ever read from a senior eecs student. If this code fails, please follow this
 * guide:
 * 1. close your computer
 * 2. cry
 * 3. open your computer and see if code works
 * 4. repeat steps 1-3 until you can get a hold of me (Bruno) to tell me how shit this is
 */
export default class TimedTutorialScene extends Phaser.Scene {
    constructor() {
        super('timedTutorialScene');
    }

    /**
     * Capture any scene data held in data for later scenes
     * @param {*} data 
     */
    init(data) {
        this.levelData = data;
        this.kills = {
            grunt: 0,
            miniBoss: 0,
            boss: 0
        };
    }

    create() {
        const { width, height } = this.scale;
        this.constants = new Constants(width, height);

        this.quitButton = new QuitButton(this, {
            backMenu: 'savefileMenu', data: this.levelData
        });

        // Create Ask Tutorial Menu
        this.initTutorialMenu(width, height);

        // Create hud, turrets, objective, timer, score
        this.createHud(width, height);

        // Wait some time...
        this.section1Timer = this.time.addEvent({
            delay: 1500,
            callback: () => {
                this.section1(width, height);
            },
            callbackScope: this,
            loop: false,
            paused: true
        });
    }

    /**
     * Creates a tutorial menu over existing content 
     * @param {number} width 
     * @param {number} height 
     */
    initTutorialMenu(width, height) {
        this.bg = this.add.image(width * 0.5, height * 0.5, 'space-bg');
        this.bg.setDisplaySize(width, height);
        this.bg.setDepth(12);

        const centerOutline = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        centerOutline.setDisplaySize(width * 0.6505, height * 0.505);
        centerOutline.setOrigin(0.5).setDepth(12);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.65, height * 0.5);
        center.setTint(0x000000).setOrigin(0.5).setDepth(12);

        const title = this.add.text(
            width * 0.5,
            height * 0.325,
            (!this.levelData.tutorialComplete) ? 'Play Tutorial?' : 'Tutorial Complete! Play Again?',
            this.constants.MenuTitleStyle()
        );
        title.setOrigin(0.5).setDepth(12);

        const yesB = this.add.image(width * 0.35, height * 0.55, '__WHITE');
        const noB = this.add.image(width * 0.65, height * 0.55, '__WHITE');
        const yesT = this.add.text(width * 0.35, height * 0.55, "Yes", this.constants.MenuButtonStyle());
        const noT = this.add.text(width * 0.65, height * 0.55, "No", this.constants.MenuButtonStyle());

        let buttons = [{b: yesB, t: yesT}, {b: noB, t: noT}]
        buttons.forEach(b => {
            b.b.setDisplaySize(width * 0.275, height * 0.2);
            b.b.setOrigin(0.5).setDepth(12);
            b.b.setTint(this.constants.Gray);
            b.t.setOrigin(0.5).setDepth(12);

            b.b.setInteractive();
            b.b.on('pointerover', () => {
                b.b.setTint(this.constants.Red);

                // Play TTS
            }).on('pointerout', () => {
                b.b.setTint(this.constants.Gray);
            });
        });

        this.constants.HoverClick(this, yesB, () => {
            this.sound.play('menu-click');

            this.bg.setDepth(0);
            centerOutline.setDepth(-1);
            center.setDepth(-1);
            title.setDepth(-1);
            yesB.removeInteractive().setDepth(-1);
            yesT.setDepth(-1);
            noB.removeInteractive().setDepth(-1);
            noT.setDepth(-1);

            // trigger voiceline starts
            this.section1Timer.paused = false;
        });

        // transition to next scene whatever it may be
        this.constants.HoverClick(this, noB, () => {
            this.sound.play('menu-click');

            // real scene data stored in name
            this.scene.start(
                this.levelData.name, this.levelData
            )
        })
    }

    /**
     * Creates the hud (bg already done)
     * @param {number} width 
     * @param {number} height 
     */
    createHud(width, height) {
        const cockpit = this.add.image(width * 0.5, height * 0.5, 'ship-hud');
        cockpit.setDisplaySize(width, height);
        cockpit.setDepth(11);

        this.turrets = new Turrets(this, this.constants, 'turret-colored');
        
        this.levelTimer = new LevelTimer(this, this.constants, 30000);
        this.levelScore = new ScoreObject(this, this.constants);
        this.objText = new Objective(this, this.constants, 0);
    }

    /**
     * applies a highlight effect on x and y with width and height size
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     */
    highlightLocation(x1, y1, x2, y2) {
        this.highlight = new Phaser.Geom.Rectangle(x1 + 15, y1 + 15, x2 - 30, y2 - 30);
        this.gfx = this.add.graphics().setDepth(11);
        // gfx.lineStyle(200 * x2, this.constants.Gray, 0.5);
        // gfx.strokeRectShape(this.opaqueBorder);

        this.gfx.lineStyle(15, this.constants.Gold, 1);
        this.gfx.strokeRectShape(this.highlight);
        this.sound.play('collect-powerup');
    }

    /**
     * hides the current highlight
     */
    hideHighlight() {
        this.highlight.width = 0;
        this.highlight.height = 0;
        this.highlight.setPosition(-50, -50);
        this.gfx.setVisible(false);
    }

    /**
     * Highlights bottom hud and speaks two lines before transition
     * @param {number} width 
     * @param {number} height 
     */
    section1(width, height) {
        // L1 highlight lower hud
        this.highlightLocation(0, height * 0.6, width, height * 0.4);

        // Get voicelines
        let line1 = this.sound.get('players-selected'); //TEMP
        let line2 = this.sound.get('1-player'); //TEMP
        line1.play();
        line1.on('complete', () => {
            line2.play();
            line1.off('complete');
        });
        line2.on('complete', () => {
            this.section2(width, height);
            line2.off('complete');
        })
    }

    /**
     * highlights quitbutton, creates fake quitbutton, and says a few lines related
     * @param {number} width 
     * @param {number} height 
     */
    section2(width, height) {
        // L2 Highlight QuitButton and disable action
        this.hideHighlight();
        this.highlightLocation(width * 0.9, height * 0.85, width * 0.1, height * 0.15);

        // create fake quitbutton
        const fakeQuit = this.add.image(width * 0.95, height * 0.93, '__WHITE');
        fakeQuit.setDisplaySize(width * 0.05, width * 0.05);
        fakeQuit.setDepth(25);
        const text = this.add.text(fakeQuit.x, fakeQuit.y, 'X', {
            color: "#FF0000",
            fontSize: (height * 0.085) + "px",
            strokeThickness: 3,
            stroke: "#FF0000",
        }).setOrigin(0.5);
        text.setDepth(25);
        const clickSound = this.sound.get('menu-click');
        const hoverSound = this.sound.get('quit');

        // Add interactives
        fakeQuit.setInteractive();
        fakeQuit.on('pointerover', () => {
            fakeQuit.setTint(this.constants.Red);
            text.setTint(0xFFF);

            if (!hoverSound.isPlaying) {
                hoverSound.play();
            }
        });
        fakeQuit.on('pointerout', () => {
            fakeQuit.clearTint();
            text.clearTint();
        });

        // Get Voicelines
        let line3 = this.sound.get('2-player'); //TEMP
        let line4 = this.sound.get('accuracy'); //TEMP

        line3.play();
        line3.on('complete', () => {

            this.constants.HoverClick(this, fakeQuit, () => {
                clickSound.play();
                
                // trigger transition
                line4.play();
                
            });
            line3.off('complete');
        });
        line4.on('complete', () => {
            line4.off('complete');
            this.section3(width, height);
    
            fakeQuit.setDepth(-1);
            fakeQuit.destroy();
        });
    }

    /**
     * highlights top hud and speaks lines about them
     * @param {number} width 
     * @param {number} height 
     */
    section3(width, height) {
        // L3 highlight upper hud
        this.hideHighlight();
        this.highlightLocation(0, 0, width, height * 0.3);

        // Get Voicelines
        let line5 = this.sound.get('title'); //TEMP
        let line6 = this.sound.get('arcade'); //TEMP

        line5.play();
        line5.on('complete', () => {
            line6.play();
            line5.off('complete');
        });
        line6.on('complete', () => {
            this.hideHighlight();
            line6.off('complete');
            this.section4(width, height);
        });
    }

    /**
     * placing an alien and adding fire listener for it
     * @param {number} width 
     * @param {number} height 
     */
    section4(width, height) {
        // Get Voicelines
        let line7 = this.sound.get('boss-battle');
        let line8 = this.sound.get('bubba');
        let line9 = this.sound.get('difficulty');

        // place alien
        this.aliens = new AlienGroup(this, {
            classType: AlienGrunt,
            runChildUpdate: true,
            maxSize: 7,
        }, this.constants);
        let alien = this.aliens.get();
        if (!alien) {
            console.log("Unable to create Alien!!!!");
        }

        // create collision func
        console.log(alien);
        let collisionFunc = () => {
            if (this.kills.grunt > 0) return;
            this.turrets.removeFireListener();

            alien.play('explode');
            let explode = this.sound.get('explode-3');
            explode.play({ volume: 0.25 });
            alien.on('animationcomplete', () => {
                alien.destroy();
                alien.removeListener('animationcomplete');
                this.levelTimer.stopTimer();

                line9.play();
            });
            this.kills.grunt = 1;
        }

        alien.place(width * 0.5, height * 0.5);

        line7.play();
        line7.on('complete', () => {
            line8.play();
            line7.off('complete');
        });
        line8.on('complete', () => {
            // add fire listener
            this.turrets.addFireListener(this.aliens, collisionFunc);
            this.levelTimer.startTimer();
            line8.off('complete');
        });
        line9.on('complete', () => {
            this.alienTimers = [];
            this.aliens.createSpawnTimers();
            this.aliens.spawn();

            line9.off('complete');
            this.section5();
        })
    }

    /**
     * spawns 5 aliens on spawntimers
     */
    section5() {
        // add firelistener
        let collisionFunc2 = (bullet, alien) => {
            if (alien.dead() || !bullet.active) {
                return;
            }
            if (this.kills.grunt == 7) {
                // destroy current alien group
                this.bulletColliders.forEach(c => c.destroy());
                this.aliens.getChildren().forEach(a => a.leave());
                this.aliens.destroy(false, true);

                this.turrets.removeFireListener();
                this.levelTimer.stopTimer();
                this.section6();
            }

            bullet.kill();
            let dead = alien.damage();
            if (dead) {
                this.sound.play('explode-3', { volume: 0.25 });
                switch(alien.getType()) {
                    case 1:
                        this.kills.miniBoss += 1;
                        break;
                    case 2:
                        this.kills.boss += 1;
                        break;
                    default:
                        this.kills.grunt += 1; 
                
                }
            }
        }

        this.turrets.addFireListener(this.aliens, collisionFunc2);
        this.levelTimer.startTimer();

    }

    /**
     * introduce powerups
     */
    section6() {
        // get voice lines
        let line10 = this.sound.get('easy');
        let line11 = this.sound.get('endless');

        // get aliens again
        this.aliens = new AlienGroup(this, {
            classType: AlienGrunt,
            runChildUpdate: true,
            maxSize: 10,
        }, this.constants);
        this.aliens.createSpawnTimers();

        this.speedup = this.physics.add.group({
            classType: SpeedUp,
            runChildUpdate: true,
            maxSize: 1,
        });
        let powerup = this.speedup.get();
        if (!powerup) console.log("unable to create powerup!!!");

        powerup.launch();
        this.powerupCollider = this.physics.add.overlap(
            this.bullets,
            powerup,
            () => {
                if (this.levelTimer.timer.paused) return;
                this.levelTimer.stopTimer();
                powerup.collisionFunc();
                line11.play();
                this.turrets.removeFireListener();
            },
            null,
            powerup
        );
        this.events.addListener('increaseturretspeed', (amount) => {
            this.turrets.increaseTurretSpeed(this.levelTimer.timer.getRemaining());
        });

        line10.play();
        line10.on('complete', () => {
            this.levelTimer.startTimer();
            powerup.spawn();
            this.turrets.addFireListener(this.aliens, this.collisionFunc3);
            line10.off('complete');
        });
        line11.on('complete', () => {
            line11.off('complete');
            this.section7();
        });
    }

    collisionFunc3 = (bullet, alien) => {
        if (alien.dead() || !bullet.active) {
            return;
        }

        bullet.kill();
        let dead = alien.damage();
        if (dead) {
            this.sound.play('explode-3', { volume: 0.25 });
            switch(alien.getType()) {
                case 1:
                    this.kills.miniBoss += 1;
                    break;
                case 2:
                    this.kills.boss += 1;
                    break;
                default:
                    this.kills.grunt += 1; 
            
            }
        }
    };

    /**
     * spawn a bunch of aliens after speaking lines
     */
    section7() {
        // get lines
        let line12 = this.sound.get('friend');
        let line13 = this.sound.get('game-slots');

        line12.play();
        line12.on('complete', () => {
            line13.play();
            line12.off('complete');
        });
        line13.on('complete', () => {
            this.aliens.spawn();
            this.levelTimer.startTimer();
            this.turrets.addFireListener(this.aliens, this.collisionFunc3);
            line13.off('complete');
        });

        this.events.addListener('leveltimerover', () => {
            // destroy current alien group
            // this.bulletColliders.forEach(c => {
            //     try {
            //         c.destroy()
            //     } catch (e) {
            //         console.log(e);
            //     }
            // });
            this.aliens.getChildren().forEach(a => a.leave());
            // this.aliens.destroy(false, true);

            this.section8();
        });
    }

    /**
     * tutorial over, transition to next scene
     */
    section8() {
        let line14 = this.sound.get('hard');

        line14.play();
        line14.on('complete', () => {
            line14.off('complete');
            this.tutorialComplete = true;
            this.levelData["tutorialComplete"] = this.tutorialComplete;
            this.scene.restart(this.levelData);
        });
    }
}