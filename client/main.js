import 'phaser';
import './templates/main.html';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import ArcadeMenu from './scenes/menus/arcade'
import DefaultPage from './scenes/menus/default'
import GamemodeMenu from './scenes/menus/gamemode';
import InitialLoad from './scenes/data/initial_load';
import PreLevelScene from './scenes/menus/pre_level';
import SavefileMenu from './scenes/menus/savefiles';
import StartMenu from './scenes/menus/start';
import TimedArcade from './scenes/levels/arcade/timed';

// Game Config
var config = {
  type: Phaser.AUTO,
  width: (window.innerWidth || document.body.clientWidth) * 0.95,
  height: (window.innerHeight || document.body.clientHeight) * 0.9,
  physics: {
      default: 'arcade',
      arcade: {
          debug: false,
      }
  },
  scene: [
    InitialLoad, StartMenu, GamemodeMenu, SavefileMenu, PreLevelScene,
    ArcadeMenu, TimedArcade, DefaultPage]
};

const game = new Phaser.Game(config);

// Other Helper Functions
function loadHighscore() {
  let highscore = 0;
  let scoreHolder = "emtpy";

  Meteor.call("loadHighscore", (err, res) => {
    if (typeof(res) != "string") {
      return;
    }

    // Update div
    let scoreData = res.split(" ");
    scoreHolder = scoreData[0];
    highscore = scoreData[1];

    document.getElementById("scoreHolder").innerHTML = scoreHolder;
    document.getElementById('highscore').innerHTML = highscore;
  });
}
