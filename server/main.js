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
  },

  /**
   * Fetches all possible slots which have save data
   * @returns {object[]}
   */
  getSaveData() {
    let saveslots = ["slot1", "slot2", "slot3", "slot4"];
    let res = []
    for (let slot of saveslots) {
      var s = SaveData.findOne(slot, { "fields": { _id: 1, levels: 1, difficulty: 1 } });
      if (s == null) continue;

      res.push(s);
    }

    return res;
  },

  /**
   * Creates a new entry with _id slot{{id+1}} with all levels false and diff easy
   * TODO update as we create more levels
   * @param {number} id 
   * @returns {object} the save obj
   */
  setSaveData(id) {
    let save = {
      _id: "slot" + String(id + 1),
      difficulty: 1,
      levels: [
        {
          name: "1 - 1",
          complete: false,
        },
        {
          name: "1 - 2",
          complete: false,
        },
        {
          name: "1 - 3",
          complete: false,
        },
        {
          name: "1 - 4",
          complete: false,
        },
        {
          name: "1 - 5",
          complete: false,
        },
      ]
    };
    SaveData.insert(save);

    return save;
  }
});
