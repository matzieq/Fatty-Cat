"use strict";

var FlappyCat = FlappyCat || {};

FlappyCat.loadingScreen = function() {};

FlappyCat.loadingScreen.prototype = {
    preload: function() {
        //Loading stuff
        this.load.image("Tesla", "assets/sprites/tesla2.png");
        this.load.image("Barrier", "assets/sprites/barrier.png");
        this.load.image("Cloud", "assets/sprites/cloud.png");

        this.load.audio("meow1", "assets/sounds/meow1.mp3", "assets/sounds/meow1.ogg");
        this.load.audio("meow2", "assets/sounds/meow2.mp3", "assets/sounds/meow2.ogg");
        this.load.audio("meow3", "assets/sounds/meow3.mp3", "assets/sounds/meow3.ogg");
        this.load.audio("meow4", "assets/sounds/meow4.mp3", "assets/sounds/meow4.ogg");
        this.load.audio("meow5", "assets/sounds/meow5.mp3", "assets/sounds/meow5.ogg");
        this.load.audio("meow6", "assets/sounds/meow6.mp3", "assets/sounds/meow6.ogg");
        this.load.audio("flap", "assets/sounds/Jump9.mp3", "assets/sounds/Jump9.ogg");
        this.load.audio("hit", "assets/sounds/Hit_Hurt2.mp3", "assets/sounds/Hit_Hurt2.ogg");

        this.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");


        // this.logo = this.add.sprite(this.game.width * 0.5, this.game.height * 0.5, "Logo");
        // this.emptyBar = this.add.sprite(this.game.width * 0.5, this.game.height * 0.5 + 256, "LoadingBars", 0);
        // this.fullBar = this.add.sprite(this.emptyBar.x, this.emptyBar.y, "LoadingBars", 1);
        // this.percentage = this.add.text(this.emptyBar.x, this.emptyBar.y, "0%");

        // this.logo.anchor.setTo(0.5);
        // this.emptyBar.anchor.setTo(0.5);
        // this.fullBar.anchor.setTo(0.5);
        // this.percentage.anchor.setTo(0.5);

        // this.load.setPreloadSprite(this.fullBar);

    },

    create: function() {
        this.state.start("TitleScreen");
    },

    loadUpdate: function() {
        //this.percentage.text = this.load.progress + "%";
    }
};