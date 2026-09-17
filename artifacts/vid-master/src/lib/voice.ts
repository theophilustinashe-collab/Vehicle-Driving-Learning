/**
 * Upgraded Natural Voice Synthesis Utility for Roadify
 * Provides calm, clear, and natural educational narration for driving theory tests.
 */

import { nativeSpeak, nativeStopSpeaking } from "./native-bridge";

export interface VoiceOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Sanitize and format text for natural-sounding speech
 */
export const prepareTextForSpeech = (text: string, options?: string[]): string => {
  if (!text) return "";

  // 1. Sanitize text: remove HTML tags, technical IDs, or JSON markup
  let cleanText = text
    .replace(/<[^>]*>/g, "") // Strip HTML
    .replace(/\{[^}]*\}/g, "") // Strip JSON
    .replace(/\[[^\]]*\]/g, "") // Strip brackets
    .trim();

  // 2. Expand abbreviations and symbols for natural educational pronunciation
  cleanText = cleanText
    .replace(/\bVID\b/g, "V.I.D.")
    .replace(/\bTSC\b/g, "T.S.C.")
    .replace(/\bSADC\b/g, "S.A.D.C.")
    .replace(/\bkm\/h\b/gi, " kilometers per hour ")
    .replace(/\bkm\b/gi, " kilometers ")
    .replace(/\bkg\b/gi, " kilograms ")
    .replace(/\b%\b/g, " percent ")
    .replace(/\b&\b/g, " and ")
    .replace(/\bm\b/gi, (match, offset, fullText) => {
      const prevChar = fullText.charAt(offset - 1);
      return /\d/.test(prevChar) ? " meters " : match;
    })
    .replace(/\bZim\b/i, " Zimbabwe ")
    .replace(/\bRoadify\b/i, " Roadify ");

  if (!/[.!?]$/.test(cleanText)) {
    cleanText += ".";
  }

  // 3. Format answer options with natural labels ("Answer A. [option text]")
  if (options && Array.isArray(options) && options.length > 0) {
    cleanText += "\n\n";
    options.forEach((opt, i) => {
      const label = String.fromCharCode(65 + i);
      const cleanOpt = opt.replace(/<[^>]*>/g, "").trim();
      cleanText += `Answer ${label}. ${cleanOpt}.\n`;
    });
  }

  return cleanText;
};

/**
 * Stop any active speech instance across Web and Native WebView
 */
export const stopSpeaking = () => {
  nativeStopSpeaking();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn("Failed to cancel speech synthesis:", e);
    }
  }
};

/**
 * Speak text clearly using natural voice selection and sequential pacing
 */
export const speak = (text: string, options: VoiceOptions = {}) => {
  // Always stop previous speech instances before starting new ones to prevent overlapping
  stopSpeaking();

  if (!text || text.trim() === "") return;

  const storageLang = localStorage.getItem('vid_voice_lang') || 'en-GB';
  const storageRate = localStorage.getItem('vid_voice_rate') || '0.85';
  const storagePitch = localStorage.getItem('vid_voice_pitch') || '1.0';

  const rate = options.rate ?? parseFloat(storageRate);
  const pitch = options.pitch ?? parseFloat(storagePitch);
  const language = options.language || storageLang;

  const mergedOptions = {
    language,
    rate: isNaN(rate) ? 0.85 : rate,
    pitch: isNaN(pitch) ? 1.0 : pitch,
  };

  // Try Native Shell Bridge first if inside WebView
  if (nativeSpeak(text, mergedOptions)) {
    return;
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech synthesis not supported on this device/browser");
    if (options.onError) options.onError("Speech synthesis unsupported");
    return;
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      const savedVoiceName = localStorage.getItem('vid_voice_name');

      const findBestVoice = () => {
        if (savedVoiceName) {
          const exactMatch = voices.find(v => v.name === savedVoiceName);
          if (exactMatch) return exactMatch;
        }
        // Preferred natural/neural voices for clear educational narration
        let best = voices.find(v => v.lang === language && (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Premium')));
        if (best) return best;
        best = voices.find(v => v.lang === language && v.name.includes('Google'));
        if (best) return best;
        best = voices.find(v => v.lang === language);
        if (best) return best;
        return voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google')));
      };

      const selectedVoice = findBestVoice();

      // Split text into question and answer parts for natural sequential playback
      const parts = text.split(/\n\n|\n/).map(p => p.trim()).filter(Boolean);

      parts.forEach((part, index) => {
        const utterance = new SpeechSynthesisUtterance(part);
        utterance.lang = mergedOptions.language;
        utterance.rate = mergedOptions.rate;
        utterance.pitch = index === 0 ? mergedOptions.pitch : mergedOptions.pitch * 0.98;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        if (index === parts.length - 1 && options.onEnd) {
          utterance.onend = options.onEnd;
        }

        utterance.onerror = (e) => {
          console.warn("Speech Synthesis Error:", e);
          if (options.onError) options.onError(e);
        };

        window.speechSynthesis.speak(utterance);
      });
    } catch (err) {
      console.error("Failed to execute speech synthesis:", err);
      if (options.onError) options.onError(err);
    }
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    doSpeak();
  }
};
