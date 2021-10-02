import 'phaser';
import './templates/main.html';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import DefaultPage from './scenes/menus/default'
import GamemodeMenu from './scenes/menus/gamemode';
import MainMenu from './scenes/menus/main';

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 100 }
      }
  },
  scene: [DefaultPage, MainMenu, GamemodeMenu]
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

function saveHighscore() {
  console.log("Unimplemented!");
}

Template.score.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
  loadHighscore()
});

Template.score.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.score.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },

});
