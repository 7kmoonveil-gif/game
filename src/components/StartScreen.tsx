import React, { useState } from 'react';
import { CharacterRace, LeaderboardEntry } from '../types';
import { CHARACTER_RACES } from '../game/constants';
import { Trophy, Play, RefreshCw, Code, Sparkles, User, Info } from 'lucide-react';

interface StartScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  selectedRace: CharacterRace;
  setSelectedRace: (race: CharacterRace) => void;
  leaderboard: LeaderboardEntry[];
  isLoadingLeaderboard: boolean;
  onRefreshLeaderboard: () => void;
  onStartGame: () => void;
  onOpenAppsScriptModal: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  playerName,
  setPlayerName,
  selectedRace,
  setSelectedRace,
  leaderboard,
  isLoadingLeaderboard,
  onRefreshLeaderboard,
  onStartGame,
  onOpenAppsScriptModal,
}) => {
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้เล่นก่อนเริ่มเกม');
      return;
    }
    setErrorMsg('');
    onStartGame();
  };

  return (
    <main className="w-full select-none" id="start-screen">
      {/* Main Grid: Player Setup Card (7 cols) + Leaderboard Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (Col 1-7): Player Setup Card in Neo-Brutalist Geometric Balance */}
        <section
          aria-labelledby="player-setup-heading"
          className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6"
        >
          {/* Header Title Banner */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border-2 border-black text-orange-700 text-xs font-black tracking-wide uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 2D Slow-Mo Platformer x CEFR B2
            </div>
            <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter text-orange-600 drop-shadow-sm leading-none">
              EMOJI QUEST
              <span className="text-xl sm:text-2xl block text-black/50 not-italic font-black tracking-widest mt-1">
                SLOW-MO ODYSSEY
              </span>
            </h1>
          </div>

          <form onSubmit={handleStart} className="space-y-5">
            {/* Player Name Input */}
            <div>
              <label
                htmlFor="player-name-input"
                id="player-setup-heading"
                className="block text-xs sm:text-sm font-black uppercase tracking-widest text-black/70 mb-2 flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-orange-600" />
                <span>Player Name (ชื่อผู้เล่น)</span>
              </label>
              <input
                id="player-name-input"
                type="text"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={20}
                placeholder="พิมพ์ชื่อของคุณ... (เช่น Hero ⭐)"
                className="w-full bg-gray-100 border-4 border-black p-3.5 sm:p-4 text-lg sm:text-2xl font-bold rounded-xl focus:outline-none focus:ring-4 ring-orange-300 text-slate-900 transition-all"
              />
              {errorMsg && (
                <p className="text-xs font-black text-rose-600 mt-1.5 flex items-center gap-1">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>

            {/* Select Race 4 Options */}
            <div>
              <label className="block text-xs sm:text-sm font-black uppercase tracking-widest text-black/70 mb-3">
                Select Race (เลือกเผ่าพันธุ์)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="character-race-grid">
                {(Object.keys(CHARACTER_RACES) as CharacterRace[]).map((raceKey) => {
                  const race = CHARACTER_RACES[raceKey];
                  const isSelected = selectedRace === raceKey;

                  return (
                    <button
                      type="button"
                      key={raceKey}
                      onClick={() => setSelectedRace(raceKey)}
                      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500 text-white border-4 border-black ring-4 ring-orange-200 shadow-inner'
                          : 'bg-white text-black border-4 border-black/20 hover:border-black'
                      }`}
                    >
                      <span className={`text-3xl sm:text-4xl mb-1.5 ${isSelected ? 'scale-110' : 'opacity-70'}`}>
                        {race.emoji}
                      </span>
                      <span className="text-xs font-black tracking-tight">{race.name}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-black/50'}`}>
                        {race.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Game Info Box */}
            <div className="bg-orange-50 p-3.5 rounded-2xl border-2 border-black/15 text-xs text-black/80 space-y-1">
              <div className="font-black text-orange-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> ฟีเจอร์พิเศษ:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-black/70 text-[11px]">
                <li>ความเร็ว <strong>Slow-motion (20% Speed)</strong> กระโดดลอยตัวนุ่มนวล</li>
                <li>เดินทางผ่าน <strong>3 ฤดูกาล</strong> (ปกติ 🌸 &gt; ฝน 🌧️ &gt; หิมะ ❄️)</li>
                <li>ชนกล่อง 🎁 ตอบคำถาม <strong>CEFR B2</strong> รับเหรียญ 10 เหรียญ</li>
              </ul>
            </div>

            {/* Start Adventure Button */}
            <button
              type="submit"
              id="start-game-btn"
              className="w-full py-4 sm:py-5 bg-green-500 hover:bg-green-600 text-white border-4 border-black rounded-2xl text-xl sm:text-2xl font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>START ADVENTURE</span>
            </button>
          </form>

          {/* Google Apps Script Modal Link */}
          <div className="pt-2 border-t-2 border-dashed border-black/10 flex items-center justify-between text-xs text-black/60">
            <span>เชื่อมต่อกับ Google Sheets</span>
            <button
              type="button"
              onClick={onOpenAppsScriptModal}
              className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-black hover:underline cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>ดูโค้ด Google Apps Script</span>
            </button>
          </div>
        </section>

        {/* Right Side (Col 8-12): Top Adventurers (Leaderboard) */}
        <section
          aria-labelledby="leaderboard-heading"
          className="lg:col-span-5 bg-white/95 backdrop-blur border-4 border-black rounded-3xl p-5 sm:p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black/10">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-orange-600" />
                <h2 id="leaderboard-heading" className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-black">
                  Top Adventurers
                </h2>
              </div>
              <p className="text-[11px] text-black/50 font-bold mt-0.5">
                กระดานผู้นำสูงสุด เชื่อมต่อ Google Sheets
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="bg-orange-200 text-orange-800 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-black/10">
                ASIA
              </span>
              <button
                onClick={onRefreshLeaderboard}
                disabled={isLoadingLeaderboard}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-black border-2 border-black/20 hover:border-black transition-all cursor-pointer disabled:opacity-50"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoadingLeaderboard ? 'animate-spin text-orange-600' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Leaderboard Entries List */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] pr-1" id="leaderboard-list">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-black/40 text-xs font-bold">
                ยังไม่มีข้อมูลผู้เล่น เป็นคนแรกที่พิชิตด่านนี้เลย!
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const raceData = CHARACTER_RACES[entry.race] || CHARACTER_RACES.human;
                const isTop1 = index === 0;
                const isTop3 = index < 3;

                return (
                  <div
                    key={index}
                    className={`flex items-center p-3 rounded-xl border-2 transition-all ${
                      isTop1
                        ? 'bg-yellow-100 border-yellow-500 shadow-sm'
                        : isTop3
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-gray-50 border-black/10'
                    }`}
                  >
                    {/* Rank */}
                    <span className="w-8 font-black text-lg text-black/80 shrink-0">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </span>

                    {/* Avatar & Player Name */}
                    <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                      <span className="text-base shrink-0">{raceData.emoji}</span>
                      <div className="truncate">
                        <div className="font-bold text-xs sm:text-sm text-black truncate">
                          {entry.playerName}
                        </div>
                        <div className="text-[10px] text-black/50">
                          {raceData.name} • {entry.status === 'WON' ? '🏆 ชนะ' : '💀 จบเกม'}
                        </div>
                      </div>
                    </div>

                    {/* Coin Pill & Time */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs bg-white px-2 py-1 rounded-lg border border-black/10 text-black">
                        🪙 {entry.score.toLocaleString()}
                      </span>
                      <span className="font-mono text-xs text-black/60 tabular-nums">
                        {entry.formattedTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-black/10 flex justify-between text-[10px] font-bold text-black/50 uppercase tracking-widest">
            <span>Status: Online</span>
            <span>Auto-sync Google Sheets</span>
          </div>
        </section>
      </div>
    </main>
  );
};
