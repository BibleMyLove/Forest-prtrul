import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Card, CardType } from '../types';
import { CARD_CONFIGS, DECK_TEMPLATE } from '../constants';
import { CardView } from './CardView';

interface DiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  discardedCards: Card[];
}

export const DiscardModal: React.FC<DiscardModalProps> = ({
  isOpen,
  onClose,
  discardedCards,
}) => {
  if (!isOpen) return null;

  // Count by type
  const counts: Record<CardType, number> = {
    'Вовк': 0,
    'Вівця': 0,
    'Кущі': 0,
    'Ліс': 0,
    'Пилка': 0,
    'Сокира': 0,
  };

  discardedCards.forEach((c) => {
    counts[c.type]++;
  });

  const cardTypes = Object.keys(DECK_TEMPLATE) as CardType[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-100">
                Стіпка відбою ({discardedCards.length} карт)
              </h2>
              <p className="text-xs text-stone-400">Карти, що вийшли з гри в поточній партії</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Counts summary */}
        <div className="p-4 bg-stone-950/40 border-b border-stone-800 grid grid-cols-3 sm:grid-cols-6 gap-2">
          {cardTypes.map((type) => {
            const conf = CARD_CONFIGS[type];
            const discarded = counts[type];
            const total = DECK_TEMPLATE[type];
            return (
              <div
                key={type}
                className="bg-stone-900/80 border border-stone-800 rounded-lg p-2 text-center"
              >
                <div className="text-lg">{conf.emoji}</div>
                <div className="text-[11px] font-bold text-stone-200 truncate">{type}</div>
                <div className="text-xs font-mono font-bold text-amber-400">
                  {discarded}/{total}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cards grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {discardedCards.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <p>У відбої ще немає карт.</p>
              <p className="text-xs mt-1">Після кожного успішного захисту карти потрапляють сюди.</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 justify-center">
              {discardedCards.map((card, idx) => (
                <CardView key={`${card.id}-${idx}`} type={card.type} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-lg text-sm transition-colors"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
};
