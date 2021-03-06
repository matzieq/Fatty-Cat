"use strict";

/***********\
| CONSTANTS |
\***********/

var SCREEN_WIDTH = 480;
var SCREEN_HEIGHT = 800;
var BARRIER_GAP = 220;
var BARRIER_FREQUENCY = 90;
var BARRIER_START_X = 600;

var CAT_START_X = 96;
var CAT_START_Y = 256;

var GRAVITY = 1500;
var JUMP_FORCE = -600;
var CAT_SCALE = 1;

var HIGH_SCORE_COLOR = 0xFF0000;
var CREDITS_COLOR = 0x232323;

var ROTATION_SPEED = 1000; //formerly tesla.rotSpeed


/***********\
| VARIABLES |
\***********/

var speed = -220;
var placeBarrier = false;
var barrierCounter = BARRIER_FREQUENCY;
var gameOn = false;

var clouds; //group for clouds
var cloudTimer = 0;

var barriers = {
    "topBarriers": null,
    "bottomBarriers": null,
}; //group for barriers
var placeBarrier = true;
var barrierTimer = BARRIER_FREQUENCY;

var tesla; //the name of my cat

var spacebar;

var score = 0;
var highScore = 0;
var fattyCatSavedScore;
var localStorageName = "fatty_cat_high_score";

var meowTimer = 0; //meows

var meows;
var hitSound;
var flapSound;

var titleText = {};
var highScoreDisplay;
var scoreDisplay;

var fsm = startGame; //finite state machine

var downRotation; //tween
var flapRotation; //tween
var hitRotation; //tween

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.CANVAS, "fatty-cat",
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
    displayTitleText();
    createCat();
    createClouds();
    createBarriers();
    initializeInput();
    displayHighScore();
    displayScore();

}



function update () {
    handleClouds();
    handleBarriers();
    handleCollisions();
    makeNoise();
    bringThingsToTop();
}

/***********\
| FUNCTIONS |
\***********/

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
    meows = [
        game.add.audio("meow1"),
        game.add.audio("meow2"),
        game.add.audio("meow3"),
        game.add.audio("meow4"),
        game.add.audio("meow5"),
        game.add.audio("meow6"),
    ];

    hitSound = game.add.audio("hit");
    flapSound = game.add.audio("flap");
}

function loadHighScore () {
    fattyCatSavedScore = localStorage.getItem(localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(localStorageName));
}

function displayHighScore () {
    highScoreDisplay = game.add.bitmapText(game.width / 2, 100, "font", fattyCatSavedScore.score.toString(), 72);
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
    tesla = game.add.sprite(CAT_START_X, CAT_START_Y, "Tesla");
    tesla.anchor.setTo(0.5);
    tesla.scale.setTo(CAT_SCALE);

}

function createClouds () {
    clouds = game.add.group();
    cloudTimer = game.rnd.between(10, 60);
}

function createBarriers () {
    barriers.topBarriers = game.add.group();
    barriers.bottomBarriers = game.add.group();
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
    highScoreDisplay.text = "";
    barrierCounter = BARRIER_FREQUENCY;
    gameOn = true;
    fsm = flap;

    enableCatPhysics();
    disableCredits();
    resetInputState();
    rotateTowardsBottom();
    flap();
}

function restartGame () {
    if (tesla.y > SCREEN_HEIGHT) {
        score = -0.5; //because the adjustScore function adds 0.5 to score, and we want to reset it to zero
        adjustScore();
        destroyEverything();
        resetCat();
        startGame();
    }
}

function resetCat () {
    hitRotation.stop();
    tesla.reset(CAT_START_X, CAT_START_Y);
}

function destroyEverything () {
    barriers.topBarriers.forEach(function(item) {
        item.kill();
        item.x = BARRIER_START_X;
    });
    barriers.bottomBarriers.forEach(function(item) {
        item.kill();
        item.x = BARRIER_START_X;
    });
    clouds.forEach(function(item) {
        item.kill();
        item.x = BARRIER_START_X;
    });
}

function enableCatPhysics () {  
    game.physics.enable(tesla, Phaser.Physics.ARCADE);
    tesla.body.setSize(100, 40, 10, 7);
    tesla.body.collideWorldBounds = true;
    tesla.body.gravity.y = GRAVITY;

}

function disableCredits () {
    for (var key in titleText) {
        titleText[key].visible = false;
    }
}

function flap () {
    if(gameOn) {
        flapSound.play();
        tesla.body.velocity.y = JUMP_FORCE; //just some vertical velocity to counteract gravity
        tesla.angle = -50;
        rotateTowardsBottom();
    }
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
    if (gameOn) {
        cloudTimer--;
        if(cloudTimer <= 0) {
            addCloud();
        }
    }

    clouds.forEach(function (cloud) {
        if (cloud.x < 0) {
            cloud.kill(); //remove invisible clouds
        }
    });
}

