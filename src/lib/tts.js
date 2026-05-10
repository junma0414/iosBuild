// src/lib/tts.js

let currentUtterance = null;
let currentRecognition = null;
let nativeTTS = null;
let isNative = false;

const langMap = {
  en: "en-US", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR", es: "es-ES",
  fr: "fr-FR", de: "de-DE", it: "it-IT", pt: "pt-BR", ru: "ru-RU",
  ar: "ar-SA", hi: "hi-IN", th: "th-TH", vi: "vi-VN", tr: "tr-TR",
  pl: "pl-PL", nl: "nl-NL", sv: "sv-SE", da: "da-DK", fi: "fi-FI",
  no: "nb-NO", el: "el-GR", cs: "cs-CZ", ro: "ro-RO", hu: "hu-HU",
  uk: "uk-UA", id: "id-ID", ms: "ms-MY", tl: "fil-PH", he: "he-IL",
  fa: "fa-IR", bn: "bn-BD", ta: "ta-IN", te: "te-IN"
};

export async function speak(text, langCode = "en", options = {}) {
  if (!text) return;

  stopSpeaking();

  if (isNative && nativeTTS) {
    try {
      const lang = langMap[langCode] || langCode;
      await nativeTTS.speak({
        text,
        lang,
        rate: options.rate || 0.9,
        pitch: options.pitch || 1,
        volume: options.volume || 1,
      });
      if (options.onStart) options.onStart();
      if (options.onEnd) options.onEnd();
    } catch (error) {
      console.error("Native TTS error:", error);
      if (options.onError) options.onError(error);
      fallbackSpeak(text, langCode, options);
    }
    return;
  }

  fallbackSpeak(text, langCode, options);
}

function fallbackSpeak(text, langCode = "en", options = {}) {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langMap[langCode] || langCode;
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (event) => {
    console.error("Speech synthesis error:", event);
    currentUtterance = null;
    if (options.onError) options.onError(event);
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isNative && nativeTTS) {
    try {
      nativeTTS.stop();
    } catch (e) {}
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentUtterance) {
    currentUtterance = null;
  }
}

export function isSpeaking() {
  if (isNative) return false;
  return currentUtterance !== null || (window.speechSynthesis && window.speechSynthesis.speaking);
}

export function startSpeechRecognition(langCode = "en", onResult, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech recognition not supported");
    return null;
  }

  if (currentRecognition) {
    try { currentRecognition.stop(); } catch (e) {}
  }

  const recognition = new SpeechRecognition();
  recognition.lang = langMap[langCode] || langCode;
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const results = event.results;
    for (let i = event.resultIndex; i < results.length; i++) {
      const transcript = results[i][0].transcript;
      const isFinal = results[i].isFinal;
      if (onResult) onResult(transcript, isFinal);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (onEnd) onEnd(event.error);
  };

  recognition.onend = () => {
    currentRecognition = null;
    if (onEnd) onEnd(null);
  };

  recognition.start();
  currentRecognition = recognition;
  return recognition;
}

export function stopSpeechRecognition() {
  if (currentRecognition) {
    try { currentRecognition.stop(); } catch (e) {}
    currentRecognition = null;
  }
}

export function getAvailableVoices() {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

export async function initSpeech() {
  const isCapacitor = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.() === true;

  if (isCapacitor) {
    try {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      nativeTTS = TextToSpeech;
      isNative = true;
      return true;
    } catch (e) {
      console.warn("Native TTS not available, falling back to Web Speech API");
    }
  }

  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve(false);
      return;
    }
    if (window.speechSynthesis.getVoices().length) {
      resolve(true);
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        resolve(true);
      }, { once: true });
    }
  });
}
