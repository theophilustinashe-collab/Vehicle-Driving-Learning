/**
 * Voice utility for reading questions aloud using Web Speech API
 */

export interface VoiceOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

export const speak = (text: string, options: VoiceOptions = {}) => {
  if (!('speechSynthesis' in window)) return;

  const {
    language = localStorage.getItem('vid_voice_lang') || 'en-GB',
    rate = parseFloat(localStorage.getItem('vid_voice_rate') || '0.9'),
    pitch = 1.0
  } = options;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = rate;
  utterance.pitch = pitch;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
};
