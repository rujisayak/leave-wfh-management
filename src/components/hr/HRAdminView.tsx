import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  Sparkles, 
  MapPin, 
  Building2,
  CalendarCheck,
  Coins,
  CalendarDays
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmployeeMasterTable } from './EmployeeMasterTable';
import { CompanyLogsExport } from './CompanyLogsExport';
import { EmployeeFormModal } from './EmployeeFormModal';
import { CompanyOfficeDaysManager } from './CompanyOfficeDaysManager';
import { AllowanceSummarySection } from './AllowanceSummarySection';
import { Employee } from '../../types';

export const HRAdminView: React.FC = () => {
  const { employees, leaveRequests, wfhSwaps, remoteCheckIns, companyOfficeDays } = useApp();
  const [activeTab, setActiveTab] = useState<'MASTER' | 'COMPANY_DAYS' | 'ALLOWANCE' | 'LOGS'>('MASTER');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const hybridCount = employees.filter(e => e.locationType === 'HYBRID').length;
  const remoteCount = employees.filter(e => e.locationType === 'REMOTE_100').length;
  const probationCount = employees.filter(e => !e.isPassedProbation).length;

  const totalPending = leaveRequests.filter(r => r.status === 'PENDING').length +
                       wfhSwaps.filter(s => s.status === 'PENDING').length +
                       remoteCheckIns.filter(r => r.status === 'PENDING').length;

  const handleOpenEdit = (emp: Employee) => {
    setEmployeeToEdit(emp);
  };

  return (
    <div className="space-y-6">
      
      {/* HR Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">พนักงานทั้งหมด</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{employees.length} <span className="text-xs font-normal text-slate-500">คน</span></div>
          <div className="text-[11px] text-slate-500 mt-1">
            ผ่านโปร {employees.length - probationCount} | ทดลองงาน {probationCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">กทม. Hybrid (2-3 วัน)</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{hybridCount} <span className="text-xs font-normal text-slate-500">คน</span></div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">
            มีสิทธิ์ขอสลับวัน WFH
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">ต่างจังหวัด 100% Remote</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{remoteCount} <span className="text-xs font-normal text-slate-500">คน</span></div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            มีสิทธิ์เบิกเบี้ยเลี้ยงเดินทาง
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">คำขอรอพิจารณา</span>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{totalPending} <span className="text-xs font-normal text-slate-500">รายการ</span></div>
          <div className="text-[11px] text-slate-500 mt-1">
            ลางาน, WFH Swap & ตจว.
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('MASTER')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'MASTER'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ทะเบียนพนักงาน (Master Data)</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPANY_DAYS')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'COMPANY_DAYS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>📢 วันเข้าออฟฟิศพิเศษ / อบรมรวม ({companyOfficeDays.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALLOWANCE')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'ALLOWANCE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>💰 สรุปเบี้ยเลี้ยงเข้าออฟฟิศ (All Staff)</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'LOGS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>ประวัติคำขอทั้งองค์กร & ส่งออก CSV</span>
        </button>
      </div>

      {/* View Content */}
      {activeTab === 'MASTER' && (
        <EmployeeMasterTable
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenEditModal={handleOpenEdit}
        />
      )}

      {activeTab === 'COMPANY_DAYS' && (
        <CompanyOfficeDaysManager />
      )}

      {activeTab === 'ALLOWANCE' && (
        <AllowanceSummarySection />
      )}

      {activeTab === 'LOGS' && (
        <CompanyLogsExport />
      )}

      {/* Add / Edit Modal */}
      <EmployeeFormModal
        isOpen={isAddModalOpen || Boolean(employeeToEdit)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEmployeeToEdit(null);
        }}
        employeeToEdit={employeeToEdit}
      />

    </div>
  );
};
