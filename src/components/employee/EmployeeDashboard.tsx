import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Shield, 
  Briefcase, 
  CalendarDays,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Coins
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QuotaCards } from './QuotaCards';
import { WeeklyScheduleBar } from './WeeklyScheduleBar';
import { MyRequestHistory } from './MyRequestHistory';
import { LeaveRequestModal } from './LeaveRequestModal';
import { WfhSwapModal } from './WfhSwapModal';
import { RemoteCheckInModal } from './RemoteCheckInModal';
import { calculateVacationQuota } from '../../utils/leaveCalculator';
import { getWfhGroupDescription } from '../../utils/wfhSchedule';

export const EmployeeDashboard: React.FC = () => {
  const { currentEmployee, employees } = useApp();
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isRemoteCheckInModalOpen, setIsRemoteCheckInModalOpen] = useState(false);
  
  // Date passed when clicking a specific day card
  const [activeInitialDate, setActiveInitialDate] = useState<string | undefined>(undefined);

  const manager = employees.find(e => e.id === currentEmployee.managerId);
  const vacationQuota = calculateVacationQuota(currentEmployee);
  const wfhGroupInfo = getWfhGroupDescription(currentEmployee);

  const handleOpenLeave = (date?: string) => {
    setActiveInitialDate(date);
    setIsLeaveModalOpen(true);
  };

  const handleOpenSwap = (date?: string) => {
    setActiveInitialDate(date);
    setIsSwapModalOpen(true);
  };

  const handleOpenRemoteCheckIn = (date?: string) => {
    setActiveInitialDate(date);
    setIsRemoteCheckInModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Profile Overview Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-white/10 flex-shrink-0">
              {currentEmployee.name.charAt(3) || currentEmployee.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {currentEmployee.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/20 backdrop-blur-sm">
                  {currentEmployee.role === 'EMPLOYEE' ? 'พนักงานทั่วไป' : currentEmployee.role === 'MANAGER' ? 'หัวหน้างาน' : 'ฝ่ายบุคคล HR'}
                </span>
                {currentEmployee.locationType === 'REMOTE_100' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> ต่างจังหวัด 100% Remote (มีสิทธิ์รับเบี้ยเลี้ยง)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    🏢 กรุงเทพฯ & ปริมณฑล (Hybrid)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  {currentEmployee.position}
                </span>
                <span className="text-slate-500">•</span>
                <span>แผนก: {currentEmployee.department}</span>
                {manager && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>หัวหน้างาน: {manager.name}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-300" />
                  <span>เริ่มงาน: {currentEmployee.startDate}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>สถานะโปร: {currentEmployee.isPassedProbation ? `ผ่านโปร (${currentEmployee.passProbationDate})` : 'กำลังทดลองงาน'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick info right side */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block">สิทธิ์พักร้อนปีนี้</span>
              <span className="text-2xl font-extrabold text-amber-300">
                {vacationQuota.finalDays} <span className="text-xs text-slate-300 font-normal">วัน</span>
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {vacationQuota.tierLabel}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Leave Quota Cards (Updated: Used / Total with prominent remaining) */}
      <QuotaCards />

      {/* Visual Weekly & Monthly Schedule (Interactive Click on Any Day) */}
      <WeeklyScheduleBar 
        onOpenLeaveModal={handleOpenLeave}
        onOpenSwapModal={handleOpenSwap}
        onOpenRemoteCheckInModal={handleOpenRemoteCheckIn}
      />

      {/* My Request History Table */}
      <MyRequestHistory />

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isLeaveModalOpen}
        onClose={() => {
          setIsLeaveModalOpen(false);
          setActiveInitialDate(undefined);
        }}
        initialDate={activeInitialDate}
      />

      <WfhSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => {
          setIsSwapModalOpen(false);
          setActiveInitialDate(undefined);
        }}
        initialDate={activeInitialDate}
      />

      <RemoteCheckInModal
        isOpen={isRemoteCheckInModalOpen}
        onClose={() => {
          setIsRemoteCheckInModalOpen(false);
          setActiveInitialDate(undefined);
        }}
        initialDate={activeInitialDate}
      />

    </div>
  );
};
