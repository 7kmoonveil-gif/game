import React from 'react';
import { CharacterRace, LeaderboardEntry } from '../types';
import { CHARACTER_RACES } from '../game/constants';
import { Trophy, RefreshCw, Home, Sparkles, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  isWon: boolean;
  score: number;
  timeSeconds: number;
  formattedTime: string;
  race: CharacterRace;
  playerName: string;
  leaderboard: LeaderboardEntry[];
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isWon,
  score,
  formattedTime,
  race,
  playerName,
  leaderboard,
  onRestart,
  onGoHome,
}) => {
  const raceInfo = CHARACTER_RACES[race] || CHARACTER_RACES.human;

  // Find player's rank in the leaderboard
  const rankIndex = leaderboard.findIndex(
    (e) => e.playerName.trim().toLowerCase() === playerName.trim().toLowerCase()
  );
  const currentRank = rankIndex >= 0 ? rankIndex + 1 : '-';

  return (
    <div
      id="game-over-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 select-none"
    >
      <div className="w-full max-w-md bg-white border-[6px] border-black rounded-3xl p-6 sm:p-7 text-center text-[#2D2D2D] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-5 animate-in zoom-in-95 duration-200">
        {/* Banner Emoji & Title */}
        <div className="space-y-1.5">
          <div className="text-5xl sm:text-6xl animate-bounce">
            {isWon ? '🏆' : '💀'}
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${
              isWon ? 'text-orange-600' : 'text-rose-600'
            }`}
          >
            {isWon ? 'MISSION COMPLETE!' : 'GAME OVER!'}
          </h2>
          <p className="text-xs sm:text-sm text-black/70 font-semibold">
            {isWon
              ? 'คุณผจญภัยผ่านครบทั้ง 3 ฤดูกาลและพิชิตเส้นชัยสำเร็จ!'
              : 'พลังชีวิตหมดหรือตกเหวลึก ลองเริ่มใหม่อีกครั้ง!'}
          </p>
        </div>

        {/* Player & Stats summary card */}
        <div className="bg-[#FFF6ED] border-4 border-black rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
            <span className="text-xs text-black/60 font-black uppercase tracking-wider">ADVENTURER:</span>
            <span className="text-sm font-black flex items-center gap-1.5 text-black">
              <span>{raceInfo.emoji}</span>
              <span>{playerName}</span>
              <span className="text-xs text-black/50">({raceInfo.name})</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-sm">
              <div className="text-[11px] text-black/60 font-black">เหรียญ 🪙</div>
              <div className="text-xl font-black text-amber-500 mt-0.5 tabular-nums">
                {score.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-sm">
              <div className="text-[11px] text-black/60 font-black">เวลา ⏱️</div>
              <div className="text-base sm:text-lg font-black text-black mt-0.5 font-mono tabular-nums">
                {formattedTime}
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border-2 border-black shadow-sm">
              <div className="text-[11px] text-black/60 font-black">อันดับ 🏅</div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">
                #{currentRank}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-black/60 font-bold italic pt-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>บันทึกคะแนนลง Google Sheets เรียบร้อย</span>
          </div>
        </div>

        {/* Top 3 Quick Leaderboard Preview */}
        <div className="bg-gray-50 rounded-2xl p-3.5 border-2 border-black text-left">
          <div className="text-xs font-black text-black uppercase tracking-wider mb-2 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-orange-600" /> Top 3 Adventurers
          </div>
          <div className="space-y-1.5 text-xs">
            {leaderboard.slice(0, 3).map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-black/10 text-black font-semibold"
              >
                <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                  <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <span className="truncate">{entry.playerName}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-orange-600 font-black">🪙 {entry.score.toLocaleString()}</span>
                  <span className="text-[11px] text-black/50">{entry.formattedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onRestart}
            id="restart-game-btn"
            className="flex items-center justify-center gap-1.5 py-3.5 px-4 bg-green-500 hover:bg-green-600 text-white font-black text-sm sm:text-base rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>เล่นใหม่</span>
          </button>
          <button
            onClick={onGoHome}
            id="back-home-btn"
            className="flex items-center justify-center gap-1.5 py-3.5 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-sm sm:text-base rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all uppercase tracking-wider cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>หน้าแรก</span>
          </button>
        </div>
      </div>
    </div>
  );
};
