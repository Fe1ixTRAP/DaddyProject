import * as Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    const { width, height } = this.scale;

    const townBackground = this.add
      .image(width / 2, height / 2, "Town")
      .setDisplaySize(width, height);
    townBackground.setAlpha(0.9);

    const atlasKey = this.findAtlasKeyByFrame("Town.png");

    const mayorFrame =
      this.findFrameInAtlas(atlasKey, /mayor|мэр|mer/i) ??
      this.findFrameInAtlas(atlasKey, /hero|character|npc/i) ??
      "Town.png";

    if (atlasKey) {
      const mayor = this.add
        .image(190, height - 180, atlasKey, mayorFrame)
        .setOrigin(0.5, 1)
        .setScale(0.75);

      this.tweens.add({
        targets: mayor,
        y: mayor.y - 14,
        scaleX: mayor.scaleX * 1.02,
        scaleY: mayor.scaleY * 1.02,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    const button = this.add
      .text(width / 2, height * 0.72, "Играть", {
        fontFamily: "Arial",
        fontSize: "52px",
        color: "#ffffff",
        backgroundColor: "#2a7f3a",
        padding: { left: 34, right: 34, top: 14, bottom: 14 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.setShadow(0, 6, "#000000", 8, true, true);

    button.on("pointerover", () => {
      this.tweens.killTweensOf(button);
      this.tweens.add({
        targets: button,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 140,
        ease: "Quad.easeOut",
      });
      button.setStyle({ backgroundColor: "#36a34a" });
    });

    button.on("pointerout", () => {
      this.tweens.killTweensOf(button);
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 160,
        ease: "Quad.easeOut",
      });
      button.setStyle({ backgroundColor: "#2a7f3a" });
    });

    button.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.96,
        scaleY: 0.96,
        duration: 80,
        yoyo: true,
        ease: "Quad.easeOut",
      });
    });

    button.on("pointerup", () => {
      this.scene.start("GameScene");
    });
  }

  findAtlasKeyByFrame(frameName) {
    const textures = this.textures.list;
    return (
      Object.keys(textures).find((key) => {
        const texture = textures[key];
        return texture?.has && texture.has(frameName);
      }) || null
    );
  }

  findFrameInAtlas(atlasKey, matcher) {
    if (!atlasKey) {
      return null;
    }

    const texture = this.textures.get(atlasKey);
    const frames = Object.keys(texture.frames || {});
    return frames.find((frame) => matcher.test(frame)) || null;
  }
}
