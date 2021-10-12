import { Meteor } from 'meteor/meteor';
import 'fs';

const fs = require("fs")

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
    try {
      var asset = fs.readFileSync("../../../../../public/assets/" + path);

      return asset.toString('base64');
    } catch {
      throw Meteor.Error("File not found with path: " + path);
    }
  },

  /**
   * @param {string} path 
   * @returns {string} base64 of asset
   */
  loadSoundAsset(path) {
    try {
      var asset = fs.readFileSync("../../../../../public/sounds/" + path);

      return asset.toString('base64');
    } catch (e) {
      throw Meteor.Error(e);
    }
  },
});
