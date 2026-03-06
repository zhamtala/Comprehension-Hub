let currentUtterance: SpeechSynthesisUtterance | null = null;
let voicesLoaded = false;

function loadVoices() {
  return new Promise<void>((resolve) => {
    const voices = speechSynthesis.getVoices();

    if (voices.length !== 0) {
      voicesLoaded = true;
      resolve();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        voicesLoaded = true;
        resolve();
      };
    }
  });
}

export async function speakText(text: string) {
  if (typeof window === "undefined") return;

  await loadVoices();

  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = speechSynthesis.getVoices();

  const preferred =
    voices.find(v => v.lang === "en-US" && v.name.includes("Google")) ||
    voices.find(v => v.lang === "en-US");

  if (preferred) utterance.voice = preferred;

  currentUtterance = utterance;

  speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  speechSynthesis.cancel();
  currentUtterance = null;
}

export function pauseSpeaking() {
  if (typeof window === "undefined") return;
  speechSynthesis.pause();
}

export function resumeSpeaking() {
  if (typeof window === "undefined") return;
  speechSynthesis.resume();
}