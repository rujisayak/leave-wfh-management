import React, { useState } from 'react';
import { 
  FileText, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  MessageSquare,
  Filter,
  Palmtree,
  ThermometerSnowflake,
  UserCheck,
  Coins,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatThaiDate } from '../../utils/dateUtils';
import { LeaveRequest, WfhSwapRequest, RemoteCheckInRequest } from '../../types';

export const MyRequestHistory: React.FC = () => {
  const { currentEmployee, leaveRequests, wfhSwaps, remoteCheckIns } = useApp();
  const [filterType, setFilterType] = useState<'ALL' | 'LEAVE' | 'SWAP' | 'REMOTE' | 'PENDING'>('ALL');

  // Filter requests strictly for current employee
  const myLeaves = leaveRequests.filter(lr => lr.empId === currentEmployee.id);
  const mySwaps = wfhSwaps.filter(sw => sw.empId === currentEmployee.id);
  const myRemoteCheckIns = remoteCheckIns.filter(rc => rc.empId === currentEmployee.id);

  interface CombinedItem {
    id: string;
    type: 'LEAVE' | 'SWAP' | 'REMOTE';
    data: LeaveRequest | WfhSwapRequest | RemoteCheckInRequest;
    createdAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }

  const combinedItems: CombinedItem[] = [
    ...myLeaves.map(l => ({ id: l.id, type: 'LEAVE' as const, data: l, createdAt: l.createdAt, status: l.status })),
    ...mySwaps.map(s => ({ id: s.id, type: 'SWAP' as const, data: s, createdAt: s.createdAt, status: s.status })),
    ...myRemoteCheckIns.map(r => ({ id: r.id, type: 'REMOTE' as const, data: r, createdAt: r.createdAt, status: r.status }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredItems = combinedItems.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'LEAVE') return item.type === 'LEAVE';
    if (filterType === 'SWAP') return item.type === 'SWAP';
    if (filterType === 'REMOTE') return item.type === 'REMOTE';
    if (filterType === 'PENDING') return item.status === 'PENDING';
    return true;
  });

  const getStatusBadge = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            รออนุมัติ (Pending)
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            อนุมัติแล้ว (Approved)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            ไม่อนุมัติ (Rejected)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            ประวัติการยื่นคำขอของฉัน (My Request History)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            แสดงเฉพาะรายการคำขอลางาน, สลับวัน WFH, และการแจ้งเข้าออฟฟิศของ {currentEmployee.name}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium flex-wrap">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({combinedItems.length})
          </button>
          <button
            onClick={() => setFilterType('LEAVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'LEAVE'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ขอลางาน ({myLeaves.length})
          </button>
          {currentEmployee.locationType !== 'REMOTE_100' && (
            <button
              onClick={() => setFilterType('SWAP')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'SWAP'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สลับวัน WFH ({mySwaps.length})
            </button>
          )}
          {currentEmployee.locationType === 'REMOTE_100' && (
            <button
              onClick={() => setFilterType('REMOTE')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === 'REMOTE'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แจ้งเข้าออฟฟิศ ({myRemoteCheckIns.length})
            </button>
          )}
          <button
            onClick={() => setFilterType('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterType === 'PENDING'
                ? 'bg-white text-amber-700 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รออนุมัติ ({combinedItems.filter(i => i.status === 'PENDING').length})
          </button>
        </div>
      </div>

      {/* List / Table */}
      <div className="mt-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">ไม่มีประวัติคำขอ</p>
            <p className="text-xs text-slate-400 mt-1">ยังไม่มีรายการคำขอในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredItems.map(item => {
              const isLeave = item.type === 'LEAVE';
              const isSwap = item.type === 'SWAP';
              const isRemote = item.type === 'REMOTE';

              const leave = isLeave ? (item.data as LeaveRequest) : null;
              const swap = isSwap ? (item.data as WfhSwapRequest) : null;
              const remote = isRemote ? (item.data as RemoteCheckInRequest) : null;

              return (
                <div key={item.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition-colors">
                  
                  {/* Left: Type badge & details */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      {isLeave && (
                        leave?.leaveType === 'VACATION' ? (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Palmtree className="w-5 h-5" />
                          </div>
                        ) : leave?.leaveType === 'SICK' ? (
                          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <ThermometerSnowflake className="w-5 h-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <UserCheck className="w-5 h-5" />
                          </div>
                        )
                      )}

                      {isSwap && (
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <ArrowLeftRight className="w-5 h-5" />
                        </div>
                      )}

                      {isRemote && (
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Coins className="w-5 h-5 text-amber-600" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isLeave && leave && (
                          <>
                            <span className="font-bold text-slate-900 text-sm">
                              {leave.leaveType === 'VACATION' && '🏖️ ขอลางาน (พักร้อน)'}
                              {leave.leaveType === 'SICK' && '🤒 ขอลางาน (ลาป่วย)'}
                              {leave.leaveType === 'PERSONAL' && '👤 ขอลางาน (ลากิจ)'}
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {leave.durationType === 'FULL' && `เต็มวัน (${leave.totalDays} วัน)`}
                              {leave.durationType === 'HALF_MORNING' && 'ครึ่งวันเช้า (0.5 วัน)'}
                              {leave.durationType === 'HALF_AFTERNOON' && 'ครึ่งวันบ่าย (0.5 วัน)'}
                            </span>
                          </>
                        )}

                        {isSwap && swap && (
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                            <span>ขอสลับวัน WFH เฉพาะกิจ (Same-Week)</span>
                          </span>
                        )}

                        {isRemote && remote && (
                          <>
                            <span className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                              <Building className="w-4 h-4 text-emerald-600" />
                              <span>แจ้งเข้าปฏิบัติงานที่ออฟฟิศ</span>
                            </span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                              💰 เบี้ยเลี้ยงเดินทาง ({remote.totalDays} วัน)
                            </span>
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                              {remote.purposeLabel}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="text-xs text-slate-700 mt-1 font-medium">
                        {isLeave && leave && (
                          <span>
                            วันที่ลา: {formatThaiDate(leave.startDate)}
                            {leave.startDate !== leave.endDate && ` ถึง ${formatThaiDate(leave.endDate)}`}
                          </span>
                        )}
                        {isSwap && swap && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                              🏠 ขอ WFH: {formatThaiDate(swap.requestedWfhDate)}
                            </span>
                            <span>➔</span>
                            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                              🏢 เข้าออฟฟิศชดเชย: {formatThaiDate(swap.compensateOfficeDate)}
                            </span>
                          </div>
                        )}
                        {isRemote && remote && (
                          <div className="text-emerald-800 font-semibold">
                            วันที่เข้าออฟฟิศ: {formatThaiDate(remote.startDate)}
                            {remote.startDate !== remote.endDate && ` ถึง ${formatThaiDate(remote.endDate)}`}
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        <span className="text-slate-400">รายละเอียด:</span> {item.data.reason}
                      </p>

                      {/* Attachment if present */}
                      {isLeave && leave?.attachmentUrl && (
                        <a
                          href={leave.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline mt-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>ดูเอกสารแนบ / ใบรับรองแพทย์</span>
                        </a>
                      )}

                      {/* Manager action feedback */}
                      {item.data.actionReason && (
                        <div className="mt-2 text-xs bg-slate-100/90 text-slate-800 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-900">
                              ความเห็นจากผู้อนุมัติ ({item.data.actionBy || 'หัวหน้างาน'}):
                            </span>{' '}
                            <span>{item.data.actionReason}</span>
                            {item.data.actionAt && (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                วันที่พิจารณา: {item.data.actionAt}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status badge & timestamp */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-1 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div>{getStatusBadge(item.status)}</div>
                    <span className="text-[11px] text-slate-400">
                      ยื่นเมื่อ: {item.createdAt}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
