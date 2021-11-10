import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import 'fs';

// Setup Directory Layout
const fs = require("fs")
const cwd_arr = fs.realpathSync(process.cwd()).split("\\");
const isLocalDev = cwd_arr[cwd_arr.length - 3] == "build";
let pathPrefix = "";
if (isLocalDev) {
  pathPrefix = "../../../../../public/";
} else {
  pathPrefix = "../web.browser/";
}

// Export Collections
export const SaveData = new Mongo.Collection("save-files");
export const MetaData = new Mongo.Collection("meta-data");
export const Levels   = new Mongo.Collection("levels");

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
    var d = MetaData.findOne("difficulty", { "fields": { value: 1 } });
    if (d) {
      return d.value
    }

    // entry doesn't exist. Create one.
    MetaData.insert(
      {
        "_id": "difficulty", 
        "value": 1
      }
    );
    return 1;
  },

  /**
   * Checks that difficulty.number isn't already d, then sets it
   * @param {number} difficulty 
   * @returns {boolean} whether difficulty was changes
   */
  setDifficulty(difficulty) {
    var d = MetaData.findOne("difficulty", { "fields": { value: 1 } });

    if (d.value == difficulty) {
      return false
    } 

    MetaData.update("difficulty", { $set: { "value" : difficulty } });
    return true;
  },

  /**
   * Finds the value of the highscore entry of '${gamemode}-${level}-highscore'.
   * If lower than score, then updates the DB entry with score and player. Finally
   * returns the highscore object
   * @param {'arcade' | 'story'} gamemode 
   * @param {string} levelId 
   * @param {{player: string, score: number}} scoreObj 
   * @returns {{player: string, score: number}}
   */
  getHighScore(levelId, scoreObj) {
    var id = (levelId + "-highscore");
    var h = SaveData.findOne(id, { "fields": { player: 1, value: 1 } });
    if (h && h.value >= scoreObj.score) {
      return {player: h.player, score: h.value};
    }

    SaveData.update(id, { $set: { "value": scoreObj.score, "player": scoreObj.player } });
    return scoreObj;
  },

  /**
   * Finds the DB entry in levels with levelId and returns all of its contents
   * @param {string} levelId 
   */
  getLevelData(levelId) {
    var l = Levels.findOne(levelId);
    if (l == null) {
      throw new Meteor.Error("unknown levelId provided " + levelId);
    }

    return l;
  }
});
