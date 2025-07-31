import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react'; // Lucide icons

function VoiceInput({ onTranscript, lang = 'en-IN' }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported.');
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      console.log('🎙️ Voice recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('📝 Transcript:', transcript);
      onTranscript(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      console.log('🛑 Voice recognition stopped');
    };

    recognition.onerror = (e) => {
      console.error('❌ Speech Recognition Error:', e.error);
      setListening(false);

      switch (e.error) {
        case 'no-speech':
          console.warn('No speech detected');
          break;
        case 'audio-capture':
          alert('Microphone access denied or not available.');
          break;
        case 'not-allowed':
          alert('Microphone permission denied. Please allow microphone access.');
          break;
        case 'network':
          alert('Network error occurred during speech recognition.');
          break;
        default:
          console.error('Speech recognition error:', e.error);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current || !supported) return;

    try {
      if (listening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
      setListening(false);
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center">
        <button
          disabled
          title="Speech recognition not supported"
          className="p-3 rounded-full bg-gray-400 text-white cursor-not-allowed"
        >
          <MicOff size={20} />
        </button>
        <p className="ml-2 text-sm text-gray-500">Not supported</p>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        onClick={toggleListening}
        title={listening ? 'Stop listening' : 'Start listening'}
        className={`relative p-4 rounded-full transition-all duration-200 
          ${listening ? 'bg-red-600 shadow-red-500/50 animate-pulse' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}
          text-white shadow-md`}
      >
        <Mic className="w-5 h-5" />
        {listening && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
        )}
      </button>
      {listening && (
        <p className="ml-3 text-sm text-gray-300">Listening...</p>
      )}
    </div>
  );
}

export default VoiceInput;
