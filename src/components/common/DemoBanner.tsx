import React from 'react';
import { Sparkles, RotateCcw, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoBanner: React.FC = () => {
  const { isDemoMode, resetDemoData, exitDemoMode, currentEmployee } = useApp();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white text-xs py-2.5 px-4 sm:px-6 shadow-md border-b border-indigo-700/50 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Banner Message */}
        <div className="flex items-center gap-2.5 text-center md:text-left flex-wrap justify-center md:justify-start">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-900 shadow-xs uppercase tracking-wide">
            <Sparkles className="w-3 h-3 text-slate-900 animate-spin-slow" />
            Sandbox
          </span>

          <span className="font-semibold text-slate-100 leading-tight">
            ✨ Interactive Demo Mode — Feel free to test all actions! Changes are temporary and won&apos;t affect live data.
          </span>

          <span className="hidden xl:inline-block text-[11px] text-indigo-200/80">
            (เซสชันทดลองเล่น: ข้อมูลบันทึกใน sessionStorage ชั่วคราว)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Active Persona Hint */}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-indigo-200 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
            <span>บทบาท:</span>
            <strong className="text-white font-semibold">{currentEmployee.name}</strong>
          </span>

          {/* Reset Demo Data Button */}
          <button
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-xs transition-all border border-indigo-400/30"
            title="รีเซ็ตข้อมูลจำลองทั้งหมดกลับเป็นค่าเริ่มต้น"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          {/* Exit Demo Button */}
          <button
            onClick={exitDemoMode}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="ออกจากโหมด Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
