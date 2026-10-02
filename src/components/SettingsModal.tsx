import React from 'react';
import { X, Settings, ShieldOff, Layers, Check, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  noTossing: boolean;
  onToggleNoTossing: (val: boolean) => void;
  refillHandTo4: boolean;
  onToggleRefillHandTo4: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  noTossing,
  onToggleNoTossing,
  refillHandTo4,
  onToggleRefillHandTo4,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-100 tracking-tight">
                Налаштування правил
              </h2>
              <p className="text-xs text-stone-400">Оберіть бажані модифікатори для партії</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-6 space-y-4 text-sm">
          {/* Пункт 1: Без підкидання */}
          <div
            onClick={() => onToggleNoTossing(!noTossing)}
            className={`cursor-pointer p-4 rounded-xl border transition-all select-none ${
              noTossing
                ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    noTossing ? 'bg-amber-500/25 text-amber-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  <ShieldOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-200 text-base">Без підкидання</h3>
                  <span
                    className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold ${
                      noTossing
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {noTossing ? 'УВІМКНЕНО (1 карта)' : 'ВИМКНЕНО (класика)'}
                  </span>
                </div>
              </div>

              {/* iOS style toggle */}
              <div
                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-1 ${
                  noTossing ? 'bg-amber-500' : 'bg-stone-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white transition-transform shadow-md ${
                    noTossing ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed pl-10.5">
              Атака здійснюється рівно однією картою. Після захисту карти одразу йдуть у відбій («Бито!»), без можливості підкидати додаткові карти на стіл.
            </p>
          </div>

          {/* Пункт 2: З добором - (до 4 карт) */}
          <div
            onClick={() => onToggleRefillHandTo4(!refillHandTo4)}
            className={`cursor-pointer p-4 rounded-xl border transition-all select-none ${
              refillHandTo4
                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    refillHandTo4 ? 'bg-emerald-500/25 text-emerald-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-200 text-base">
                    З добором — <span className="text-emerald-400 font-normal text-xs">(до 4 карт)</span>
                  </h3>
                  <span
                    className={`inline-block text-[11px] px-2 py-0.5 rounded font-semibold ${
                      refillHandTo4
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {refillHandTo4 ? 'УВІМКНЕНО (добір до 4)' : 'ВИМКНЕНО'}
                  </span>
                </div>
              </div>

              {/* iOS style toggle */}
              <div
                className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-1 ${
                  refillHandTo4 ? 'bg-emerald-500' : 'bg-stone-700'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full bg-white transition-transform shadow-md ${
                    refillHandTo4 ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed pl-10.5">
              Після кожного раунду («Бито!» або коли гравець забирає карти), якщо в колоді є залишок, гравці по черзі добирають карти з колоди до 4 штук. Гра ведеться, доки не спорожніє вся колода!
            </p>
          </div>

          {/* Quick Notice */}
          <div className="flex items-start gap-2 p-3 bg-stone-950/70 border border-stone-800 rounded-xl text-stone-400 text-xs">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              Змінені налаштування автоматично зберігаються та застосовуються одразу під час гри та у наступних раундах.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 flex justify-end bg-stone-950/60">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Готово</span>
          </button>
        </div>
      </div>
    </div>
  );
};
