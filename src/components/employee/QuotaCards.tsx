import React, { useState } from 'react';
import { Palmtree, ThermometerSnowflake, UserCheck, Info, Sparkles, Coins, MapPin, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getEmployeeLeaveSummary } from '../../utils/leaveCalculator';
import { calculateMonthlyAllowanceDays } from '../../utils/wfhSchedule';
import { formatThaiDate } from '../../utils/dateUtils';

export const QuotaCards: React.FC = () => {
  const { 
    currentEmployee, 
    remoteCheckIns, 
    companyOfficeDays, 
    employees, 
    leaveRequests, 
    wfhSwaps, 
    currentDateStr 
  } = useApp();
  
  const [showAllowanceDetails, setShowAllowanceDetails] = useState(false);
  const summary = getEmployeeLeaveSummary(currentEmployee);

  // Fix: Progress bar is strictly Used / Total
  const vacationUsedPercent = summary.vacation.total > 0 
    ? Math.min(100, Math.round((summary.vacation.used / summary.vacation.total) * 100))
    : 0;

  const sickUsedPercent = summary.sick.total > 0
    ? Math.min(100, Math.round((summary.sick.used / summary.sick.total) * 100))
    : 0;

  const personalUsedPercent = summary.personal.total > 0
    ? Math.min(100, Math.round((summary.personal.used / summary.personal.total) * 100))
    : 0;

  // Calculate allowance days for ALL employees who come to office (ได้ทุกคนที่เข้าออฟฟิศ)
  const curDate = new Date(currentDateStr);
  const allowanceSummary = calculateMonthlyAllowanceDays(
    currentEmployee.id,
    curDate.getFullYear(),
    curDate.getMonth() + 1,
    remoteCheckIns,
    companyOfficeDays,
    employees,
    leaveRequests,
    wfhSwaps
  );

  const dailyAllowanceRate = 200; // 200 บาท / วัน
  const estimatedAllowanceAmount = allowanceSummary.totalDays * dailyAllowanceRate;

  return (
    <div className="space-y-4">
      {/* Allowance Banner Card - FOR EVERYONE who enters the office (ได้ทุกคนที่เข้าออฟฟิศ) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-base text-white tracking-tight">
                  สิทธิ์เบี้ยเลี้ยงการเข้าปฏิบัติงานที่ออฟฟิศ (Office Attendance Allowance)
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-900 shadow-xs">
                  ได้ทุกคนที่เข้าออฟฟิศ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  {currentEmployee.locationType === 'REMOTE_100' ? 'พนักงานต่างจังหวัด (ตจว.)' : 'พนักงาน Hybrid (กทม.)'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-1">
                พนักงานทุกคนที่เข้าปฏิบัติงาน ณ สำนักงานใหญ่จริง (วันตามตารางปกติ, วันชดเชย, วันอบรมส่วนกลาง หรือแจ้งเข้าออฟฟิศ) จะได้รับเบี้ยเลี้ยงรายวัน ({dailyAllowanceRate.toLocaleString()} บาท/วัน)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-md">
            <div className="text-right">
              <span className="text-[11px] text-emerald-100 block">เข้าออฟฟิศสะสมเดือนนี้</span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-black text-amber-300">
                  {allowanceSummary.totalDays}
                </span>
                <span className="text-xs text-white font-normal">วัน</span>
                <span className="text-xs text-emerald-200 font-semibold ml-1">
                  (~{estimatedAllowanceAmount.toLocaleString()} บ.)
                </span>
              </div>
            </div>
            <Coins className="w-5 h-5 text-amber-300 flex-shrink-0" />
          </div>
        </div>

        {/* Expandable Breakdown of office days */}
        {allowanceSummary.items.length > 0 && (
          <div className="pt-2 border-t border-white/20">
            <button
              onClick={() => setShowAllowanceDetails(!showAllowanceDetails)}
              className="text-xs text-emerald-100 hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>{showAllowanceDetails ? 'ซ่อนรายละเอียดวันที่เข้าออฟฟิศ' : `ดูรายละเอียดวันที่เข้าออฟฟิศในเดือนนี้ (${allowanceSummary.items.length} วัน)`}</span>
              {showAllowanceDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAllowanceDetails && (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-black/15 p-3 rounded-xl border border-white/10 text-xs">
                {allowanceSummary.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{formatThaiDate(item.date)}</span>
                      <span className="text-[10px] text-emerald-100 truncate block">{item.title} ({item.dayFraction} วัน)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3 Standard Leave Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        
        {/* 1. Vacation Leave Quota Card */}
        <div className="relative bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-28 h-28 bg-indigo-50/50 rounded-full blur-xl group-hover:bg-indigo-100/50 transition-colors pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Palmtree className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    ลาพักร้อน (Vacation)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    สะสมตามอายุงานและสูตร Pro-rate
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {summary.vacation.tierLabel}
              </span>
            </div>

            <div className="my-3">
              {/* Number format: Used / Total */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {summary.vacation.used}
                  </span>
                  <span className="text-sm text-slate-500 font-medium ml-1">
                    / {summary.vacation.total} วัน
                  </span>
                </div>
                
                {/* Chip: Used days */}
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  ใช้ไป {summary.vacation.used} วัน
                </span>
              </div>

              {/* Progress bar: strictly Used / Total */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vacationUsedPercent}%` }}
                />
              </div>

              {/* Prominent Remaining Badge */}
              <div className="flex items-center justify-between mt-2.5 pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  ใช้ไปแล้ว {vacationUsedPercent}%
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  คงเหลือ {summary.vacation.remaining} วัน
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed bg-slate-50/60 p-2 rounded-xl">
            <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>{summary.vacation.explanation}</span>
          </div>
        </div>

        {/* 2. Sick Leave Quota Card */}
        <div className="relative bg-white rounded-2xl p-5 border border-rose-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <ThermometerSnowflake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    ลาป่วย (Sick Leave)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    ตามกฎหมายแรงงาน 30 วัน/ปี
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                โควตา 30 วัน
              </span>
            </div>

            <div className="my-3">
              {/* Number format: Used / Total */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {summary.sick.used}
                  </span>
                  <span className="text-sm text-slate-500 font-medium ml-1">
                    / {summary.sick.total} วัน
                  </span>
                </div>
                
                {/* Chip: Used days */}
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  ใช้ไป {summary.sick.used} วัน
                </span>
              </div>

              {/* Progress bar: strictly Used / Total */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${sickUsedPercent}%` }}
                />
              </div>

              {/* Prominent Remaining Badge */}
              <div className="flex items-center justify-between mt-2.5 pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  ใช้ไปแล้ว {sickUsedPercent}%
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  คงเหลือ {summary.sick.remaining} วัน
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-[11px] text-slate-500 flex items-center justify-between bg-slate-50/60 p-2 rounded-xl">
            <span>รองรับการลาเต็มวัน และครึ่งวัน</span>
            <span className="font-semibold text-rose-600">สิทธิ์ตามกฎหมาย 30 วัน</span>
          </div>
        </div>

        {/* 3. Personal Leave Quota Card */}
        <div className="relative bg-white rounded-2xl p-5 border border-amber-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    ลากิจ (Personal Leave)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    สิทธิ์ตามระเบียบบริษัท 3 วัน/ปี
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                โควตา 3 วัน
              </span>
            </div>

            <div className="my-3">
              {/* Number format: Used / Total */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {summary.personal.used}
                  </span>
                  <span className="text-sm text-slate-500 font-medium ml-1">
                    / {summary.personal.total} วัน
                  </span>
                </div>
                
                {/* Chip: Used days */}
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                  ใช้ไป {summary.personal.used} วัน
                </span>
              </div>

              {/* Progress bar: strictly Used / Total */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${personalUsedPercent}%` }}
                />
              </div>

              {/* Prominent Remaining Badge */}
              <div className="flex items-center justify-between mt-2.5 pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  ใช้ไปแล้ว {personalUsedPercent}%
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  คงเหลือ {summary.personal.remaining} วัน
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 text-[11px] text-slate-500 flex items-center justify-between bg-slate-50/60 p-2 rounded-xl">
            <span>ธุระจำเป็น / ติดต่อราชการ</span>
            <span className="font-semibold text-amber-600">สิทธิ์บริษัท 3 วัน</span>
          </div>
        </div>

      </div>
    </div>
  );
};
