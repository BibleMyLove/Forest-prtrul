import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ChainAnimationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CardItem {
  id: number;
  name: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
}

const CARDS: CardItem[] = [
  {
    id: 0,
    name: 'Вовк',
    emoji: '🐺',
    gradient: 'from-rose-900 via-rose-950 to-stone-950',
    borderColor: 'border-rose-500',
    glowColor: 'shadow-rose-500/80 ring-rose-500/60',
  },
  {
    id: 1,
    name: 'Вівця',
    emoji: '🐑',
    gradient: 'from-amber-900 via-amber-950 to-stone-950',
    borderColor: 'border-amber-500',
    glowColor: 'shadow-amber-500/80 ring-amber-500/60',
  },
  {
    id: 2,
    name: 'Кущі',
    emoji: '🌿',
    gradient: 'from-emerald-900 via-emerald-950 to-stone-950',
    borderColor: 'border-emerald-500',
    glowColor: 'shadow-emerald-500/80 ring-emerald-500/60',
  },
  {
    id: 3,
    name: 'Пилка',
    emoji: '🪚',
    gradient: 'from-sky-900 via-sky-950 to-stone-950',
    borderColor: 'border-sky-500',
    glowColor: 'shadow-sky-500/80 ring-sky-500/60',
  },
  {
    id: 4,
    name: 'Ліс',
    emoji: '🌲',
    gradient: 'from-teal-900 via-teal-950 to-stone-950',
    borderColor: 'border-teal-500',
    glowColor: 'shadow-teal-500/80 ring-teal-500/60',
  },
];

export const ChainAnimationModal: React.FC<ChainAnimationModalProps> = ({ isOpen, onClose }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % CARDS.length);
  };

  // Auto-switch cards smoothly
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [isOpen, isPaused]);

  // Keyboard navigation for PC (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Computes exact translateX, scale, and opacity for equal uniform gaps (50px desktop, ~28px mobile)
  const getCardLayout = (offset: number) => {
    if (isDesktop) {
      if (offset === 0) return { x: 0, scale: 1.15, opacity: 1, zIndex: 30 };
      if (Math.abs(offset) === 1) return { x: offset * 220, scale: 0.85, opacity: 0.55, zIndex: 20 };
      return { x: offset * 200, scale: 0.68, opacity: 0.25, zIndex: 10 }; // offset ±2 is ±400px
    } else {
      if (offset === 0) return { x: 0, scale: 1.12, opacity: 1, zIndex: 30 };
      if (Math.abs(offset) === 1) return { x: offset * 135, scale: 0.82, opacity: 0.55, zIndex: 20 };
      return { x: offset * 120, scale: 0.62, opacity: 0.25, zIndex: 10 }; // offset ±2 is ±240px
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full max-w-5xl bg-stone-950/95 border border-stone-800 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[380px] sm:min-h-[480px]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-700/60 z-40"
          title="Закрити"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center border border-stone-700/60 z-40 transition-all hover:scale-105 active:scale-95 shadow-lg group"
          title="Попередня карта (←)"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden group-hover:block absolute -bottom-6 text-[9px] bg-stone-900 px-1 py-0.5 rounded border border-stone-700 text-stone-400 font-mono">←</span>
        </button>

        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center border border-stone-700/60 z-40 transition-all hover:scale-105 active:scale-95 shadow-lg group"
          title="Наступна карта (→)"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden group-hover:block absolute -bottom-6 text-[9px] bg-stone-900 px-1 py-0.5 rounded border border-stone-700 text-stone-400 font-mono">→</span>
        </button>

        {/* Carousel Stage with Equal Balanced Spacing */}
        <div className="relative w-full flex items-center justify-center h-[280px] sm:h-[350px] overflow-hidden">
          {CARDS.map((card, idx) => {
            let offset = idx - activeIndex;

            // Handle circular wrap-around
            if (offset < -2) offset += CARDS.length;
            if (offset > 2) offset -= CARDS.length;

            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 2;

            if (!isVisible) return null;

            const { x, scale, opacity, zIndex } = getCardLayout(offset);

            return (
              <div
                key={card.id}
                onClick={() => setActiveIndex(idx)}
                style={{
                  transform: `translateX(${x}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  width: isDesktop ? '170px' : '110px',
                  height: isDesktop ? '240px' : '165px',
                }}
                className={`absolute cursor-pointer transition-all duration-700 ease-out flex flex-col items-center justify-center rounded-3xl border-2 sm:border-3 p-3 sm:p-5 bg-gradient-to-b ${card.gradient} ${
                  isCenter
                    ? `${card.borderColor} ${card.glowColor} ring-4 sm:ring-8 shadow-2xl`
                    : 'border-stone-800 hover:opacity-80'
                }`}
              >
                <div
                  className={`text-5xl sm:text-7xl filter drop-shadow-2xl transition-transform duration-500 select-none ${
                    isCenter ? 'scale-105' : ''
                  }`}
                >
                  {card.emoji}
                </div>
                <span
                  className={`mt-2.5 sm:mt-3 text-sm sm:text-xl font-black tracking-wider transition-colors select-none ${
                    isCenter ? 'text-white font-extrabold drop-shadow' : 'text-stone-400'
                  }`}
                >
                  {card.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Indicator Dots */}
        <div className="flex items-center gap-2 mt-2 z-30">
          {CARDS.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-7 sm:w-8 bg-amber-400 shadow-md'
                  : 'w-2 sm:w-2.5 bg-stone-700 hover:bg-stone-500'
              }`}
              title={card.name}
            />
          ))}
        </div>

        {/* Keyboard navigation hint */}
        <div className="hidden sm:flex items-center gap-1.5 mt-2.5 text-[11px] text-stone-400 font-mono z-30 select-none">
          <span className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-bold">←</span>
          <span className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 font-bold">→</span>
          <span className="text-stone-400">перемикання стрілочками на ПК</span>
        </div>
      </div>
    </div>
  );
};
