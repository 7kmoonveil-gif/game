import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface MobileControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeftStart,
  onLeftEnd,
  onRightStart,
  onRightEnd,
  onJumpStart,
  onJumpEnd,
}) => {
  return (
    <div
      id="mobile-controls-panel"
      className="w-full flex items-center justify-between px-5 py-4 bg-white border-t-[5px] border-black rounded-b-3xl select-none touch-none"
    >
      {/* Left/Right Directional Buttons */}
      <div className="flex items-center gap-3">
        <button
          id="btn-move-left"
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onLeftStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onLeftEnd();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            onLeftEnd();
          }}
          onMouseDown={onLeftStart}
          onMouseUp={onLeftEnd}
          onMouseLeave={onLeftEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-4 border-black active:bg-orange-500 active:text-white active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none flex items-center justify-center text-black font-black transition-all cursor-pointer"
          aria-label="เดินซ้าย"
        >
          <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
        </button>

        <button
          id="btn-move-right"
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onRightStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRightEnd();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            onRightEnd();
          }}
          onMouseDown={onRightStart}
          onMouseUp={onRightEnd}
          onMouseLeave={onRightEnd}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-4 border-black active:bg-orange-500 active:text-white active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none flex items-center justify-center text-black font-black transition-all cursor-pointer"
          aria-label="เดินขวา"
        >
          <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
        </button>
      </div>

      {/* Keyboard Helper Tips (visible on larger screens) */}
      <div className="hidden md:flex items-center gap-2 text-xs font-bold text-black/60 bg-gray-100 px-3.5 py-2 rounded-xl border-2 border-black/20">
        <span>คีย์บอร์ด:</span>
        <kbd className="px-2 py-0.5 rounded-lg bg-white text-black font-mono font-black text-xs border-2 border-black">◀ / ▶</kbd>
        <kbd className="px-2 py-0.5 rounded-lg bg-white text-black font-mono font-black text-xs border-2 border-black">Spacebar (กระโดด)</kbd>
      </div>

      {/* Jump Button */}
      <div>
        <button
          id="btn-jump"
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onJumpStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onJumpEnd();
          }}
          onTouchCancel={(e) => {
            e.preventDefault();
            onJumpEnd();
          }}
          onMouseDown={onJumpStart}
          onMouseUp={onJumpEnd}
          onMouseLeave={onJumpEnd}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-500 hover:bg-orange-600 border-4 border-black active:translate-y-1 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:shadow-none flex flex-col items-center justify-center text-white transition-all cursor-pointer"
          aria-label="กระโดด"
        >
          <ArrowUp className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          <span className="text-[10px] font-black tracking-wider uppercase">JUMP</span>
        </button>
      </div>
    </div>
  );
};
