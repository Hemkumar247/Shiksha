import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  autoSpeak?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  placeholder,
  className = "",
  autoSpeak = false
}) => {
  const { t, language } = useLanguage();
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const { speak, isSpeaking, cancel } = useSpeechSynthesis();
  const [showTranscript, setShowTranscript] = useState(false);
  const [hasSpokenConfirmation, setHasSpokenConfirmation] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  const defaultPlaceholder = placeholder || t('clickMicToSpeak');

  // Handle transcript updates
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      setShowTranscript(true);
    }
  }, [transcript, onTranscript]);

  // Handle voice confirmation - only speak once when we have a new transcript
  useEffect(() => {
    if (!isListening && transcript && autoSpeak && transcript !== lastTranscript) {
      speak(t('requestRecorded'), { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
      setLastTranscript(transcript);
    }
  }, [isListening, transcript, autoSpeak, lastTranscript, speak, t, language]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setShowTranscript(false);
      setLastTranscript(''); // Reset last transcript for new recording
      startListening();
    }
  };

  const handleSpeakClick = () => {
    if (isSpeaking) {
      cancel();
    } else if (transcript) {
      speak(transcript, { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-700 text-sm">
          Voice recognition is not supported in this browser. Please use Chrome or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        <motion.button
          onClick={handleMicClick}
          className={`relative p-4 rounded-full shadow-lg transition-all duration-300 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-primary hover:bg-primary hover:text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
          
          {/* Pulse animation when listening */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500 opacity-30"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>

        {transcript && (
          <motion.button
            onClick={handleSpeakClick}
            className={`p-3 rounded-full shadow-md transition-all duration-300 ${
              isSpeaking
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-white text-secondary hover:bg-secondary hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-sm text-blue-700 mb-2">{t('listening')}</p>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTranscript && (transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-sm text-green-700 mb-2">{t('youSaid')}</p>
            <p className="text-gray-800">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-500 italic">{interimTranscript}</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-700 text-sm">
            {error === 'not-allowed' ? t('micPermissionNeeded') : error}
          </p>
        </motion.div>
      )}
    </div>
  );
};