import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  LayoutGrid, 
  ListCheck,
  Building2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PendingApprovals } from './PendingApprovals';
import { TeamWeeklyMatrix } from './TeamWeeklyMatrix';

export const ManagerView: React.FC = () => {
  const { currentEmployee, leaveRequests, wfhSwaps, employees } = useApp();
  const [subView, setSubView] = useState<'ALL' | 'PENDING' | 'MATRIX'>('ALL');

  // Count pending for this manager
  const isHR = currentEmployee.role === 'HR';
  const myTeamEmpIds = isHR 
    ? employees.map(e => e.id)
    : employees.filter(e => e.managerId === currentEmployee.id || e.id === currentEmployee.id).map(e => e.id);

  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'PENDING' && myTeamEmpIds.includes(lr.empId)).length;
  const pendingSwaps = wfhSwaps.filter(sw => sw.status === 'PENDING' && myTeamEmpIds.includes(sw.empId)).length;
  const totalPending = pendingLeaves + pendingSwaps;

  return (
    <div className="space-y-6">
      
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>การจัดการทีม & ตารางงาน (Team Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ผู้อนุมัติ: {currentEmployee.name} ({currentEmployee.position})
          </p>
        </div>

        {/* Sub-view filters */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setSubView('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subView === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>แสดงทั้งหมด</span>
          </button>

          <button
            onClick={() => setSubView('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subView === 'PENDING'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListCheck className="w-3.5 h-3.5" />
            <span>รอการอนุมัติ</span>
            {totalPending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {totalPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubView('MATRIX')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              subView === 'MATRIX'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>ตารางเมทริกซ์ทีม</span>
          </button>
        </div>
      </div>

      {/* Conditional rendering based on subView */}
      {(subView === 'ALL' || subView === 'PENDING') && (
        <PendingApprovals />
      )}

      {(subView === 'ALL' || subView === 'MATRIX') && (
        <TeamWeeklyMatrix />
      )}

    </div>
  );
};
