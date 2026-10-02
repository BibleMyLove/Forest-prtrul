import React from 'react';
import { CardType } from '../types';
import { CARD_CONFIGS } from '../constants';

interface CardViewProps {
  type?: CardType;
  faceDown?: boolean;
  highlight?: boolean; // Can beat the current attack card
  dimmed?: boolean; // Cannot beat in defense phase
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  badge?: string;
  countBadge?: number;
  keyShortcut?: string | number;
}

// Кольорова схема кожної карти: c — основне сяйво, c2 — другий відтінок, d — глибока тінь
const PALETTE: Record<CardType, { c: string; c2: string; d: string }> = {
  'Вовк': { c: '#fb7185', c2: '#be123c', d: '#2a0713' },
  'Вівця': { c: '#fde68a', c2: '#f59e0b', d: '#2b1d05' },
  'Кущі': { c: '#34d399', c2: '#047857', d: '#04231a' },
  'Ліс': { c: '#2dd4bf', c2: '#0f766e', d: '#03242a' },
  'Пилка': { c: '#fb923c', c2: '#c2410c', d: '#2a1204' },
  'Сокира': { c: '#ffd86b', c2: '#ff4fa3', d: '#1f1405' },
};

type CssVars = React.CSSProperties & Record<`--${string}`, string>;

export const CardView: React.FC<CardViewProps> = ({
  type = 'Вовк',
  faceDown = false,
  highlight = false,
  dimmed = false,
  size = 'md',
  onClick,
  className = '',
  badge,
  countBadge,
  keyShortcut,
}) => {
  const config = (type && CARD_CONFIGS[type]) ? CARD_CONFIGS[type] : CARD_CONFIGS['Вовк'];
  const pal = (type && PALETTE[type]) ? PALETTE[type] : PALETTE['Вовк'];
  const isAxe = type === 'Сокира';

  // Size styles
  const sizeClasses = {
    xs: 'w-9 h-13 xs:w-10 xs:h-15 sm:w-12 sm:h-18 text-[8px] sm:text-[9px] rounded-md sm:rounded-lg p-0.5 sm:p-1',
    sm: 'w-10 h-15 xs:w-11 xs:h-16 sm:w-14 sm:h-20 md:w-16 md:h-24 text-[9px] sm:text-xs rounded-md sm:rounded-lg p-0.5 sm:p-1',
    md: 'w-[74px] h-[112px] sm:w-24 sm:h-36 md:w-28 md:h-42 text-xs rounded-xl p-1.5 sm:p-2.5',
    lg: 'w-32 h-48 sm:w-40 sm:h-56 text-base rounded-2xl p-3 sm:p-3.5',
  }[size];

  // 3D-нахил та голографічний блиск, що слідують за курсором
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--ry', `${((px - 0.5) * 16).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - py) * 16).toFixed(2)}deg`);
  };
  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--mx', '50%');
    el.style.setProperty('--my', '50%');
  };

  const vars: CssVars = {
    '--c': pal.c,
    '--c2': pal.c2,
    '--d': pal.d,
    '--rx': '0deg',
    '--ry': '0deg',
    '--mx': '50%',
    '--my': '50%',
  };

  if (faceDown) {
    return (
      <div
        onClick={onClick}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={vars}
        className={`gcard gcard-back ${onClick ? 'gcard-click' : ''} ${highlight ? 'gcard-hl' : ''} ${sizeClasses} ${className}`}
      >
        <div className="gcard-clip">
          <div className="gcard-back-pattern" />
          <div className="gcard-back-ring" />
          <div className="gcard-back-gem" />
          <div className="gcard-foil" />
          <div className="gcard-shine" />
        </div>

        {countBadge !== undefined && <span className="gcard-count">{countBadge}</span>}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={vars}
      className={`gcard gcard-front ${isAxe ? 'gcard-axe' : ''} ${onClick ? 'gcard-click' : ''} ${
        highlight ? 'gcard-hl' : ''
      } ${dimmed ? 'gcard-dim' : ''} ${sizeClasses} ${className}`}
    >
      <div className="gcard-clip">
        <div className="gcard-bgglow" />
        <div className="gcard-frame" />
        <div className="gcard-foil" />
        <div className="gcard-shine" />

        {/* Верхній рядок */}
        <div className="flex items-center justify-between w-full z-10 leading-none relative">
          <span className="gcard-title flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm">
            <span className="truncate max-w-[52px] sm:max-w-none">{config.title}</span>
          </span>
          {isAxe && <span className="gcard-star">★</span>}
        </div>

        {/* Центральна медаль з персонажем */}
        <div className="flex-1 flex flex-col items-center justify-center my-0.5 z-10 relative">
          <div className="gcard-medal">
            <span className="gcard-emoji text-2xl sm:text-3xl md:text-4xl">{config.emoji}</span>
          </div>
        </div>

        {/* Підпис внизу */}
        <div className="gcard-foot z-10 relative rounded px-1 py-0.5 text-center leading-none">
          <span className="block font-bold text-[8px] sm:text-[9px] md:text-[10px] truncate">{config.beatsDesc}</span>
        </div>

        {isAxe && (
          <>
            <i className="gcard-twinkle t1" />
            <i className="gcard-twinkle t2" />
            <i className="gcard-twinkle t3" />
          </>
        )}
      </div>

      {badge && (
        <div className="absolute top-0.5 right-0.5 z-20">
          <span className="gcard-badge">{badge}</span>
        </div>
      )}

      {keyShortcut !== undefined && (
        <div className="absolute -top-1 -left-1 z-20 pointer-events-none">
          <kbd className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded bg-stone-950/90 border border-amber-400/60 text-amber-300 font-mono text-[9px] sm:text-[10px] font-black shadow-md">
            {keyShortcut}
          </kbd>
        </div>
      )}

      {countBadge !== undefined && <span className="gcard-count">{countBadge}</span>}
    </div>
  );
};
