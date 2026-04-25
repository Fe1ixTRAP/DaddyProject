export class SpeechValidator {
  constructor() {
    this.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }

  isSupported() {
    return Boolean(this.SpeechRecognition);
  }

  startListening(options = {}) {
    const { onInterimResult, interimResults = true } = options;

    return new Promise((resolve, reject) => {
      if (!this.SpeechRecognition) {
        reject(new Error("SpeechRecognition API is not supported in this browser."));
        return;
      }

      const recognition = new this.SpeechRecognition();
      recognition.lang = "ru-RU";
      recognition.interimResults = interimResults;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      let hasFinalResult = false;
      const startedAt = performance.now();

      recognition.onresult = (event) => {
        const result = event.results?.[event.resultIndex];
        const transcript = result?.[0]?.transcript?.trim() || "";
        const durationMs = performance.now() - startedAt;

        if (!transcript) {
          return;
        }

        if (result?.isFinal) {
          hasFinalResult = true;
          resolve({
            text: transcript,
            durationMs,
            loudness: 0,
            loudnessSamples: [],
          });
          return;
        }

        if (typeof onInterimResult === "function") {
          onInterimResult({
            text: transcript,
            durationMs,
            loudness: 0,
            loudnessSamples: [],
          });
        }
      };

      recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error || "unknown_error"}`));
      };

      recognition.onnomatch = () => {
        reject(new Error("Speech was not recognized."));
      };

      recognition.onend = () => {
        if (!hasFinalResult) {
          reject(new Error("Speech recognition ended before a final result."));
        }
      };

      try {
        recognition.start();
      } catch (error) {
        reject(
          new Error(
            `Unable to start speech recognition: ${error.message || "start_failed"}`,
          ),
        );
      }
    });
  }

  compareTexts(original, spoken) {
    const originalText = this.normalizeText(original);
    const spokenTextRaw = typeof spoken === "string" ? spoken : spoken?.text || "";
    const spokenText = this.normalizeText(spokenTextRaw);

    const maxLen = Math.max(originalText.length, spokenText.length, 1);
    const distance = this.levenshteinDistance(originalText, spokenText);
    const accuracy = Number((((1 - distance / maxLen) * 100).toFixed(2)));

    const spokenWordCount = spokenText ? spokenText.split(" ").filter(Boolean).length : 0;
    const durationSeconds = this.resolveDurationSeconds(spoken);
    const wpm =
      durationSeconds > 0 ? Number(((spokenWordCount / durationSeconds) * 60).toFixed(2)) : 0;

    const loudness = this.resolveAverageLoudness(spoken);

    return {
      accuracy,
      loudness,
      wpm,
    };
  }

  normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  resolveDurationSeconds(spoken) {
    if (typeof spoken === "object" && spoken !== null) {
      if (typeof spoken.durationSeconds === "number" && spoken.durationSeconds > 0) {
        return spoken.durationSeconds;
      }
      if (typeof spoken.durationMs === "number" && spoken.durationMs > 0) {
        return spoken.durationMs / 1000;
      }
    }
    return 60;
  }

  resolveAverageLoudness(spoken) {
    if (typeof spoken === "object" && spoken !== null) {
      if (Array.isArray(spoken.loudnessSamples) && spoken.loudnessSamples.length > 0) {
        const sum = spoken.loudnessSamples.reduce((acc, sample) => acc + Number(sample || 0), 0);
        return Number((sum / spoken.loudnessSamples.length).toFixed(2));
      }
      if (typeof spoken.loudness === "number") {
        return Number(spoken.loudness.toFixed(2));
      }
    }
    return 0;
  }

  levenshteinDistance(a, b) {
    const rows = a.length + 1;
    const cols = b.length + 1;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let i = 0; i < rows; i += 1) {
      matrix[i][0] = i;
    }
    for (let j = 0; j < cols; j += 1) {
      matrix[0][j] = j;
    }

    for (let i = 1; i < rows; i += 1) {
      for (let j = 1; j < cols; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost,
        );
      }
    }

    return matrix[a.length][b.length];
  }

  validate(_input) {
    return false;
  }
}
