import Phaser from "phaser";
import Constants from "../../lib/constants";
import QuitButton from "../../gameobjects/quit_button";
import HelpButton from '../../gameobjects/help_button';
import Turrets from "../../gameobjects/turret";
import LevelTimer from "../../gameobjects/level_timer";
import ScoreObject from "../../gameobjects/scoreObject";
import Objective from "../../gameobjects/objective";
import AlienGrunt from "../../gameobjects/alien_grunt";
import AlienGroup from "../../gameobjects/alien_group";
import SpeedUp from "../../gameobjects/powerups/speedup";

const line1Text = ["This ","is my ","spaceship",", ","I ","have ","2 cannons ","which ","keep ","us out ", "of ", "danger."];
const line2Text = ["But most ","importantly, ","my spaceship"," has a ","done ","button."];
const line3Text = ["If I ","ever ","want ","to ","stop ","I ","just ","use ","this. ","Try it ","now by ","TAPPING "," or LOOKING ","at it ","for a ","little ","while."];
const line4Text = ["Use ","this ","if ","you ","are ","ever ","done ","playing ","and ","want ","to ","stop! ","Any ","completed ","levels ","will be ","waiting ","when you ","come back."];
const line5Text = ["This ","is the ","level ","tracker!"," On the ","left ","it tells ","you ","what ","you"," have"," to"," do."];
const line5_2Text = ["In the"," middle"," is a"," timer"," to"," show you"," when"," the"," level"," is"," over,"," and on the"," right"," is your"," score!"];
const line6Text = ["Oh! ","It's zero! ","Lets fix ","that..."];
const line7Text = ["Look ","an Alien!"];
const line8Text = ["TAP"," or LOOK"," at it"," to fire"," the cannons!"];
const line9Text = ["Great Job!"," I think"," more"," of them"," are coming..."," Watch Out!!!"];
const line10Text = ["You may"," have"," noticed"," the cannons"," don't fire ","very fast!"];
const line10_2Text = ["That's"," because ","they ","need to"," cool off"," before"," shooting ","again."];
const line11Text = ["Oh look,"," a powerup!"," Shoot it"," to collect it."];
const line12Text = ["Now we"," can shoot"," much faster,"," but only"," as long"," as the"," effect ","lasts!"," Watch the"," color of"," your cannons!"];
const line13Text = ["Uh oh,"," more aliens!"," Quick,"," take"," them out!!!"];
const line14Text = ["I have"," taught ","you everthing ","I know,"," time to"," take out"," those villians!"];

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
     * @param {{
     * meta: {
     *  playerCount: number, 
     *  difficulty: number, 
     *  players: string[], 
     *  levelName: string
     * }, 
     * level: {any}?,
     *  scene: { 
     *      prevScene: { 
     *          name: string, 
     *          type: string
     *      }, 
     *      nextScene: { 
     *          name: string, 
     *          type: string
     *      }
     *  },
     *  levels: any,
     * }} data
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
                this.createDialogue();
                this.section1(width, height);
            },
            callbackScope: this,
            loop: false,
            paused: true
        });

        // Add help button
        this.help = new HelpButton(this);
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
        centerOutline.setDisplaySize(width * 0.6505, height * 0.555);
        centerOutline.setOrigin(0.5).setDepth(12);

        const center = this.add.image(width * 0.5, height * 0.5, '__WHITE');
        center.setDisplaySize(width * 0.65, height * 0.55);
        center.setTint(0x000000).setOrigin(0.5).setDepth(12);

        const title = this.add.text(
            width * 0.5,
            height * 0.325,
            (!this.levelData.tutorialComplete) ? 'Play Tutorial?' : 'Tutorial Complete! Play Again?',
            {
                fontFamily: 'impact-custom',
                fontSize: (height * 0.085) + "px",
                color: "#FFF",
                align: "center"
            }
        );
        title.setOrigin(0.5).setDepth(12).setWordWrapWidth(width * 0.6);
        title.setInteractive();
        title.on('pointerover', () => {
            let t = this.sound.get('tutorial');
            if (this.levelData.tutorialComplete) {
                if (t.isPlaying) return;
                let sound = this.sound.get('level-complete');
                t.play();
                t.on('complete', () => {
                    t.off('complete');
                    sound.play();
                });
            } else {
                let sound = this.sound.get('play');
                if (sound.isPlaying) return;
                sound.play();
                sound.on('complete', () => {
                    sound.off('complete');
                    t.play();
                })
            }
        });

        const yesB = this.add.image(width * 0.35, height * 0.555, '__WHITE');
        const noB = this.add.image(width * 0.65, height * 0.555, '__WHITE');
        const yesT = this.add.text(width * 0.35, height * 0.555, "Yes", this.constants.MenuButtonStyle());
        const noT = this.add.text(width * 0.65, height * 0.555, "No", this.constants.MenuButtonStyle());

        let buttons = [{b: yesB, t: yesT, s: this.sound.get('yes')}, {b: noB, t: noT, s: this.sound.get('no')}]
        buttons.forEach(b => {
            b.b.setDisplaySize(width * 0.275, height * 0.2);
            b.b.setOrigin(0.5).setDepth(12);
            b.b.setTint(this.constants.Gray);
            b.t.setOrigin(0.5).setDepth(12);

            b.b.setInteractive();
            b.b.on('pointerover', () => {
                b.b.setTint(this.constants.Red);

                // Play TTS
                if (b.s.isPlaying) return;
                b.s.play();
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

        // transition to next scene whatever it may be if last player is current player
        this.constants.HoverClick(this, noB, () => {
            this.sound.play('menu-click');

            if (this.levelData.meta.playerCount == 2 && this.levelData.meta.currentPlayer == 0) {
                // go to ready scene which runs back to tutorial
                this.scene.start(
                    'storyReadyScene',
                    {
                        meta: {
                            difficulty: this.levelData.meta.difficulty,
                            players: this.levelData.meta.players,
                            currentPlayer: 1,
                            playerCount: this.levelData.meta.playerCount,
                            levelName: 'timedTutorialScene'
                        },
                        level: {
                            difficulty_multiplier: [1, 1.5, 2],
                            powerup_spawnrate: 500,
                            aliens: {
                                grunt: {
                                    score: 10,
                                },
                                mini_boss: {
                                    score: 10,
                                },
                                boss: {
                                    score: 10,
                                },
                            }
                        },
                        scene: this.levelData.scene,
                        levels: this.levelData.levels,
                        name: 'worldSelectMenu'
                    }
                );
                this.scene.stop(this); // stop itself
            } else {
                // real scene data stored in name
                this.scene.start(
                    this.levelData.name, this.levelData
                );
                this.scene.stop(this); // stop itself
            }
        });

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
        this.objText.objText.text = "Listen To Your Teacher!";
    }

    createDialogue() {
        this.mentorBG = new Phaser.Geom.Circle(0, 0, 0);
        this.textBG = new Phaser.Geom.Rectangle(15,15);

        this.mentorImg = this.add.image(0, 0, 'mentor-side').setDepth(-1);
        this.dialogueText = this.add.text(0, 0, "", this.constants.MenuButtonStyle())
            .setDepth(-1).setWordWrapWidth(this.constants.Width * 0.7);

        this.wordDelay = 200;
        this.wordTimer = this.time.addEvent({
            delay: this.wordDelay,
            paused: true,
            loop: true,
        });
    }

    /**
     * places a diaogue box with the teacher's icon on the right and animates the t
     * text to place so that it places words individually
     * @param {number?} height If provided, then the height to place the outer rectangle at
     * @param {string[]} text
     * @param {Phaser.Sound.BaseSound} line
     * @param {number} lineNum number of line
     */
    showDialogue(height, text, line, lineNum) {
        this.dialogueText.text = "";
        height = (height) ? height : 0;
        this.textBG.setTo(15, 15 + height, this.constants.Width - 30, this.constants.Height * 0.25);
        this.mentorBG.setTo(this.constants.Width * 0.85, this.constants.Height * .125 + 15 + height, this.constants.Height * .1);

        this.dialogueGfx = this.add.graphics().setDepth(11);
        this.dialogueGfx.setVisible(true);
        this.dialogueGfx.fillStyle(0x000000, 1);
        this.dialogueGfx.fillRectShape(this.textBG);
        this.dialogueGfx.fillStyle(0xFFFFFF, 1);
        this.dialogueGfx.fillCircleShape(this.mentorBG);

        this.mentorImg.setPosition(this.constants.Width * 0.85,
             this.constants.Height * .125 + 15 + height)
        ;
        this.mentorImg.setDepth(12);

        // add text
        this.dialogueText.setPosition(this.constants.Width * 0.05, height + 30).setDepth(12);
        this.wordIndex = 0;
        this.wordTimer.callback = () => {
            this.nextWord(text, lineNum);
        }
        this.wordTimer.callbackScope = this;
        this.wordTimer.paused = false;
        line.play();
    }

    /**
     * 
     * @param {string[]} line array for words
     * @param {number} lineNum number of line
     */
    nextWord(line) {
        this.dialogueText.text = this.dialogueText.text.concat(line[this.wordIndex]);
        this.wordIndex++;
        if (this.wordIndex >= line.length) {
            // this.hideDialogue();
            this.wordTimer.paused = true;
        }
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

    hideDialogue() {
        this.textBG.width = 0;
        this.textBG.height = 0;
        this.textBG.setPosition(-50, -50);
        this.mentorBG.width = 0;
        this.mentorBG.height = 0;
        this.mentorImg.setDepth(-1);
        this.dialogueText.text = "";
        this.wordTimer.paused = true;
        this.dialogueGfx.setVisible(false).setAlpha(0);
        this.dialogueGfx.fillRectShape(this.textBG).fillCircleShape(this.mentorBG);
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
        let line1 = this.sound.get('time-tutorial-1'); //TEMP
        let line2 = this.sound.get('time-tutorial-2'); //TEMP

        this.showDialogue(0, line1Text, line1);
        line1.on('complete', () => {
            line1.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.showDialogue(0, line2Text, line2);
            }, 1000);
        });
        line2.on('complete', () => {
            line2.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.section2(width, height);
            }, 1000);
        });
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
        fakeQuit.setDisplaySize(width * 0.075, width * 0.075);
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
        let line3 = this.sound.get('time-tutorial-3'); //TEMP
        let line4 = this.sound.get('time-tutorial-4'); //TEMP

        this.showDialogue(this.constants.Height * 0.4, line3Text, line3);
        line3.on('complete', () => {
            this.constants.HoverClick(this, fakeQuit, () => {
                clickSound.play();
                
                // trigger transition
                clickSound.on('complete', () => {
                    clickSound.off('complete');
                    this.hideDialogue();
                    this.showDialogue(this.constants.Height * 0.4, line4Text, line4);
                });
            });
            line3.off('complete');
        });
        line4.on('complete', () => {
            line4.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.section3(width, height);
            }, 500);
    
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
        let line5_1 = this.sound.get('time-tutorial-5-1'); //TEMP
        let line5_2 = this.sound.get('time-tutorial-5-2');
        let line6 = this.sound.get('time-tutorial-6'); //TEMP

        this.hideDialogue();
        this.showDialogue(this.constants.Height * 0.45, line5Text, line5_1);
        line5_1.on('complete', () => {
            line5_1.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.showDialogue(this.constants.Height * 0.45, line5_2Text, line5_2);
            }, 1000);
        });
        line5_2.on('complete', () => {
            line5_2.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.showDialogue(this.constants.Height * 0.45, line6Text, line6);
            }, 1000);
        });
        line6.on('complete', () => {
            line6.off('complete');
            setTimeout(() => {
                this.hideHighlight();
                this.hideDialogue();
                this.section4(width, height);
            }, 1000);
        });
    }

    /**
     * placing an alien and adding fire listener for it
     * @param {number} width 
     * @param {number} height 
     */
    section4(width, height) {
        // Get Voicelines
        let line7 = this.sound.get('time-tutorial-7');
        let line8 = this.sound.get('time-tutorial-8');
        let line9 = this.sound.get('time-tutorial-9');

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

                this.hideDialogue();
                this.showDialogue(0, line9Text, line9);
            });
            this.kills.grunt = 1;
        }

        alien.place(width * 0.5, height * 0.5);

        this.showDialogue(0, line7Text, line7);
        line7.on('complete', () => {
            line7.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.showDialogue(0, line8Text, line8);
                this.objText.objText.text = "Kill the Alien!";
            }, 1000);
        });
        line8.on('complete', () => {
            line8.off('complete');
            setTimeout(() => {
                this.hideDialogue();

                // add fire listener
                this.turrets.addFireListener(this.aliens, collisionFunc);
                this.levelTimer.startTimer();
            }, 500);
        });
        line9.on('complete', () => {
            line9.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.objText.objText.text = "Kill the Aliens!"
                this.alienTimers = [];
                this.aliens.createSpawnTimers();
                this.aliens.spawn();
                this.section5();
            }, 1000);
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

    // TODO: add case to respawn powerup if it goes offscreen lol
    /**
     * introduce powerups
     */
    section6() {
        // get voice lines
        let line10_1 = this.sound.get('time-tutorial-10-1');
        let line10_2 = this.sound.get('time-tutorial-10-2');
        let line11 = this.sound.get('time-tutorial-11');

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
                this.turrets.removeFireListener();
                
                setTimeout(() => {
                    this.hideDialogue();
                    this.section7();
                }, 1000);
            },
            null,
            powerup
        );
        this.events.addListener('increaseturretspeed', (amount) => {
            this.turrets.increaseTurretSpeed(60000);
        });

        this.showDialogue(0, line10Text, line10_1);
        line10_1.on('complete', () => {
            line10_1.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.showDialogue(0, line10_2Text, line10_2);
            }, 1000);
        });
        line10_2.on('complete', () => {
            line10_2.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.showDialogue(0, line11Text, line11);
            }, 1000);
        });
        line11.on('complete', () => {
            line11.off('complete');
            setTimeout(() => {
                this.objText.objText.text = "Shoot the Powerup!"
                this.levelTimer.startTimer();
                powerup.spawn();
                this.hideDialogue();
                this.turrets.addFireListener(this.aliens, this.collisionFunc3);
            }, 1000);
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
        let line12 = this.sound.get('time-tutorial-12');
        let line13 = this.sound.get('time-tutorial-13');

        this.showDialogue(0, line12Text, line12);
        line12.on('complete', () => {
            line12.off('complete');
            setTimeout(() => {
                this.objText.objText.text = "Kill the Aliens!"
                this.hideDialogue();
                this.showDialogue(0, line13Text, line13);
            }, 1000);
        });
        line13.on('complete', () => {
            line13.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.aliens.spawn();
                this.levelTimer.startTimer();
                this.turrets.addFireListener(this.aliens, this.collisionFunc3);
            }, 1000);
        });

        this.events.addListener('leveltimerover', () => {
            this.aliens.getChildren().forEach(a => a.leave());
            this.bg.setDepth(5);
            // this.aliens.destroy(false, true);
            this.turrets.removeFireListener();

            this.section8();
        });
    }

    /**
     * tutorial over, transition to next scene
     */
    section8() {
        let line14 = this.sound.get('time-tutorial-14');

        this.showDialogue(this.constants.Height * 0.6, line14Text, line14);
        line14.on('complete', () => {
            line14.off('complete');
            setTimeout(() => {
                this.hideDialogue();
                this.tutorialComplete = true;
                this.levelData["tutorialComplete"] = this.tutorialComplete;
                this.scene.restart(this.levelData);
            }, 1000);
            });
    }
}