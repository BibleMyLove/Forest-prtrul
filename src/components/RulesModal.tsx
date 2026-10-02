import React from 'react';
import { X, BookOpen, Shield, Sword, Award, Layers } from 'lucide-react';
import { CARD_CONFIGS, DECK_TEMPLATE } from '../constants';
import { CardType } from '../types';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const cardTypes = Object.keys(DECK_TEMPLATE) as CardType[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-100 tracking-tight">
                Правила гри «Лісовий патруль»
              </h2>
              <p className="text-xs text-stone-400">Стратегічна карткова битва на 54 карти (від 1 до 4 ботів-супротивників)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Objective */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-4">
            <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-2 text-base">
              <Award className="w-4 h-4" />
              Головна мета гри
            </h3>
            <p className="text-stone-200 text-xs sm:text-sm leading-relaxed">
              <b>Хто перший скинув усі карти з руки — той і виграв!</b>
            </p>
            <p className="text-stone-400 text-xs mt-1 leading-relaxed">
              У грі можуть брати участь <b>від 1 до 4 ботів</b> (2–5 гравців за столом). Атака та захист передаються по колу. Якщо під час бою гравець не зміг відбитися, він забирає карти зі столу. Гравець, який першим скине всі свої карти, займає 1-е місце!
            </p>
          </div>

          {/* Cards & Deck structure */}
          <div>
            <h3 className="text-emerald-400 font-bold flex items-center gap-2 mb-3 text-base">
              <Layers className="w-4 h-4" />
              Склад колоди (54 карти)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {cardTypes.map((type) => {
                const conf = CARD_CONFIGS[type];
                const count = DECK_TEMPLATE[type];
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-stone-800/60 border border-stone-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{conf.emoji}</span>
                      <div>
                        <div className="font-bold text-stone-100 flex items-center gap-1.5">
                          {conf.title}
                          {type === 'Сокира' && (
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 rounded font-semibold border border-amber-500/30">
                              Джокер
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">{conf.beatsDesc}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-stone-900 px-2 py-1 rounded text-stone-300 border border-stone-700">
                      {count} шт.
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How beating works */}
          <div>
            <h3 className="text-amber-300 font-bold flex items-center gap-2 mb-3 text-base">
              <Sword className="w-4 h-4" />
              Замкнений харчовий ланцюг та інструменти
            </h3>
            <div className="bg-stone-950/80 p-3.5 rounded-xl border border-stone-800 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-stone-200">
                <span className="text-lg">🐺</span> <b>Вовк</b> б'є <span className="text-lg">🐑</span> <b>Вівцю</b> (Хижак полює на здобич)
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <span className="text-lg">🐑</span> <b>Вівця</b> б'є <span className="text-lg">🌿</span> <b>Кущі</b> (Травоїдна об'їдає кущі)
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <span className="text-lg">🌿</span> <b>Кущі</b> б'ють <span className="text-lg">🪚</span> <b>Пилку</b> (Гілки та терен заклинюють і ламають пилку)
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <span className="text-lg">🪚</span> <b>Пилка</b> б'є <span className="text-lg">🌲</span> <b>Ліс</b> (Гостра пила розпилює стовбури лісу)
              </div>
              <div className="flex items-center gap-2 text-stone-200">
                <span className="text-lg">🌲</span> <b>Ліс</b> б'є <span className="text-lg">🐺</span> <b>Вовка</b> (Дрімуча пуща заплутує та поглинає хижака)
              </div>
              <div className="flex items-center gap-2 text-amber-300 pt-1 border-t border-stone-800">
                <span className="text-lg">🪓</span> <b>Сокира</b> — універсальний <b>Джокер</b>. Вона б'є будь-яку карту, включно з іншою Сокирою!
              </div>
            </div>
          </div>

          {/* Flow of round */}
          <div>
            <h3 className="text-cyan-400 font-bold flex items-center gap-2 mb-3 text-base">
              <Shield className="w-4 h-4" />
              Перебіг бою та добір карт
            </h3>
            <ul className="list-disc list-inside space-y-2 text-stone-300 text-xs sm:text-sm leading-relaxed">
              <li>
                <b>Початок:</b> Кожен гравець отримує по <b>6 карт</b>.
              </li>
              <li>
                <b>Атака:</b> Гравець викладає карту на стіл.
              </li>
              <li>
                <b>Захист:</b> Супротивник повинен побити карту згідно з правилами ланцюга або Джокером.
              </li>
              <li className="bg-amber-500/15 p-2.5 rounded-lg border border-amber-500/40 text-amber-200">
                <b>Підбір під час захисту:</b> Якщо у вас немає карти для захисту — ви можете <b>взяти карту з колоди</b> (кнопка «Взяти 1 карту (+1)» або клік на колоду). Якщо ви використали карту для захисту і суперник підкинув ще атаку, ви можете брати ще карту, якщо знову нічим битися! Якщо витягнута карта не б'є атаку і бити нічим — забираєте карти зі столу («Беру»).
              </li>
              <li className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/30 text-amber-200">
                <b>Підкидання карт:</b> Якщо вашу карту побито, ви маєте право <b>підкинути</b> з руки додаткову карту будь-якого типу, який вже є на столі (серед атакуючих чи захисних карт).
              </li>
              <li className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/30 text-yellow-200">
                <b>Коли суперник забирає карти:</b> Якщо супротивник не може побити атаку і забирає карти, у вас з'являється кнопка <b>«Дати ще»</b>. Ви можете дати йому ще одну або дві такі ж карти з руки (не більше ніж ліміт карт суперника), а потім натиснути <b>«Завершити хід»</b>!
              </li>
              <li>
                <b>«Бито!» (Відбій):</b> Коли всі карти на столі успішно побито і атакуючий натискає кнопку «Бито!» — всі карти зі столу йдуть у <b>«Відбій»</b>. Карти в руках <b>НЕ поповнюються автоматично</b> (як в Уно) — кожен скинутий хід наближає вас до перемоги! Захисник отримує право наступної атаки.
              </li>
              <li>
                <b>Якщо немає чим бити:</b> Захисник натискає <b>«Забрати карти»</b> та забирає карти зі столу у свою руку. Карти з колоди <b>не добираються автоматично</b> — атакуючий ходить знову з тими картами, що в нього залишилися!
              </li>
            </ul>
          </div>

          {/* Game Modes Section */}
          <div>
            <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-3 text-base">
              <Award className="w-4 h-4" />
              Режими гри
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                <div className="font-bold text-amber-300 text-xs sm:text-sm mb-1">🏆 Класична гра (54 карти)</div>
                <p className="text-[11px] text-stone-400">
                  Повна колода на 54 карти, вибір від 1 до 4 ботів-супротивників, добір під час захисту.
                </p>
              </div>

              <div className="bg-stone-950/60 p-3 rounded-xl border border-amber-500/40 bg-amber-500/5">
                <div className="font-bold text-amber-200 text-xs sm:text-sm mb-1">👑 Турнір (Плей-оф)</div>
                <p className="text-[11px] text-stone-300">
                  Гра на вибування з 3 етапів: Чвертьфінал ➔ Півфінал ➔ Гранд-Фінал. Поразка означає вибування!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all"
          >
            Зрозуміло, до гри!
          </button>
        </div>
      </div>
    </div>
  );
};
