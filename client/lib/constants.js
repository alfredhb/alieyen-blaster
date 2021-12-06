/**
 * A util lib for common constants across scenes
 */
export default class Constants {
    /**
     * @param {number} width 
     * @param {number} height 
     */
    constructor(width, height) {
        this.Width = width;
        this.Height = height;

        this.hoverTimers = [];
        this.gameOutListener = false;
    }

    Blue = 0x0000FF;
    Gold = 0xFFD700
    Green = 0x00ff00;
    Gray = 0x808080;
    LightBlue = 0x7DF9FF;
    LightGreen = 0x90EE90;
    Red = 0xFF0000;
    Pink = 0xFF69B4;
    Purple = 0x800080;

    PersonColors = {
        "bubba": this.Green,
        "leah": this.Pink,
        "friend": this.Blue,
    }

    // Basic Speeds of aliens
    MinSpeed = 100;
    MaxSpeed = 300;

    // Cursor file prefix
    CursorPath = "https://storage.googleapis.com/alieyen-blaster/public/assets/cursors/cursor-";

    /**
     * Creates speed based on min and max and applies a difficulty multiplier
     * Multiplier: d == 1: 1, d == 2: 1.5, d == 3: 2
     * @param {number} d difficulty
     */
    GetSpeed = (d) => {
        return Phaser.Math.GetSpeed(
            Phaser.Math.RND.between(this.MinSpeed, this.MaxSpeed),
            1,
        ) * this.GetDifficultyMultiplier(d);
    }

    /**
     * The default difficulty multiplier (1, 1.5, 2)
     * @param {number} d 
     * @returns {number}
     */
    GetDifficultyMultiplier = (d) => {
        return ((d > 1) ? (d + 1) / 2 : 1 );
    }

    /**
     * title text style for menus
     * Calculates fontsize based on screenheight
     * @param {string?} color hexcode of color to set text to. Default is white
     * @returns {Phaser.Types.GameObjects.Text.TextStyle} menu title text style
     */
    MenuTitleStyle = (color) => {
        return {
            fontFamily: 'impact-custom',
            fontSize: (this.Height * 0.085) + "px",
            color: (color) ? color : "#FFF",
        }
    }

    /**
     * @returns {Phaser.Types.GameObjects.Text.TextStyle}
     */
    TimerStyle = () => {
        return {
            fontFamily: 'impact-custom',
            fontSize: (this.Height * 0.045) + "px",
            color: "0x000000",
        }
    };

    /**
     * Button text style for menus
     * Calculates fontsize based on screenheight
     * @param {string?} color hexcode of color to set text to. Default is white
     * @returns {Phaser.Types.GameObjects.Text.TextStyle} menu button text style
     */
    MenuButtonStyle = (color) => {
        return {
            fontFamily: 'impact-custom',
            fontSize: (this.Height * 0.055) + "px",
            color: (color) ? color : "#FFF",
        }
    }

    /**
     * Capitalizes the first letter of str
     * @param {string} str 
     */
    Capitalize = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Adds enough leading zeros to num so that it takes up places amount of digits.
     * @param {number} num 
     * @param {number} places 
     * @returns {string} num padded to places amount of digits
     */
    ZeroPad = (num, places) => String(num).padStart(places, '0');
    
    /**
     * If platform running game is iOS
     * @returns {boolean}
     */
    isIOS() {
        return [
        'iPad Simulator',
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
        ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchedn" in document);
    }

    /**
     * cancels and resets the given timer
     * @param {Phaser.Scene} scene
     * @param {Phaser.Time.TimerEvent} timer 
     */
    cancelHover(scene, timer) {
        timer.paused = true;
        timer.elapsed = 0;

        this.hoverFill.setVisible(false);
        this.hoverFill.stop();

        // Show cursor
        scene.game.events.emit("cursorsizeset");
    } 

    /**
     * Stops and resets all timers in hovertimers
     */
    cancelAllHovers() {
        this.hoverTimers.forEach(t => {
            t.paused = true;
            t.elapsed = 0;
        });

        this.hoverFill.setVisible(false);
        this.hoverFill.stop();
    }
    
    /**
     * Adds listeners to button. Checks for X seconds that
     * no pointerout events are registered. While this happens, fills the mouse
     * with a bright blue color. At X seconds, clicks the button. Adds provided
     * callbackFunc to pointerup event too!
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Image} button 
     * @param {function} callbackFunc What to call to 'click' the button
     */
    HoverClick(scene, button, callbackFunc) {
        this.hoverFill = scene.add.sprite(-50, -50, 'cursor-fill-2', 0).setDepth(30);
        this.hoverFill.setScale(scene.game.config.cursorSize / 0.4);

        this.hoverTimerActive = false;
        let delayTimeSec = scene.game.config.dwellTime * 5;
        let hoverTimer = scene.time.addEvent({
            delay: (delayTimeSec * 1000), // dwell is a decimal [0, 1] corresponding to [0, 5] seconds
            callback: () => {
                this.cancelHover(scene, hoverTimer);
                callbackFunc()
            },
            loop: false,
            paused: true,
            repeat: -1,
        });

        button.on('pointerover', () => {
            // Kill an active timer
            if (this.hoverTimerActive) this.cancelHover(scene, hoverTimer);

            this.hoverFill.setPosition(
                scene.input.activePointer.x,
                scene.input.activePointer.y
            )

            document.body.style.cursor = 'none';
            this.hoverFill.setVisible(true);
            this.hoverFill.play('cursor-fill-animation-2');
            this.hoverFill.play({
                key: 'cursor-fill-animation-2',
                frameRate: (20 / delayTimeSec), // 20 is the default fps, so ensure all frames are played no matter the well time
            })
            hoverTimer.paused = false;
            
        }).on('pointermove', () => {
            this.hoverFill.setPosition(
                scene.input.activePointer.x,
                scene.input.activePointer.y
            );

        }).on('pointerout', () => {
            // cancel any active timer
            this.cancelHover(scene, hoverTimer);
        }).on('pointerup', () => {
            this.cancelHover(scene, hoverTimer);
            callbackFunc();
        });
        this.hoverTimers.push(hoverTimer);

        if (!this.gameOutListener) {
            scene.input.on('gameout', () => {
                this.cancelAllHovers();
            });
            this.gameOutListener = true;
        }
    }

    /**
     * Sets tint of object to color specified by the button's name and creates
     *  a timer which reverts tint to color
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.Image} object 
     * @param {number} color
     * @param {number} delay 
     */
    FlashColor(scene, object, color, delay) {
        object.setTint(object.name);

        scene.time.addEvent({
            delay: delay,
            callback: () => {
                object.setTint(color);
            },
            callbackScope: scene,
            loop: false,
            paused: false,
        })
    }
}