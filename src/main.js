import * as Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import { MenuScene } from "./scenes/MenuScene";

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  transparent: true,
  scene: [BootScene, MenuScene, GameScene],
};

const game = new Phaser.Game(config);

export default game;
