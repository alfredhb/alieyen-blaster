/**
 * A util lib for common constants across scenes
 */
export default class Constants {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.hoverMiliseconds = 1000;
    }

    Blue = 0x0000FF;
    Green = 0x00ff00;
    Gray = 0x808080;
    Red = 0xFF0000;

    PersonColors = {
        "bubba": this.Green,
        "leah": this.Red,
        "friend": this.Blue,
    }

    /**
     * title text style for menus
     * Calculates fontsize based on screenheight
     * @returns {Phaser.Types.GameObjects.Text.TextStyle} menu title text style
     */
    MenuTitleStyle = () => {
        return {
            fontFamily: 'impact',
            fontSize: (this.height * 0.085) + "px",
            color: "#FFF",
        }
    }

    /**
     * @returns {Phaser.Types.GameObjects.Text.TextStyle}
     */
    TimerStyle = () => {
        return {
            fontFamily: 'impact',
            fontSize: (this.height * 0.045) + "px",
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
            fontFamily: 'impact',
            fontSize: (this.height * 0.055) + "px",
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
     * @param {Phaser.Time.TimerEvent} timer 
     */
    cancelHover(timer) {
        timer.paused = true;
        timer.elapsed = 0;

        this.hoverFill.setVisible(false);
        this.hoverFill.stop();

        // Show cursor
        document.body.style.cursor = "url(https://storage.googleapis.com/alieyen-blaster/public/assets/features/cursor.png) 19 19, pointer";
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
        this.hoverTimerActive = false;
        let hoverTimer = scene.time.addEvent({
            delay: this.hoverMiliseconds,
            callback: () => {
                this.cancelHover(hoverTimer);
                callbackFunc()
            },
            loop: false,
            paused: true,
            repeat: -1,
        });

        button.on('pointerover', () => {
            // Kill an active timer
            if (this.hoverTimerActive) this.cancelHover(hoverTimer);

            this.hoverFill.setPosition(
                scene.input.activePointer.x,
                scene.input.activePointer.y
            )

            document.body.style.cursor = 'none';
            this.hoverFill.setVisible(true);
            this.hoverFill.play('cursor-fill-animation-2');
            hoverTimer.paused = false;
            
        }).on('pointermove', () => {
            this.hoverFill.setPosition(
                scene.input.activePointer.x,
                scene.input.activePointer.y
            );

        }).on('pointerout', () => {
            // cancel any active timer
            this.cancelHover(hoverTimer);
        }).on('pointerup', () => {
            this.cancelHover(hoverTimer);
            callbackFunc();
        });
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