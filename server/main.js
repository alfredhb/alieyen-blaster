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
   * Reads global difficulty var from /public/game/difficulty.number or if story,
   * then from slotId
   * @param {boolean?} story 
   * @param {number} id 
   */
  getDifficulty(story, id) {
    if (story) {
      var d = SaveData.findOne(("slot" + String(id + 1)), { fields: {difficulty: 1 } });

      return d.difficulty;
    }

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
   * @param {number} dif 
   * @param {boolean?} story 
   * @param {number} id 
   * @returns {boolean} whether difficulty was changes
   */
  setDifficulty(dif, story, id) {
    if (story) {
      SaveData.update(("slot" + String(id + 1)), { $set: { difficulty: dif } });

      return true;
    }

    var d = MetaData.findOne("difficulty", { "fields": { value: 1 } });

    if (d.value == dif) {
      return false
    } 

    MetaData.update("difficulty", { $set: { "value" : dif } });
    return true;
  },

  /**
   * Reads global sound var which contains values for SFX and TTS volume.
   * If the entry doesn't exist in DB, then inserts it with default values of 0.5
   */
  getVolume() {
    var v = MetaData.findOne("volume", { "fields": { sfx: 1, tts: 1 } });
    if (v) {
      return { sfx: v.sfx, tts: v.tts };
    }

    MetaData.insert({
      "_id": "volume",
      "sfx": 0.5,
      "tts": 0.5
    });
    return { sfx: 0.5, tts: 0.5 };
  },

  /**
   * Sets volume entry with sfx and tts values
   * @param {number} sfx 
   * @param {number} tts 
   * @returns 
   */
  setVolume(sfx, tts) {
    MetaData.update("volume", { $set: { "sfx": Number(sfx), "tts": Number(tts) } });
    return;
  },

  /**
   * Fetches dwell time setting from db, and if it doesn't exist, then inserts it.
   */
  getDwellTime() {
    var d = MetaData.findOne("dwell", { "fields": { value: 1 } });
    if (d) {
      return d.value;
    }

    MetaData.insert({
      "_id": "dwell",
      "value": 0.2 // 1 second
    });
    return 0.2;
  },

  /**
   * Sets dwell time in db to time
   * @param {number} time 
   */
  setDwellTime(time) {
    MetaData.update("dwell", { $set: { "value": Number(time) } });
    return;
  },

  /**
   * Fetchs cursor size from db or inserts default if it doesnt exist
   */
  getCursorSize() {
    var c = MetaData.findOne("cursor", { "fields": { value: 1 } });
    if (c) {
      return c.value;
    }

    MetaData.insert({
      "_id": "cursor",
      "value": 0.4 // 40 pixels
    });
    return 0.4;
  },

  /**
   * Sets cursor size in db to size
   * @param {number}} size 
   * @returns 
   */
  setCursorSize(size) {
    MetaData.update("cursor", { $set: { "value": Number(size) } });
    return;
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

    // get intro cutscene
    var cs = MetaData.findOne("introCutscene", { "fields": { url: 1 } });
    if (cs == null) cs = {url: null};

    return {slots: res, cutscene: cs.url};
  },

  /**
   * the save slot entry for id
   * @param {number} id 
   * @returns {object}
   */
  getSlotData(id) {
    var s = SaveData.findOne("slot" + String(id + 1));

    return s;
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
        {
          name: "2 - 1",
          complete: false,
        },
        {
          name: "2 - 2",
          complete: false,
        },
        {
          name: "2 - 3",
          complete: false,
        },
        {
          name: "2 - 4",
          complete: false,
        },
        {
          name: "2 - 5",
          complete: false,
        },
        {
          name: "3 - 1",
          complete: false,
        },
        {
          name: "3 - 2",
          complete: false,
        },
        {
          name: "3 - 3",
          complete: false,
        },
        {
          name: "3 - 4",
          complete: false,
        },
        {
          name: "3 - 5",
          complete: false,
        },
        {
          name: "Boss Battle",
          complete: false,
        },
      ]
    };
    SaveData.insert(save);

    return save;
  },

  /**
   * sets the completion of level to true for slot at id
   * @param {number} id 
   * @param {string} level format world#level#
   * @returns {object} the save obj
   */
  saveLevelData(id, level, stars) {
    var levelEntry = String(level[5] + ' - ' + level[11]);
    if (level == "Boss Battle") levelEntry = "Boss Battle";

    SaveData.update(
      {_id: ("slot" + String(id + 1))},
      { 
        $set: { "levels.$[element].complete": true },
        $max: { "levels.$[element].stars": stars }  
      },
      {
        multi: true,
        arrayFilters: [ { "element.name": { $eq: levelEntry } } ]
      }
    );
    var s = SaveData.findOne(("slot" + String(id + 1)));

    return s;
  },

  /**
   * deletes the save data associated with id
   * @param {string} id 
   */
  deleteSaveData(id) {
    return SaveData.remove(id);
  }
});
