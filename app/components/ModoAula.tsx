'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Check, X, Clock, ChevronRight, ChevronLeft, Volume2 } from 'lucide-react';

interface Step {
  title: string;
  content: string;
}

interface Props {
  isOpen: boolean;
  activityTitle: string;
  steps: Step[];
  onClose: () => void;
  onComplete: () => void;
}

export default function ModoAula({ isOpen, activityTitle, steps, onClose, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const playNotification = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore */ }
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      playNotification();
    } else {
      setIsComplete(true);
      setIsTimerRunning(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setTimer(0);
      setIsTimerRunning(true);
      setIsComplete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                <X size={20} />
              </button>
              <div>
                <h2 className="font-sans font-bold text-base text-on-surface leading-tight">Modo Aula</h2>
                <p className="text-[10px] text-on-surface-variant font-medium">{activityTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full">
                <Clock size={14} className="text-primary" />
                <span className="font-bold text-sm tabular-nums text-primary">{formatTime(timer)}</span>
              </div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
              >
                {isTimerRunning ? <Volume2 size={18} /> : <Volume2 size={18} className="opacity-40" />}
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 max-w-2xl mx-auto w-full">
            {isComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check size={40} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-2xl text-on-surface">Atividade Concluída!</h3>
                  <p className="text-on-surface-variant mt-2">Tempo total: {formatTime(timer)}</p>
                </div>
                <button
                  onClick={handleComplete}
                  className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold text-sm shadow-lg"
                >
                  Fechar e Registrar
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Progress dots */}
                <div className="flex justify-center gap-2">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentStep
                          ? 'bg-primary w-6'
                          : i < currentStep
                          ? 'bg-primary/40'
                          : 'bg-outline-variant/40'
                      }`}
                    />
                  ))}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 space-y-4"
                  >
                    <span className="text-[10px] font-black text-outline uppercase tracking-widest">
                      Passo {currentStep + 1} de {steps.length}
                    </span>
                    <h3 className="font-sans font-bold text-2xl text-on-surface leading-tight">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-medium">
                      {steps[currentStep].content}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={18} /> Anterior
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm bg-primary text-on-primary shadow-md hover:bg-primary/95 transition-all"
                  >
                    {currentStep < steps.length - 1 ? (
                      <>Próximo <ChevronRight size={18} /></>
                    ) : (
                      <>Concluir <Check size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
