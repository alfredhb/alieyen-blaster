import { Meteor } from 'meteor/meteor';
import 'fs';

const fs = require("fs")
const cwd_arr = fs.realpathSync(process.cwd()).split("\\");
const isLocalDev = cwd_arr[cwd_arr.length - 3] == "build";
let pathPrefix = "";
if (isLocalDev) {
  pathPrefix = "../../../../../public/";
} else {
  pathPrefix = "../web.browser/";
}

Meteor.methods({
  // Loads asset from ./data/assets/{path} and returns a base64 object of it
  loadImageAsset(path) {
    try {
      var asset = fs.readFileSync("../../../../../data/assets/" + path);

      return asset.toString('base64');
    } catch {
      throw Meteor.Error("File not found with path: " + path);
    }
  },

  /**
   * Reads global difficulty var from /public/game/difficulty.number
   */
  getDifficulty() {
    throw new Meteor.Error("Unimplemented!")
  },

  /**
   * Checks that difficulty.number isn't already d, then sets it
   * @param {number} d 
   * @returns {boolean} whether difficulty was changes
   */
  setDifficulty(d) {
    throw new Meteor.Error("Unimplemented!")
  },
});
