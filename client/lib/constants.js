
/**
 * A util lib for common constants across scenes
 */
export default class Constants {
    /**
     * title text style for menus
     * @returns {Phaser.Types.GameObjects.Text.TextStyle} menu title text style
     */
    MenuTitleStyle = () => {
        return {
            fontFamily: 'impact',
            fontSize: "75px",
            color: "#FFF",
        }
    }

    /**
     * 
     * Button text style for menus
     * @param {string?} color hexcode of color to set text to. Default is white
     * @returns {Phaser.Types.GameObjects.Text.TextStyle} menu button text style
     */
    MenuButtonStyle = (color) => {
        return {
            fontFamily: 'impact',
            fontSize: "50px",
            color: (color) ? color : "#FFF",
        }
    }

    /**
     * Adds enough leading zeros to num so that it takes up places amount of digits.
     * @param {number} num 
     * @param {number} places 
     * @returns {string} num padded to places amount of digits
     */
    ZeroPad = (num, places) => String(num).padStart(places, '0');
}