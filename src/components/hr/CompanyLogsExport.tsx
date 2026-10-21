import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeftRight, 
  Palmtree, 
  ThermometerSnowflake, 
  UserCheck,
  Coins
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatThaiDate } from '../../utils/dateUtils';
import { LeaveRequest, WfhSwapRequest, RemoteCheckInRequest } from '../../types';

export const CompanyLogsExport: React.FC = () => {
  const { employees, leaveRequests, wfhSwaps, remoteCheckIns, showToast } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'LEAVE' | 'SWAP' | 'REMOTE_CHECKIN'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  interface CombinedLog {
    id: string;
    type: 'LEAVE' | 'SWAP' | 'REMOTE_CHECKIN';
    empId: string;
    empName: string;
    empPosition: string;
    detail: string;
    dateInfo: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
    actionBy?: string;
    actionReason?: string;
    actionAt?: string;
  }

  const logs: CombinedLog[] = [
    ...leaveRequests.map(l => {
      const emp = employees.find(e => e.id === l.empId);
      const leaveLabel = l.leaveType === 'VACATION' ? 'ลาพักร้อน' : l.leaveType === 'SICK' ? 'ลาป่วย' : 'ลากิจ';
      const durLabel = l.durationType === 'FULL' ? `เต็มวัน (${l.totalDays} วัน)` : l.durationType === 'HALF_MORNING' ? 'ครึ่งเช้า (0.5 วัน)' : 'ครึ่งบ่าย (0.5 วัน)';
      return {
        id: l.id,
        type: 'LEAVE' as const,
        empId: l.empId,
        empName: emp ? emp.name : 'Unknown',
        empPosition: emp ? emp.position : '',
        detail: `${leaveLabel} ${durLabel}`,
        dateInfo: `${formatThaiDate(l.startDate)}${l.startDate !== l.endDate ? ` - ${formatThaiDate(l.endDate)}` : ''}`,
        reason: l.reason,
        status: l.status,
        createdAt: l.createdAt,
        actionBy: l.actionBy,
        actionReason: l.actionReason,
        actionAt: l.actionAt,
      };
    }),
    ...wfhSwaps.map(s => {
      const emp = employees.find(e => e.id === s.empId);
      return {
        id: s.id,
        type: 'SWAP' as const,
        empId: s.empId,
        empName: emp ? emp.name : 'Unknown',
        empPosition: emp ? emp.position : '',
        detail: 'สลับวัน WFH เฉพาะกิจ (Same-Week)',
        dateInfo: `WFH: ${formatThaiDate(s.requestedWfhDate)} ➔ ชดเชย: ${formatThaiDate(s.compensateOfficeDate)}`,
        reason: s.reason,
        status: s.status,
        createdAt: s.createdAt,
        actionBy: s.actionBy,
        actionReason: s.actionReason,
        actionAt: s.actionAt,
      };
    }),
    ...remoteCheckIns.map(r => {
      const emp = employees.find(e => e.id === r.empId);
      return {
        id: r.id,
        type: 'REMOTE_CHECKIN' as const,
        empId: r.empId,
        empName: emp ? emp.name : 'Unknown',
        empPosition: emp ? emp.position : '',
        detail: `แจ้งเข้าออฟฟิศ (${r.purposeLabel || 'ภารกิจทั่วไป'}) ${r.isAllowanceEligible ? '💰 เบิกเบี้ยเลี้ยง' : ''} [${r.totalDays} วัน]`,
        dateInfo: `${formatThaiDate(r.startDate)}${r.startDate !== r.endDate ? ` - ${formatThaiDate(r.endDate)}` : ''}`,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
        actionBy: r.actionBy,
        actionReason: r.actionReason,
        actionAt: r.actionAt,
      };
    })
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'ALL' && log.type !== filterType) return false;
    if (filterStatus !== 'ALL' && log.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return log.empName.toLowerCase().includes(q) ||
             log.detail.toLowerCase().includes(q) ||
             log.reason.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'รหัสรายการ',
      'ประเภท',
      'พนักงาน',
      'ตำแหน่ง',
      'รายละเอียด',
      'วันที่ขอ/สลับ',
      'เหตุผล',
      'สถานะ',
      'วันที่ยื่นคำขอ',
      'ผู้อนุมัติ',
      'ความเห็นผู้อนุมัติ',
      'วันที่พิจารณา'
    ];

    const rows = filteredLogs.map(l => [
      l.id,
      l.type === 'LEAVE' ? 'ขอลางาน' : l.type === 'SWAP' ? 'สลับวัน WFH' : 'แจ้งเข้าออฟฟิศ (ตจว.)',
      l.empName,
      l.empPosition,
      l.detail,
      l.dateInfo,
      l.reason,
      l.status,
      l.createdAt,
      l.actionBy || '-',
      l.actionReason || '-',
      l.actionAt || '-'
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `company_leave_wfh_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'ส่งออกบันทึกสำเร็จ', 'ดาวน์โหลดไฟล์ CSV ประวัติคำขอทั้งองค์กรเรียบร้อยแล้ว');
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>ประวัติคำขอทั้งองค์กร & ส่งออกรายงาน (Company-Wide Logs)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบประวัติการลางานและการขอสลับวัน WFH ทั้งหมด พร้อมระบบส่งออกไฟล์สำหรับงานบุคคล
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออกรายงาน CSV ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อพนักงาน, เหตุผล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">ประเภททั้งหมด (Leave, Swap & Travel)</option>
            <option value="LEAVE">คำขอลางานเท่านั้น (Leave Only)</option>
            <option value="SWAP">คำขอสลับวัน WFH เท่านั้น (Swap Only)</option>
            <option value="REMOTE_CHECKIN">แจ้งเข้าออฟฟิศ/เบี้ยเลี้ยง (Remote Check-in)</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">สถานะทั้งหมด (All Status)</option>
            <option value="PENDING">รออนุมัติ (Pending)</option>
            <option value="APPROVED">อนุมัติแล้ว (Approved)</option>
            <option value="REJECTED">ไม่อนุมัติ (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
              <th className="py-3 px-4 font-bold min-w-[170px]">พนักงาน</th>
              <th className="py-3 px-3 font-bold min-w-[150px]">ประเภทคำขอ</th>
              <th className="py-3 px-3 font-bold min-w-[200px]">วันที่ / ช่วงเวลา</th>
              <th className="py-3 px-3 font-bold min-w-[200px]">เหตุผล</th>
              <th className="py-3 px-3 font-bold min-w-[120px] text-center">สถานะ</th>
              <th className="py-3 px-3 font-bold min-w-[160px]">การพิจารณา</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                
                {/* Employee */}
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{log.empName}</div>
                  <div className="text-[11px] text-slate-500">{log.empPosition}</div>
                </td>

                {/* Request Type */}
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    log.type === 'LEAVE'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : log.type === 'SWAP'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {log.type === 'LEAVE' ? '🏖️ ' : log.type === 'SWAP' ? '🔄 ' : '💰 '}
                    {log.detail}
                  </span>
                </td>

                {/* Date info */}
                <td className="py-3 px-3 font-medium text-slate-800">
                  {log.dateInfo}
                </td>

                {/* Reason */}
                <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={log.reason}>
                  {log.reason}
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    log.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : log.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {log.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {log.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                    {log.status === 'REJECTED' && <XCircle className="w-3 h-3 text-rose-600" />}
                    {log.status}
                  </span>
                </td>

                {/* Action By */}
                <td className="py-3 px-3 text-[11px] text-slate-500">
                  {log.actionBy ? (
                    <div>
                      <span className="font-medium text-slate-800">{log.actionBy}</span>
                      {log.actionAt && (
                        <span className="text-[10px] text-slate-400 block">{log.actionAt}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">ยังไม่พิจารณา</span>
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
