import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Home, 
  Building, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  validateWfhSwap, 
  getScheduledWfhDayNumbers, 
  getWfhGroupDescription,
  isNormallyWfhDay 
} from '../../utils/wfhSchedule';
import { 
  getWeekDays, 
  toIsoDate, 
  formatThaiDate, 
  DAY_NAMES_TH_FULL,
  isSameCalendarWeek,
  DAY_NAMES_TH_SHORT
} from '../../utils/dateUtils';

interface WfhSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const WfhSwapModal: React.FC<WfhSwapModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { currentEmployee, addWfhSwapRequest, currentDateStr, wfhSwaps, leaveRequests, showToast } = useApp();
  const groupDesc = getWfhGroupDescription(currentEmployee);

  const initialTargetDate = initialDate || currentDateStr;
  const initialWeekDays = getWeekDays(new Date(initialTargetDate));
  const initialOfficeDays = initialWeekDays.filter(d => !isNormallyWfhDay(currentEmployee, toIsoDate(d)));
  const initialWfhDays = initialWeekDays.filter(d => isNormallyWfhDay(currentEmployee, toIsoDate(d)));

  const defaultReq = initialDate || (initialOfficeDays.length > 0 ? toIsoDate(initialOfficeDays[0]) : toIsoDate(initialWeekDays[0]));
  const defaultComp = initialWfhDays.length > 0 ? toIsoDate(initialWfhDays[0]) : toIsoDate(initialWeekDays[3]);

  const [requestedWfhDate, setRequestedWfhDate] = useState<string>(defaultReq);
  const [compensateOfficeDate, setCompensateOfficeDate] = useState<string>(defaultComp);
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Compute week days dynamically based on requestedWfhDate!
  const targetWeekDays = getWeekDays(new Date(requestedWfhDate || currentDateStr));
  const officeDays = targetWeekDays.filter(d => !isNormallyWfhDay(currentEmployee, toIsoDate(d)));
  const wfhDays = targetWeekDays.filter(d => isNormallyWfhDay(currentEmployee, toIsoDate(d)));

  useEffect(() => {
    if (initialDate) {
      setRequestedWfhDate(initialDate);
      const wkDays = getWeekDays(new Date(initialDate));
      const wDays = wkDays.filter(d => isNormallyWfhDay(currentEmployee, toIsoDate(d)));
      if (wDays.length > 0) {
        setCompensateOfficeDate(toIsoDate(wDays[0]));
      }
    }
  }, [initialDate, isOpen, currentEmployee]);

  // When requestedWfhDate changes, ensure compensateOfficeDate is in the same week
  const handleRequestedDateChange = (newReqDate: string) => {
    setRequestedWfhDate(newReqDate);
    const newWeek = getWeekDays(new Date(newReqDate));
    const newWfhDays = newWeek.filter(d => isNormallyWfhDay(currentEmployee, toIsoDate(d)));
    if (newWfhDays.length > 0) {
      // If current compensateOfficeDate is not in this new week, auto-select first WFH day of new week
      if (!isSameCalendarWeek(newReqDate, compensateOfficeDate)) {
        setCompensateOfficeDate(toIsoDate(newWfhDays[0]));
      }
    }
  };

  // Live validation
  const validation = validateWfhSwap(
    currentEmployee,
    requestedWfhDate,
    compensateOfficeDate,
    wfhSwaps,
    leaveRequests
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('error', 'กรุณาระบุเหตุผล', 'โปรดระบุเหตุผลความจำเป็นในการขอสลับวัน WFH');
      return;
    }

    if (!validation.isValid) {
      showToast('error', 'เงื่อนไขไม่ถูกต้อง', validation.errorMessage || 'ข้อมูลไม่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);
    const result = addWfhSwapRequest({
      requestedWfhDate,
      compensateOfficeDate,
      reason,
    });

    setIsSubmitting(false);
    if (result.success) {
      setReason('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ขอสลับวันทำงาน WFH เฉพาะกิจ (WFH Day-Swap)"
      subtitle={`ผู้ยื่นคำขอ: ${currentEmployee.name} | ${groupDesc.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Banner explaining the swap policy */}
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 text-xs text-indigo-950">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-indigo-900 block">
                กติกาการสลับวัน WFH สำหรับพนักงานกลุ่ม Hybrid:
              </span>
              <p className="text-slate-600 leading-relaxed">
                1. <strong>วันขอ WFH</strong> ต้องเป็นวันที่ปกติคุณต้องเข้าออฟฟิศ
                <br />
                2. <strong>วันเข้าออฟฟิศชดเชย</strong> ต้องเป็นวันที่ปกติคุณ WFH และ<strong>อยู่ภายในสัปดาห์เดียวกัน (จันทร์ - ศุกร์)</strong>
                <br />
                3. <span className="text-emerald-700 font-medium">✨ การสลับวัน WFH ไม่มีการหักโควตาวันลาใดๆ</span>
              </p>
            </div>
          </div>
        </div>

        {/* Current Employee WFH baseline info */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
          <div>
            <span className="text-slate-500">ตารางประจำปัจจุบันของคุณ:</span>{' '}
            <strong className="text-slate-900 font-semibold">{groupDesc.schedule}</strong>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${groupDesc.badge}`}>
            {groupDesc.name}
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Requested WFH Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-purple-600" />
              <span>1. วันที่ขอ WFH เพิ่มเติม</span>
              <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              (วันที่ปกติเป็นวันเข้าออฟฟิศ)
            </p>
            <input
              type="date"
              value={requestedWfhDate}
              onChange={(e) => handleRequestedDateChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />

            {/* Quick helper pills for that week's office days */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block mb-1">
                วันออฟฟิศปกติในสัปดาห์นี้:
              </span>
              <div className="flex flex-wrap gap-1">
                {officeDays.map(d => {
                  const ds = toIsoDate(d);
                  const isSelected = requestedWfhDate === ds;
                  return (
                    <button
                      key={ds}
                      type="button"
                      onClick={() => handleRequestedDateChange(ds)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-sm'
                          : 'bg-white hover:bg-purple-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {DAY_NAMES_TH_SHORT[d.getDay()]} {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Compensate Office Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-600" />
              <span>2. วันที่เข้าออฟฟิศชดเชย</span>
              <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              (ต้องเป็นวัน WFH ในสัปดาห์เดียวกัน)
            </p>
            <input
              type="date"
              value={compensateOfficeDate}
              onChange={(e) => setCompensateOfficeDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />

            {/* Quick helper pills for that week's wfh days */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block mb-1">
                วัน WFH ปกติในสัปดาห์นี้ที่ชดเชยได้:
              </span>
              <div className="flex flex-wrap gap-1">
                {wfhDays.map(d => {
                  const ds = toIsoDate(d);
                  const isSelected = compensateOfficeDate === ds;
                  return (
                    <button
                      key={ds}
                      type="button"
                      onClick={() => setCompensateOfficeDate(ds)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-teal-600 text-white border-teal-600 font-semibold shadow-sm'
                          : 'bg-white hover:bg-teal-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {DAY_NAMES_TH_SHORT[d.getDay()]} {d.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Validation Result Banner */}
        <div className={`p-3.5 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
          validation.isValid 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {validation.isValid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">เงื่อนไขถูกต้อง:</strong> สลับวัน WFH จาก{' '}
                <span className="underline font-semibold">{formatThaiDate(requestedWfhDate)}</span>{' '}
                และเข้าออฟฟิศชดเชยใน{' '}
                <span className="underline font-semibold">{formatThaiDate(compensateOfficeDate)}</span>{' '}
                (อยู่ในสัปดาห์เดียวกัน)
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">เงื่อนไขไม่ถูกต้อง:</strong>{' '}
                <span>{validation.errorMessage}</span>
              </div>
            </>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            เหตุผลความจำเป็นในการสลับวัน (Reason) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="โปรดระบุเหตุผล เช่น ช่างเข้ามาซ่อมแซมที่พักอาศัย, มีนัดรับพัสดุชิ้นใหญ่, มีประชุมกับลูกค้า..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !validation.isValid}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
          >
            {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันส่งคำขอสลับวัน'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
