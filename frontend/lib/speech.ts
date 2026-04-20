import { TextToSpeech } from "@capacitor-community/text-to-speech";

/* =========================
   PLATFORM DETECTION
========================= */

function isNative() {
  return (
    typeof window !== "undefined" &&
    typeof (window as any).Capacitor !== "undefined" &&
    (window as any).Capacitor.isNativePlatform?.()
  );
}

function isWebSpeechSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined"
  );
}

/* =========================
   SPEAK
========================= */

export async function speakText(text: string) {
  if (!text) return;

  try {
    // 🟢 ANDROID / IOS (Capacitor)
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