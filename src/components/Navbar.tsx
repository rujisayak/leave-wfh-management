import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  ShieldCheck, 
  RotateCcw, 
  BookOpen, 
  ChevronDown, 
  Check, 
  Sparkles,
  Laptop,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateVacationQuota } from '../utils/leaveCalculator';

interface NavbarProps {
  onOpenPolicyGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPolicyGuide }) => {
  const { 
    employees, 
    currentEmployee, 
    setCurrentEmployeeId, 
    activeTab, 
    setActiveTab,
    leaveRequests,
    wfhSwaps,
    resetToDefaultData,
    isDemoMode,
    enterDemoMode
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Count pending requests for manager
  const pendingLeaves = leaveRequests.filter(r => r.status === 'PENDING').length;
  const pendingSwaps = wfhSwaps.filter(s => s.status === 'PENDING').length;
  const totalPending = pendingLeaves + pendingSwaps;

  const roleLabelMap = {
    EMPLOYEE: 'พนักงานทั่วไป (Employee)',
    MANAGER: 'หัวหน้างาน / PM (Manager)',
    HR: 'ฝ่ายบุคคล / Admin (HR)'
  };

  const roleBadgeMap = {
    EMPLOYEE: 'bg-blue-50 text-blue-700 border-blue-200',
    MANAGER: 'bg-purple-50 text-purple-700 border-purple-200',
    HR: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  ระบบลางาน & WFH Swap
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Hybrid Work OS
                </span>
                {isDemoMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Demo Sandbox
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Leave & WFH Day-Swap Management System (RBAC)
              </p>
            </div>
          </div>

          {/* Role / User Switcher (Prominent Testing Feature) */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/80 hover:bg-indigo-50/40 transition-all text-left shadow-sm group"
              title="คลิกเพื่อสลับผู้ใช้งานทดสอบ (Role-Based Access Control)"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                {currentEmployee.name.charAt(3) || currentEmployee.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800">
                    {currentEmployee.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${roleBadgeMap[currentEmployee.role]}`}>
                    {currentEmployee.role}
                  </span>
                  {isDemoMode && (
                    <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-amber-400 text-slate-900 shadow-2xs">
                      DEMO
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                  {currentEmployee.position}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </button>

            {/* Persona Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        {isDemoMode && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{isDemoMode ? 'สลับผู้ใช้งานในโหมดเดโม' : 'สลับผู้ใช้งานทดสอบ (Persona)'}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {isDemoMode ? 'ทดสอบได้ครบทุกสิทธิ์ โดยไม่กระทบฐานข้อมูลจริง' : 'ทดสอบมุมมองทั้ง 3 สิทธิ์ (Employee, Manager, HR)'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${isDemoMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-50 text-indigo-700'}`}>
                      {isDemoMode ? 'Demo Sandbox' : 'RBAC Mode'}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50">
                    {employees.map(emp => {
                      const isSelected = emp.id === currentEmployee.id;
                      const vacationInfo = calculateVacationQuota(emp);
                      return (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setCurrentEmployeeId(emp.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-indigo-50/60 font-medium' : ''
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs mt-0.5 flex-shrink-0">
                            {emp.name.charAt(3) || emp.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {emp.name}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${roleBadgeMap[emp.role]}`}>
                                {emp.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {emp.position}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                {emp.locationType === 'REMOTE_100' ? 'ตจว. 100%' : emp.wfhGroup}
                              </span>
                              <span>
                                พักร้อน: {vacationInfo.finalDays} วัน ({vacationInfo.tierLabel})
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/70 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">
                      💡 สลับบทบาทเพื่อทดสอบ Flow อนุมัติ
                    </span>
                    <button
                      onClick={() => {
                        resetToDefaultData();
                        setIsDropdownOpen(false);
                      }}
                      className="text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      รีเซ็ตข้อมูลทดสอบ
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 py-1 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-2">
            
            {/* Tab 1: Employee View */}
            <button
              onClick={() => setActiveTab('employee')}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'employee'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>ข้อมูลของฉัน (My Dashboard)</span>
            </button>

            {/* Tab 2: Manager View */}
            <button
              onClick={() => setActiveTab('team_manager')}
              className={`relative flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'team_manager'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>จัดการทีม & ตารางประจำสัปดาห์ (Team Matrix)</span>
              {totalPending > 0 && (
                <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                  activeTab === 'team_manager' ? 'bg-amber-400 text-slate-900' : 'bg-amber-500 text-white'
                }`}>
                  {totalPending}
                </span>
              )}
            </button>

            {/* Tab 3: HR Admin View */}
            <button
              onClick={() => setActiveTab('hr_admin')}
              className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                activeTab === 'hr_admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ข้อมูลองค์กร (HR Master Data)</span>
            </button>

          </nav>

          {/* Quick Guide & Demo Mode Triggers */}
          <div className="flex items-center gap-2">
            {!isDemoMode && (
              <button
                onClick={enterDemoMode}
                className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-semibold transition-all border border-amber-200/90 shadow-2xs active:scale-95"
                title="เข้าสู่โหมดทดลองเล่น Sandbox สำหรับผู้เยี่ยมชมพอร์ตโฟลิโอ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Try Demo Mode</span>
              </button>
            )}

            <button
              onClick={onOpenPolicyGuide}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-colors border border-indigo-200/50"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เกณฑ์คำนวณวันลา & WFH</span>
              <span className="sm:hidden">เกณฑ์</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
