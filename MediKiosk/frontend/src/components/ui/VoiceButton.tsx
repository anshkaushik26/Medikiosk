'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n-context';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  label?: string;
  className?: string;
}

export function VoiceButton({ onTranscript, label, className = '' }: VoiceButtonProps) {
  const { t, language } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSupported(false);
      }
    }
  }, []);

  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन अभी उपलब्ध नहीं है। कृपया टाइप करें।'
          : 'Voice speech recognition is not supported in this browser. Please type instead.'
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
        isListening
          ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-200'
          : 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100 hover:border-teal-300'
      } ${className}`}
      title={isListening ? t.common.stopListening : (label || t.common.speakInstead)}
      aria-label={isListening ? t.common.stopListening : (label || t.common.speakInstead)}
    >
      {isListening ? (
        <>
          <MicOff className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>{t.common.listening}</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-teal-700" />
          <span>{label || t.common.speakInstead}</span>
        </>
      )}
    </button>
  );
}
