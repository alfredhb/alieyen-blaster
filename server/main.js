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
});