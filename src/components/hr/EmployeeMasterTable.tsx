import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateVacationQuota, getEmployeeLeaveSummary } from '../../utils/leaveCalculator';
import { getWfhGroupDescription, calculateMonthlyAllowanceDays } from '../../utils/wfhSchedule';
import { formatThaiDate } from '../../utils/dateUtils';
import { Employee } from '../../types';

interface EmployeeMasterTableProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (emp: Employee) => void;
}

export const EmployeeMasterTable: React.FC<EmployeeMasterTableProps> = ({
  onOpenAddModal,
  onOpenEditModal
}) => {
  const { 
    employees, 
    deleteEmployee, 
    remoteCheckIns, 
    companyOfficeDays, 
    leaveRequests, 
    wfhSwaps, 
    showToast 
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');

  const filteredEmployees = employees.filter(emp => {
    if (filterRole !== 'ALL' && emp.role !== filterRole) return false;
    if (filterLocation !== 'ALL' && emp.locationType !== filterLocation) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q) || (emp.nameEn && emp.nameEn.toLowerCase().includes(q));
      const matchPos = emp.position.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchDept) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'ตำแหน่ง',
      'แผนก',
      'บทบาท (Role)',
      'วันที่เริ่มงาน',
      'สถานะผ่านโปร',
      'วันที่ผ่านโปร',
      'ประเภทสถานที่',
      'กลุ่ม WFH',
      'ระดับอายุงาน (Tenure Tier)',
      'โควตาพักร้อนคำนวณ',
      'โควตาพักร้อนสุทธิ',
      'พักร้อนใช้ไป',
      'พักร้อนคงเหลือ',
      'ลาป่วยใช้ไป/30',
      'ลากิจใช้ไป/3'
    ];

    const rows = employees.map(emp => {
      const calc = calculateVacationQuota(emp);
      const summary = getEmployeeLeaveSummary(emp);
      return [
        emp.id,
        emp.name,
        emp.position,
        emp.department,
        emp.role,
        emp.startDate,
        emp.isPassedProbation ? 'ผ่านแล้ว' : 'ทดลองงาน',
        emp.passProbationDate || '-',
        emp.locationType === 'REMOTE_100' ? 'ต่างจังหวัด 100%' : 'กทม. Hybrid',
        emp.wfhGroup,
        calc.tierLabel,
        calc.calculatedDays,
        calc.finalDays,
        summary.vacation.used,
        summary.vacation.remaining,
        `${summary.sick.used}/30`,
        `${summary.personal.used}/3`
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employee_leave_master_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'ส่งออกข้อมูลสำเร็จ', 'ดาวน์โหลดไฟล์ CSV ข้อมูลพนักงานและโควตาวันลาเรียบร้อยแล้ว');
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
      
      {/* Table Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              ทะเบียนข้อมูลพนักงาน & สิทธิ์วันลา (Employee Master Data)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {employees.length} รายการ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการข้อมูลพนักงาน, อายุงาน, วันที่ผ่านทดลองงาน, และระบบคำนวณวันลาพักร้อนอัตโนมัติ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มพนักงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ตำแหน่ง, แผนก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">สิทธิ์ทั้งหมด (All Roles)</option>
            <option value="EMPLOYEE">พนักงานทั่วไป (Employee)</option>
            <option value="MANAGER">หัวหน้างาน (Manager)</option>
            <option value="HR">ฝ่ายบุคคล (HR Admin)</option>
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">สถานที่ทั้งหมด (All Locations)</option>
            <option value="HYBRID">กรุงเทพฯ & ปริมณฑล (Hybrid)</option>
            <option value="REMOTE_100">ต่างจังหวัด (Remote 100%)</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 font-bold min-w-[200px]">พนักงาน</th>
              <th className="py-3 px-3 font-bold min-w-[150px]">เริ่มงาน / ผ่านโปร</th>
              <th className="py-3 px-3 font-bold min-w-[180px]">ระดับอายุงาน & สูตรคำนวณ</th>
              <th className="py-3 px-3 font-bold min-w-[130px] text-center">โควตาพักร้อนสุทธิ</th>
              <th className="py-3 px-3 font-bold min-w-[130px]">กลุ่ม WFH</th>
              <th className="py-3 px-3 font-bold min-w-[140px]">คงเหลือ / ใช้ไป</th>
              <th className="py-3 px-3 font-bold text-center">จัดการ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map(emp => {
              const vacationResult = calculateVacationQuota(emp);
              const summary = getEmployeeLeaveSummary(emp);
              const groupDesc = getWfhGroupDescription(emp);

              return (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Employee Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                        {emp.name.charAt(3) || emp.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {emp.position}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {emp.department}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Start & Probation Date */}
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <div className="font-medium text-slate-800">
                        เริ่ม: {emp.startDate}
                      </div>
                      {emp.isPassedProbation ? (
                        <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>ผ่านโปร: {emp.passProbationDate}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          <span>อยู่ระหว่างทดลองงาน</span>
                        </div>
                      )}
                      {emp.isAppointedJan1 && (
                        <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          บรรจุ 1 ม.ค.
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tenure Tier & Auto-Calculation Result */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        {vacationResult.tierLabel}
                      </span>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {vacationResult.breakdown}
                      </p>
                    </div>
                  </td>

                  {/* Vacation Quota */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-base font-extrabold text-indigo-600">
                        {vacationResult.finalDays}{' '}
                        <span className="text-xs font-normal text-slate-500">วัน</span>
                      </span>
                      {vacationResult.isOverrideApplied && (
                        <span className="text-[9px] px-1 rounded bg-purple-100 text-purple-700 font-bold border border-purple-200">
                          กำหนดเอง
                        </span>
                      )}
                    </div>
                  </td>

                  {/* WFH Group */}
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold border ${groupDesc.badge}`}>
                        {groupDesc.name}
                      </span>
                      <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {groupDesc.schedule}
                      </p>
                      <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <span>💰 เข้าออฟฟิศ ต.ค.: {calculateMonthlyAllowanceDays(emp.id, 2026, 10, remoteCheckIns, companyOfficeDays, employees, leaveRequests, wfhSwaps).totalDays} วัน</span>
                      </div>
                    </div>
                  </td>

                  {/* Remaining / Used */}
                  <td className="py-3 px-3">
                    <div className="text-[11px] space-y-0.5">
                      <div>
                        พักร้อน: <strong className="text-indigo-700">{summary.vacation.remaining}</strong> / {summary.vacation.total}
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        ป่วย: {summary.sick.used}/30 | กิจ: {summary.personal.used}/3
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenEditModal(emp)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="แก้ไขข้อมูลและสิทธิ์วันลา"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`ยืนยันการลบข้อมูลของ ${emp.name}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ลบพนักงาน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