function rotateTowardsBottom() {
    downRotation = game.add.tween(tesla).to({ //diving tween
            angle: 50
    }, ROTATION_SPEED, "Linear", true);
}

function handleBarriers () {
    if (gameOn) {
        barrierTimer--;
    }
    if (barrierTimer <= 0) {
        barrierTimer = BARRIER_FREQUENCY;
        placeBarrier = true;
    }
    if(placeBarrier && gameOn) { //if barrier is to be placed and the game is still going
        placeBarrier = false; //this should run only once
        addBarrier();
    }
    barriers.topBarriers.forEach(killBarrierIfOutsideScreen);
    barriers.bottomBarriers.forEach(killBarrierIfOutsideScreen);
}

function killBarrierIfOutsideScreen(barrier) {
    if (barrier.x < 0) {
        barrier.kill();
        barrier.x = BARRIER_START_X;
        adjustScore();
    }
}

function adjustScore () {
    score += 0.5;
    scoreDisplay.text = Math.ceil(score).toString();
}

function addBarrier () {
    var posY = game.rnd.between(20, SCREEN_HEIGHT - BARRIER_GAP - 20); //the gap starts min. 20px from the top and max. 20 px from the bottom of the screen
    createTopBarrier(posY);
    createBottomBarrier(posY); 
}

function createTopBarrier (posY) {
    var topBarrier = barriers.topBarriers.getFirstExists(false);
    
    if (!topBarrier) {
        topBarrier = game.add.sprite(0, 0, "Barrier");
        game.physics.enable(topBarrier, Phaser.Physics.ARCADE);
        topBarrier.body.setSize(topBarrier.width, topBarrier.height - 10);
        topBarrier.anchor.setTo(1);
        topBarrier.body.immovable = true; //we do not want tesla to move the barriers when hitting them
        barriers.topBarriers.add(topBarrier);
    }
    topBarrier.reset(BARRIER_START_X, posY); //place outside the screen to the right
    topBarrier.body.velocity.x = speed;
    topBarrier.bringToTop();
}

function createBottomBarrier (posY) {
    var bottomBarrier = barriers.bottomBarriers.getFirstExists(false);

    if (!bottomBarrier) {
        console.log("Created!");
        bottomBarrier = game.add.sprite(0, 0, "Barrier");
        game.physics.enable(bottomBarrier, Phaser.Physics.ARCADE);
        bottomBarrier.scale.y = -1;
        //bottomBarrier.body.setSize(bottomBarrier.width, bottomBarrier.height);
        bottomBarrier.anchor.setTo(1, 0);
        bottomBarrier.body.immovable = true;
        barriers.bottomBarriers.add(bottomBarrier);
    }
    
    bottomBarrier.reset(BARRIER_START_X, posY - bottomBarrier.height + BARRIER_GAP); //the lower barrier must leave a gap between both of them
    bottomBarrier.body.velocity.x = speed; 
    bottomBarrier.bringToTop();

}

function handleCollisions () {
    if (gameOn) {
        game.physics.arcade.collide(tesla, barriers.topBarriers, null, loseGame, this);
        game.physics.arcade.collide(tesla, barriers.bottomBarriers, null, loseGame, this);
        if (tesla.y > game.height - tesla.height) {
            loseGame();
        }
    }
}

function loseGame () {
    stopTheDamnNoise();
    hitSound.play();
    meows[0].play();
    stopMoving(barriers.topBarriers);
    stopMoving(barriers.bottomBarriers);
    stopMoving(clouds);
    fallOffScreen();
    gameOn = false;
    fsm = restartGame;
    resetInputState();
    saveHighScore();
}

function stopTheDamnNoise () {
    for(var i = 0; i < meows.length; i++) {
        meows[i].stop();
    }
}

function fallOffScreen () {
    tesla.body.collideWorldBounds = false; //now we can let her fall of the screen
    downRotation.stop(); //stop normal tween and add the flipping back gameover tween
    hitRotation = game.add.tween(tesla).to({
        x: tesla.x - tesla.width/2,
        y: 800,
        angle: -180
    }, 500, "Linear", true);
}

function saveHighScore () {
    highScore = Math.max(score, fattyCatSavedScore.score);
    localStorage.setItem(localStorageName, JSON.stringify({
        score: highScore
    }));
    highScoreDisplay.text = highScore.toString();
}

function stopMoving (group) {
    group.forEach(function(item) {
        item.body.velocity.x = 0;
    });
}

function makeNoise () {
    if (gameOn) {
        meowTimer--;
        if(meowTimer <= 0) {
            meowTimer = game.rnd.between(20, 100);
            var randomSound = game.rnd.between(0, meows.length - 1);
            if(!meows[randomSound].isPlaying) {
                meows[randomSound].play();
            }
        }
    }
}

function bringThingsToTop () {
    tesla.bringToTop();
}