import { Meteor } from 'meteor/meteor';
import 'fs';

const fs = require("fs")
const cwd_arr = fs.realpathSync(process.cwd()).split("\\");
const isLocalDev = cwd_arr[cwd_arr.length - 3] == "build";

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
  loadHighscore() {
    var highscore = fs.readFileSync("../../../../../savedata/counter_highscores.txt");
    var score = highscore.toString();
  
    return score;
  },

  // Loads asset from ./data/assets/{path} and returns a base64 object of it
  loadImageAsset(path) {
    let pathPrefix = "";
    if (isLocalDev) {
      pathPrefix = "../../../../../public/";
    } else {
      pathPrefix = "../web.browser/";
    }

    try {
      var asset = fs.readFileSync(pathPrefix + "assets/" + path);
      var base64 = asset.toString('base64');

      return base64;
    } catch {
      throw new Meteor.Error("File not found with path: " + path);
    }
  },

  /**
   * @param {string} path 
   * @returns {string} base64 of asset
   */
  loadSoundAsset(path) {
    let pathPrefix = "";
    if (isLocalDev) {
      pathPrefix = "../../../../../public/";
    } else {
      pathPrefix = "../web.browser/app/";
    }

    try {
      var asset = fs.readFileSync(pathPrefix + "sounds/" + path);
      var base64 = asset.toString('base64');

      return base64;
    } catch (e) {
      throw new Meteor.Error(e);
    }
  },
});
