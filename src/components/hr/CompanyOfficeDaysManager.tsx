import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Plus, 
  Trash2, 
  Users, 
  MapPin, 
  Coins, 
  CheckCircle2, 
  Sparkles,
  Info,
  CalendarCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { CompanyOfficeTargetType } from '../../types';
import { formatThaiDate } from '../../utils/dateUtils';

export const CompanyOfficeDaysManager: React.FC = () => {
  const { 
    companyOfficeDays, 
    addCompanyOfficeDay, 
    deleteCompanyOfficeDay, 
    employees, 
    showToast 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState('2026-10-23');
  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<CompanyOfficeTargetType>('ALL');
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleToggleEmp = (id: string) => {
    if (selectedEmpIds.includes(id)) {
      setSelectedEmpIds(selectedEmpIds.filter(e => e !== id));
    } else {
      setSelectedEmpIds([...selectedEmpIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อกิจกรรมหรือหัวข้อการอบรม');
      return;
    }

    if (targetType === 'CUSTOM' && selectedEmpIds.length === 0) {
      showToast('error', 'กรุณาเลือกพนักงาน', 'กรุณาเลือกพนักงานอย่างน้อย 1 คนสำหรับกลุ่มเป้าหมายนี้');
      return;
    }

    addCompanyOfficeDay({
      date,
      title,
      targetType,
      targetEmployeeIds: targetType === 'CUSTOM' ? selectedEmpIds : undefined,
      notes: notes || undefined,
    });

    setTitle('');
    setNotes('');
    setIsModalOpen(false);
  };

  const getTargetBadge = (type: CompanyOfficeTargetType, empIds?: string[]) => {
    switch (type) {
      case 'ALL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Users className="w-3 h-3" />
            พนักงานทุกคน (รวม ตจว. 100%)
          </span>
        );
      case 'HYBRID':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Building2 className="w-3 h-3" />
            เฉพาะพนักงาน กทม. (Hybrid)
          </span>
        );
      case 'CUSTOM':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Users className="w-3 h-3" />
            รายบุคคล ({empIds?.length || 0} คน)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-indigo-600" />
              <span>กำหนดวันเข้าออฟฟิศพิเศษ / วันอบรมรวม (Company Office & Training Days)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {companyOfficeDays.length} วัน
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดวันเข้าออฟฟิศพร้อมกันสำหรับงานอบรมหรือประชุมใหญ่ ระบบจะอัปเดตตารางพนักงานและคำนวณเบี้ยเลี้ยงให้พนักงานต่างจังหวัดอัตโนมัติ
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มวันอบรม/เข้าออฟฟิศรวม</span>
        </button>
      </div>

      {/* List of Company Days */}
      {companyOfficeDays.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
          ยังไม่มีการกำหนดวันเข้าออฟฟิศพิเศษ กดปุ่ม "+ เพิ่มวันอบรม/เข้าออฟฟิศรวม" ด้านบนเพื่อประกาศ
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {companyOfficeDays.map(day => (
            <div
              key={day.id}
              className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      📅
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {day.title}
                      </h4>
                      <span className="text-xs font-semibold text-indigo-700">
                        {formatThaiDate(day.date)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`ยืนยันการยกเลิกวันเข้าออฟฟิศพิเศษ "${day.title}"?`)) {
                        deleteCompanyOfficeDay(day.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="ลบรายการ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {getTargetBadge(day.targetType, day.targetEmployeeIds)}
                  {day.targetType === 'ALL' && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-500" />
                      ตจว. ได้รับเบี้ยเลี้ยงอัตโนมัติ
                    </span>
                  )}
                </div>

                {day.notes && (
                  <p className="text-xs text-slate-600 mt-2 bg-white/80 p-2 rounded-lg border border-slate-100 leading-relaxed">
                    📝 {day.notes}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>กำหนดโดย: {day.createdBy}</span>
                <span>บันทึกเมื่อ: {day.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to add Company Office Day */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="กำหนดวันเข้าออฟฟิศพิเศษ / วันอบรมรวม (Mandatory Office Day)"
        subtitle="ระบบจะเปลี่ยนตารางเข้างานของกลุ่มเป้าหมายเป็นเข้าออฟฟิศ และบันทึกเบี้ยเลี้ยงให้พนักงานต่างจังหวัดอัตโนมัติ"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              วันที่กำหนดเข้าออฟฟิศ (Date) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              ชื่องาน / กิจกรรม (Event Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น อบรมประจำปี 2026, ประชุม Townhall Q4..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              กลุ่มเป้าหมาย (Target Group) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'ALL'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-xs text-indigo-950 block">พนักงานทุกคน</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">รวมต่างจังหวัด 100%</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('HYBRID')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'HYBRID'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-xs text-indigo-950 block">เฉพาะ กทม.</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">กลุ่ม Hybrid เท่านั้น</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('CUSTOM')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetType === 'CUSTOM'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-xs text-indigo-950 block">เลือกรายบุคคล</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">ระบุพนักงานเจาะจง</span>
              </button>
            </div>
          </div>

          {/* If CUSTOM is selected, show employee selector */}
          {targetType === 'CUSTOM' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                เลือกพนักงานที่ต้องการให้เข้าออฟฟิศ ({selectedEmpIds.length} คน):
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                {employees.map(emp => {
                  const isChecked = selectedEmpIds.includes(emp.id);
                  return (
                    <label key={emp.id} className="flex items-center gap-2 pt-1 text-xs text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEmp(emp.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                      />
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-slate-400 text-[11px]">({emp.position})</span>
                      {emp.locationType === 'REMOTE_100' && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 rounded">ตจว.</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              หมายเหตุ / รายละเอียดเพิ่มเติม (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น มีอาหารกลางวันจัดเลี้ยง, ขอให้เตรียมอุปกรณ์แล็ปท็อปมาด้วย..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
            >
              ประกาศกำหนดวันเข้าออฟฟิศ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
