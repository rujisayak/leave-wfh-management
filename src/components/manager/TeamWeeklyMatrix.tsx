import React, { useState } from 'react';
import { 
  Building, 
  Home, 
  ArrowLeftRight, 
  Clock, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Users, 
  MapPin,
  Calendar,
  Sparkles,
  Info,
  Coins
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getDailyAttendanceStatus, 
  getWfhGroupDescription 
} from '../../utils/wfhSchedule';
import { 
  getWeekDays, 
  toIsoDate, 
  formatThaiDate, 
  DAY_NAMES_TH_SHORT, 
  MONTH_NAMES_TH_SHORT 
} from '../../utils/dateUtils';
import { WfhGroup } from '../../types';

export const TeamWeeklyMatrix: React.FC = () => {
  const { 
    employees, 
    currentDateStr, 
    setCurrentDateStr, 
    leaveRequests, 
    wfhSwaps,
    remoteCheckIns,
    companyOfficeDays 
  } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 5 days of the active week (Mon-Fri)
  const viewDate = new Date(currentDateStr);
  const weekDays = getWeekDays(viewDate);

  const handlePrevWeek = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 7);
    setCurrentDateStr(toIsoDate(d));
  };

  const handleNextWeek = () => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 7);
    setCurrentDateStr(toIsoDate(d));
  };

  const handleCurrentWeek = () => {
    setCurrentDateStr('2026-10-19'); // Default target demo date
  };

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    // Group filter
    if (selectedGroup !== 'ALL') {
      if (selectedGroup === 'REMOTE_100') {
        if (emp.locationType !== 'REMOTE_100') return false;
      } else {
        if (emp.wfhGroup !== selectedGroup) return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchPos = emp.position.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchDept) return false;
    }
    return true;
  });

  // Calculate daily office headcount for bottom summary row
  const dailyHeadcounts = weekDays.map(date => {
    const dateStr = toIsoDate(date);
    let officeCount = 0;
    employees.forEach(emp => {
      const status = getDailyAttendanceStatus(
        emp, 
        dateStr, 
        leaveRequests, 
        wfhSwaps,
        remoteCheckIns,
        companyOfficeDays
      );
      if (status.isOfficeHeadcount) {
        officeCount++;
      }
    });
    return {
      dateStr,
      count: officeCount,
      percentage: employees.length > 0 ? Math.round((officeCount / employees.length) * 100) : 0
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
      
      {/* Top Header: Title & Week Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              ตารางการทำงานของทีมแบบเมทริกซ์ (Team Weekly Attendance Matrix)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              ทั้งทีม {employees.length} คน
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ภาพรวมการเข้าออฟฟิศ, วัน WFH ประจำ, การสลับวัน WFH เฉพาะกิจ, และการลางานของสมาชิกทุกคน
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="สัปดาห์ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-800">
              สัปดาห์: {formatThaiDate(toIsoDate(weekDays[0]), false)} - {formatThaiDate(toIsoDate(weekDays[4]), false)}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="สัปดาห์ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCurrentWeek}
            className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl border border-indigo-200/60 transition-colors"
          >
            สัปดาห์ปัจจุบัน
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, ตำแหน่ง, แผนก..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* WFH Group Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            กลุ่ม:
          </span>
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'GROUP_A', label: 'Group A (จ.-อ.)' },
            { id: 'GROUP_B', label: 'Group B (อ.-พ.)' },
            { id: 'CUSTOM', label: 'Custom (แล้วแต่คน)' },
            { id: 'REMOTE_100', label: 'ตจว. 100%' },
          ].map(grp => (
            <button
              key={grp.id}
              onClick={() => setSelectedGroup(grp.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedGroup === grp.id
                  ? 'bg-slate-900 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge Legend */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-[11px]">
        <span className="font-bold text-slate-700 mr-1 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          คำอธิบายสถานะ:
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white font-medium shadow-2xs">
          <Building className="w-3 h-3" /> 🏢 ออฟฟิศ
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-medium">
          <Home className="w-3 h-3" /> 🏠 WFH ประจำ
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-300 font-bold">
          <ArrowLeftRight className="w-3 h-3" /> 🔄 WFH (สลับเฉพาะกิจ)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-300 font-bold ring-1 ring-teal-400">
          <Building className="w-3 h-3" /> 🏢 เข้าออฟฟิศ (ชดเชย)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-600 text-white font-bold shadow-2xs">
          <Coins className="w-3 h-3 text-amber-300" /> 🏢 เข้าออฟฟิศ (💰 เบี้ยเลี้ยง)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold shadow-2xs">
          <Building className="w-3 h-3" /> 🏢 เข้าออฟฟิศ (อบรม/กิจกรรม)
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
          <MapPin className="w-3 h-3" /> 🏠 ตจว. 100%
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-medium">
          <Clock className="w-3 h-3" /> 🏖️/🤒 ลางาน
        </span>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 font-bold min-w-[200px]">
                พนักงาน / ตำแหน่ง
              </th>
              {weekDays.map(date => {
                const dateStr = toIsoDate(date);
                const isToday = dateStr === '2026-10-19';
                const dayName = DAY_NAMES_TH_SHORT[date.getDay()];
                const dayNum = date.getDate();
                const month = MONTH_NAMES_TH_SHORT[date.getMonth()];

                return (
                  <th
                    key={dateStr}
                    className={`py-3 px-3 text-center min-w-[140px] ${
                      isToday ? 'bg-indigo-50/70 border-x border-indigo-200' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className={`font-bold ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {dayName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {dayNum} {month}
                      </span>
                      {isToday && (
                        <span className="mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                          วันนี้
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Team Members */}
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.map(emp => {
              const groupDesc = getWfhGroupDescription(emp);

              return (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Employee Info Column */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0">
                        {emp.name.charAt(3) || emp.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {emp.position}
                        </div>
                        <span className={`inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded font-medium border ${groupDesc.badge}`}>
                          {groupDesc.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 5 Daily Columns (Mon - Fri) */}
                  {weekDays.map(date => {
                    const dateStr = toIsoDate(date);
                    const isToday = dateStr === '2026-10-19';
                    const status = getDailyAttendanceStatus(
                      emp, 
                      dateStr, 
                      leaveRequests, 
                      wfhSwaps,
                      remoteCheckIns,
                      companyOfficeDays
                    );

                    return (
                      <td
                        key={dateStr}
                        className={`py-3 px-2 text-center align-middle ${
                          isToday ? 'bg-indigo-50/30 border-x border-indigo-100' : ''
                        }`}
                      >
                        <div 
                          className="flex flex-col items-center justify-center"
                          title={status.note || status.labelTh}
                        >
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${status.badgeColor} shadow-2xs max-w-full truncate`}>
                            {status.type === 'OFFICE' && <Building className="w-3.5 h-3.5 flex-shrink-0" />}
                            {status.type === 'FIXED_WFH' && <Home className="w-3.5 h-3.5 flex-shrink-0" />}
                            {status.type === 'SWAPPED_WFH' && <ArrowLeftRight className="w-3.5 h-3.5 flex-shrink-0 text-purple-700" />}
                            {status.type === 'COMPENSATED_OFFICE' && <Building className="w-3.5 h-3.5 flex-shrink-0 text-teal-700" />}
                            {status.type === 'REMOTE_OFFICE_ALLOWANCE' && <Coins className="w-3.5 h-3.5 flex-shrink-0 text-amber-300" />}
                            {status.type === 'COMPANY_MANDATORY_OFFICE' && <Building className="w-3.5 h-3.5 flex-shrink-0" />}
                            {status.type === 'REMOTE_100' && <Home className="w-3.5 h-3.5 flex-shrink-0 text-emerald-700" />}
                            {status.type.startsWith('LEAVE_') && <Clock className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />}
                            <span className="truncate">{status.labelTh}</span>
                          </span>

                          {/* Detail note if swapped or on leave */}
                          {status.note && (
                            <span className="text-[9px] text-slate-500 mt-1 max-w-[130px] truncate block" title={status.note}>
                              {status.type === 'SWAPPED_WFH' ? '🔁 สลับวัน' : 
                               status.type === 'COMPENSATED_OFFICE' ? '🏢 ชดเชย' : 
                               status.type === 'REMOTE_OFFICE_ALLOWANCE' ? '💰 เบี้ยเลี้ยง' :
                               status.type === 'COMPANY_MANDATORY_OFFICE' ? '📢 ส่วนรวม' : '🏖️ ลางาน'}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Table Footer: Daily Headcount Summary (Crucial Requirement) */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-700">
              <td className="py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>สรุปยอดคนเข้าออฟฟิศ (Headcount)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">
                  คนเข้าทำงานที่ออฟฟิศจริง (รวมชดเชย & อบรม & ตจว.)
                </span>
              </td>

              {dailyHeadcounts.map(item => {
                const isToday = item.dateStr === '2026-10-19';

                return (
                  <td 
                    key={item.dateStr} 
                    className={`py-3.5 px-2 text-center align-middle ${
                      isToday ? 'bg-indigo-950/80 border-x border-indigo-700' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-base font-extrabold text-amber-300">
                        🏢 {item.count} <span className="text-xs text-slate-300 font-normal">คน</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({item.percentage}% ของทีม)
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>
          </tfoot>

        </table>
      </div>

    </div>
  );
};
