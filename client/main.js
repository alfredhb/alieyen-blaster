import 'phaser';
import './templates/main.html';

import ArcadeMenu from './scenes/menus/arcade'
import DifficultySelectMenu from './scenes/menus/difficulty_select'
import GamemodeMenu from './scenes/menus/gamemode';
import InitialLoad from './scenes/data/initial_load';
import PlayerSelectMenu from './scenes/menus/player_select';
import ArcadeReportScene from './scenes/levels/arcade/report';
import ArcadeReadyScene from './scenes/levels/arcade/ready';
import SavefileMenu from './scenes/menus/savefiles';
import StartMenu from './scenes/menus/start';
import TimedArcade from './scenes/levels/arcade/timed';
import Constants from './lib/constants';
import LevelFactory from './scenes/levels/level_factory';
import TemplateLevelScene from './scenes/levels/template_level';
import TimedTutorialScene from './scenes/levels/timed_tutorial';
import WorldSelectMenu from './scenes/menus/world_select';
import StoryReadyScene from './scenes/levels/story/ready';
import LevelSelectMenu from './scenes/menus/level_select';
import StoryReportScene from './scenes/levels/story/report';
import HelpMenu from './scenes/menus/help';
import AdminSettingsMenu from './scenes/menus/admin_settings';
import TemplateCutscene from './scenes/levels/story/template_cutscene';

// Game Config
var config = {
  type: Phaser.AUTO,
  width: (window.innerWidth || document.body.clientWidth) * 0.95,
  height: (window.innerHeight || document.body.clientHeight) * 0.95,
  physics: {
      default: 'arcade',
      arcade: {
          debug: false,
      }
  },
  scene: [
    InitialLoad, StartMenu, PlayerSelectMenu, GamemodeMenu, SavefileMenu, 
    ArcadeReportScene, ArcadeMenu, DifficultySelectMenu, TimedArcade, TemplateCutscene,
    LevelFactory, TemplateLevelScene, ArcadeReadyScene, TimedTutorialScene, WorldSelectMenu,
    StoryReadyScene, LevelSelectMenu, StoryReportScene, HelpMenu, AdminSettingsMenu
  ],
};

const constants = new Constants(config.width, config.height);

// If Ipad, inject 50px spacing above canvas
if (constants.isIOS()) {
  let div = document.createElement('div');
  div.style.height = "50px"
}

// Create Game canvas and begin with InitialLoad scene
const game = new Phaser.Game(config);
game.events.addListener("cursorsizeset", () => {
  document.body.style.cursor = game.config.cursorStyle;
});

/**
 * Sample Call to server for savedata
 */
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
