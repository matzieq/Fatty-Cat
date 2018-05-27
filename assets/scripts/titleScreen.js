var FlappyCat = FlappyCat || {};

var savedScore;

FlappyCat.titleScreen = function () {};

FlappyCat.titleScreen.prototype = {
    preload: function() {
	    this.textTemplate = {
	        font: "monospace",
	        fontSize: "48px",
	        fill: "yellow",
	        align: "center"

	    }

	},
	create: function () {
		savedScore = localStorage.getItem(localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(localStorageName));
        this.highScoreDisplay = this.add.bitmapText(this.game.width / 2, 100, "font", savedScore.score.toString(), 72);
		this.highScoreDisplay.tint = 0xFF0000
		this.highScoreDisplay.anchor.setTo(0.5);

		this.scoreDisplay = this.add.bitmapText(this.game.width / 2, 30, "font", "0", 72);
		this.scoreDisplay.anchor.setTo(0.5);

		var instructions = this.add.bitmapText(50, 670, "font", "LMB, space or tap", 32);
		var credits = this.add.bitmapText(60, 710, "font", "gfx, snd & prg: matzieq", 24);
		var disclaimer = this.add.bitmapText(50, 750, "font", "image of my cat used with permission", 24);

		credits.tint = 0x232323;
		instructions.tint = 0x232323;
		disclaimer.tint = 0x232323;

		this.tesla = this.add.sprite(96, 256, "Tesla");
		this.tesla.anchor.setTo(0.5);
		this.input.onDown.add(function () {
			this.state.start("Gameplay");
		}, this);

		this.spacebar = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.spacebar.onDown.add(function () {
			this.state.start("Gameplay");
		}, this);
	}
}