'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from '../../lib/i18n-context';

interface AudioHelperProps {
  text: string;
  className?: string;
  label?: string;
}

export const AudioHelper: React.FC<AudioHelperProps> = ({
  text,
  className = '',
  label,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { language } = useTranslation();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9; // Slightly calmer pace for seniors

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={label || (isPlaying ? "Stop audio" : "Listen")}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
        isPlaying
          ? 'bg-amber-100 text-amber-800 animate-pulse'
          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
      } ${className}`}
    >
      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      {label && <span>{label}</span>}
    </button>
  );
};
