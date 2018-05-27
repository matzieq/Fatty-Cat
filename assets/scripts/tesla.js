"use strict";

var FlappyCat = FlappyCat || {};

var Tesla = function (rot, grav) {
    Phaser.Sprite.call(this, FlappyCat.game, 96, 256, "Tesla");
    this.rotSpeed = rot;
    FlappyCat.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    //this.tesla.scale.setTo(2, 2);
    
    this.body.collideWorldBounds = true;
    this.body.gravity.y = grav;
    console.log(this.x + " " + this.y);
    this.noseDown()
};

Tesla.prototype = Object.create(Phaser.Sprite.prototype);
Tesla.prototype.constructor = Tesla;
Tesla.prototype.jump = function () {
    console.log("jump");
    console.log(this.x + " " + this.y);

    this.body.velocity.y = -300;
    //this.tesla.angle = -50;
    FlappyCat.game.teslaTween.stop();
    var backTween = FlappyCat.game.add.tween(this).to({
        angle: -50
    }, 50, "Linear", true);
    backTween.onComplete.add(this.noseDown, FlappyCat.game);
}

Tesla.prototype.noseDown = function () {
    console.log("going down");
    FlappyCat.game.teslaTween = FlappyCat.game.add.tween(this).to({
            angle: 70
    }, this.rotSpeed, "Linear", true);
}