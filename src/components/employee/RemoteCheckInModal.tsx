import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Coins, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Info,
  MapPin
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { RemotePurposeType } from '../../types';
import { countWorkingDays, formatThaiDate } from '../../utils/dateUtils';

interface RemoteCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const RemoteCheckInModal: React.FC<RemoteCheckInModalProps> = ({
  isOpen,
  onClose,
  initialDate
}) => {
  const { currentEmployee, addRemoteCheckInRequest, showToast } = useApp();

  const [startDate, setStartDate] = useState<string>(initialDate || '2026-10-21');
  const [endDate, setEndDate] = useState<string>(initialDate || '2026-10-21');
  const [purposeType, setPurposeType] = useState<RemotePurposeType>('TRAINING');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialDate) {
      setStartDate(initialDate);
      setEndDate(initialDate);
    }
  }, [initialDate, isOpen]);

  const purposeOptions: Array<{ type: RemotePurposeType; label: string; desc: string }> = [
    { type: 'TRAINING', label: 'เข้าอบรม (Training)', desc: 'เข้าร่วมหลักสูตรอบรม, สัมมนา, หรือเวิร์กช็อป' },
    { type: 'TOWNHALL', label: 'ประชุมบริษัท (Townhall/Meeting)', desc: 'ประชุมวางแผนยุทธศาสตร์, ทาวน์ฮอลล์, หรือประชุมทีม' },
    { type: 'CLIENT_MEETING', label: 'พบลูกค้า / งานภายนอก', desc: 'ร่วมประชุมพบลูกค้า หรือประสานงานพาร์ตเนอร์' },
    { type: 'OTHER', label: 'ภารกิจอื่นๆ (Other)', desc: 'ภารกิจพิเศษอื่นๆ ที่ได้รับมอบหมาย' },
  ];

  const calculatedDays = countWorkingDays(startDate, endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast('error', 'กรุณาระบุรายละเอียด', 'โปรดระบุรายละเอียดภารกิจการเดินทางเข้าออฟฟิศ');
      return;
    }

    if (calculatedDays <= 0) {
      showToast('error', 'ช่วงวันที่ไม่ถูกต้อง', 'กรุณาเลือกวันทำงานปกติอย่างน้อย 1 วัน (จันทร์ - ศุกร์)');
      return;
    }

    const selectedPurpose = purposeOptions.find(p => p.type === purposeType)?.label || 'เข้าปฏิบัติงานที่สำนักงานใหญ่';

    setIsSubmitting(true);
    const res = addRemoteCheckInRequest({
      startDate,
      endDate,
      totalDays: calculatedDays,
      purposeType,
      purposeLabel: selectedPurpose,
      reason,
    });

    setIsSubmitting(false);
    if (res.success) {
      setReason('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="แจ้งเข้าปฏิบัติงานที่ออฟฟิศ (Remote Check-in & Allowance)"
      subtitle={`ผู้ยื่นคำขอ: ${currentEmployee.name} (${currentEmployee.position})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Allowance eligibility banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <Coins className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-900 text-sm">
                  💰 มีสิทธิ์ได้รับเบี้ยเลี้ยงเดินทางเข้าออฟฟิศ (Allowance Eligible)
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                เนื่องจากคุณเป็นพนักงานกลุ่ม <strong>ต่างจังหวัด (100% Remote)</strong> เมื่อได้รับอนุมัติจากหัวหน้างาน ระบบจะบันทึกสถานะเป็น <strong className="text-emerald-700">🏢 เข้าออฟฟิศ (💰 เบี้ยเลี้ยง)</strong> และสะสมยอดวันเข้าออฟฟิศเพื่อนำไปคำนวณจ่ายเบี้ยเลี้ยงสิ้นเดือน
              </p>
            </div>
          </div>
        </div>

        {/* 1. Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              วันที่เริ่มเข้าออฟฟิศ <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate < e.target.value) {
                  setEndDate(e.target.value);
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              วันที่สิ้นสุด <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Calculation summary */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500">จำนวนวันทำงานที่จะเข้าออฟฟิศ:</span>{' '}
            <strong className="text-sm font-bold text-slate-900">{calculatedDays} วัน</strong>
            <span className="text-slate-400 ml-1.5">(เฉพาะวันจันทร์ - ศุกร์)</span>
          </div>
          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            เบี้ยเลี้ยง {calculatedDays} วัน
          </span>
        </div>

        {/* 2. Purpose of travel */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            ประเภทภารกิจ (Purpose Type) <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {purposeOptions.map(p => {
              const isSelected = purposeType === p.type;
              return (
                <button
                  key={p.type}
                  type="button"
                  onClick={() => setPurposeType(p.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={`text-xs font-bold block ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                    {p.label}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                    {p.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            รายละเอียดภารกิจ / กำหนดการ (Details) <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="โปรดระบุรายละเอียด เช่น เข้าร่วมประชุม Townhall ประจำไตรมาส, อบรมระบบกับทีม Platform..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            required
          />
        </div>

        {/* Action buttons */}
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
            disabled={isSubmitting || calculatedDays <= 0}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white shadow-sm transition-all shadow-emerald-600/20 active:scale-95"
          >
            {isSubmitting ? 'กำลังส่งคำขอ...' : 'ยืนยันแจ้งเข้าออฟฟิศ'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
