import React, { useState } from 'react';
import { 
  Coins, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CheckCircle2, 
  Info,
  Download,
  Search,
  Filter,
  Building2,
  Users,
  DollarSign
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateMonthlyAllowanceDays, getWfhGroupDescription } from '../../utils/wfhSchedule';
import { formatThaiMonthYear, formatThaiDate } from '../../utils/dateUtils';

export const AllowanceSummarySection: React.FC = () => {
  const { 
    employees, 
    remoteCheckIns, 
    companyOfficeDays, 
    leaveRequests, 
    wfhSwaps, 
    currentDateStr, 
    showToast 
  } = useApp();

  const curDate = new Date(currentDateStr);
  const [selectedYear, setSelectedYear] = useState<number>(curDate.getFullYear() || 2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(curDate.getMonth() + 1 || 10);
  
  // Filters & Settings
  const [locationFilter, setLocationFilter] = useState<'ALL' | 'HYBRID' | 'REMOTE_100'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(200); // 200 บาท/วัน (configurable)

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedYear(2026);
    setSelectedMonth(10);
  };

  // Compute allowance summary per employee for ALL employees (ได้ทุกคนที่เข้าออฟฟิศ)
  const allAllowanceData = employees.map(emp => {
    const summary = calculateMonthlyAllowanceDays(
      emp.id,
      selectedYear,
      selectedMonth,
      remoteCheckIns,
      companyOfficeDays,
      employees,
      leaveRequests,
      wfhSwaps
    );
    const groupDesc = getWfhGroupDescription(emp);
    const totalAmount = summary.totalDays * dailyRate;

    return {
      emp,
      summary,
      groupDesc,
      totalAmount
    };
  });

  // Filter results
  const filteredData = allAllowanceData.filter(item => {
    if (locationFilter !== 'ALL' && item.emp.locationType !== locationFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.emp.name.toLowerCase().includes(q) || (item.emp.nameEn && item.emp.nameEn.toLowerCase().includes(q));
      const matchPos = item.emp.position.toLowerCase().includes(q);
      const matchDept = item.emp.department.toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchDept) return false;
    }
    return true;
  });

  // Grand totals across all employees
  const grandTotalAllowanceDays = filteredData.reduce((sum, item) => sum + item.summary.totalDays, 0);
  const grandTotalAmount = grandTotalAllowanceDays * dailyRate;
  const totalEmployeesWithOfficeDays = filteredData.filter(i => i.summary.totalDays > 0).length;

  const handleExportAllowanceCSV = () => {
    const headers = [
      'รหัสพนักงาน',
      'ชื่อ-นามสกุล',
      'แผนก',
      'ตำแหน่ง',
      'ประเภทสถานที่',
      'กลุ่ม WFH',
      'เดือน/ปี',
      'จำนวนวันเข้าออฟฟิศ',
      'อัตราเบี้ยเลี้ยงต่อวัน (บาท)',
      'ยอดเบี้ยเลี้ยงรวม (บาท)',
      'รายละเอียดวันที่เข้าออฟฟิศ'
    ];

    const rows = filteredData.map(item => [
      item.emp.id,
      item.emp.name,
      item.emp.department,
      item.emp.position,
      item.emp.locationType === 'REMOTE_100' ? 'ต่างจังหวัด 100%' : 'กทม. Hybrid',
      item.groupDesc.name,
      `${formatThaiMonthYear(selectedYear, selectedMonth)}`,
      item.summary.totalDays,
      dailyRate,
      item.totalAmount,
      item.summary.items.map(i => `${i.date} (${i.title}: ${i.dayFraction} วัน)`).join('; ')
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `office_allowance_summary_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'ส่งออกข้อมูลเบี้ยเลี้ยงสำเร็จ', 'ดาวน์โหลดไฟล์ CSV สรุปเบี้ยเลี้ยงการเข้าออฟฟิศทั้งองค์กรเรียบร้อยแล้ว');
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span>สรุปเบี้ยเลี้ยงการเข้าปฏิบัติงานที่ออฟฟิศ (Office Attendance Allowance)</span>
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              ได้ทุกคนที่เข้าออฟฟิศ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            รวบรวมวันเข้าออฟฟิศจริงของพนักงานทุกคน (ทั้งกลุ่ม Hybrid และ ต่างจังหวัด Remote 100%) เพื่อจ่ายเบี้ยเลี้ยงรายวันตามระเบียบบริษัท
          </p>
        </div>

        {/* Month Switcher & Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800">
              {formatThaiMonthYear(selectedYear, selectedMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportAllowanceCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออกรายงาน CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-800 block">พนักงานที่เข้าออฟฟิศ</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">
              {totalEmployeesWithOfficeDays} <span className="text-xs font-normal text-slate-500">/ {filteredData.length} คน</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-indigo-800 block">จำนวนวันเข้าออฟฟิศสะสม</span>
            <span className="text-2xl font-black text-indigo-700 mt-0.5 block">
              {grandTotalAllowanceDays} <span className="text-xs font-normal text-slate-500">วัน</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-amber-800 block">ยอดงบประมาณเบี้ยเลี้ยงรวม</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block">
              {grandTotalAmount.toLocaleString()} <span className="text-xs font-normal text-slate-500">บาท</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Rate Configuration Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อพนักงาน หรือตำแหน่ง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        <div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
          >
            <option value="ALL">กลุ่มพนักงานทั้งหมด (All Staff)</option>
            <option value="HYBRID">เฉพาะกลุ่ม Hybrid (กทม.)</option>
            <option value="REMOTE_100">เฉพาะกลุ่ม Remote 100% (ต่างจังหวัด)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium whitespace-nowrap">อัตราเบี้ยเลี้ยง:</span>
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              step="50"
              value={dailyRate}
              onChange={(e) => setDailyRate(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-2.5 py-1.5 text-xs font-bold text-amber-700 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <span className="absolute right-2.5 top-1.5 text-xs text-slate-400">บ./วัน</span>
          </div>
        </div>
      </div>

      {/* Table of Allowance */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 font-bold min-w-[180px]">พนักงาน</th>
              <th className="py-3 px-3 font-bold min-w-[130px]">สถานที่ & กลุ่ม</th>
              <th className="py-3 px-3 font-bold min-w-[110px] text-center">เข้าออฟฟิศ (วัน)</th>
              <th className="py-3 px-3 font-bold min-w-[130px] text-right">เบี้ยเลี้ยงรวม ({dailyRate} บ./วัน)</th>
              <th className="py-3 px-3 font-bold min-w-[280px]">รายละเอียดวันที่เข้าออฟฟิศ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredData.map(item => (
              <tr key={item.emp.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Employee Name */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                      {item.emp.name.charAt(3) || item.emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {item.emp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.emp.position}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Location & WFH Group */}
                <td className="py-3 px-3">
                  <div className="space-y-1">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-semibold border ${item.groupDesc.badge}`}>
                      {item.groupDesc.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {item.emp.locationType === 'REMOTE_100' ? 'ตจว. 100%' : 'กทม. Hybrid'}
                    </span>
                  </div>
                </td>

                {/* Days */}
                <td className="py-3 px-3 text-center">
                  <span className="text-base font-extrabold text-slate-800">
                    {item.summary.totalDays}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">วัน</span>
                </td>

                {/* Total Amount */}
                <td className="py-3 px-3 text-right">
                  <span className="text-sm font-bold text-emerald-700">
                    {item.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">บาท</span>
                </td>

                {/* Breakdown Dates */}
                <td className="py-3 px-3">
                  {item.summary.items.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">ไม่มีบันทึกเข้าออฟฟิศในเดือนนี้</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {item.summary.items.slice(0, 8).map(it => (
                        <span
                          key={it.date}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                            it.type === 'COMPANY_EVENT'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : it.type === 'CHECK_IN'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : it.type === 'COMPENSATED'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                          title={`${it.date}: ${it.title}`}
                        >
                          {it.date.substring(8)} ต.ค.
                        </span>
                      ))}
                      {item.summary.items.length > 8 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
                          +{item.summary.items.length - 8} วัน
                        </span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
