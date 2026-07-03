/**
 * Voice utility for reading questions aloud using Web Speech API
 */
export const speak = (text: string, language = 'en-GB') => {
  if (!('speechSynthesis' in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
};
