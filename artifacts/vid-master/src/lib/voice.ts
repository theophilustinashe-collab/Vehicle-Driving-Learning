/**
 * Premium Voice utility for Roadify
 * Handles natural pauses, abbreviation expansion, and high-fidelity speech.
 */

import { nativeSpeak, nativeStopSpeaking } from "./native-bridge";

export interface VoiceOptions {
  language?: string;
  rate?: number;
  pitch?: number;
}

/**
 * Sanitize and format text for natural-sounding speech
 */
export const prepareTextForSpeech = (text: string, options?: string[]) => {
  // 1. Expand abbreviations and add natural phonetic spelling
  let cleanText = text
    .replace(/\bVID\b/g, "V.I.D.")
    .replace(/\bTSC\b/g, "T.S.C.")
    .replace(/\bkm\/h\b/i, " kilometers per hour ")
    .replace(/\bm\b/gi, (match, offset, fullText) => {
      // Only replace if preceded by a number (e.g. 50m)
      const prevChar = fullText.charAt(offset - 1);
      return /\d/.test(prevChar) ? " meters " : match;
    })
    .replace(/\bkg\b/gi, " kilograms ")
    .replace(/\bZim\b/i, " Zimbabwe ")
    .replace(/\bRoadify\b/i, " Row-dee-fy ") // Better phonetic pronunciation
    .replace(/\?/g, "? ... ") // Add natural pause after questions
    .replace(/\./g, ". ... ") // Add natural pause after sentences
    .replace(/\,/g, ", ... "); // Slight pause for commas

  // 2. Add structured flow for multiple choice items
  if (options && options.length > 0) {
    cleanText += " ... Please listen to the options: ... ";
    options.forEach((opt, i) => {
      cleanText += ` Option ${String.fromCharCode(65 + i)}: ... ${opt}. ... `;
    });
    cleanText += " ... Which one is correct? ";
  }

  return cleanText;
};

export const speak = (text: string, options: VoiceOptions = {}) => {
  // Use preparation if raw text is passed (fallback)
  const isPreFormatted = text.includes("Option A");
  const finalSpeechText = isPreFormatted ? text : prepareTextForSpeech(text);

  // Combine Settings
  const storageLang = localStorage.getItem('vid_voice_lang') || 'en-GB';
  const storageRate = localStorage.getItem('vid_voice_rate') || '0.82';

  const mergedOptions = {
    language: options.language || storageLang,
    rate: options.rate || parseFloat(storageRate),
    pitch: options.pitch || 1.05
  };

  // Try Native High-Quality Engine first with merged settings
  if (nativeSpeak(finalSpeechText, mergedOptions)) {
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported");
    return;
  }

  const doSpeak = () => {
    window.speechSynthesis.cancel();

    const { language, rate, pitch } = mergedOptions;
    const utterance = new SpeechSynthesisUtterance(finalSpeechText);
    utterance.lang = language;
    utterance.rate = isNaN(rate) ? 0.82 : rate;
    utterance.pitch = pitch;

    const voices = window.speechSynthesis.getVoices();
    const savedVoiceName = localStorage.getItem('vid_voice_name');

    const findBestVoice = () => {
      if (savedVoiceName) {
        const exactMatch = voices.find(v => v.name === savedVoiceName);
        if (exactMatch) return exactMatch;
      }
      let best = voices.find(v => v.lang === language && (v.name.includes('Premium') || v.name.includes('Neural')));
      if (best) return best;
      best = voices.find(v => v.lang === language && (v.name.includes('Google') || v.name.includes('Natural')));
      if (best) return best;
      best = voices.find(v => v.lang === language);
      if (best) return best;
      return voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
    };

    const selectedVoice = findBestVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
    utterance.onerror = (e) => console.error("Speech Fault:", e);
  };

  // If voices aren't loaded yet, wait for them
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      window.speechSynthesis.onvoiceschanged = null; // Prevent multi-triggers
    };
  } else {
    doSpeak();
  }
};

export const stopSpeaking = () => {
  nativeStopSpeaking();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
