import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  Paperclip, 
  AlertCircle, 
  Clock, 
  Palmtree, 
  ThermometerSnowflake, 
  UserCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { LeaveType, LeaveDurationType } from '../../types';
import { getEmployeeLeaveSummary } from '../../utils/leaveCalculator';
import { countWorkingDays, formatThaiDate } from '../../utils/dateUtils';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { currentEmployee, addLeaveRequest, showToast } = useApp();
  const summary = getEmployeeLeaveSummary(currentEmployee);

  const [leaveType, setLeaveType] = useState<LeaveType>('VACATION');
  const [durationType, setDurationType] = useState<LeaveDurationType>('FULL');
  const [startDate, setStartDate] = useState<string>(initialDate || '2026-10-21');
  const [endDate, setEndDate] = useState<string>(initialDate || '2026-10-21');
  const [reason, setReason] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialDate) {
      setStartDate(initialDate);
      setEndDate(initialDate);
    }
  }, [initialDate, isOpen]);

  // If probationary, default to SICK instead of VACATION
  useEffect(() => {
    if (!currentEmployee.isPassedProbation && leaveType === 'VACATION') {
      setLeaveType('SICK');
    }
  }, [currentEmployee, leaveType]);

  // Adjust endDate when half-day is selected
  useEffect(() => {
    if (durationType !== 'FULL') {
      setEndDate(startDate);
    }
  }, [durationType, startDate]);

  // Calculate calculated total days
  let calculatedDays = 0;
  if (durationType === 'FULL') {
    calculatedDays = countWorkingDays(startDate, endDate);
  } else {
    calculatedDays = 0.5;
  }

  // Quota validation
  let currentQuotaRemaining = 0;
  if (leaveType === 'VACATION') currentQuotaRemaining = summary.vacation.remaining;
  if (leaveType === 'SICK') currentQuotaRemaining = summary.sick.remaining;
  if (leaveType === 'PERSONAL') currentQuotaRemaining = summary.personal.remaining;

  const isExceedingQuota = calculatedDays > currentQuotaRemaining;
  const isProbationVacationBlocked = leaveType === 'VACATION' && !currentEmployee.isPassedProbation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('error', 'กรุณาระบุข้อมูล', 'กรุณาระบุเหตุผลการขอลางาน');
      return;
    }

    if (calculatedDays <= 0) {
      showToast('error', 'ช่วงวันที่ไม่ถูกต้อง', 'กรุณาเลือกวันทำงานปกติอย่างน้อย 1 วัน');
      return;
    }

    if (isExceedingQuota) {
      showToast('error', 'โควตาไม่เพียงพอ', `คุณมีวันลาคงเหลือเพียง ${currentQuotaRemaining} วัน แต่ขอลา ${calculatedDays} วัน`);
      return;
    }

    if (isProbationVacationBlocked) {
      showToast('error', 'ไม่สามารถขอลาพักร้อนได้', 'พนักงานอยู่ระหว่างทดลองงานยังไม่ได้รับสิทธิ์ลาพักร้อน');
      return;
    }

    setIsSubmitting(true);
    const result = addLeaveRequest({
      leaveType,
      durationType,
      totalDays: calculatedDays,
      startDate,
      endDate: durationType === 'FULL' ? endDate : startDate,
      reason,
      attachmentUrl: attachmentUrl || undefined,
    });

    setIsSubmitting(false);
    if (result.success) {
      setReason('');
      setAttachmentUrl('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="แบบฟอร์มยื่นขอลางาน (Leave Request)"
      subtitle={`ผู้ยื่นคำขอ: ${currentEmployee.name} (${currentEmployee.position})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Leave Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            ประเภทการลา (Leave Type) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Vacation */}
            <button
              type="button"
              disabled={isProbationVacationBlocked}
              onClick={() => setLeaveType('VACATION')}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                leaveType === 'VACATION'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : isProbationVacationBlocked
                  ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
                <Palmtree className="w-4 h-4" />
                <span className="text-xs font-bold">ลาพักร้อน</span>
              </div>
              <div className="text-[11px] text-slate-500">
                คงเหลือ: <strong className="text-slate-800">{summary.vacation.remaining}</strong> วัน
              </div>
              {isProbationVacationBlocked && (
                <span className="text-[9px] text-rose-600 font-semibold block mt-0.5">
                  ติดโปรโมชั่น/ทดลองงาน
                </span>
              )}
            </button>

            {/* Sick */}
            <button
              type="button"
              onClick={() => setLeaveType('SICK')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leaveType === 'SICK'
                  ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                <ThermometerSnowflake className="w-4 h-4" />
                <span className="text-xs font-bold">ลาป่วย</span>
              </div>
              <div className="text-[11px] text-slate-500">
                คงเหลือ: <strong className="text-slate-800">{summary.sick.remaining}</strong> วัน
              </div>
            </button>

            {/* Personal */}
            <button
              type="button"
              onClick={() => setLeaveType('PERSONAL')}
              className={`p-3 rounded-xl border text-left transition-all ${
                leaveType === 'PERSONAL'
                  ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-bold">ลากิจ</span>
              </div>
              <div className="text-[11px] text-slate-500">
                คงเหลือ: <strong className="text-slate-800">{summary.personal.remaining}</strong> วัน
              </div>
            </button>
          </div>
        </div>

        {/* 2. Duration Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            ช่วงเวลาการลา (Duration Unit) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDurationType('FULL')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                durationType === 'FULL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              เต็มวัน (1.0 วัน)
            </button>
            <button
              type="button"
              onClick={() => setDurationType('HALF_MORNING')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                durationType === 'HALF_MORNING'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ครึ่งเช้า (0.5 วัน)
            </button>
            <button
              type="button"
              onClick={() => setDurationType('HALF_AFTERNOON')}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center ${
                durationType === 'HALF_AFTERNOON'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              ครึ่งบ่าย (0.5 วัน)
            </button>
          </div>
        </div>

        {/* 3. Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              วันที่เริ่มต้น (Start Date) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              วันที่สิ้นสุด (End Date) {durationType !== 'FULL' && '(ตรงกับวันเริ่มต้น)'}
            </label>
            <input
              type="date"
              value={endDate}
              disabled={durationType !== 'FULL'}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className={`w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                durationType !== 'FULL' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
              required
            />
          </div>
        </div>

        {/* Summary of calculation & Quota validation alert */}
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
          isExceedingQuota 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
        }`}>
          <div>
            <span className="font-semibold">จำนวนวันที่ขอลา:</span>{' '}
            <strong className="text-sm font-bold">{calculatedDays} วันทำงาน</strong>
            <span className="text-slate-500 ml-1.5">(โควตาคงเหลือ {currentQuotaRemaining} วัน)</span>
          </div>
          {isExceedingQuota ? (
            <span className="font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> เกินโควตาที่มี
            </span>
          ) : (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> โควตาเพียงพอ
            </span>
          )}
        </div>

        {/* 4. Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            เหตุผลการขอลางาน (Reason) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="โปรดระบุรายละเอียดความจำเป็น เช่น นัดพบแพทย์, ลาพักผ่อน, จัดการธุระส่วนตัว..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* 5. Attachment Link / File simulation */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              เอกสารแนบ / ใบรับรองแพทย์ (ถ้ามี)
            </span>
            <button
              type="button"
              onClick={() => setAttachmentUrl('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80')}
              className="text-[11px] text-indigo-600 hover:underline"
            >
              + จำลองแนบใบรับรองแพทย์
            </button>
          </label>
          <input
            type="url"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="https://... หรือใส่ลิงก์รูปถ่ายเอกสาร"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {attachmentUrl && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-indigo-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">แนบเอกสารเรียบร้อย: {attachmentUrl}</span>
              <button 
                type="button" 
                onClick={() => setAttachmentUrl('')}
                className="text-slate-400 hover:text-slate-600 ml-auto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
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
            disabled={isSubmitting || isExceedingQuota || isProbationVacationBlocked}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
          >
            {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันส่งคำขอลางาน'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
