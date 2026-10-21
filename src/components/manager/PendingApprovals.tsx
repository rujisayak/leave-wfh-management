import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  Palmtree, 
  ThermometerSnowflake, 
  UserCheck, 
  ArrowLeftRight, 
  ExternalLink,
  Coins,
  Building,
  Inbox
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatThaiDate } from '../../utils/dateUtils';
import { getEmployeeLeaveSummary } from '../../utils/leaveCalculator';
import { LeaveRequest, WfhSwapRequest, RemoteCheckInRequest } from '../../types';

export const PendingApprovals: React.FC = () => {
  const { 
    currentEmployee, 
    employees, 
    leaveRequests, 
    wfhSwaps, 
    remoteCheckIns,
    reviewLeaveRequest, 
    reviewWfhSwapRequest,
    reviewRemoteCheckInRequest 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LEAVE' | 'SWAP' | 'REMOTE'>('ALL');
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  // If current employee is MANAGER, show team members where managerId === currentEmployee.id (or if HR, show all)
  const isHR = currentEmployee.role === 'HR';
  const myTeamEmpIds = isHR 
    ? employees.map(e => e.id)
    : employees.filter(e => e.managerId === currentEmployee.id || e.id === currentEmployee.id).map(e => e.id);

  const pendingLeaves = leaveRequests.filter(lr => 
    lr.status === 'PENDING' && myTeamEmpIds.includes(lr.empId)
  );

  const pendingSwaps = wfhSwaps.filter(sw => 
    sw.status === 'PENDING' && myTeamEmpIds.includes(sw.empId)
  );

  const pendingRemoteCheckIns = remoteCheckIns.filter(rc => 
    rc.status === 'PENDING' && myTeamEmpIds.includes(rc.empId)
  );

  const handleCommentChange = (id: string, text: string) => {
    setCommentMap(prev => ({ ...prev, [id]: text }));
  };

  const handleApproveLeave = (req: LeaveRequest) => {
    reviewLeaveRequest(req.id, 'APPROVED', commentMap[req.id]);
    setCommentMap(prev => {
      const next = { ...prev };
      delete next[req.id];
      return next;
    });
  };

  const handleRejectLeave = (req: LeaveRequest) => {
    const comment = commentMap[req.id] || 'ไม่อนุมัติคำขอตามความเหมาะสมของภาระงาน';
    reviewLeaveRequest(req.id, 'REJECTED', comment);
    setCommentMap(prev => {
      const next = { ...prev };
      delete next[req.id];
      return next;
    });
  };

  const handleApproveSwap = (swap: WfhSwapRequest) => {
    reviewWfhSwapRequest(swap.id, 'APPROVED', commentMap[swap.id]);
    setCommentMap(prev => {
      const next = { ...prev };
      delete next[swap.id];
      return next;
    });
  };

  const handleRejectSwap = (swap: WfhSwapRequest) => {
    const comment = commentMap[swap.id] || 'ไม่อนุมัติเนื่องจากจำนวนผู้เข้าออฟฟิศในวันที่ระบุไม่เพียงพอ';
    reviewWfhSwapRequest(swap.id, 'REJECTED', comment);
    setCommentMap(prev => {
      const next = { ...prev };
      delete next[swap.id];
      return next;
    });
  };

  const handleApproveRemoteCheckIn = (chk: RemoteCheckInRequest) => {
    reviewRemoteCheckInRequest(chk.id, 'APPROVED', commentMap[chk.id]);
    setCommentMap(prev => {
      const next = { ...prev };
      delete next[chk.id];
      return next;
    });
  };

  const handleRejectRemoteCheckIn = (chk: RemoteCheckInRequest) => {
    const comment = commentMap[chk.id] || 'ไม่อนุมัติการเดินทางเข้าออฟฟิศในรอบนี้';
    reviewRemoteCheckInRequest(chk.id, 'REJECTED', comment);
    setCommentMap(prev => {
      const next = { ...prev };
      delete next[chk.id];
      return next;
    });
  };

  const totalPending = pendingLeaves.length + pendingSwaps.length + pendingRemoteCheckIns.length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              รายการรอการอนุมัติของทีม (Pending Approvals)
            </h3>
            {totalPending > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                {totalPending} รายการ
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ไม่มีรายการค้าง
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            พิจารณาอนุมัติคำขอลางาน, การสลับวัน WFH, และคำขอเข้าออฟฟิศพร้อมเบี้ยเลี้ยงของพนักงาน
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium flex-wrap">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({totalPending})
          </button>
          <button
            onClick={() => setActiveFilter('LEAVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'LEAVE'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ขอลางาน ({pendingLeaves.length})
          </button>
          <button
            onClick={() => setActiveFilter('SWAP')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'SWAP'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สลับวัน WFH ({pendingSwaps.length})
          </button>
          <button
            onClick={() => setActiveFilter('REMOTE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'REMOTE'
                ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เข้าออฟฟิศ ตจว. ({pendingRemoteCheckIns.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-5 space-y-4">
        {totalPending === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">ไม่มีรายการที่ต้องพิจารณาในขณะนี้</h4>
            <p className="text-xs text-slate-400 mt-1">
              คำขอทั้งหมดของทีมได้รับการพิจารณาครบถ้วนแล้ว
            </p>
          </div>
        ) : (
          <>
            {/* 1. Pending Remote Check-Ins (Allowance Eligible) */}
            {(activeFilter === 'ALL' || activeFilter === 'REMOTE') && pendingRemoteCheckIns.map(chk => {
              const emp = employees.find(e => e.id === chk.empId);
              if (!emp) return null;

              return (
                <div
                  key={chk.id}
                  className="bg-white rounded-2xl border-2 border-emerald-300/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />

                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                      <Coins className="w-6 h-6 text-amber-300" />
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {emp.name}
                        </span>
                        <span className="text-xs text-slate-500">({emp.position})</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <Coins className="w-3.5 h-3.5 text-amber-600" />
                          แจ้งเข้าออฟฟิศ (ตจว. ขอรับเบี้ยเลี้ยง)
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          {chk.purposeLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                        <div className="bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                          วันที่เข้าออฟฟิศ: {formatThaiDate(chk.startDate)}
                          {chk.startDate !== chk.endDate && ` ถึง ${formatThaiDate(chk.endDate)}`}
                        </div>
                        <span className="text-emerald-700 font-bold">
                          ({chk.totalDays} วันทำงาน)
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-2">
                        <span className="font-semibold text-slate-900">รายละเอียดภารกิจ:</span>{' '}
                        {chk.reason}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>ยื่นคำขอเมื่อ: {chk.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <input
                      type="text"
                      placeholder="ความเห็นการอนุมัติเบี้ยเลี้ยง (ถ้ามี)"
                      value={commentMap[chk.id] || ''}
                      onChange={(e) => handleCommentChange(chk.id, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 w-full lg:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        onClick={() => handleRejectRemoteCheckIn(chk)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>ปฏิเสธ</span>
                      </button>

                      <button
                        onClick={() => handleApproveRemoteCheckIn(chk)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>อนุมัติ (รับเบี้ยเลี้ยง)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. Pending WFH Swaps */}
            {(activeFilter === 'ALL' || activeFilter === 'SWAP') && pendingSwaps.map(swap => {
              const emp = employees.find(e => e.id === swap.empId);
              if (!emp) return null;

              return (
                <div
                  key={swap.id}
                  className="bg-white rounded-2xl border-2 border-purple-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />

                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                      {emp.name.charAt(3) || emp.name.charAt(0)}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {emp.name}
                        </span>
                        <span className="text-xs text-slate-500">({emp.position})</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <ArrowLeftRight className="w-3 h-3" />
                          ขอสลับวัน WFH เฉพาะกิจ
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                        <div className="bg-purple-50 text-purple-900 px-2.5 py-1 rounded-lg border border-purple-200 font-semibold">
                          🏠 ขอ WFH: {formatThaiDate(swap.requestedWfhDate)}
                        </div>
                        <span className="text-slate-400 font-bold">➔</span>
                        <div className="bg-teal-50 text-teal-900 px-2.5 py-1 rounded-lg border border-teal-200 font-semibold">
                          🏢 เข้าออฟฟิศชดเชย: {formatThaiDate(swap.compensateOfficeDate)}
                        </div>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                          ✓ อยู่ในสัปดาห์เดียวกัน
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-2">
                        <span className="font-semibold text-slate-900">เหตุผลความจำเป็น:</span>{' '}
                        {swap.reason}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>ยื่นคำขอเมื่อ: {swap.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <input
                      type="text"
                      placeholder="ความเห็นประกอบการอนุมัติ (ถ้ามี)"
                      value={commentMap[swap.id] || ''}
                      onChange={(e) => handleCommentChange(swap.id, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 w-full lg:w-56 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        onClick={() => handleRejectSwap(swap)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>ปฏิเสธ</span>
                      </button>

                      <button
                        onClick={() => handleApproveSwap(swap)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>อนุมัติสลับวัน</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 3. Pending Leaves */}
            {(activeFilter === 'ALL' || activeFilter === 'LEAVE') && pendingLeaves.map(leave => {
              const emp = employees.find(e => e.id === leave.empId);
              if (!emp) return null;
              const summary = getEmployeeLeaveSummary(emp);

              const leaveIcon = leave.leaveType === 'VACATION' 
                ? <Palmtree className="w-4 h-4 text-indigo-600" />
                : leave.leaveType === 'SICK'
                ? <ThermometerSnowflake className="w-4 h-4 text-rose-600" />
                : <UserCheck className="w-4 h-4 text-amber-600" />;

              const leaveLabel = leave.leaveType === 'VACATION' ? 'ลาพักร้อน' : leave.leaveType === 'SICK' ? 'ลาป่วย' : 'ลากิจ';

              return (
                <div
                  key={leave.id}
                  className="bg-white rounded-2xl border-2 border-indigo-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />

                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                      {emp.name.charAt(3) || emp.name.charAt(0)}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {emp.name}
                        </span>
                        <span className="text-xs text-slate-500">({emp.position})</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {leaveIcon}
                          ขอ{leaveLabel}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          {leave.durationType === 'FULL' && `เต็มวัน (${leave.totalDays} วัน)`}
                          {leave.durationType === 'HALF_MORNING' && 'ครึ่งเช้า (0.5 วัน)'}
                          {leave.durationType === 'HALF_AFTERNOON' && 'ครึ่งบ่าย (0.5 วัน)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                        <div className="bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-200 font-semibold">
                          วันที่ขอลา: {formatThaiDate(leave.startDate)}
                          {leave.startDate !== leave.endDate && ` ถึง ${formatThaiDate(leave.endDate)}`}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          (โควตาพักร้อนคงเหลือ: <strong>{summary.vacation.remaining}</strong> วัน)
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-2">
                        <span className="font-semibold text-slate-900">เหตุผล:</span>{' '}
                        {leave.reason}
                      </div>

                      {leave.attachmentUrl && (
                        <div className="pt-1">
                          <a
                            href={leave.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline bg-indigo-50/50 px-2.5 py-1 rounded-lg border border-indigo-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>ดูไฟล์เอกสารแนบ / ใบรับรองแพทย์</span>
                          </a>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>ยื่นคำขอเมื่อ: {leave.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <input
                      type="text"
                      placeholder="ความเห็นประกอบการอนุมัติ (ถ้ามี)"
                      value={commentMap[leave.id] || ''}
                      onChange={(e) => handleCommentChange(leave.id, e.target.value)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 w-full lg:w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="flex items-center gap-2 w-full justify-end">
                      <button
                        onClick={() => handleRejectLeave(leave)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>ปฏิเสธ</span>
                      </button>

                      <button
                        onClick={() => handleApproveLeave(leave)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>อนุมัติการลา</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

    </div>
  );
};
