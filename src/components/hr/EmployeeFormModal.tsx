import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Calculator, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Info,
  MapPin
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, LocationType, WfhGroup, Role } from '../../types';
import { calculateVacationQuota } from '../../utils/leaveCalculator';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit
}) => {
  const { employees, addEmployee, updateEmployee, showToast } = useApp();

  const isEditMode = Boolean(employeeToEdit);

  // Form State
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [department, setDepartment] = useState('Software Engineering');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<Role>('EMPLOYEE');
  const [managerId, setManagerId] = useState('');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [isPassedProbation, setIsPassedProbation] = useState(true);
  const [passProbationDate, setPassProbationDate] = useState('2026-06-01');
  const [isAppointedJan1, setIsAppointedJan1] = useState(false);
  const [locationType, setLocationType] = useState<LocationType>('HYBRID');
  const [wfhGroup, setWfhGroup] = useState<WfhGroup>('GROUP_A');
  const [customWfhDays, setCustomWfhDays] = useState<number[]>([1, 2]);
  
  // Manual Override State
  const [enableOverride, setEnableOverride] = useState(false);
  const [overrideDays, setOverrideDays] = useState<number>(6.0);

  // Load employee data when editing
  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setNameEn(employeeToEdit.nameEn || '');
      setDepartment(employeeToEdit.department);
      setPosition(employeeToEdit.position);
      setRole(employeeToEdit.role);
      setManagerId(employeeToEdit.managerId || '');
      setStartDate(employeeToEdit.startDate);
      setIsPassedProbation(employeeToEdit.isPassedProbation);
      setPassProbationDate(employeeToEdit.passProbationDate);
      setIsAppointedJan1(employeeToEdit.isAppointedJan1 || false);
      setLocationType(employeeToEdit.locationType);
      setWfhGroup(employeeToEdit.wfhGroup);
      setCustomWfhDays(employeeToEdit.customWfhDays || [1, 2]);
      
      if (employeeToEdit.vacationQuotaOverride !== undefined && employeeToEdit.vacationQuotaOverride !== null) {
        setEnableOverride(true);
        setOverrideDays(employeeToEdit.vacationQuotaOverride);
      } else {
        setEnableOverride(false);
        setOverrideDays(6.0);
      }
    } else {
      // Default new employee
      setName('');
      setNameEn('');
      setDepartment('Software Engineering');
      setPosition('');
      setRole('EMPLOYEE');
      setManagerId(employees.find(e => e.role === 'MANAGER')?.id || '');
      setStartDate('2026-03-01');
      setIsPassedProbation(true);
      setPassProbationDate('2026-06-01');
      setIsAppointedJan1(false);
      setLocationType('HYBRID');
      setWfhGroup('GROUP_A');
      setCustomWfhDays([1, 2]);
      setEnableOverride(false);
      setOverrideDays(6.0);
    }
  }, [employeeToEdit, isOpen, employees]);

  // Adjust WFH group when locationType changes
  const handleLocationChange = (loc: LocationType) => {
    setLocationType(loc);
    if (loc === 'REMOTE_100') {
      setWfhGroup('REMOTE_100');
    } else if (wfhGroup === 'REMOTE_100') {
      setWfhGroup('GROUP_A');
    }
  };

  // Real-time live vacation quota calculation preview!
  const previewEmp: Employee = {
    id: employeeToEdit?.id || 'temp-id',
    name: name || 'พนักงานใหม่',
    department,
    position,
    role,
    managerId,
    startDate,
    isPassedProbation,
    passProbationDate,
    isAppointedJan1,
    locationType,
    wfhGroup,
    customWfhDays,
    usedLeave: employeeToEdit?.usedLeave || { sick: 0, personal: 0, vacation: 0 },
    vacationQuotaOverride: enableOverride ? overrideDays : null,
  };

  const vacationCalculation = calculateVacationQuota(previewEmp, 2026);

  const toggleCustomDay = (dayNum: number) => {
    if (customWfhDays.includes(dayNum)) {
      setCustomWfhDays(customWfhDays.filter(d => d !== dayNum));
    } else {
      setCustomWfhDays([...customWfhDays, dayNum].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !position.trim()) {
      showToast('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อ-นามสกุล และตำแหน่งพนักงาน');
      return;
    }

    const payload = {
      name,
      nameEn,
      department,
      position,
      role,
      managerId,
      startDate,
      isPassedProbation,
      passProbationDate,
      isAppointedJan1,
      locationType,
      wfhGroup,
      customWfhDays,
      vacationQuotaOverride: enableOverride ? Number(overrideDays) : null,
      usedLeave: employeeToEdit?.usedLeave || { sick: 0, personal: 0, vacation: 0 }
    };

    if (isEditMode && employeeToEdit) {
      updateEmployee(employeeToEdit.id, payload);
    } else {
      addEmployee(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `แก้ไขข้อมูลพนักงาน: ${employeeToEdit?.name}` : 'เพิ่มพนักงานใหม่ (Add Employee)'}
      subtitle="ระบบจะคำนวณสิทธิ์วันลาพักร้อนอัตโนมัติตามเกณฑ์บริษัทแบบ Real-time"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Section 1: Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              ชื่อ - นามสกุล (ภาษาไทย) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นายสมคิด จิตดี"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              ชื่อภาษาอังกฤษ (Full Name EN)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Somkid Jitdee"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              ตำแหน่ง (Position) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="เช่น Senior Fullstack Developer"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              แผนก (Department) <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="DevOps & Infrastructure">DevOps & Infrastructure</option>
              <option value="QA & Testing">QA & Testing</option>
              <option value="People & Culture">People & Culture (HR)</option>
              <option value="Engineering Leadership">Engineering Leadership</option>
            </select>
          </div>
        </div>

        {/* Section 2: Role & Manager */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              สิทธิ์การใช้งาน (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="EMPLOYEE">พนักงานทั่วไป (EMPLOYEE)</option>
              <option value="MANAGER">หัวหน้างาน / PM (MANAGER)</option>
              <option value="HR">ผู้ดูแลระบบ / HR (HR)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              หัวหน้างานที่อนุมัติ (Assigned Manager)
            </label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- ไม่ระบุ (สำหรับผู้บริหารระดับสูง) --</option>
              {employees.filter(e => e.id !== employeeToEdit?.id).map(mgr => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.name} ({mgr.position})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Dates & Probation (Crucial for Section 3.2 Vacation Rules) */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              ประวัติการเริ่มงาน & การทดลองงาน (Probation & Tenure)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                วันที่เริ่มงาน (Start Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                วันที่ผ่านทดลองงาน (Pass Probation Date)
              </label>
              <input
                type="date"
                value={passProbationDate}
                onChange={(e) => setPassProbationDate(e.target.value)}
                disabled={!isPassedProbation}
                className={`w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  !isPassedProbation ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isPassedProbation}
                onChange={(e) => setIsPassedProbation(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>ผ่านการทดลองงานแล้ว (Passed Probation)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isAppointedJan1}
                onChange={(e) => setIsAppointedJan1(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>เงื่อนไขพิเศษ: บรรจุเป็นพนักงานประจำวันที่ 1 ม.ค. (ได้ 6.0 วันใน Year 0)</span>
            </label>
          </div>

          {/* Live Vacation Calculation Preview Box */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl border border-indigo-200/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                ผลการคำนวณสิทธิ์พักร้อนอัตโนมัติ (Live Preview):
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                {vacationCalculation.tierLabel}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-indigo-100">
              <div className="space-y-0.5">
                <p className="text-slate-600 text-[11px]">
                  {vacationCalculation.explanation}
                </p>
                <p className="text-[10px] font-mono text-indigo-800">
                  สูตร: {vacationCalculation.breakdown}
                </p>
              </div>

              <div className="text-right flex-shrink-0 ml-3">
                <span className="text-2xl font-black text-indigo-700">
                  {vacationCalculation.calculatedDays}
                </span>
                <span className="text-xs text-slate-600 font-normal ml-1">วัน</span>
              </div>
            </div>
          </div>

          {/* Manual Quota Override */}
          <div className="pt-2 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableOverride}
                  onChange={(e) => setEnableOverride(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <span>กำหนดสิทธิ์วันลาพักร้อนด้วยตนเอง (Manual Quota Override)</span>
              </label>

              {enableOverride && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={overrideDays}
                    onChange={(e) => setOverrideDays(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs font-bold text-center rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs text-slate-500">วัน</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Location & WFH Group */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            สถานที่ปฏิบัติงาน & กลุ่ม WFH (Work Location & Schedule)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ประเภทสถานที่ (Location Type)
              </label>
              <select
                value={locationType}
                onChange={(e) => handleLocationChange(e.target.value as LocationType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HYBRID">กรุงเทพฯ & ปริมณฑล (Hybrid 2-3 วัน)</option>
                <option value="REMOTE_100">ต่างจังหวัด 100% (Remote ทำงานที่บ้าน)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                กลุ่มตาราง WFH (WFH Group)
              </label>
              <select
                value={wfhGroup}
                disabled={locationType === 'REMOTE_100'}
                onChange={(e) => setWfhGroup(e.target.value as WfhGroup)}
                className={`w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  locationType === 'REMOTE_100' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                }`}
              >
                <option value="GROUP_A">Group A: WFH จ.-อ. | ออฟฟิศ พ.-ศ.</option>
                <option value="GROUP_B">Group B: WFH อ.-พ. | ออฟฟิศ จ., พฤ.-ศ.</option>
                <option value="CUSTOM">Custom: กำหนดวัน WFH ประจำรายบุคคล (แล้วแต่คน)</option>
                <option value="REMOTE_100">REMOTE_100: WFH ทุกวัน (จันทร์-ศุกร์)</option>
              </select>
            </div>
          </div>

          {/* Custom Days Selector if CUSTOM is selected */}
          {wfhGroup === 'CUSTOM' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs font-semibold text-amber-900 block mb-2">
                เลือกวันที่กำหนดให้เป็นวัน WFH ประจำสัปดาห์:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 1, label: 'วันจันทร์' },
                  { id: 2, label: 'วันอังคาร' },
                  { id: 3, label: 'วันพุธ' },
                  { id: 4, label: 'วันพฤหัสบดี' },
                  { id: 5, label: 'วันศุกร์' },
                ].map(day => {
                  const isChecked = customWfhDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleCustomDay(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
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
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
          >
            {isEditMode ? 'บันทึกการแก้ไข' : 'ยืนยันเพิ่มพนักงาน'}
          </button>
        </div>

      </form>
    </Modal>
  );
};
