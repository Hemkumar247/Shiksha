import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types/speech';
import { useLanguage } from '../contexts/LanguageContext';

export const useSpeechRecognition = () => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript(interimTranscript);
        setError(null); // Clear any previous errors on successful recognition
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsListening(false);
        
        // Handle different types of errors with user-friendly messages
        switch (event.error) {
          case 'network':
            setError('Network connection issue. Please check your internet connection and try again.');
            break;
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone permissions and try again.');
            break;
          case 'no-speech':
            setError('No speech detected. Please try speaking again.');
            break;
          case 'audio-capture':
            setError('Microphone not available. Please check your microphone connection.');
            break;
          case 'service-not-allowed':
            setError('Speech recognition service not available. Please try again later.');
            break;
          case 'bad-grammar':
            setError('Speech recognition grammar error. Please try again.');
            break;
          case 'language-not-supported':
            setError('Selected language not supported. Please try with English.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}. Please try again.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onnomatch = () => {
        setError('No speech was recognized. Please try speaking more clearly.');
        setIsListening(false);
      };

      recognition.onaudiostart = () => {
        console.log('Audio capture started');
        setError(null);
      };

      recognition.onaudioend = () => {
        console.log('Audio capture ended');
      };

      recognition.onsoundstart = () => {
        console.log('Sound detected');
      };

      recognition.onsoundend = () => {
        console.log('Sound ended');
      };

      recognition.onspeechstart = () => {
        console.log('Speech detected');
        setError(null);
      };

      recognition.onspeechend = () => {
        console.log('Speech ended');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'ta' ? 'ta-IN' : 'en-US';
    }
  }, [language]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Check for microphone permissions first
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop the stream immediately as we just needed to check permissions
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
          setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
          return;
        }
      }

      setTranscript('');
      setError(null);
      setInterimTranscript('');
      
      // Add a small delay to ensure the recognition service is ready
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};