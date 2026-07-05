/**
 * Voice utility for reading questions aloud using Web Speech API
 */

export interface VoiceOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

export const speak = (text: string, options: VoiceOptions = {}) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported in this environment");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const lang = localStorage.getItem('vid_voice_lang') || 'en-GB';
  const rateVal = localStorage.getItem('vid_voice_rate') || '0.9';

  const {
    language = lang,
    rate = parseFloat(rateVal),
    pitch = 1.0
  } = options;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = isNaN(rate) ? 0.9 : rate;
  utterance.pitch = pitch;

  // On some mobile devices, voices need to be loaded first
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.speak(utterance);
    };
  } else {
    window.speechSynthesis.speak(utterance);
  }

  // Error handling
  utterance.onerror = (event) => {
    console.error("SpeechSynthesisUtterance error", event);
  };
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
