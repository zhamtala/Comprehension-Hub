import { TextToSpeech } from "@capacitor-community/text-to-speech";

/* =========================
   SAFE PLATFORM DETECTION
========================= */

function isClient() {
  return typeof window !== "undefined";
}

function isNative() {
  if (!isClient()) return false;

  const capacitor = (window as any)?.Capacitor;

  return !!capacitor?.isNativePlatform?.();
}

function isWebSpeechSupported() {
  return isClient() && "speechSynthesis" in window;
}

/* =========================
   SPEAK
========================= */

export async function speakText(text: string) {
  if (!text) return;

  try {
    // 🟢 NATIVE (Android / iOS via Capacitor)
    if (isNative()) {
      await TextToSpeech.speak({
        text,
        lang: "en-US",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
      return;
    }

    // 🟡 WEB fallback (Chrome / desktop / mobile browser)
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
  try {
    if (isNative()) {
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