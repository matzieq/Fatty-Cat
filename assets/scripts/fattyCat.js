"use strict";

/***********\
| CONSTANTS |
\***********/

var SCREEN_WIDTH = 480;
var SCREEN_HEIGHT = 800;
var BARRIER_GAP = 220;
var BARRIER_FREQUENCY = 78;


var GRAVITY = 1500;
var JUMP_STRENTH = -600;
var CAT_SCALE = 1;

var HIGH_SCORE_COLOR = 0xFF0000;
var CREDITS_COLOR = 0x232323;

var ROTATION_SPEED = 1000; //formerly tesla.rotSpeed


/***********\
| VARIABLES |
\***********/

var speed = -220;
var placeBarrier = true;
var barrierCounter = BARRIER_FREQUENCY;
var gameOn = false;

var clouds; //group for clouds
var cloudTimer = 0;

var tesla; //the name of my cat

var spacebar;

var score = 0;
var highScore = 0;
var savedScore;
var localStorageName = "high_score";

var meowCounter = 0; //meows

var meowSounds;
var hitSound;

var titleText = {};
var highScoreDisplay;
var scoreDisplay;

var fsm = startGame; //finite state machine

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, "fatty-cat",
    {preload: preload, create: create, update: update});


/******\
| MAIN |
\******/

function preload () {
    loadAssets();
    enableCrispRendering();
}



function create () {
    adjustGameScale();
    initializeAudio();
    loadHighScore();
    displayHighScore();
    displayScore();
    displayTitleText();
    createCat();
    createClouds();
    initializeInput();

}

function update () {
    handleClouds();

    tesla.bringToTop();
}

function loadAssets () {
    game.load.image("Tesla", "assets/sprites/tesla2.png");
    game.load.image("Barrier", "assets/sprites/barrier.png");
    game.load.image("Cloud", "assets/sprites/cloud.png");
    game.load.audio("meow1", ["assets/sounds/meow1.mp3", "assets/sounds/meow1.ogg"]);
    game.load.audio("meow2", ["assets/sounds/meow2.mp3", "assets/sounds/meow2.ogg"]);
    game.load.audio("meow3", ["assets/sounds/meow3.mp3", "assets/sounds/meow3.ogg"]);
    game.load.audio("meow4", ["assets/sounds/meow4.mp3", "assets/sounds/meow4.ogg"]);
    game.load.audio("meow5", ["assets/sounds/meow5.mp3", "assets/sounds/meow5.ogg"]);
    game.load.audio("meow6", ["assets/sounds/meow6.mp3", "assets/sounds/meow6.ogg"]);
    game.load.audio("flap", ["assets/sounds/Jump9.mp3", "assets/sounds/Jump9.ogg"]);
    game.load.audio("hit", ["assets/sounds/Hit_Hurt2.mp3", "assets/sounds/Hit_Hurt2.ogg"]);
    game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
}

function enableCrispRendering () {
    game.renderer.renderSession.roundPixels = true;
	Phaser.Canvas.setImageRenderingCrisp(game.canvas);
	game.stage.backgroundColor = "#00ccff";
}

function adjustGameScale () {
	game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
}

function initializeAudio () {
    meowSounds = [
        game.add.audio("meow1"),
        game.add.audio("meow2"),
        game.add.audio("meow3"),
        game.add.audio("meow4"),
        game.add.audio("meow5"),
        game.add.audio("meow6"),
    ];
    hitSound = game.add.audio("hit");
}

function loadHighScore () {
    savedScore = localStorage.getItem(localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(localStorageName));
}

function displayHighScore () {
    highScoreDisplay = game.add.bitmapText(game.width / 2, 100, "font", savedScore.score.toString(), 72);
    highScoreDisplay.tint = HIGH_SCORE_COLOR;
    highScoreDisplay.anchor.setTo(0.5);
}

function displayScore () {
    scoreDisplay = game.add.bitmapText(game.width / 2, 30, "font", "0", 72);
    scoreDisplay.anchor.setTo(0.5);
}

function displayTitleText () {
    titleText.instructions = game.add.bitmapText(50, 670, "font", "LMB, space or tap", 32);
    titleText.instructions.tint = CREDITS_COLOR;

    titleText.credits = game.add.bitmapText(60, 710, "font", "gfx, snd & prg: matzieq", 24);
    titleText.credits.tint = CREDITS_COLOR;

    titleText.disclaimer = game.add.bitmapText(50, 750, "font", "image of my cat used with permission", 24);
    titleText.disclaimer.tint = CREDITS_COLOR;
}

function createCat () {
    tesla = game.add.sprite(96, 256, "Tesla");
    tesla.anchor.setTo(0.5);
    tesla.scale.setTo(CAT_SCALE);

}

function initializeInput () {
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    resetInputState();

}

function resetInputState () {
    game.input.onDown.dispose();
    spacebar.onDown.dispose();

    game.input.onDown.add(fsm, this); // mouse or touch
    spacebar.onDown.add(fsm, this);
}

function startGame () {
    enableCatPhysics();
    flipCreditsVisibility();
    fsm = flap;
    gameOn = true;
    resetInputState();
}

function enableCatPhysics () {  
    game.physics.enable(tesla, Phaser.Physics.ARCADE);
    tesla.body.setSize(100, 40, 10, 7);
    tesla.body.collideWorldBounds = true;
    tesla.body.gravity.y = GRAVITY;

}

function flipCreditsVisibility () {
    for (var key in titleText) {
        titleText[key].visible = !titleText[key].visible;
    }
}

function flap () {
    console.log("Flap!");
}

function createClouds () {
    clouds = game.add.group();
    cloudTimer = game.rnd.between(10, 60);
}

function addCloud () {
    cloudTimer = game.rnd.between(10, 30);
    var cloud = clouds.getFirstExists(false);
    if (!cloud) {
        cloud = game.add.sprite(0, 0, "Cloud");
    }
    cloud.reset (SCREEN_WIDTH * 1.5, game.rnd.between(10, 750));

    game.physics.enable(cloud, Phaser.Physics.ARCADE);
    cloud.anchor.setTo(1, 0);
    var cloudSize = game.rnd.realInRange(0.6, 1.5);
    cloud.scale.setTo(cloudSize);
    cloud.body.velocity.x = -cloudSize * 100 - 200;
    cloud.sendToBack();
    clouds.add(cloud);
}

function handleClouds () {
    cloudTimer--;
    if(cloudTimer <= 0 && gameOn) {
        addCloud();
    }

    clouds.forEach(function (cloud) {
        if (cloud.x < 0) {
            cloud.kill(); //remove invisible clouds
        }
    });
}