import React from 'react';
import { BattleLogItem } from '../types';
import { ScrollText, Swords, ShieldCheck, Hand, Trophy, Skull } from 'lucide-react';

interface GameLogProps {
  logs: BattleLogItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const GameLog: React.FC<GameLogProps> = ({
  logs,
  collapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const getIcon = (type: BattleLogItem['type']) => {
    switch (type) {
      case 'attack':
        return <Swords className="w-3.5 h-3.5 text-amber-400" />;
      case 'defend':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'take':
        return <Hand className="w-3.5 h-3.5 text-rose-400" />;
      case 'win':
        return <Trophy className="w-3.5 h-3.5 text-yellow-300" />;
      case 'loss':
        return <Skull className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <ScrollText className="w-3.5 h-3.5 text-stone-400" />;
    }
  };

  return (
    <div className={`bg-stone-950/80 border border-stone-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm flex flex-col text-xs ${className}`}>
      <div
        onClick={onToggleCollapse}
        className="p-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between cursor-pointer select-none hover:bg-stone-850 shrink-0"
      >
        <div className="flex items-center gap-1.5 font-bold text-stone-300">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span>Літопис бою</span>
          <span className="text-[10px] text-stone-500 font-mono">({logs.length})</span>
        </div>
        <span className="text-[10px] text-stone-400 hover:text-stone-200">
          {collapsed ? 'Розгорнути ▼' : 'Згорнути ▲'}
        </span>
      </div>

      {!collapsed && (
        <div className="p-2.5 flex-1 min-h-[140px] max-h-60 overflow-y-auto space-y-1.5 flex flex-col-reverse">
          {logs.length === 0 ? (
            <div className="text-center py-4 text-stone-500 italic">Початок битви...</div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 p-1.5 rounded bg-stone-900/40 border border-stone-800/40 text-stone-300 leading-tight"
              >
                <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                <div className="flex-1">
                  <span>{item.text}</span>
                  <span className="text-[9px] text-stone-500 ml-1.5 font-mono">{item.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
