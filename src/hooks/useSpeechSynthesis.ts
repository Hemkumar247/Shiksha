import { useState, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getVoices = useCallback(() => {
    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
    return availableVoices;
  }, []);

  const speak = useCallback((text: string, options?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice;
  }) => {
    if (!speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    utterance.lang = options?.lang || 'ta-IN';
    utterance.rate = options?.rate || 1;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;
    
    if (options?.voice) {
      utterance.voice = options.voice;
    } else {
      // Find Tamil voice if available
      const tamilVoice = voices.find(voice => 
        voice.lang.includes('ta') || voice.lang.includes('tamil')
      );
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    speechSynthesis.speak(utterance);
  }, [voices]);

  const pause = useCallback(() => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.pause();
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (speechSynthesis && isPaused) {
      speechSynthesis.resume();
    }
  }, [isPaused]);

  const cancel = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  return {
    isSpeaking,
    isPaused,
    voices,
    speak,
    pause,
    resume,
    cancel,
    getVoices
  };
};