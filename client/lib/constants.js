/**
 * A util lib for common constants across scenes
 */
export default class Constants {
    constructor(width, height) {
        this.width = width;
        this.height = height;
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
     * @returns {Phaser.Types.GameObjects.Text.TextStyle}
     */
    TimerStyle = () => {
        return {
            fontFamily: 'impact',
            fontSize: (this.height * 0.045) + "px",
            color: "0x000000",
        }
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
}