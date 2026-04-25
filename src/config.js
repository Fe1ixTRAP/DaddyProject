import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { ParentScene } from "./scenes/ParentScene";

export const gameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#1b1b1b",
  scene: [BootScene, MenuScene, GameScene, ParentScene],
};
