import React from 'react';
import { Trophy, Swords, Crown, Award, CheckCircle2, XCircle, X, ChevronRight, Flame, Shield, Sparkles } from 'lucide-react';
import { TournamentState } from '../types';
import { TOURNAMENT_STAGES_CONFIG } from '../constants';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: TournamentState;
  onStartMatch: () => void;
  onResetTournament: () => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  tournament,
  onStartMatch,
  onResetTournament,
}) => {
  if (!isOpen) return null;

  const currentMatch = TOURNAMENT_STAGES_CONFIG[tournament.currentStageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-stone-900 border-2 border-amber-500/50 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-stone-950 via-amber-950/40 to-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-stone-950 shadow-lg font-black">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
                <span>Турнір на вибування</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Плей-оф
                </span>
              </h2>
              <p className="text-xs text-stone-400">Перемагайте у кожному раунді, щоб здобути Золотий Кубок Лісу</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Bracket Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Tournament Champion Banner if won */}
          {tournament.isChampion && (
            <div className="bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 text-center shadow-xl shadow-amber-500/20 animate-pulse">
              <div className="text-5xl mb-2">🏆</div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-200">
                ВИТОК ТРІУМФУ: ВИ — ЧЕМПІОН ЛІСУ!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-md mx-auto">
                Ви здолали всіх суперників на вибування та заволоділи головним трофеєм «Лісового патруля»!
              </p>
            </div>
          )}

          {/* Elimination Banner if lost */}
          {tournament.isEliminated && (
            <div className="bg-gradient-to-r from-rose-950/60 via-stone-900 to-rose-950/60 border-2 border-rose-500/60 rounded-2xl p-4 text-center shadow-xl">
              <div className="text-4xl mb-1">💀</div>
              <h3 className="text-lg sm:text-xl font-black text-rose-300">
                Ви вибули з турніру
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                Поразка у раунді «{currentMatch?.stageName}». Не засмучуйтесь, спробуйте пройти турнірну сітку знову!
              </p>
            </div>
          )}

          {/* Tournament Tree / Bracket Stages */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Swords className="w-4 h-4" /> Турнірна сітка
              </span>
              <span className="text-xs text-stone-400">
                Раунд {Math.min(tournament.currentStageIndex + 1, 3)} із 3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {TOURNAMENT_STAGES_CONFIG.map((stageConf, idx) => {
                const matchState = tournament.matches[idx];
                const isCurrent = idx === tournament.currentStageIndex && !tournament.isChampion && !tournament.isEliminated;
                const isPassed = matchState?.isCompleted && matchState?.isWon;
                const isFailed = matchState?.isCompleted && !matchState?.isWon;
                const isLocked = idx > tournament.currentStageIndex;

                return (
                  <div
                    key={stageConf.stage}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between relative transition-all ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                        : isPassed
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-stone-300'
                        : isFailed
                        ? 'bg-rose-950/30 border-rose-500/50 opacity-75'
                        : isLocked
                        ? 'bg-stone-950/60 border-stone-800 opacity-60'
                        : 'bg-stone-900 border-stone-700'
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-tight">
                        {stageConf.stageName}
                      </span>
                      {isPassed && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Перемога
                        </span>
                      )}
                      {isFailed && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Вибув
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                          Поточний бій
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] text-stone-500 font-semibold">
                          🔒 Заблоковано
                        </span>
                      )}
                    </div>

                    {/* Opponent Card info */}
                    <div className="flex items-center gap-3 my-2 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800">
                      <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl shadow shrink-0">
                        {stageConf.opponentEmoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-stone-100 flex items-center gap-1.5 truncate">
                          <span>{stageConf.opponentName}</span>
                          {idx === 2 && (
                            <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-amber-400 font-medium truncate">
                          {stageConf.opponentTitle}
                        </div>
                      </div>
                    </div>

                    {/* Difficulty and description */}
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      {stageConf.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">Складність ШІ:</span>
                      <span className="font-bold text-stone-300">
                        {stageConf.difficulty === 'easy' ? '🐾 Новачок' : stageConf.difficulty === 'normal' ? '🌲 Лісник' : '🐺 Хижак'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournament Rules Explainer */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-4 text-xs sm:text-sm text-stone-300 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Правила формату «Турнір на вибування»
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-xs leading-relaxed">
              <li>
                Турнір складається з <b>3 послідовних дуелей</b>: Чвертьфінал ➔ Півфінал ➔ Гранд-Фінал.
              </li>
              <li>
                <b>Одна помилка — вибування:</b> Якщо ви програєте будь-який матч, ви вибуваєте з турніру.
              </li>
              <li>
                <b>Зростаюча складність:</b> У кожному наступному раунді інтелект і тактика суперника стають агресивнішими.
              </li>
              <li>
                <b>Трофей Чемпіона:</b> Перемога у фіналі приносить Золотий Кубок Лісу та записується у вашу пожиттєву статистику!
              </li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between gap-3">
          <button
            onClick={onResetTournament}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs sm:text-sm transition-colors border border-stone-700"
          >
            Почати турнір заново
          </button>

          {!tournament.isChampion && !tournament.isEliminated ? (
            <button
              onClick={() => {
                onClose();
                onStartMatch();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Битися: {currentMatch?.stageName}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onResetTournament();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <span>Почати новий похід за кубком</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
