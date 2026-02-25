'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Button } from '@/components/ui/button'; // Commented out until verified
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  abort(): void;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

export function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Define speakText with useCallback
  const speakText = useCallback(async (text: string) => {
    try {
        setIsSpeaking(true);
        const response = await fetch('/api/voice/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voiceId: '21m00Tcm4TlvDq8ikWAM' })
        });

        if (!response.ok) throw new Error('TTS Failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) {
            audioRef.current.src = url;
            audioRef.current.play();
            audioRef.current.onended = () => setIsSpeaking(false);
        }
    } catch (e) {
        console.error(e);
        setIsSpeaking(false);
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            window.speechSynthesis.speak(utterance);
        }
    }
  }, []);

  // Define handleAiConversation with useCallback
  const handleAiConversation = useCallback(async (userText: string) => {
      try {
          const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  shamanId: 'master_cheon',
                  userSaju: {},
                  chatHistory: [],
                  message: userText,
              }),
          });
          const data = await res.json();
          const aiText = data.reply || "기운이 흐트러져 응답할 수 없습니다. 다시 시도해주세요.";
          setAiResponse(aiText);
          await speakText(aiText);
      } catch {
          const fallback = "연결이 불안정합니다. 잠시 후 다시 말씀해주세요.";
          setAiResponse(fallback);
          await speakText(fallback);
      }
  }, [speakText]);

  // Ref to access handler inside effect without dependency
  const handlerRef = useRef(handleAiConversation);
  useEffect(() => { handlerRef.current = handleAiConversation; }, [handleAiConversation]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognitionConstructor();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'ko-KR';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        const results = event.results;
        for (let i = event.resultIndex; i < results.length; ++i) {
          if (results[i].isFinal) {
            finalTranscript += results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           setTranscript(finalTranscript);
           handlerRef.current(finalTranscript);
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setAiResponse('');
      recognition.start();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {(transcript || aiResponse) && (
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl max-w-xs mb-2 text-sm shadow-xl animate-in fade-in slide-in-from-bottom-5">
              {transcript && <p className="text-gray-400 mb-1">USER: {transcript}</p>}
              {aiResponse && <p className="text-purple-200 font-semibold">AI: {aiResponse}</p>}
          </div>
      )}

      <button
        onClick={toggleListening}
        className={cn(
            "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 border-2 flex items-center justify-center",
            isListening 
                ? "bg-red-500/20 border-red-500 hover:bg-red-500/30 animate-pulse" 
                : isSpeaking
                    ? "bg-green-500/20 border-green-500 hover:bg-green-500/30"
                    : "bg-indigo-600/80 border-indigo-400 hover:bg-indigo-600"
        )}
      >
        {isListening ? (
            <MicOff className="h-6 w-6 text-red-300" />
        ) : isSpeaking ? (
            <Volume2 className="h-6 w-6 text-green-300 animate-bounce" />
        ) : (
            <Mic className="h-6 w-6 text-white" />
        )}
      </button>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
