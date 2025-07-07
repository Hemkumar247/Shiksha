import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [lastTranscript, setLastTranscript] = useState('');
  const [retryCount, setRetryCount] = useState(0);

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

  const handleMicClick = async () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setShowTranscript(false);
      setLastTranscript('');
      setRetryCount(0);
      await startListening();
    }
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    resetTranscript();
    setShowTranscript(false);
    setLastTranscript('');
    
    // Add a longer delay for retries
    setTimeout(async () => {
      await startListening();
    }, 500);
  };

  const handleSpeakClick = () => {
    if (isSpeaking) {
      cancel();
    } else if (transcript) {
      speak(transcript, { lang: language === 'ta' ? 'ta-IN' : 'en-US' });
    }
  };

  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case 'network':
        return 'Network connection issue. Please check your internet connection.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone permissions.';
      case 'no-speech':
        return 'No speech detected. Please try speaking again.';
      case 'audio-capture':
        return 'Microphone not available. Please check your microphone.';
      case 'service-not-allowed':
        return 'Speech recognition service not available.';
      default:
        return errorType;
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-700 text-sm font-medium">
              Voice recognition not supported
            </p>
            <p className="text-red-600 text-xs mt-1">
              Please use Chrome, Safari, or Edge browser for voice input functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3 justify-center sm:justify-start">
        <motion.button
          onClick={handleMicClick}
          disabled={error && error.includes('not-allowed')}
          className={`relative p-4 sm:p-6 rounded-full shadow-lg transition-all duration-300 touch-manipulation ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : error
              ? 'bg-gray-300 text-gray-500'
              : 'bg-white text-primary hover:bg-primary hover:text-white'
          } ${error && error.includes('not-allowed') ? 'cursor-not-allowed opacity-50' : ''}`}
          whileHover={!error ? { scale: 1.05 } : {}}
          whileTap={!error ? { scale: 0.95 } : {}}
        >
          {isListening ? (
            <MicOff className="h-6 w-6 sm:h-8 sm:w-8" />
          ) : (
            <Mic className="h-6 w-6 sm:h-8 sm:w-8" />
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
            className={`p-3 sm:p-4 rounded-full shadow-md transition-all duration-300 touch-manipulation ${
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
              <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </motion.button>
        )}

        {error && !error.includes('not-allowed') && (
          <motion.button
            onClick={handleRetry}
            className="p-3 sm:p-4 rounded-full shadow-md bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 touch-manipulation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {isListening ? t('listening') : error ? 'Click retry to try again' : defaultPlaceholder}
        </p>
        {retryCount > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Retry attempt: {retryCount}
          </p>
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
            <p className="text-sm text-blue-700 mb-2 text-center">{t('listening')}</p>
            <div className="flex justify-center space-x-1">
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
            {interimTranscript && (
              <p className="text-sm text-blue-600 mt-2 italic text-center">
                "{interimTranscript}"
              </p>
            )}
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
            <p className="text-sm text-green-700 mb-2 font-medium">{t('youSaid')}</p>
            <p className="text-gray-800 text-sm sm:text-base">
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
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700 text-sm font-medium">
                Speech Recognition Error
              </p>
              <p className="text-red-600 text-sm mt-1">
                {getErrorMessage(error)}
              </p>
              {error.includes('network') && (
                <div className="mt-2">
                  <p className="text-red-600 text-xs">
                    • Check your internet connection<br/>
                    • Try refreshing the page<br/>
                    • Ensure you're using HTTPS (secure connection)
                  </p>
                </div>
              )}
              {error.includes('not-allowed') && (
                <div className="mt-2">
                  <p className="text-red-600 text-xs">
                    • Click the microphone icon in your browser's address bar<br/>
                    • Select "Allow" for microphone access<br/>
                    • Refresh the page and try again
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};