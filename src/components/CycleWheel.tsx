import React, { useState } from 'react';
import { CardType } from '../types';
import { CARD_CONFIGS, BEATS, BEATEN_BY } from '../constants';
import { Sparkles, X, ShieldAlert, Swords } from 'lucide-react';

interface CycleWheelProps {
  currentHighlighted?: CardType | null;
  compact?: boolean;
  onClose?: () => void;
}

const RELATION_EXPLANATIONS: Record<CardType, { beatsReason: string; beatenByReason: string }> = {
  'Вовк': {
    beatsReason: 'Вовк полює на Вівцю (хижак)',
    beatenByReason: 'Ліс заплутує та поглинає Вовка, а Сокира рубає',
  },
  'Вівця': {
    beatsReason: "Вівця об'їдає соковиті зелені Кущі (травоїдна)",
    beatenByReason: 'Вовк полює на Вівцю, а Сокира рубає',
  },
  'Кущі': {
    beatsReason: 'Колючі гілки Кущів заклинюють і ламають зубці Пилки',
    beatenByReason: "Вівця об'їдає Кущі, а Сокира вирубує",
  },
  'Пилка': {
    beatsReason: 'Гостра Пилка розпилює стовбури й валить Ліс',
    beatenByReason: 'Густі Кущі ламають Пилку, а Сокира перерубує',
  },
  'Ліс': {
    beatsReason: 'Дрімуча пуща Лісу поглинає й заплутує Вовка',
    beatenByReason: 'Пилка спилює дерева Лісу, а Сокира рубає',
  },
  'Сокира': {
    beatsReason: 'Сокира вирубує будь-яку карту без винятку!',
    beatenByReason: 'Нікому не програє (крім іншої Сокири)',
  },
};

