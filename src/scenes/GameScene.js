import * as Phaser from "phaser";
import { SpeechValidator } from "../systems/SpeechValidator";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.cityWidth = 2200;
    this.cityHeight = 1200;
    this.currentModal = null;
    this.speechValidator = new SpeechValidator();
    this.targetReadingText = "Город оживает, когда жители читают истории вслух";
    this.isListening = false;
  }

  create() {
    this.input.setTopOnly(true);
    this.createCityBackground();
    this.setupCameraPan();
    this.createAbandonedPlots();
    this.createHudHint();
    this.createReadingMagicHud();
  }

  createCityBackground() {
    this.cameras.main.setBackgroundColor("#1e2f45");

    this.add
      .image(this.cityWidth / 2, this.cityHeight / 2, "Town")
      .setDisplaySize(this.cityWidth, this.cityHeight)
      .setAlpha(0.95);
  }

  setupCameraPan() {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.cityWidth, this.cityHeight);
    cam.setZoom(1);
    cam.centerOn(640, this.cityHeight / 2);

    this.cameraPanTween = this.tweens.add({
      targets: cam,
      scrollX: this.cityWidth - cam.width,
      duration: 18000,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
  }

  createAbandonedPlots() {
    const plots = [
      { id: 1, x: 520, y: 760, width: 220, height: 150 },
      { id: 2, x: 1120, y: 700, width: 220, height: 150 },
      { id: 3, x: 1760, y: 770, width: 220, height: 150 },
    ];

    plots.forEach((plot) => {
      const zone = this.add
        .rectangle(plot.x, plot.y, plot.width, plot.height, 0xf9b233, 0.12)
        .setStrokeStyle(3, 0xf9b233, 0.9)
        .setInteractive({ useHandCursor: true });

      const label = this.add
        .text(plot.x, plot.y - plot.height / 2 - 20, `Заброшенный участок ${plot.id}`, {
          fontFamily: "Arial",
          fontSize: "22px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      const glow = this.add
        .rectangle(plot.x, plot.y, plot.width + 24, plot.height + 24, 0xffdd66, 0)
        .setStrokeStyle(2, 0xffdd66, 0);

      zone.on("pointerover", () => {
        this.tweens.add({
          targets: [zone, glow],
          alpha: { from: zone.alpha, to: 0.28 },
          duration: 180,
        });
        glow.setAlpha(0.35);
        glow.setStrokeStyle(3, 0xffdd66, 0.95);
      });

      zone.on("pointerout", () => {
        this.tweens.add({
          targets: zone,
          alpha: { from: zone.alpha, to: 0.12 },
          duration: 180,
        });
        glow.setAlpha(0);
        glow.setStrokeStyle(2, 0xffdd66, 0);
      });

      zone.on("pointerdown", (_pointer, _x, _y, event) => {
        event?.stopPropagation();
        this.openRestoreModal(plot);
      });

      zone.setDepth(3);
      glow.setDepth(2);
      label.setDepth(3);
    });
  }

  createHudHint() {
    this.add
      .text(20, 20, "Наведите на участок и кликните, чтобы восстановить здание", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.45)",
        padding: { left: 12, right: 12, top: 8, bottom: 8 },
      })
      .setScrollFactor(0)
      .setDepth(20);
  }

  createReadingMagicHud() {
    const hudX = 20;
    const hudY = 80;
    const hudWidth = 600;

    const panel = this.add
      .rectangle(hudX + hudWidth / 2, hudY + 74, hudWidth, 148, 0x0d1a2b, 0.72)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20)
      .setStrokeStyle(2, 0x8cc4ff, 0.6);

    const title = this.add
      .text(hudX + 16, hudY + 14, "Магия чтения", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(21);

    const phrase = this.add
      .text(hudX + 16, hudY + 48, `Фраза: "${this.targetReadingText}"`, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#d4e8ff",
        wordWrap: { width: 560 },
      })
      .setScrollFactor(0)
      .setDepth(21);

    const barX = hudX + 16;
    const barY = hudY + 104;
    const barWidth = 430;
    const barHeight = 26;

    const barBg = this.add
      .rectangle(barX + barWidth / 2, barY, barWidth, barHeight, 0x1f2d3f, 1)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21)
      .setStrokeStyle(2, 0xffffff, 0.2);

    const barFill = this.add
      .rectangle(barX, barY, 0, barHeight - 4, 0xc62828, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(22);

    const accuracyText = this.add
      .text(barX + barWidth + 16, barY - 12, "0%", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(22);

    const statusText = this.add
      .text(hudX + 16, hudY + 124, "Нажмите 'Слушать', затем произнесите фразу", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#f7e7a6",
      })
      .setScrollFactor(0)
      .setDepth(22);

    const listenButton = this.add
      .rectangle(hudX + 534, hudY + 104, 132, 34, 0x2f8f46, 1)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(22)
      .setStrokeStyle(2, 0xffffff, 0.7)
      .setInteractive({ useHandCursor: true });

    const listenLabel = this.add
      .text(hudX + 534, hudY + 104, "Слушать", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(23)
      .setInteractive({ useHandCursor: true });

    const runListening = async (event) => {
      event?.stopPropagation();
      if (this.isListening) {
        return;
      }

      if (!this.speechValidator.isSupported()) {
        statusText.setText("SpeechRecognition не поддерживается в этом браузере.");
        return;
      }

      this.isListening = true;
      listenButton.setFillStyle(0x7d8a94, 1);
      statusText.setText("Запрашиваю доступ к микрофону...");

      try {
        if (navigator.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        statusText.setText("Слушаю... говорите сейчас");
        const finalSpoken = await this.speechValidator.startListening({
          interimResults: true,
          onInterimResult: (interimSpoken) => {
            const interimMetrics = this.speechValidator.compareTexts(
              this.targetReadingText,
              interimSpoken,
            );
            this.updateReadingMagicBar(interimMetrics.accuracy, barFill, barWidth, accuracyText);
            statusText.setText(`Распознано: "${interimSpoken.text}"`);
          },
        });

        const finalMetrics = this.speechValidator.compareTexts(this.targetReadingText, finalSpoken);
        this.updateReadingMagicBar(finalMetrics.accuracy, barFill, barWidth, accuracyText);
        statusText.setText(
          `Готово: accuracy ${finalMetrics.accuracy}% | loudness ${finalMetrics.loudness} | wpm ${finalMetrics.wpm}`,
        );
      } catch (error) {
        statusText.setText(`Ошибка распознавания: ${error.message}`);
      } finally {
        this.isListening = false;
        listenButton.setFillStyle(0x2f8f46, 1);
      }
    };

    listenButton.on("pointerdown", runListening);
    listenLabel.on("pointerdown", runListening);

    this.readingMagicHud = {
      panel,
      title,
      phrase,
      barBg,
      barFill,
      accuracyText,
      statusText,
      listenButton,
      listenLabel,
    };
  }

  updateReadingMagicBar(accuracy, barFill, barWidth, accuracyText) {
    const safeAccuracy = Phaser.Math.Clamp(Number(accuracy) || 0, 0, 100);
    barFill.width = (barWidth * safeAccuracy) / 100;
    accuracyText.setText(`${safeAccuracy.toFixed(0)}%`);

    if (safeAccuracy > 80) {
      barFill.setFillStyle(0x23c552, 1);
      return;
    }

    if (safeAccuracy >= 60) {
      barFill.setFillStyle(0xf2c94c, 1);
      return;
    }

    barFill.setFillStyle(0xe74c3c, 1);
  }

  openRestoreModal(plot) {
    if (this.currentModal) {
      this.currentModal.destroy(true);
      this.currentModal = null;
    }

    const modal = this.add.container(0, 0).setScrollFactor(0).setDepth(50);
    if (this.cameraPanTween) {
      this.cameraPanTween.pause();
    }

    const closeModal = () => {
      modal.destroy(true);
      this.currentModal = null;
      if (this.cameraPanTween) {
        this.cameraPanTween.resume();
      }
    };

    const backdrop = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.58)
      .setScrollFactor(0)
      .setInteractive();
    backdrop.on("pointerdown", (_pointer, _x, _y, event) => {
      event?.stopPropagation();
      closeModal();
    });

    const panel = this.add
      .rectangle(640, 360, 980, 520, 0x2a3f5f, 0.98)
      .setScrollFactor(0)
      .setStrokeStyle(4, 0xe8f2ff, 0.95);
    const title = this.add
      .text(640, 155, `Восстановление участка ${plot.id}`, {
        fontFamily: "Arial",
        fontSize: "42px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setOrigin(0.5);

    const choices = [
      {
        key: "Library",
        name: "Библиотека",
        bonus: "+20 культуры, +10 образования",
        description: "Тихое место для чтения, кружков и встреч жителей.",
      },
      {
        key: "Park",
        name: "Парк",
        bonus: "+25 экологии, +15 настроения",
        description: "Зеленая зона отдыха с дорожками и площадками.",
      },
      {
        key: "Bakery",
        name: "Пекарня",
        bonus: "+18 экономики, +12 уюта",
        description: "Свежая выпечка каждый день и новые рабочие места.",
      },
    ];

    const startX = 360;
    const cardY = 385;
    const gap = 280;
    const cardNodes = [];

    modal.add([backdrop, panel, title]);

    choices.forEach((choice, index) => {
      const x = startX + index * gap;
      const card = this.add
        .rectangle(x, cardY, 250, 360, 0xf8fbff, 0.98)
        .setScrollFactor(0)
        .setStrokeStyle(3, 0x294b73, 0.9)
        .setInteractive({ useHandCursor: true });

      const preview = this.add.image(x, cardY - 98, choice.key).setScrollFactor(0).setDisplaySize(185, 118);
      const name = this.add
        .text(x, cardY - 15, choice.name, {
          fontFamily: "Arial",
          fontSize: "30px",
          color: "#10233d",
        })
        .setScrollFactor(0)
        .setOrigin(0.5);
      const desc = this.add
        .text(x, cardY + 40, choice.description, {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#243a56",
          align: "center",
          wordWrap: { width: 220 },
        })
        .setScrollFactor(0)
        .setOrigin(0.5);
      const bonus = this.add
        .text(x, cardY + 132, choice.bonus, {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#0f7f4c",
          align: "center",
          wordWrap: { width: 220 },
        })
        .setScrollFactor(0)
        .setOrigin(0.5);

      card.on("pointerover", () => {
        card.setFillStyle(0xffffff, 1);
        card.setStrokeStyle(4, 0xffb347, 1);
      });

      card.on("pointerout", () => {
        card.setFillStyle(0xf8fbff, 0.98);
        card.setStrokeStyle(3, 0x294b73, 0.9);
      });

      card.on("pointerdown", (_pointer, _x, _y, event) => {
        event?.stopPropagation();
        this.showRestoreConfirmation(plot, choice);
        closeModal();
      });

      cardNodes.push(card, preview, name, desc, bonus);
    });

    const closeButton = this.add
      .rectangle(640, 575, 220, 56, 0x9a2f2f, 1)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xffffff, 0.9)
      .setInteractive({ useHandCursor: true });

    const closeText = this.add
      .text(640, 575, "Закрыть", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const handleClose = (_pointer, _x, _y, event) => {
      event?.stopPropagation();
      closeModal();
    };

    closeButton.on("pointerdown", handleClose);
    closeText.on("pointerdown", handleClose);

    modal.add([...cardNodes, closeButton, closeText]);
    this.currentModal = modal;
  }

  showRestoreConfirmation(plot, choice) {
    const toast = this.add
      .text(640, 665, `Участок ${plot.id} выбран: ${choice.name} (${choice.bonus})`, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "#1f5d2f",
        padding: { left: 14, right: 14, top: 8, bottom: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(60);

    this.tweens.add({
      targets: toast,
      alpha: { from: 1, to: 0 },
      y: 620,
      duration: 1800,
      onComplete: () => toast.destroy(),
    });
  }
}
