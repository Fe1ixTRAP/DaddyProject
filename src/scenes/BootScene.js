import * as Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const { width, height } = this.scale;
    const barWidth = 640;
    const barHeight = 36;
    const barX = (width - barWidth) / 2;
    const barY = (height - barHeight) / 2;

    const box = this.add.graphics();
    box.fillStyle(0x000000, 0.45);
    box.fillRoundedRect(barX, barY, barWidth, barHeight, 8);

    const bar = this.add.graphics();
    const progressText = this.add
      .text(width / 2, barY - 34, "Loading 0%", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value) => {
      bar.clear();
      bar.fillStyle(0xffffff, 0.9);
      bar.fillRoundedRect(barX + 4, barY + 4, (barWidth - 8) * value, barHeight - 8, 6);
      progressText.setText(`Loading ${Math.round(value * 100)}%`);
    });

    this.load.on("complete", () => {
      box.destroy();
      bar.destroy();
      progressText.destroy();
    });

    const spriteFiles = [
      "apple.png",
      "boss.png",
      "dog.png",
      "golubika.png",
      "Group 2131331788.png",
      "Group 2131331789.png",
      "Group 2131331792.png",
      "Group 2131331793.png",
      "Group 2131331794.png",
      "Group 2131331795.png",
      "Group-1.png",
      "Group-10.png",
      "Group-11.png",
      "Group-12.png",
      "Group-13.png",
      "Group-14.png",
      "Group-15.png",
      "Group-16.png",
      "Group-17.png",
      "Group-18.png",
      "Group-19.png",
      "Group-2.png",
      "Group-20.png",
      "Group-21.png",
      "Group-22.png",
      "Group-23.png",
      "Group-24.png",
      "Group-25.png",
      "Group-26.png",
      "Group-27.png",
      "Group-28.png",
      "Group-29.png",
      "Group-3.png",
      "Group-4.png",
      "Group-5.png",
      "Group-6.png",
      "Group-7.png",
      "Group-8.png",
      "Group-9.png",
      "Group.png",
      "Layer_1.png",
      "Library.png",
      "lemon.png",
      "little_slime.png",
      "orange.png",
      "Park.png",
      "slime.png",
      "tomato.png",
      "Town.png",
      "Bakery.png",
    ];

    spriteFiles.forEach((fileName) => {
      const key = fileName.replace(/\.[^.]+$/, "");
      this.load.image(key, `/assets/sprites/${fileName}`);
    });
  }

  create() {
    this.scene.start("MenuScene");
  }
}
