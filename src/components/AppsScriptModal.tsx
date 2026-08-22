import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE, SHEET_ID, APPS_SCRIPT_URL } from '../utils/googleSheets';
import { Copy, Check, ExternalLink, X, FileCode, Database } from 'lucide-react';

interface AppsScriptModalProps {
  onClose: () => void;
}

export const AppsScriptModal: React.FC<AppsScriptModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      id="apps-script-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none"
    >
      <div className="w-full max-w-2xl bg-white border-[6px] border-black rounded-3xl p-5 sm:p-6 text-[#2D2D2D] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-4 max-h-[90vh] flex flex-col animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b-4 border-black pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 border-2 border-black rounded-xl">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-black tracking-tight uppercase">
                Google Apps Script (Code.gs)
              </h3>
              <p className="text-xs text-black/60 font-semibold">
                ระบบสร้างชีต Leaderboard อัตโนมัติและจัดการคะแนน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border-2 border-black bg-gray-100 hover:bg-gray-200 text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config Info Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#FFF6ED] p-3 rounded-2xl border-2 border-black">
            <span className="text-black/60 font-black block mb-0.5 uppercase tracking-wider">📊 SHEET_ID:</span>
            <code className="text-orange-700 font-mono text-[11px] font-bold break-all select-all">
              {SHEET_ID}
            </code>
          </div>
          <div className="bg-[#FFF6ED] p-3 rounded-2xl border-2 border-black">
            <span className="text-black/60 font-black block mb-0.5 uppercase tracking-wider">🌐 Web App Script URL:</span>
            <a
              href={APPS_SCRIPT_URL}
              target="_blank"
              rel="noreferrer"
              className="text-orange-700 hover:underline font-mono text-[11px] font-bold break-all flex items-center gap-1"
            >
              <span>{APPS_SCRIPT_URL.substring(0, 40)}...</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border-2 border-black p-3.5 rounded-2xl text-xs text-black/80 space-y-1">
          <p className="font-black text-black flex items-center gap-1">
            <span>✨ วิธีการนำไปติดตั้งใน Google Apps Script:</span>
          </p>
          <ol className="list-decimal list-inside space-y-0.5 text-black/70 font-medium">
            <li>เปิด Google Sheet ของคุณ แล้วไปที่เมนู <strong>ส่วนขยาย (Extensions) &gt; Apps Script</strong></li>
            <li>ลบโค้ดเดิมทั้งหมด แล้ววางโค้ดด้านล่างนี้ลงไปใน <code>Code.gs</code></li>
            <li>กด <strong>Deploy (การทำให้ใช้งานได้) &gt; New deployment &gt; Web app</strong></li>
            <li>ตั้งค่า Execute as: <strong>Me</strong> และ Who has access: <strong>Anyone (ทุกคน)</strong></li>
            <li>กด Deploy แล้วจะได้ URL มาใช้งานทันที! ระบบจะสร้างชีต <strong>Leaderboard</strong> ให้อัตโนมัติ</li>
          </ol>
        </div>

        {/* Code View Area */}
        <div className="relative flex-1 overflow-hidden rounded-2xl border-4 border-black bg-slate-950">
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b-2 border-black text-xs text-slate-300">
            <span className="flex items-center gap-1 font-mono font-bold">
              <FileCode className="w-3.5 h-3.5 text-orange-400" /> Code.gs
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกสำเร็จ!' : 'คัดลอกโค้ดทั้งหมด'}</span>
            </button>
          </div>
          <pre className="p-3.5 text-[11px] font-mono text-emerald-300 overflow-y-auto max-h-52 leading-relaxed select-all">
            {GOOGLE_APPS_SCRIPT_CODE}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-black text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer uppercase tracking-wider"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
