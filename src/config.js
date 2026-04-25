import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { MenuScene } from "./scenes/MenuScene";

export const gameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  transparent: true,
  scene: [BootScene, MenuScene],
};
