import { Meteor } from 'meteor/meteor';
import 'fs';

const fs = require("fs")
const cwd_arr = fs.realpathSync(process.cwd()).split("\\");
const isLocalDev = cwd_arr[cwd_arr.length - 3] == "build";

Meteor.methods({
  /**
   * DEPRECATED
   * @param {string} path 
   * @returns {string} base64 of asset
   */
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
    } catch (e) {
      throw new Meteor.Error("File not found with path: " + path);
    }
  },

  /**
   * DEPRECATED
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
