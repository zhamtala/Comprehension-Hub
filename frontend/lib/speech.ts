/* =========================
   SAFE PLATFORM DETECTION
========================= */

function isBrowser() {
  return typeof window !== "undefined";
}

function isNative() {
  return isBrowser() && (window as any).Capacitor?.isNativePlatform?.();
}

function isWebSpeechSupported() {
  return isBrowser() && "speechSynthesis" in window;
}

/* =========================
   SPEAK
========================= */

export async function speakText(text: string) {
  if (!text || !isBrowser()) return;

  try {
    // 🟢 NATIVE (lazy import — prevents SSR crash)
    if (isNative()) {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");

      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });

      return;
    }

    // 🟡 WEB fallback
    if (isWebSpeechSupported()) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";

      window.speechSynthesis.speak(utterance);
      return;
    }

    console.warn("No TTS support available");
  } catch (err) {
    console.warn("TTS error:", err);
  }
}

/* =========================
   STOP
========================= */

export async function stopSpeaking() {
  if (!isBrowser()) return;

  try {
    if (isNative()) {
      const { TextToSpeech } = await import("@capacitor-community/text-to-speech");
      await TextToSpeech.stop();
      return;
    }

    if (isWebSpeechSupported()) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    console.warn("Stop error:", err);
  }
}