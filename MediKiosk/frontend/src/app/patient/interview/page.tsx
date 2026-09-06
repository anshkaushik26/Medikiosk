'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n-context';
import { api } from '@/lib/api';
import { InterviewState, QuestionDTO } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Keyboard,
  MousePointer,
  HeartPulse,
  Thermometer,
  Wind,
  Activity,
  ClipboardCheck,
  HelpCircle,
  Clock,
  Calendar,
  CalendarDays,
  History,
  Target,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Weight,
  Flame,
  Zap,
  CircleDot,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export default function PatientInterviewPage() {
  const router = useRouter();
  const { t, language } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
  const [viewMode, setViewMode] = useState<'LANDING' | 'WIZARD'>('LANDING');

  // Input states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Audio helper states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
      }
    }
    loadActiveInterview();
  }, []);

  const loadActiveInterview = async () => {
    try {
      setLoading(true);
      const state = await api.startOrResumeInterview();
      setInterviewState(state);

      if (state.status === 'URGENT' || state.safety_status === 'URGENT_RED_FLAG') {
        router.push('/patient/interview/urgent');
        return;
      }

      if (state.status === 'REVIEW') {
        router.push('/patient/interview/review');
        return;
      }

      // If active question is beyond START, go straight to WIZARD
      if (state.current_question && state.current_question.id !== 'START') {
        setViewMode('WIZARD');
      }
    } catch (err) {
      console.error('Failed to load interview state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    setViewMode('WIZARD');
  };

  // Text-to-speech for reading question aloud
  const handleReadQuestionAloud = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const q = interviewState?.current_question;
    if (!q) return;

    const textToSpeak =
      language === 'hi'
        ? q.voice_prompt_hi || q.text_hi || q.text
        : q.voice_prompt || q.text;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9; // clear, comfortable pace for seniors

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition (Web Speech API)
  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉइस रिकग्निशन उपलब्ध नहीं है। कृपया टाइप करें।'
          : 'Voice speech recognition is not supported in this browser. Please type instead.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVoiceTranscript(transcript);
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

  const handleUseVoiceTranscript = () => {
    if (!voiceTranscript) return;
    handleSubmitAnswer(voiceTranscript, 'VOICE');
    setVoiceTranscript(null);
  };

  const handleRetryVoice = () => {
    setVoiceTranscript(null);
    startListening();
  };

  const handleSubmitAnswer = async (answerText: string, source: string = 'TOUCH') => {
    if (!interviewState || !interviewState.current_question || submitting) return;

    try {
      setSubmitting(true);
      const curQ = interviewState.current_question;
      const updatedState = await api.submitInterviewAnswer(interviewState.interview_id, {
        question_id: curQ.id,
        question_text: language === 'hi' && curQ.text_hi ? curQ.text_hi : curQ.text,
        answer_text: answerText,
        answer_type: curQ.answer_type,
        source: source,
      });

      setInterviewState(updatedState);
      setSelectedOption(null);
      setCustomText('');
      setShowTextInput(false);
      setVoiceTranscript(null);

      // Check for urgent red-flag interruption
      if (
        updatedState.status === 'URGENT' ||
        updatedState.safety_status === 'URGENT_RED_FLAG'
      ) {
        router.push('/patient/interview/urgent');
        return;
      }

      // Check for review completion
      if (updatedState.status === 'REVIEW') {
        router.push('/patient/interview/review');
        return;
      }
    } catch (err: any) {
      alert(err.message || 'Could not submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper icon renderer
  const renderOptionIcon = (iconName?: string) => {
    const props = { className: 'w-6 h-6 flex-shrink-0' };
    switch (iconName) {
      case 'heart-pulse':
        return <HeartPulse {...props} className="w-6 h-6 text-rose-600" />;
      case 'thermometer':
        return <Thermometer {...props} className="w-6 h-6 text-amber-600" />;
      case 'wind':
        return <Wind {...props} className="w-6 h-6 text-teal-600" />;
      case 'activity':
        return <Activity {...props} className="w-6 h-6 text-indigo-600" />;
      case 'clipboard-check':
        return <ClipboardCheck {...props} className="w-6 h-6 text-emerald-600" />;
      case 'clock':
        return <Clock {...props} className="w-6 h-6 text-blue-600" />;
      case 'calendar':
        return <Calendar {...props} className="w-6 h-6 text-blue-600" />;
      case 'calendar-days':
        return <CalendarDays {...props} className="w-6 h-6 text-indigo-600" />;
      case 'history':
        return <History {...props} className="w-6 h-6 text-purple-600" />;
      case 'target':
        return <Target {...props} className="w-6 h-6 text-rose-600" />;
      case 'weight':
        return <Weight {...props} className="w-6 h-6 text-purple-600" />;
      case 'flame':
        return <Flame {...props} className="w-6 h-6 text-orange-600" />;
      case 'zap':
        return <Zap {...props} className="w-6 h-6 text-amber-600" />;
      case 'circle-dot':
        return <CircleDot {...props} className="w-6 h-6 text-slate-600" />;
      case 'smile':
        return <Smile {...props} className="w-6 h-6 text-emerald-600" />;
      case 'meh':
        return <Meh {...props} className="w-6 h-6 text-amber-600" />;
      case 'frown':
        return <Frown {...props} className="w-6 h-6 text-rose-600" />;
      case 'alert-circle':
        return <AlertCircle {...props} className="w-6 h-6 text-rose-600" />;
      case 'check-circle':
        return <CheckCircle2 {...props} className="w-6 h-6 text-emerald-600" />;
      default:
        return <Sparkles {...props} className="w-6 h-6 text-teal-600" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">Preparing your health conversation...</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 1. LANDING SCREEN VIEW
  // -------------------------------------------------------------
  if (viewMode === 'LANDING') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-teal-600/20">
            <Mic className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t.interview?.heroTitle || 'Talk to MediKiosk'}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
            {t.interview?.heroSubtitle ||
              'Tell us what is bothering you. You can speak, type, or tap.'}
          </p>
        </div>

        {/* 3 Input Methods Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-teal-50 border-2 border-teal-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {t.interview?.badgeSpeak || 'Speak'}
            </h3>
            <p className="text-xs text-slate-600">
              {t.interview?.badgeSpeakDesc || 'Tell us in your own words'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <MousePointer className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {t.interview?.badgeTap || 'Tap'}
            </h3>
            <p className="text-xs text-slate-600">
              {t.interview?.badgeTapDesc || 'Choose from simple options'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <Keyboard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {t.interview?.badgeType || 'Type'}
            </h3>
            <p className="text-xs text-slate-600">
              {t.interview?.badgeTypeDesc || 'Type your answer'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleStartInterview}
            className="w-full h-16 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2"
          >
            {t.interview?.btnStart || 'Start Interview'}
            <ArrowRight className="w-5 h-5" />
          </Button>

          <Link href="/patient/dashboard" className="block text-center">
            <button className="py-3 px-6 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              {t.interview?.btnLater || "I'll do this later"}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ACTIVE QUESTION WIZARD VIEW
  // -------------------------------------------------------------
  const currentQ = interviewState?.current_question;
  const questionTitle =
    language === 'hi' && currentQ?.text_hi ? currentQ.text_hi : currentQ?.text;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn pb-16">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="teal" className="text-xs py-1 px-3 font-bold">
            {currentQ?.step_label || 'Step'}
          </Badge>
          <span className="text-xs font-semibold text-slate-500">
            {interviewState?.chief_complaint || 'MediKiosk Guide'}
          </span>
        </div>

        {/* Audio Question Playback Button */}
        <button
          onClick={handleReadQuestionAloud}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isPlayingAudio
              ? 'bg-rose-100 text-rose-800 animate-pulse'
              : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
          }`}
          title="Listen to question"
        >
          {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isPlayingAudio ? 'Stop' : t.interview?.hearQuestion || 'Hear question'}</span>
        </button>
      </div>

      {/* Main Single Question Box */}
      <div className="space-y-6 pt-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug tracking-tight">
          {questionTitle}
        </h2>

        {/* Interactive Options (Min 56px height touch targets) */}
        {currentQ?.options && currentQ.options.length > 0 && !showTextInput && (
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const optLabel =
                language === 'hi' && opt.label_hi ? opt.label_hi : opt.label;
              const isSelected = selectedOption === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt.id);
                    handleSubmitAnswer(opt.id, 'TOUCH');
                  }}
                  disabled={submitting}
                  className={`w-full min-h-[56px] p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all shadow-sm ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:border-teal-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {renderOptionIcon(opt.icon)}
                  </div>
                  <span className="text-base sm:text-lg font-bold text-slate-900 flex-1">
                    {optLabel}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Voice Input Section */}
        {!showTextInput && (
          <div className="pt-2">
            {/* Listening Banner */}
            {isListening && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center gap-3 text-rose-800 animate-pulse">
                <Mic className="w-6 h-6 animate-bounce" />
                <span className="font-bold text-sm">
                  {t.interview?.listening || 'Listening... speak clearly now'}
                </span>
              </div>
            )}

            {/* Voice Confirmation Bubble */}
            {voiceTranscript && (
              <Card className="p-5 border-2 border-teal-500 bg-teal-50/50 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.interview?.youSaid || 'You said'}:</span>
                </div>
                <p className="text-lg font-black text-slate-900 italic">
                  "{voiceTranscript}"
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleUseVoiceTranscript}
                    disabled={submitting}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {t.interview?.useThis || 'Use this'}
                  </Button>
                  <Button
                    onClick={handleRetryVoice}
                    variant="outline"
                    className="h-12 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    {t.interview?.tryAgain || 'Try again'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Speak or Type Alternative Bar */}
            {!isListening && !voiceTranscript && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={startListening}
                  className="flex-1 min-h-[52px] px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-2xl border border-teal-200 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Mic className="w-5 h-5 text-teal-600" />
                  <span>{t.interview?.badgeSpeak || 'Speak instead'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTextInput(true)}
                  className="min-h-[52px] px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <Keyboard className="w-5 h-5 text-slate-500" />
                  <span>Type</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Input Fallback View */}
        {showTextInput && (
          <Card className="p-5 border-2 border-slate-300 space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              {t.interview?.badgeTypeDesc || 'Type your answer'}:
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={t.interview?.typePlaceholder || 'Type your answer here...'}
              className="w-full p-4 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowTextInput(false)}
                className="rounded-xl"
              >
                Back to options
              </Button>
              <Button
                onClick={() => handleSubmitAnswer(customText, 'TEXT')}
                disabled={!customText.trim() || submitting}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 rounded-xl"
              >
                {t.interview?.btnContinue || 'Continue'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Subtle Step Progress */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>{t.interview?.almostThere || 'Almost there'}</span>
        <button
          onClick={() => router.push('/patient/dashboard')}
          className="hover:underline text-slate-600 font-medium"
        >
          {t.interview?.btnLater || "I'll do this later"}
        </button>
      </div>
    </div>
  );
}
