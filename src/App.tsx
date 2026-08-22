/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterRace, GameStatus, QuizQuestion, LeaderboardEntry } from './types';
import { CEFR_B2_QUESTIONS } from './data/quizQuestions';
import {
  fetchLeaderboard,
  submitScore,
  formatSeconds,
  getLocalLeaderboard,
} from './utils/googleSheets';
import { soundManager } from './utils/audio';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { MobileControls } from './components/MobileControls';
import { QuizModal } from './components/QuizModal';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { AppsScriptModal } from './components/AppsScriptModal';

export default function App() {
  // Game Flow States
  const [gameStatus, setGameStatus] = useState<GameStatus>('start');
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('super_emoji_player_name') || 'Hero ⭐';
  });
  const [selectedRace, setSelectedRace] = useState<CharacterRace>('human');

  // HUD & Gameplay Stats
  const [hearts, setHearts] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [playerXPos, setPlayerXPos] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => getLocalLeaderboard());
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // Modals & Quiz
  const [showAppsScriptModal, setShowAppsScriptModal] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<QuizQuestion | null>(null);
  const [currentQuizNumber, setCurrentQuizNumber] = useState<number>(1);
  const [usedQuestionIds, setUsedQuestionIds] = useState<number[]>([]);

  // Mystery box action callback states
  const [mysteryBoxState, setMysteryBoxState] = useState<{
    pendingBoxId: string | null;
    wasCorrect: boolean | null;
    triggerEffect: boolean;
  }>({
    pendingBoxId: null,
    wasCorrect: null,
    triggerEffect: false,
  });

  // Input states (Keyboard + Mobile)
  const [inputs, setInputs] = useState<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  // Refs for tracking time accurately without drift
  const timerIntervalRef = useRef<number | null>(null);

  // Save player name when changed
  useEffect(() => {
    if (playerName.trim()) {
      localStorage.setItem('super_emoji_player_name', playerName.trim());
    }
  }, [playerName]);

  // Load Leaderboard on mount
  const refreshLeaderboardData = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.warn('Leaderboard refresh error:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    refreshLeaderboardData();
  }, [refreshLeaderboardData]);

  // In-Game Timer (Only runs when playing; paused in Quiz, Start, GameOver)
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerIntervalRef.current = window.setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameStatus]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setInputs((prev) => ({ ...prev, left: true }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setInputs((prev) => ({ ...prev, right: true }));
      } else if (
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W'
      ) {
        setInputs((prev) => ({ ...prev, jump: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setInputs((prev) => ({ ...prev, left: false }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setInputs((prev) => ({ ...prev, right: false }));
      } else if (
        e.key === ' ' ||
        e.key === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W'
      ) {
        setInputs((prev) => ({ ...prev, jump: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus]);

  // Start new game
  const handleStartGame = () => {
    setHearts(3);
    setScore(0);
    setTimeSeconds(0);
    setPlayerXPos(0);
    setUsedQuestionIds([]);
    setCurrentQuizNumber(1);
    setInputs({ left: false, right: false, jump: false });
    setGameStatus('playing');
  };

  // Trigger Mystery Box (CEFR B2 Quiz)
  const handleHitMysteryBox = (boxId: string) => {
    // Select an unused question from the 10 questions pool
    let availableQuestions = CEFR_B2_QUESTIONS.filter(
      (q) => !usedQuestionIds.includes(q.id)
    );

    // If all 10 have been used, reset pool
    if (availableQuestions.length === 0) {
      availableQuestions = CEFR_B2_QUESTIONS;
      setUsedQuestionIds([]);
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const chosenQuestion = availableQuestions[randomIndex];

    setUsedQuestionIds((prev) => [...prev, chosenQuestion.id]);
    setActiveQuestion(chosenQuestion);
    setCurrentQuizNumber((prev) => Math.min(10, prev));
    setMysteryBoxState((prev) => ({ ...prev, pendingBoxId: boxId }));
    setGameStatus('quiz');
  };

  // Close Quiz Modal and resume
  const handleCloseQuiz = (wasCorrect: boolean) => {
    setActiveQuestion(null);
    setCurrentQuizNumber((prev) => prev + 1);
    setMysteryBoxState((prev) => ({
      ...prev,
      wasCorrect,
      triggerEffect: true,
    }));
    setGameStatus('playing');
  };

  const handleResetTriggerEffect = () => {
    setMysteryBoxState({
      pendingBoxId: null,
      wasCorrect: null,
      triggerEffect: false,
    });
  };

  // Handle Win (Finished stage at flagpole 🏁)
  const handleWin = async () => {
    setGameStatus('won');
    const finalEntry: LeaderboardEntry = {
      playerName: playerName.trim() || 'Hero ⭐',
      race: selectedRace,
      score,
      timeSeconds,
      formattedTime: formatSeconds(timeSeconds),
      status: 'WON',
      timestamp: new Date().toLocaleDateString('th-TH'),
    };

    const res = await submitScore(finalEntry);
    if (res.leaderboard) {
      setLeaderboard(res.leaderboard);
    }
  };

  // Handle Game Over (Died from damage or falling in pit)
  const handleGameOver = async () => {
    setGameStatus('gameover');
    const finalEntry: LeaderboardEntry = {
      playerName: playerName.trim() || 'Hero ⭐',
      race: selectedRace,
      score,
      timeSeconds,
      formattedTime: formatSeconds(timeSeconds),
      status: 'LOST',
      timestamp: new Date().toLocaleDateString('th-TH'),
    };

    const res = await submitScore(finalEntry);
    if (res.leaderboard) {
      setLeaderboard(res.leaderboard);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-[#FFD1A9] text-[#2D2D2D] font-sans flex flex-col justify-between relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Geometric Balance Background Hill Silhouettes */}
      <div className="fixed bottom-0 left-0 w-full h-[28%] bg-[#8B4513] border-t-4 border-[#552A0C] pointer-events-none z-0">
        <div className="w-full h-7 bg-[#4ADE80] flex items-center px-4 border-b-2 border-[#16a34a]">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 bg-white/30 rounded-full"></div>
            <div className="w-3.5 h-3.5 bg-white/30 rounded-full"></div>
            <div className="w-3.5 h-3.5 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[28%] left-0 w-full h-[140px] opacity-35 pointer-events-none z-0">
        <div className="flex items-end justify-around h-full w-full max-w-7xl mx-auto px-4">
          <div className="w-48 h-48 bg-[#F97316] rounded-t-full"></div>
          <div className="w-64 h-64 bg-[#EA580C] rounded-t-full translate-x-12"></div>
          <div className="w-40 h-40 bg-[#FB923C] rounded-t-full -translate-x-8"></div>
          <div className="w-56 h-56 bg-[#F97316] rounded-t-full translate-x-4"></div>
        </div>
      </div>

      {/* Floating Geometric Decorative Emojis */}
      <div className="fixed top-12 right-[8%] text-6xl opacity-20 pointer-events-none select-none z-0">🎁</div>
      <div className="fixed top-1/2 left-[4%] text-4xl opacity-20 pointer-events-none select-none z-0">🐝</div>
      <div className="fixed bottom-36 right-[5%] text-5xl opacity-20 pointer-events-none select-none z-0">🐸</div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Start Screen Mode */}
        {gameStatus === 'start' && (
          <div className="w-full max-w-5xl my-auto">
            <StartScreen
              playerName={playerName}
              setPlayerName={setPlayerName}
              selectedRace={selectedRace}
              setSelectedRace={setSelectedRace}
              leaderboard={leaderboard}
              isLoadingLeaderboard={isLoadingLeaderboard}
              onRefreshLeaderboard={refreshLeaderboardData}
              onStartGame={handleStartGame}
              onOpenAppsScriptModal={() => setShowAppsScriptModal(true)}
            />
          </div>
        )}

        {/* Playing / Quiz / Active Game Arena Mode */}
        {(gameStatus === 'playing' ||
          gameStatus === 'quiz' ||
          gameStatus === 'won' ||
          gameStatus === 'gameover') && (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center my-auto">
            {/* Main Stage Frame with Geometric Balance styling */}
            <div className="w-full bg-white border-4 border-black rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col">
              {/* Top HUD */}
              <HUD
                hearts={hearts}
                maxHearts={3}
                score={score}
                timeSeconds={timeSeconds}
                formattedTime={formatSeconds(timeSeconds)}
                playerX={playerXPos}
                race={selectedRace}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />

              {/* Canvas Stage */}
              <GameCanvas
                race={selectedRace}
                hearts={hearts}
                setHearts={setHearts}
                score={score}
                setScore={setScore}
                setPlayerXPos={setPlayerXPos}
                isPaused={gameStatus === 'quiz' || gameStatus === 'won' || gameStatus === 'gameover'}
                onHitMysteryBox={handleHitMysteryBox}
                onWin={handleWin}
                onGameOver={handleGameOver}
                mysteryBoxState={mysteryBoxState}
                resetTriggerEffect={handleResetTriggerEffect}
                inputs={inputs}
              />

              {/* Virtual Touch Controller for Mobile / Touchscreens */}
              <MobileControls
                onLeftStart={() => setInputs((prev) => ({ ...prev, left: true }))}
                onLeftEnd={() => setInputs((prev) => ({ ...prev, left: false }))}
                onRightStart={() => setInputs((prev) => ({ ...prev, right: true }))}
                onRightEnd={() => setInputs((prev) => ({ ...prev, right: false }))}
                onJumpStart={() => setInputs((prev) => ({ ...prev, jump: true }))}
                onJumpEnd={() => setInputs((prev) => ({ ...prev, jump: false }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Geometric Controls Helper Footer (visible when playing on desktop) */}
      {(gameStatus === 'playing' || gameStatus === 'start') && (
        <footer className="relative z-20 py-2 sm:py-3 flex justify-center items-center gap-3">
          <div className="flex items-center gap-2 bg-black text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-white shadow-md">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">ARROWS / A D</span>
            <span className="font-bold text-xs uppercase tracking-wider">To Move</span>
          </div>
          <div className="flex items-center gap-2 bg-black text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border-2 border-white shadow-md">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold">SPACE / W</span>
            <span className="font-bold text-xs uppercase tracking-wider">To Jump</span>
          </div>
        </footer>
      )}

      {/* Quiz Modal */}
      {gameStatus === 'quiz' && activeQuestion && (
        <QuizModal
          question={activeQuestion}
          questionNumber={currentQuizNumber}
          totalQuestions={10}
          onClose={handleCloseQuiz}
        />
      )}

      {/* Game Over / Victory Modal */}
      {(gameStatus === 'won' || gameStatus === 'gameover') && (
        <GameOverModal
          isWon={gameStatus === 'won'}
          score={score}
          timeSeconds={timeSeconds}
          formattedTime={formatSeconds(timeSeconds)}
          race={selectedRace}
          playerName={playerName}
          leaderboard={leaderboard}
          onRestart={handleStartGame}
          onGoHome={() => setGameStatus('start')}
        />
      )}

      {/* Google Apps Script Modal */}
      {showAppsScriptModal && (
        <AppsScriptModal onClose={() => setShowAppsScriptModal(false)} />
      )}
    </div>
  );
}