export const CycleWheel: React.FC<CycleWheelProps> = ({
  currentHighlighted,
  compact = false,
  onClose,
}) => {
  const [selected, setSelected] = useState<CardType | null>(null);

  const activeCard: CardType = (selected || currentHighlighted || 'Вовк') as CardType;
  const config = CARD_CONFIGS[activeCard];
  const beatsList = BEATS[activeCard] || [];
  const beatenByList = BEATEN_BY[activeCard] || [];
  const reasons = RELATION_EXPLANATIONS[activeCard] || { beatsReason: '', beatenByReason: '' };

  const mainFive: CardType[] = ['Вовк', 'Вівця', 'Кущі', 'Пилка', 'Ліс'];
  const activeIndex = mainFive.indexOf(activeCard);

  // Keyboard navigation on PC (ArrowLeft, ArrowRight, ArrowDown/Space for Сокира, Escape to close)
  React.useEffect(() => {
    if (!onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = activeIndex === -1 ? 0 : (activeIndex + 1) % mainFive.length;
        setSelected(mainFive[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx = activeIndex === -1 ? 0 : (activeIndex - 1 + mainFive.length) % mainFive.length;
        setSelected(mainFive[prevIdx]);
      } else if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setSelected('Сокира');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, onClose]);

  if (compact) {
    return (
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-2.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-xs text-stone-300 font-semibold mb-1.5">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Ланцюг побиття
          </span>
          <span className="text-[10px] text-amber-400/90 font-normal">🪓 Сокира б'є всіх</span>
        </div>
        <div className="flex items-center justify-center text-[10px] sm:text-xs bg-stone-950/70 rounded-lg py-1 px-1.5 sm:p-2 border border-stone-800/80 overflow-x-auto">
          <div className="flex items-center justify-center gap-1 sm:gap-2 font-semibold whitespace-nowrap text-stone-200">
            <span className="flex items-center gap-0.5"><span>🐺</span>Вовк</span>
            <span className="text-amber-500 font-bold text-xs">➔</span>
            <span className="flex items-center gap-0.5"><span>🐑</span>Вівця</span>
            <span className="text-amber-500 font-bold text-xs">➔</span>
            <span className="flex items-center gap-0.5"><span>🌿</span>Кущі</span>
            <span className="text-amber-500 font-bold text-xs">➔</span>
            <span className="flex items-center gap-0.5"><span>🪚</span>Пилка</span>
            <span className="text-amber-500 font-bold text-xs">➔</span>
            <span className="flex items-center gap-0.5"><span>🌲</span>Ліс</span>
            <span className="text-amber-500 font-bold text-xs">➔</span>
            <span className="flex items-center gap-0.5"><span>🐺</span>Вовк</span>
          </div>
        </div>
      </div>
    );
  }

  // Exact geometric coordinates for 260x260 canvas
  const centerCoord = 130;
  const radius = 86;

  return (
    <div className="bg-stone-900 border border-stone-700 w-full max-w-sm rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl relative text-stone-100 select-none">
      <style>{`
        @keyframes cycleArrowDashFlow {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .cycle-arrow-anim {
          stroke-dasharray: 6 3;
          animation: cycleArrowDashFlow 0.8s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2.5 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-amber-200 text-sm tracking-tight">Коло Виживання</h3>
            <p className="text-[10px] text-stone-400">Натисніть на карту для перегляду взаємодій</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
            title="Закрити"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* SVG & Card Wheel Layout (Fixed 260x260 container, all items in strict positions) */}
      <div className="relative w-[260px] h-[260px] mx-auto my-1">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 260 260"
        >
          <defs>
            {/* Neutral Arrowhead Marker */}
            <marker
              id="cycle-arrow-neutral"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 7 3.5, 0 7" fill="#6b7280" />
            </marker>

            {/* Green (Beats) Arrowhead Marker */}
            <marker
              id="cycle-arrow-beats"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
            </marker>

            {/* Red (Beaten by / Threat) Arrowhead Marker */}
            <marker
              id="cycle-arrow-threat"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#f43f5e" />
            </marker>

            {/* Gold Arrowhead Marker from Axe */}
            <marker
              id="cycle-arrow-axe"
              markerWidth="8"
              markerHeight="8"
              refX="6.5"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 8 4, 0 8" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Neutral Background Ring Guide */}
          <circle
            cx={centerCoord}
            cy={centerCoord}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="opacity-50"
          />

          {/* 5 Directed Cycle Arcs (Only arrows animate) */}
          {mainFive.map((_, i) => {
            const startAngleDeg = i * 72 - 90 + 17;
            const endAngleDeg = (i + 1) * 72 - 90 - 17;

            const rad1 = startAngleDeg * (Math.PI / 180);
            const rad2 = endAngleDeg * (Math.PI / 180);

            const x1 = centerCoord + radius * Math.cos(rad1);
            const y1 = centerCoord + radius * Math.sin(rad1);
            const x2 = centerCoord + radius * Math.cos(rad2);
            const y2 = centerCoord + radius * Math.sin(rad2);

            const pathData = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;

            const isBeatsArc = activeIndex !== -1 && i === activeIndex;
            const isThreatArc = activeIndex !== -1 && (i + 1) % 5 === activeIndex;

            let strokeColor = '#6b7280';
            let strokeWidth = 1.5;
            let marker = 'url(#cycle-arrow-neutral)';
            let animClass = '';

            if (activeCard === 'Сокира') {
              strokeColor = '#4b5563';
              strokeWidth = 1.5;
            } else if (isBeatsArc) {
              strokeColor = '#10b981';
              strokeWidth = 3;
              marker = 'url(#cycle-arrow-beats)';
              animClass = 'cycle-arrow-anim';
            } else if (isThreatArc) {
              strokeColor = '#f43f5e';
              strokeWidth = 3;
              marker = 'url(#cycle-arrow-threat)';
              animClass = 'cycle-arrow-anim';
            }

            return (
              <path
                key={i}
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                markerEnd={marker}
                className={animClass}
              />
            );
          })}

          {/* Radial arrows from Сокира to all 5 outer cards when Сокира is selected */}
          {activeCard === 'Сокира' &&
            mainFive.map((_, i) => {
              const angleDeg = i * 72 - 90;
              const rad = angleDeg * (Math.PI / 180);
              const x1 = centerCoord + 28 * Math.cos(rad);
              const y1 = centerCoord + 28 * Math.sin(rad);
              const x2 = centerCoord + (radius - 23) * Math.cos(rad);
              const y2 = centerCoord + (radius - 23) * Math.sin(rad);

              return (
                <line
                  key={`axe-rad-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  markerEnd="url(#cycle-arrow-axe)"
                  className="cycle-arrow-anim"
                />
              );
            })}
        </svg>

        {/* 5 Outer Cards - exact fixed positions, no size scaling, no shifting */}
        {mainFive.map((item, idx) => {
          const angleDeg = idx * 72 - 90;
          const rad = angleDeg * (Math.PI / 180);
          const x = centerCoord + radius * Math.cos(rad);
          const y = centerCoord + radius * Math.sin(rad);

          const isSelected = activeCard === item;
          const isTargetOfActive = activeIndex !== -1 && idx === (activeIndex + 1) % 5 && activeCard !== 'Сокира';
          const isThreatToActive = activeIndex !== -1 && idx === (activeIndex + 4) % 5 && activeCard !== 'Сокира';
          const itemConfig = CARD_CONFIGS[item];

          let borderClass = 'border-stone-700 bg-stone-850 hover:bg-stone-800 text-stone-200';

          if (isSelected) {
            borderClass = 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400 font-black shadow-lg z-10';
          } else if (isTargetOfActive) {
            borderClass = 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/50 shadow-md z-10';
          } else if (isThreatToActive) {
            borderClass = 'bg-rose-950 border-rose-400 text-rose-200 ring-2 ring-rose-500/50 shadow-md z-10';
          }

          return (
            <button
              key={item}
              onClick={() => setSelected(item)}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute w-12 h-12 rounded-xl flex flex-col items-center justify-center text-lg border-2 cursor-pointer transition-colors ${borderClass}`}
              title={`${item}: Б'є ${BEATS[item].join(', ')}`}
            >
              <span className="text-xl leading-none">{itemConfig.emoji}</span>
              <span className="text-[9px] font-bold tracking-tight mt-0.5 leading-none">{item}</span>
            </button>
          );
        })}

        {/* Center: Сокира (Strictly named 'Сокира', perfectly centered) */}
        <button
          onClick={() => setSelected('Сокира')}
          style={{
            left: `${centerCoord}px`,
            top: `${centerCoord}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className={`absolute w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 cursor-pointer z-20 transition-colors ${
            activeCard === 'Сокира'
              ? 'bg-amber-500 text-stone-950 border-amber-300 ring-2 ring-amber-400 font-black shadow-xl'
              : 'bg-stone-850 hover:bg-stone-800 text-amber-300 border-amber-600/70 shadow-md'
          }`}
          title="Сокира: б'є будь-яку карту!"
        >
          <span className="text-xl leading-none">🪓</span>
          <span className="text-[9.5px] font-bold tracking-tight mt-0.5 leading-none">
            Сокира
          </span>
        </button>
      </div>

      {/* Selected Card Info Box */}
      <div className="bg-stone-950/90 rounded-2xl p-3 border border-stone-800 text-xs mt-1 shadow-inner">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-stone-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <div>
              <span className="font-black text-stone-100 text-sm block leading-none">{config.title}</span>
              <span className="text-[10px] text-amber-400/90 italic font-medium">{config.shortDesc}</span>
            </div>
          </div>
        </div>

        {/* 2-column relation cards */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {/* Green: BEATS */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] uppercase mb-0.5">
                <Swords className="w-3 h-3" />
                <span>Б'є:</span>
              </div>
              <div className="text-emerald-200 font-bold text-xs">
                {activeCard === 'Сокира' ? 'Усі карти' : beatsList.join(', ')}
              </div>
            </div>
            <p className="text-[9.5px] text-emerald-300/80 mt-1 leading-tight border-t border-emerald-500/20 pt-1">
              {reasons.beatsReason}
            </p>
          </div>

          {/* Red: BEATEN BY */}
          <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-rose-400 font-bold text-[10px] uppercase mb-0.5">
                <ShieldAlert className="w-3 h-3" />
                <span>Програє проти:</span>
              </div>
              <div className="text-rose-200 font-bold text-xs">
                {activeCard === 'Сокира' ? 'Тільки іншій Сокирі' : beatenByList.join(', ')}
              </div>
            </div>
            <p className="text-[9.5px] text-rose-300/80 mt-1 leading-tight border-t border-rose-500/20 pt-1">
              {reasons.beatenByReason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
