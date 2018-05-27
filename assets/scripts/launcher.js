"use strict";

var FlappyCat = FlappyCat || {};

FlappyCat.launcher =  function(game) {};

FlappyCat.launcher.prototype = {
    init: function() {
        this.game.input.maxPointers = 1;
        this.game.stage.disableVisibilityChange = true;
        this.game.renderer.renderSession.roundPixels = true; //onl
        this.game.stage.backgroundColor = "#00ccff";
    },

    preload: function() {
        //this.load.image("Logo", "assets/sprites/phaser.png");
        //this.load.spritesheet("LoadingBars", "assets/sprites/loadingBars.png", 256, 64);
    },

    create: function() {
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.state.start("LoadingScreen");
    }
};