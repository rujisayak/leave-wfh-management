import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Building, 
  ArrowLeftRight, 
  MapPin,
  Clock,
  Plus,
  CalendarDays,
  Sparkles,
  Coins,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  getDailyAttendanceStatus, 
  getWfhGroupDescription,
  isNormallyWfhDay
} from '../../utils/wfhSchedule';
import { 
  getWeekDays, 
  formatThaiDate, 
  formatThaiMonthYear,
  DAY_NAMES_TH_FULL, 
  MONTH_NAMES_TH_SHORT,
  toIsoDate,
  getMonthCalendarGrid,
  CALENDAR_WEEKDAY_NAMES_TH,
  CalendarDayCell
} from '../../utils/dateUtils';

interface WeeklyScheduleBarProps {
  onOpenLeaveModal: (initialDate?: string) => void;
  onOpenSwapModal: (initialDate?: string) => void;
  onOpenRemoteCheckInModal: (initialDate?: string) => void;
}

export const WeeklyScheduleBar: React.FC<WeeklyScheduleBarProps> = ({
  onOpenLeaveModal,
  onOpenSwapModal,
  onOpenRemoteCheckInModal
}) => {
  const { 
    currentEmployee, 
    currentDateStr, 
    setCurrentDateStr, 
    leaveRequests, 
    wfhSwaps,
    remoteCheckIns,
    companyOfficeDays
  } = useApp();

  const [viewMode, setViewMode] = useState<'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string;
    date: Date;
    isWeekend: boolean;
  } | null>(null);

  // Month view state
  const curDate = new Date(currentDateStr);
  const [viewYear, setViewYear] = useState<number>(curDate.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState<number>(curDate.getMonth() + 1 || 10);

  const groupInfo = getWfhGroupDescription(currentEmployee);
  const isRemote100 = currentEmployee.locationType === 'REMOTE_100';

  // Weekly calculations
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
    setCurrentDateStr('2026-10-19');
    setViewYear(2026);
    setViewMonth(10);
  };

  // Monthly navigation
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    setViewYear(2026);
    setViewMonth(10);
    setCurrentDateStr('2026-10-19');
  };

  const monthGrid = getMonthCalendarGrid(viewYear, viewMonth);

  // Quick Action Handler for any day
  const handleDayClick = (dateStr: string, date: Date, isWeekend: boolean) => {
    setSelectedDayDetail({ dateStr, date, isWeekend });
  };

  const renderStatusBadge = (status: ReturnType<typeof getDailyAttendanceStatus>, isCompact: boolean = false) => {
    return (
      <span className={`inline-flex items-center gap-1 rounded-lg font-semibold border ${status.badgeColor} shadow-2xs ${
        isCompact ? 'px-1.5 py-0.5 text-[10px] w-full justify-center truncate' : 'px-2.5 py-1 text-xs w-full justify-center'
      }`}>
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
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4 relative">
      
      {/* Top Header: Schedule Title, Group Badge & Toggle View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base">
                ตารางการทำงานของฉัน (My Schedule)
              </h3>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${groupInfo.badge}`}>
                {groupInfo.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {groupInfo.schedule} • คลิกที่การ์ดวันใดๆ เพื่อทำรายการล่วงหน้าได้ทันที
            </p>
          </div>
        </div>

        {/* Action Buttons & View Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main Action Buttons */}
          <button
            onClick={() => onOpenLeaveModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ยื่นขอลางาน</span>
          </button>

          {isRemote100 ? (
            <button
              onClick={() => onOpenRemoteCheckInModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all shadow-emerald-600/20 active:scale-95"
              title="แจ้งเข้าปฏิบัติงานที่สำนักงานใหญ่ และขอรับเบี้ยเลี้ยงเดินทาง"
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>🏢 แจ้งเข้าออฟฟิศ (เบิกเบี้ยเลี้ยง)</span>
            </button>
          ) : (
            <button
              onClick={() => onOpenSwapModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border bg-white hover:bg-indigo-50/50 text-indigo-600 border-indigo-200 shadow-sm active:scale-95 transition-all"
              title="ขอสลับวัน WFH เฉพาะกิจในสัปดาห์เดียวกัน"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>ขอสลับวัน WFH</span>
            </button>
          )}

          {/* View Mode Toggle: Weekly vs Monthly */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold ml-auto sm:ml-0">
            <button
              onClick={() => setViewMode('WEEKLY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'WEEKLY'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>📅 รายสัปดาห์</span>
            </button>
            <button
              onClick={() => setViewMode('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'MONTHLY'
                  ? 'bg-white text-indigo-700 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>🗓️ รายเดือน</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: WEEKLY VIEW */}
      {viewMode === 'WEEKLY' && (
        <div className="space-y-3">
          {/* Week Navigator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="สัปดาห์ก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextWeek}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="สัปดาห์ถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 ml-2">
                สัปดาห์ที่ {formatThaiDate(toIsoDate(weekDays[0]), false)} - {formatThaiDate(toIsoDate(weekDays[4]), false)}
              </span>
            </div>

            <button
              onClick={handleCurrentWeek}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition-colors"
            >
              สัปดาห์ปัจจุบัน
            </button>
          </div>

          {/* 5-Day Visual Schedule Bar (Mon - Fri) */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {weekDays.map(date => {
              const dateStr = toIsoDate(date);
              const isToday = dateStr === '2026-10-19';
              const status = getDailyAttendanceStatus(
                currentEmployee, 
                dateStr, 
                leaveRequests, 
                wfhSwaps,
                remoteCheckIns,
                companyOfficeDays
              );

              const dayFullName = DAY_NAMES_TH_FULL[date.getDay()];
              const dateDisplay = `${date.getDate()} ${MONTH_NAMES_TH_SHORT[date.getMonth()]}`;

              return (
                <div
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr, date, false)}
                  className={`group relative rounded-2xl p-4 border transition-all flex flex-col justify-between cursor-pointer hover:shadow-md ${
                    isToday 
                      ? 'ring-2 ring-indigo-500 ring-offset-2 bg-white border-indigo-300 shadow-md' 
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-indigo-300'
                  }`}
                >
                  {isToday && (
                    <div className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      วันนี้
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-bold ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {dayFullName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {dateDisplay}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="my-2.5">
                      {renderStatusBadge(status, false)}
                    </div>
                  </div>

                  {/* Context Note & Action Hint */}
                  <div className="pt-2 border-t border-slate-200/60 mt-1 min-h-[36px] flex flex-col justify-center">
                    {status.note ? (
                      <p className="text-[10px] text-slate-600 line-clamp-2 leading-tight">
                        💡 {status.note}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        {status.type === 'OFFICE' && 'ทำงานที่ออฟฟิศ'}
                        {status.type === 'FIXED_WFH' && 'WFH ตามตาราง'}
                        {status.type === 'REMOTE_100' && 'WFH เต็มเวลา'}
                      </p>
                    )}
                    
                    <span className="text-[10px] text-indigo-600 font-semibold mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      คลิกเพื่อจัดการวันนี้ ➔
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY VIEW (7-Column Calendar Grid) */}
      {viewMode === 'MONTHLY' && (
        <div className="space-y-3">
          {/* Month Navigator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm sm:text-base font-bold text-slate-900 ml-2">
                {formatThaiMonthYear(viewYear, viewMonth)}
              </span>
            </div>

            <button
              onClick={handleCurrentMonth}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 transition-colors"
            >
              เดือนปัจจุบัน
            </button>
          </div>

          {/* 7 Columns: Mon to Sun */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <div className="min-w-[650px]">
              
              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 bg-slate-100 text-slate-700 text-xs font-bold py-2.5 px-1 border-b border-slate-200 text-center">
                {CALENDAR_WEEKDAY_NAMES_TH.map((name, i) => (
                  <div key={name} className={i >= 5 ? 'text-rose-600' : ''}>
                    {name} {i === 0 && '(จันทร์)'} {i === 6 && '(อาทิตย์)'}
                  </div>
                ))}
              </div>

              {/* Monthly Calendar Grid Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
                {monthGrid.map((cell) => {
                  const isToday = cell.dateStr === '2026-10-19';
                  const status = getDailyAttendanceStatus(
                    currentEmployee, 
                    cell.dateStr, 
                    leaveRequests, 
                    wfhSwaps,
                    remoteCheckIns,
                    companyOfficeDays
                  );

                  return (
                    <div
                      key={cell.dateStr}
                      onClick={() => handleDayClick(cell.dateStr, cell.date, cell.isWeekend)}
                      className={`min-h-[92px] p-2 flex flex-col justify-between transition-all cursor-pointer group ${
                        cell.isCurrentMonth ? 'bg-white hover:bg-indigo-50/40' : 'bg-slate-50/60 opacity-40 hover:opacity-80'
                      } ${isToday ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/20' : ''}`}
                    >
                      {/* Date Header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isToday 
                            ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs' 
                            : cell.isWeekend 
                            ? 'text-rose-500' 
                            : 'text-slate-800'
                        }`}>
                          {cell.dayNumber}
                        </span>

                        {isToday && (
                          <span className="text-[9px] font-bold text-indigo-700 hidden sm:inline">
                            วันนี้
                          </span>
                        )}
                      </div>

                      {/* Status Content */}
                      <div className="my-1">
                        {cell.isWeekend ? (
                          <span className="text-[10px] text-slate-400 block text-center py-0.5">
                            วันหยุด
                          </span>
                        ) : (
                          renderStatusBadge(status, true)
                        )}
                      </div>

                      {/* Hover action hint */}
                      <div className="text-[9px] text-indigo-600 font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {!cell.isWeekend && '+ จัดการ'}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE DAY QUICK ACTION MODAL / POPOVER */}
      {selectedDayDetail && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedDayDetail(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  จัดการวันทำงาน & ยื่นคำขอ
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  {formatThaiDate(selectedDayDetail.dateStr)}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current day status preview */}
            {(() => {
              const status = getDailyAttendanceStatus(
                currentEmployee, 
                selectedDayDetail.dateStr, 
                leaveRequests, 
                wfhSwaps,
                remoteCheckIns,
                companyOfficeDays
              );

              return (
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">สถานะของวันดังกล่าว:</span>
                      <div className="mt-1 font-bold">{renderStatusBadge(status, false)}</div>
                    </div>
                    {status.hasAllowance && (
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-600" />
                        <span>รับเบี้ยเลี้ยง</span>
                      </span>
                    )}
                  </div>

                  {status.note && (
                    <div className="text-xs bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200">
                      💡 {status.note}
                    </div>
                  )}

                  {selectedDayDetail.isWeekend ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      วันนี้เป็นวันหยุดสุดสัปดาห์ ไม่จำเป็นต้องยื่นขอลางานหรือสลับวัน WFH
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        เลือกรายการที่ต้องการทำในวันที่ {formatThaiDate(selectedDayDetail.dateStr, false)}:
                      </span>

                      {/* 1. Remote 100% Employee Quick Actions */}
                      {isRemote100 ? (
                        <>
                          <button
                            onClick={() => {
                              const d = selectedDayDetail.dateStr;
                              setSelectedDayDetail(null);
                              onOpenRemoteCheckInModal(d);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-950 font-bold text-xs transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-amber-600" />
                              <span>🏢 แจ้งเข้าออฟฟิศในวันนี้ (รับเบี้ยเลี้ยง)</span>
                            </span>
                            <span>➔</span>
                          </button>

                          <button
                            onClick={() => {
                              const d = selectedDayDetail.dateStr;
                              setSelectedDayDetail(null);
                              onOpenLeaveModal(d);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-950 font-bold text-xs transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-indigo-600" />
                              <span>➕ ยื่นขอลางานในวันนี้ (พักร้อน / ป่วย / กิจ)</span>
                            </span>
                            <span>➔</span>
                          </button>
                        </>
                      ) : (
                        /* 2. Hybrid Employee Quick Actions */
                        <>
                          {/* If it's normally an Office day or currently Office */}
                          {!isNormallyWfhDay(currentEmployee, selectedDayDetail.dateStr) && (
                            <button
                              onClick={() => {
                                const d = selectedDayDetail.dateStr;
                                setSelectedDayDetail(null);
                                onOpenSwapModal(d);
                              }}
                              className="w-full flex items-center justify-between p-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 text-purple-950 font-bold text-xs transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                                <span>🔄 ขอสลับเป็น WFH ในวันนี้</span>
                              </span>
                              <span>➔</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              const d = selectedDayDetail.dateStr;
                              setSelectedDayDetail(null);
                              onOpenLeaveModal(d);
                            }}
                            className="w-full flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-950 font-bold text-xs transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Plus className="w-4 h-4 text-indigo-600" />
                              <span>➕ ยื่นขอลางานในวันนี้</span>
                            </span>
                            <span>➔</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
