"use strict"

var FlappyCat = FlappyCat || {};

var configuration = {
	width: 480,
	height: 800,
	renderer: Phaser.CANVAS
}

FlappyCat.game = new Phaser.Game(configuration);

FlappyCat.game.state.add("Launcher", FlappyCat.launcher);
FlappyCat.game.state.add("LoadingScreen", FlappyCat.loadingScreen);
FlappyCat.game.state.add("TitleScreen", FlappyCat.titleScreen);
FlappyCat.game.state.add("Gameplay", FlappyCat.gameplay);

FlappyCat.game.state.start("Launcher");