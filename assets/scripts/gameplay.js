"use strict";

var FlappyCat = FlappyCat || {};

var BARRIER_GAP = 220;
var BARRIER_FREQUENCY = 78;
var speed = -220;
var meowCounter = 0 //meows
var placeBarrier = true;
var barrierCounter = BARRIER_FREQUENCY;
var gameOn = true;
var score = 0;
var highScore = 0;
var savedScore;
var localStorageName = "high_score";
var cloudTimer = 0;

var GRAVITY = 1500;
var JUMP_STRENTH = -600;
var CAT_SCALE = 1;


FlappyCat.gameplay = function() {};



FlappyCat.gameplay.prototype = {
    preload: function() {
        this.meowSound = [
                    this.add.audio("meow1"),
                    this.add.audio("meow2"),
                    this.add.audio("meow3"),
                    this.add.audio("meow4"),
                    this.add.audio("meow5"),
                    this.add.audio("meow6"),
                ];
        this.textTemplate = {
            font: "monospace",
            fontSize: "48px",
            fill: "yellow",
            align: "center"

        }

    },

    create: function () {

        //creating tesla and her parameters
        this.tesla = this.add.sprite(96, 256, "Tesla");
        this.tesla.scale.setTo(CAT_SCALE);
        //this.tesla.tint = 0x00ccff;
        this.tesla.rotSpeed = 1000; //a constant which I placed here for whatever reason
        this.tesla.anchor.setTo(0.5);
        this.physics.enable(this.tesla, Phaser.Physics.ARCADE);
        this.tesla.body.setSize(100, 40, 10, 7);
        this.tesla.body.collideWorldBounds = true;
        this.tesla.body.gravity.y = GRAVITY;

        this.input.onDown.add(this.jump, this); //on click/tap anywhere, tesla jumps
        this.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spacebar.onDown.add(this.jump, this);
        this.noseDown(); //tween to slowly tilt downwards


        //clouds
        this.cloudGroup = this.add.group();
        cloudTimer = this.rnd.between(10, 60);
        
        //creating barriers
        this.barrierGroup = this.add.group();
        //this.addBarrier(this.barrierGroup);
        meowCounter = this.rnd.between(20, 100);
        this.jump();


        this.scoreDisplay = this.add.bitmapText(this.game.width / 2, 30, "font", score.toString(), 72);
        this.scoreDisplay.anchor.setTo(0.5);

        //initialize storage
        savedScore = localStorage.getItem(localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(localStorageName));
        this.highScoreDisplay = this.add.bitmapText(this.game.width / 2, 100, "font", savedScore.score.toString(), 72);
        this.highScoreDisplay.tint = 0xFF0000;
        this.highScoreDisplay.anchor.setTo(0.5);

    }, 

    update: function () {
        // if (this.tesla.angle < 180) {
        //     this.tesla.angle++;
        // }    


        this.cloudGroup.forEach(function (item){
            if (item.x < 0) {
                item.destroy();
            }
        });
        barrierCounter--;
        if (barrierCounter <= 0) {
            barrierCounter = BARRIER_FREQUENCY;
            placeBarrier = true;
        }
        if(placeBarrier && gameOn) { //if barrier is to be placed and the game is still going
            placeBarrier = false; //this should run only once
            this.addBarrier(this.barrierGroup);
            // this.time.events.add(Phaser.Timer.SECOND * BARRIER_FREQUENCY, function () { //set timer for the next barrier
            //     placeBarrier = true; //when timer stops, set it to true so that this will run again
            // });
        }

        if (gameOn) {
            this.highScoreDisplay.text = "";
            this.physics.arcade.collide(this.tesla, this.barrierGroup, null, function(t, b) { //if the game is still going, check for collisions
                var hitSound = this.add.audio("hit");
                for(var i = 0; i < this.meowSound.length; i++) {
                    this.meowSound[i].stop();
                }
                hitSound.play();
                this.meowSound[0].play();

                this.barrierGroup.forEach(function(item) {
                    item.body.velocity.x = 0; //we must stop all barriers
                });
                this.cloudGroup.forEach(function(item) {
                    item.body.velocity.x = 0;
                });
                this.tesla.body.collideWorldBounds = false; //now we can let her fall of the screen
                this.teslaTween.stop(); //stop normal tween and add the flipping back gameover tween
                var destroyTween = this.add.tween(this.tesla).to({
                    x: t.x - t.width/2,
                    y: 800,
                    angle: -180
                }, 500, "Linear", true);
                gameOn = false;
                highScore = Math.max(score, savedScore.score);
                localStorage.setItem(localStorageName, JSON.stringify({
                    score: highScore
                }));
                this.highScoreDisplay.text = highScore.toString();
            }, this);
            if (this.tesla.y > this.game.height - this.tesla.height) {
                var hitSound = this.add.audio("hit");
                for(var i = 0; i < this.meowSound.length; i++) {
                    this.meowSound[i].stop();
                }
                hitSound.play();
                this.meowSound[0].play();

                this.barrierGroup.forEach(function(item) {
                    item.body.velocity.x = 0; //we must stop all barriers
                });
                this.cloudGroup.forEach(function(item) {
                    item.body.velocity.x = 0;
                });
                this.tesla.body.collideWorldBounds = false; //now we can let her fall of the screen
                this.teslaTween.stop(); //stop normal tween and add the flipping back gameover tween
                var destroyTween = this.add.tween(this.tesla).to({
                    x: this.tesla.x - this.tesla.width/2,
                    y: 800,
                    angle: -180
                }, 500, "Linear", true);
                gameOn = false;
            }
            meowCounter--;
            if(meowCounter <= 0) {
                meowCounter = this.rnd.between(20, 100);
                var randomSound = this.rnd.between(0, this.meowSound.length - 1);
                if(!this.meowSound[randomSound].isPlaying) {
                    this.meowSound[randomSound].play();
                }
            }
            cloudTimer--;
            if(cloudTimer <= 0 && gameOn) {
                this.createCloud();
            }
        }
        this.barrierGroup.forEach(function (item){
            //item.bringToTop();
            if (item.x < 0) {
                item.destroy(); //if any barrier leaves the screen, destroy it
                score += 0.5;
                this.scoreDisplay.text = Math.ceil(score).toString();
            }
        }, this);
        this.tesla.bringToTop(); //so that tesla never gets behind a barrier
        //this.scoreDisplay.bringToTop();

    },

    createCloud: function () {
        cloudTimer = this.rnd.between(10, 30);
        var cloud = this.add.sprite(700, this.rnd.between(10, 750), "Cloud");
        this.physics.enable(cloud, Phaser.Physics.ARCADE);
        cloud.anchor.setTo(1, 0);
        var cloudSize = this.rnd.realInRange(0.6, 1.5);
        cloud.scale.setTo(cloudSize);
        cloud.body.velocity.x = -cloudSize * 100 - 200;
        cloud.sendToBack();
        this.cloudGroup.add(cloud);

    },

    jump: function () {
        if(gameOn) {
            var flapSound = this.add.audio("flap");
            flapSound.play();
            this.tesla.body.velocity.y = JUMP_STRENTH; //just some vertical velocity to counteract gravity
            //this.tesla.angle = -50;
            this.teslaTween.stop(); //stop normal diving tween
            var backTween = this.add.tween(this.tesla).to({ //head back up
                angle: -50
            }, 50, "Linear", true);
            backTween.onComplete.add(this.noseDown, this); //and start diving tween again
        } else {
            if (this.tesla.y > 800) {
                gameOn = true;
                score = 0;
                placeBarrier = true;
                barrierCounter = BARRIER_FREQUENCY;
                this.state.start(this.state.current);
            }
        }
    },

    noseDown: function () {
        this.teslaTween = this.add.tween(this.tesla).to({ //diving tween
                angle: 50
        }, this.tesla.rotSpeed, "Linear", true);
    },

    addBarrier: function(group) {
        var posY = this.rnd.between(20, 460); //the gap starts min. 20px from the top and max. 20 px from the bottom of the screen
        var barrierUp = this.add.sprite(600, posY, "Barrier"); //place outside the screen to the right
        var barrierDown = this.add.sprite(600, posY + barrierUp.height + BARRIER_GAP, "Barrier"); //the lower barrier must leave a gap between both of them
        this.physics.enable(barrierUp, Phaser.Physics.ARCADE);
        this.physics.enable(barrierDown, Phaser.Physics.ARCADE);
        barrierUp.body.setSize(barrierUp.width, barrierUp.height - 10);
        barrierDown.body.setSize(barrierDown.width, barrierUp.height - 10);
        barrierUp.anchor.setTo(1);
        barrierDown.anchor.setTo(1, 0);
        barrierUp.bringToTop();
        barrierDown.bringToTop();
        barrierDown.scale.y *= -1;

        barrierUp.body.velocity.x = speed;
        barrierDown.body.velocity.x = speed;

        barrierUp.body.immovable = true; //we do not want tesla to move the barriers when hitting them
        barrierDown.body.immovable = true;
        //barrierDown.anchor.setTo(0.5);
        group.add(barrierUp);
        group.add(barrierDown);

    }
}

