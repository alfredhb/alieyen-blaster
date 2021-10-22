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

    return d.value;
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
});
