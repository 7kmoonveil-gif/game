import React from 'react';
import { CharacterRace } from '../types';
import { CHARACTER_RACES, BIOMES } from '../game/constants';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HUDProps {
  hearts: number;
  maxHearts: number;
  score: number;
  timeSeconds: number;
  formattedTime: string;
  playerX: number;
  race: CharacterRace;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  hearts,
  maxHearts,
  score,
  formattedTime,
  playerX,
  race,
  isMuted,
  onToggleMute,
}) => {
  const raceInfo = CHARACTER_RACES[race] || CHARACTER_RACES.human;

  // Calculate progress percentage (0 to 100)
  const finishX = 3500;
  const progressPercent = Math.min(100, Math.max(0, (playerX / finishX) * 100));

  // Determine current season name
  let seasonLabel = '🌸 ฤดูปกติ (Spring/Sunny)';
  let seasonColor = 'bg-orange-500/80 text-white';
  if (playerX > BIOMES.ZONE1_END && playerX <= BIOMES.ZONE2_END) {
    seasonLabel = '🌧️ ฤดูฝน (Rainy Season)';
    seasonColor = 'bg-slate-700/80 text-cyan-200';
  } else if (playerX > BIOMES.ZONE2_END) {
    seasonLabel = '❄️ ฤดูหนาว (Winter Snow)';
    seasonColor = 'bg-blue-600/80 text-blue-100';
  }

  return (
    <header className="w-full select-none" id="game-hud">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5 bg-white/95 backdrop-blur-sm border-b-4 border-black/80 text-black">
        {/* Left: Hearts (Life) */}
        <div className="flex items-center gap-2" id="hud-hearts">
          <div className="flex items-center bg-black/90 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-black shadow-sm">
            <span className="text-xl sm:text-2xl mr-1.5">❤️</span>
            <span className="text-sm sm:text-base font-black tracking-tight tabular-nums">
              {hearts} / {maxHearts}
            </span>
          </div>
        </div>

        {/* Center: Timer with tabular-nums */}
        <div
          id="hud-timer"
          className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-black shadow-sm"
        >
          <span className="text-amber-500 text-base sm:text-lg font-bold">⏱️</span>
          <span className="text-sm sm:text-base font-black tracking-widest text-black tabular-nums font-mono">
            {formattedTime}
          </span>
        </div>

        {/* Right: Coins & Sound Mute Toggle */}
        <div className="flex items-center gap-2 sm:gap-3" id="hud-coins">
          <div className="flex items-center gap-1.5 bg-yellow-400 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-black shadow-sm">
            <span className="text-xl sm:text-2xl animate-bounce">🪙</span>
            <span className="text-sm sm:text-base font-black tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Audio toggle button */}
          <button
            onClick={onToggleMute}
            id="hud-mute-btn"
            className="p-2 sm:p-2.5 rounded-xl bg-black text-white border-2 border-black hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer shadow-sm"
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
        </div>
      </div>

      {/* Progress Bar (under status HUD) */}
      <div className="bg-[#FFF6ED] px-3 py-2 sm:px-6 sm:py-2.5 border-b-2 border-black/20">
        <div className="flex items-center justify-between text-xs text-black/70 mb-1">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span>🏁 PROGRESS TO GOAL</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 border border-black/10 transition-colors ${seasonColor}`}>
              {seasonLabel}
            </span>
          </span>
          <span className="font-mono text-black font-black tabular-nums">
            {Math.floor(progressPercent)}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-5 sm:h-6 bg-black/15 rounded-full border-2 border-black/40 overflow-visible p-0.5 shadow-inner">
          {/* Fill Bar with season gradient */}
          <div
            className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-orange-400 via-amber-500 to-emerald-400 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Zone markers */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-black/30"
            style={{ left: `${(BIOMES.ZONE1_END / finishX) * 100}%` }}
            title="เข้าสู่ฤดูฝน"
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-black/30"
            style={{ left: `${(BIOMES.ZONE2_END / finishX) * 100}%` }}
            title="เข้าสู่ฤดูหนาว"
          />

          {/* Moving Character Race Emoji Head on Track */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-lg sm:text-2xl transition-all duration-150 filter drop-shadow cursor-pointer hover:scale-125 z-10"
            style={{ left: `${progressPercent}%` }}
            title={`${raceInfo.name} (${Math.floor(progressPercent)}%)`}
          >
            {raceInfo.emoji}
          </div>

          {/* Goal Checkered Flag */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 text-base sm:text-xl z-10">
            🏁
          </div>
        </div>
      </div>
    </header>
  );
};
