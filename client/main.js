import 'phaser';
import './templates/main.html';

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

// Phaser Load
function preload() {
  console.log("preload");
  this.load.setBaseURL('https://labs.phaser.io');

  this.load.image('sky', 'assets/skies/space3.png');
  this.load.image('logo', 'assets/sprites/phaser3-logo.png');
  this.load.image('red', 'assets/particles/red.png');
}

function create() {
  console.log("create");
  this.add.image(400, 300, 'sky');

  var particles = this.add.particles('red');

  var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
  });

  var logo = this.physics.add.image(400, 100, 'logo');

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);
}

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
  scene: {
      preload: preload,
      create: create
  }
};

var game = new Phaser.Game(config);

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
