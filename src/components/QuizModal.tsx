import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { soundManager } from '../utils/audio';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

interface QuizModalProps {
  question: QuizQuestion;
  questionNumber: number; // 1 to 10
  totalQuestions: number; // 10
  onClose: (wasCorrect: boolean) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onClose,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    setIsAnswered(true);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      soundManager.playQuizCorrect();
    } else {
      soundManager.playQuizWrong();
    }
  };

  const isCorrect = selectedIndex === question.correctIndex;

  const handleContinue = () => {
    onClose(isCorrect);
  };

  return (
    <div
      id="quiz-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      {/* Quiz Card in Neo-Brutalist Geometric Balance */}
      <div
        id="quiz-card"
        className="w-full max-w-xl bg-white text-[#2D2D2D] rounded-3xl border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 select-none"
      >
        {/* Top Header Badge */}
        <div className="bg-orange-500 border-b-4 border-black px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎁</span>
            <span className="font-black text-sm sm:text-base tracking-wider uppercase drop-shadow-sm">
              CEFR B2 MYSTERY QUIZ
            </span>
          </div>
          <div className="bg-white text-black px-3 py-1 rounded-full text-xs sm:text-sm font-black tracking-wider border-2 border-black shadow-sm">
            คำถามข้อที่ {questionNumber} / {totalQuestions} 🍄
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Question Text */}
          <div className="bg-[#FFF6ED] p-4 sm:p-5 rounded-2xl border-4 border-black">
            <div className="text-xs font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> QUESTION:
            </div>
            <p className="text-base sm:text-xl font-black text-slate-900 leading-relaxed">
              {question.question}
            </p>
          </div>

          {/* Hint in grey */}
          <div className="flex items-start gap-2 bg-gray-100 px-4 py-2.5 rounded-xl text-black/80 text-xs sm:text-sm border-2 border-black/20">
            <span className="text-black font-black">💡 คำใบ้ (Hint):</span>
            <span className="italic font-medium">{question.hint}</span>
          </div>

          {/* Options A, B, C, D in vertical layout with yellow answer button */}
          <div className="space-y-2.5 pt-1" id="quiz-options-list">
            {question.options.map((opt, idx) => {
              let btnStyle = 'bg-white border-4 border-black hover:bg-amber-50 shadow-sm';
              let tagStyle = 'bg-black text-white border border-black';

              if (isAnswered) {
                if (idx === question.correctIndex) {
                  // Correct answer
                  btnStyle = 'bg-emerald-100 border-4 border-black ring-4 ring-emerald-300';
                  tagStyle = 'bg-emerald-600 text-white border border-black';
                } else if (idx === selectedIndex) {
                  // Wrong selected answer
                  btnStyle = 'bg-rose-100 border-4 border-black ring-4 ring-rose-300';
                  tagStyle = 'bg-rose-600 text-white border border-black';
                } else {
                  btnStyle = 'bg-gray-100 border-2 border-black/20 opacity-50';
                  tagStyle = 'bg-black/40 text-white';
                }
              }

              return (
                <div
                  key={idx}
                  className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl transition-all duration-200 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 text-left font-bold text-slate-900 text-sm sm:text-base flex-1 pr-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-black ${tagStyle}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt.substring(3)}</span>
                  </div>

                  {/* Yellow Answer Button */}
                  {!isAnswered ? (
                    <button
                      onClick={() => handleSelectOption(idx)}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all whitespace-nowrap cursor-pointer"
                    >
                      กดตอบ
                    </button>
                  ) : (
                    <div className="pl-2">
                      {idx === question.correctIndex && (
                        <span className="flex items-center gap-1 text-emerald-800 font-black text-xs sm:text-sm">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> ถูกต้อง
                        </span>
                      )}
                      {idx === selectedIndex && idx !== question.correctIndex && (
                        <span className="flex items-center gap-1 text-rose-800 font-black text-xs sm:text-sm">
                          <XCircle className="w-5 h-5 text-rose-600" /> ไม่ถูกต้อง
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Box (when answered) */}
          {isAnswered && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border-4 border-black animate-in fade-in slide-in-from-top-2 duration-300 ${
                isCorrect
                  ? 'bg-emerald-100 text-emerald-950 shadow-sm'
                  : 'bg-rose-100 text-rose-950 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-base mb-1.5">
                {isCorrect ? (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-700" />
                    <span className="text-emerald-800">ยอดเยี่ยม! ตอบถูกต้อง 🎉 รับ 10 เหรียญทอง!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-700" />
                    <span className="text-rose-800">ตอบผิดนะ! มาดูคำอธิบายกัน</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed mt-1 font-semibold text-slate-800">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer with Continue Button */}
        {isAnswered && (
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t-4 border-black flex justify-end">
            <button
              onClick={handleContinue}
              id="quiz-continue-btn"
              className="w-full sm:w-auto px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-black text-base sm:text-lg rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <span>เดินทางผจญภัยต่อ</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
