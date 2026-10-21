import { 
  Employee, 
  LeaveRequest, 
  WfhSwapRequest, 
  RemoteCheckInRequest,
  CompanyOfficeDay,
  DayAttendanceStatus, 
  DayAttendanceType 
} from '../types';
import { getDayOfWeekNumber, isSameCalendarWeek } from './dateUtils';

/**
 * Returns default scheduled WFH days of the week (1=Mon, ..., 5=Fri) for an employee
 */
export function getScheduledWfhDayNumbers(employee: Employee): number[] {
  if (employee.locationType === 'REMOTE_100' || employee.wfhGroup === 'REMOTE_100') {
    return [1, 2, 3, 4, 5];
  }
  switch (employee.wfhGroup) {
    case 'GROUP_A':
      return [1, 2]; // Mon, Tue
    case 'GROUP_B':
      return [2, 3]; // Tue, Wed
    case 'GROUP_C':
      return [4, 5]; // Thu, Fri
    case 'CUSTOM':
      return employee.customWfhDays || [];
    default:
      return [];
  }
}

/**
 * Returns human-readable Thai description of WFH group
 */
export function getWfhGroupDescription(employee: Employee): { name: string; schedule: string; badge: string } {
  if (employee.locationType === 'REMOTE_100' || employee.wfhGroup === 'REMOTE_100') {
    return {
      name: 'ต่างจังหวัด 100% (Remote)',
      schedule: 'WFH ทุกวัน (จันทร์ - ศุกร์)',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
  }
  switch (employee.wfhGroup) {
    case 'GROUP_A':
      return {
        name: 'Group A',
        schedule: 'WFH: จันทร์, อังคาร | ออฟฟิศ: พุธ - ศุกร์',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    case 'GROUP_B':
      return {
        name: 'Group B',
        schedule: 'WFH: อังคาร, พุธ | ออฟฟิศ: จันทร์, พฤหัสฯ - ศุกร์',
        badge: 'bg-violet-50 text-violet-700 border-violet-200'
      };
    case 'CUSTOM':
    case 'GROUP_C':
    default: {
      const days = (employee.customWfhDays || []).map(d => {
        const map: Record<number, string> = { 1: 'จ.', 2: 'อ.', 3: 'พ.', 4: 'พฤ.', 5: 'ศ.' };
        return map[d] || '';
      }).filter(Boolean).join(', ');
      return {
        name: 'Custom (แล้วแต่คน)',
        schedule: `WFH: ${days || 'กำหนดเอง'}`,
        badge: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    }
  }
}

/**
 * Check baseline schedule: is this date normally a WFH day for this employee?
 */
export function isNormallyWfhDay(employee: Employee, dateStr: string): boolean {
  if (employee.locationType === 'REMOTE_100' || employee.wfhGroup === 'REMOTE_100') {
    return true;
  }
  const dayNum = getDayOfWeekNumber(dateStr);
  const wfhDays = getScheduledWfhDayNumbers(employee);
  return wfhDays.includes(dayNum);
}

/**
 * Get exact daily attendance status for an employee on a given date,
 * combining baseline schedule + approved leave requests + approved WFH swaps 
 * + company mandatory office days + remote check-in requests.
 */
export function getDailyAttendanceStatus(
  employee: Employee,
  dateStr: string,
  leaveRequests: LeaveRequest[] = [],
  wfhSwaps: WfhSwapRequest[] = [],
  remoteCheckIns: RemoteCheckInRequest[] = [],
  companyOfficeDays: CompanyOfficeDay[] = []
): DayAttendanceStatus {
  const dayNum = getDayOfWeekNumber(dateStr);
  if (dayNum === 0 || dayNum === 6) {
    return {
      type: 'HOLIDAY_WEEKEND',
      labelTh: 'วันหยุด',
      badgeColor: 'bg-slate-100 text-slate-400 border-slate-200',
      isOfficeHeadcount: false,
    };
  }

  // 1. Check Approved Leaves first (takes priority)
  const approvedLeave = leaveRequests.find(lr => 
    lr.empId === employee.id &&
    lr.status === 'APPROVED' &&
    dateStr >= lr.startDate &&
    dateStr <= lr.endDate
  );

  if (approvedLeave) {
    const leaveLabelMap = {
      SICK: 'ลาป่วย (Sick)',
      PERSONAL: 'ลากิจ (Personal)',
      VACATION: 'ลาพักร้อน (Vacation)'
    };
    const typeLabel = leaveLabelMap[approvedLeave.leaveType];

    if (approvedLeave.durationType === 'HALF_MORNING') {
      return {
        type: 'LEAVE_HALF_MORNING',
        labelTh: `ลาเช้า (${typeLabel})`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        isOfficeHeadcount: true,
        note: approvedLeave.reason
      };
    }
    if (approvedLeave.durationType === 'HALF_AFTERNOON') {
      return {
        type: 'LEAVE_HALF_AFTERNOON',
        labelTh: `ลาบ่าย (${typeLabel})`,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        isOfficeHeadcount: true,
        note: approvedLeave.reason
      };
    }
    return {
      type: 'LEAVE_FULL',
      labelTh: `ลางาน (${typeLabel})`,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      isOfficeHeadcount: false,
      note: approvedLeave.reason
    };
  }

  // 2. Check Company Mandatory Office / Training Days (HR Event)
  const companyDay = companyOfficeDays.find(cd => {
    if (cd.date !== dateStr) return false;
    if (cd.targetType === 'ALL') return true;
    if (cd.targetType === 'HYBRID') return employee.locationType === 'HYBRID';
    if (cd.targetType === 'CUSTOM') return (cd.targetEmployeeIds || []).includes(employee.id);
    return false;
  });

  if (companyDay) {
    const isRemote = employee.locationType === 'REMOTE_100';
    return {
      type: 'COMPANY_MANDATORY_OFFICE',
      labelTh: isRemote ? '🏢 เข้าออฟฟิศ (💰 เบี้ยเลี้ยง)' : '🏢 เข้าออฟฟิศ (อบรม/กิจกรรม)',
      badgeColor: isRemote 
        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
        : 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs',
      isOfficeHeadcount: true,
      hasAllowance: true,
      note: isRemote 
        ? `${companyDay.title} (วันเข้าออฟฟิศส่วนรวม - มีสิทธิ์รับเบี้ยเลี้ยงเดินทาง)`
        : `${companyDay.title} (วันเข้าออฟฟิศส่วนรวม - มีสิทธิ์รับเบี้ยเลี้ยงเข้าออฟฟิศ)`
    };
  }

  // 3. Check Approved Remote Check-In (Allowance for Remote 100%)
  if (employee.locationType === 'REMOTE_100') {
    const approvedRemoteCheckIn = remoteCheckIns.find(rc => 
      rc.empId === employee.id &&
      rc.status === 'APPROVED' &&
      dateStr >= rc.startDate &&
      dateStr <= rc.endDate
    );

    if (approvedRemoteCheckIn) {
      return {
        type: 'REMOTE_OFFICE_ALLOWANCE',
        labelTh: '🏢 เข้าออฟฟิศ (💰 เบี้ยเลี้ยง)',
        badgeColor: 'bg-teal-600 text-white border-teal-600 font-semibold shadow-xs',
        isOfficeHeadcount: true,
        hasAllowance: true,
        note: `${approvedRemoteCheckIn.purposeLabel}: ${approvedRemoteCheckIn.reason} (มีสิทธิ์รับเบี้ยเลี้ยง)`
      };
    }
  }

  // 4. Check Approved WFH Swaps (Hybrid)
  const approvedSwap = wfhSwaps.find(sw => 
    sw.empId === employee.id &&
    sw.status === 'APPROVED' &&
    (sw.requestedWfhDate === dateStr || sw.compensateOfficeDate === dateStr)
  );

  if (approvedSwap) {
    if (approvedSwap.requestedWfhDate === dateStr) {
      return {
        type: 'SWAPPED_WFH',
        labelTh: 'WFH (สลับเฉพาะกิจ)',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 font-medium',
        isOfficeHeadcount: false,
        note: `สลับมาจากวันชดเชย: ${approvedSwap.compensateOfficeDate} (เหตุผล: ${approvedSwap.reason})`
      };
    }
    if (approvedSwap.compensateOfficeDate === dateStr) {
      return {
        type: 'COMPENSATED_OFFICE',
        labelTh: 'เข้าออฟฟิศ (ชดเชย)',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 font-medium ring-1 ring-teal-400',
        isOfficeHeadcount: true,
        hasAllowance: true,
        note: `เข้าออฟฟิศชดเชยวัน: ${approvedSwap.requestedWfhDate} (มีสิทธิ์รับเบี้ยเลี้ยง)`
      };
    }
  }

  // 5. Baseline WFH vs Office
  if (employee.locationType === 'REMOTE_100' || employee.wfhGroup === 'REMOTE_100') {
    return {
      type: 'REMOTE_100',
      labelTh: 'ตจว. 100%',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isOfficeHeadcount: false,
    };
  }

  const isWfh = isNormallyWfhDay(employee, dateStr);
  if (isWfh) {
    return {
      type: 'FIXED_WFH',
      labelTh: 'WFH ประจำ',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      isOfficeHeadcount: false,
    };
  }

  return {
    type: 'OFFICE',
    labelTh: 'ออฟฟิศ',
    badgeColor: 'bg-blue-600 text-white border-blue-600 font-medium shadow-sm',
    isOfficeHeadcount: true,
    hasAllowance: true,
  };
}

export interface AllowanceDayItem {
  date: string;
  title: string;
  type: 'OFFICE' | 'COMPENSATED' | 'COMPANY_EVENT' | 'CHECK_IN' | 'HALF_DAY';
  dayFraction: number;
}

/**
 * Calculates accumulated monthly allowance days for ANY employee in a given month.
 * Rule: Everyone who enters the office gets the allowance (ได้ทุกคนที่เข้าออฟฟิศ).
 */
export function calculateMonthlyAllowanceDays(
  employeeId: string,
  year: number,
  month: number,
  remoteCheckIns: RemoteCheckInRequest[] = [],
  companyOfficeDays: CompanyOfficeDay[] = [],
  employees: Employee[] = [],
  leaveRequests: LeaveRequest[] = [],
  wfhSwaps: WfhSwapRequest[] = []
): {
  totalDays: number;
  dates: string[];
  items: AllowanceDayItem[];
} {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) {
    return { totalDays: 0, dates: [], items: [] };
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const items: AllowanceDayItem[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const cur = new Date(year, month - 1, d);
    const dayOfWeek = cur.getDay();
    // Weekends (Sunday=0, Saturday=6) do not have work/allowance
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const status = getDailyAttendanceStatus(
      emp,
      dateStr,
      leaveRequests,
      wfhSwaps,
      remoteCheckIns,
      companyOfficeDays
    );

    if (status.isOfficeHeadcount || status.hasAllowance) {
      let itemType: AllowanceDayItem['type'] = 'OFFICE';
      let fraction = 1.0;
      let title = 'เข้าปฏิบัติงานที่ออฟฟิศตามตารางปกติ';

      if (status.type === 'COMPANY_MANDATORY_OFFICE') {
        itemType = 'COMPANY_EVENT';
        title = status.note || 'วันเข้าออฟฟิศส่วนกลาง / อบรมรวม';
      } else if (status.type === 'REMOTE_OFFICE_ALLOWANCE') {
        itemType = 'CHECK_IN';
        title = status.note || 'แจ้งเข้าออฟฟิศ (พนักงานต่างจังหวัด)';
      } else if (status.type === 'COMPENSATED_OFFICE') {
        itemType = 'COMPENSATED';
        title = status.note || 'เข้าออฟฟิศชดเชย (สลับ WFH)';
      } else if (status.type === 'LEAVE_HALF_MORNING' || status.type === 'LEAVE_HALF_AFTERNOON') {
        itemType = 'HALF_DAY';
        fraction = 0.5;
        title = status.note || 'เข้าปฏิบัติงานครึ่งวัน (ลาครึ่งวัน)';
      }

      items.push({
        date: dateStr,
        title,
        type: itemType,
        dayFraction: fraction
      });
    }
  }

  const totalDays = items.reduce((sum, it) => sum + it.dayFraction, 0);

  return {
    totalDays,
    dates: items.map(i => i.date),
    items
  };
}

/**
 * Validation result helper for WFH Swap form
 */
export interface WfhSwapValidation {
  isValid: boolean;
  errorMessage?: string;
  requestedWfhDayName?: string;
  compensateOfficeDayName?: string;
}

export function validateWfhSwap(
  employee: Employee,
  requestedWfhDate: string,
  compensateOfficeDate: string,
  existingSwaps: WfhSwapRequest[] = [],
  existingLeaves: LeaveRequest[] = []
): WfhSwapValidation {
  if (employee.locationType === 'REMOTE_100') {
    return {
      isValid: false,
      errorMessage: 'พนักงานประเภทต่างจังหวัด 100% ไม่จำเป็นต้องขอสลับวัน WFH'
    };
  }

  if (!requestedWfhDate || !compensateOfficeDate) {
    return {
      isValid: false,
      errorMessage: 'กรุณาเลือกทั้งวันที่ต้องการ WFH และวันที่เข้าออฟฟิศชดเชย'
    };
  }

  if (requestedWfhDate === compensateOfficeDate) {
    return {
      isValid: false,
      errorMessage: 'วันที่ขอ WFH และวันที่ชดเชยต้องไม่ใช่วันเดียวกัน'
    };
  }

  const reqDay = getDayOfWeekNumber(requestedWfhDate);
  const compDay = getDayOfWeekNumber(compensateOfficeDate);

  if (reqDay === 0 || reqDay === 6 || compDay === 0 || compDay === 6) {
    return {
      isValid: false,
      errorMessage: 'การสลับวัน WFH สามารถทำได้เฉพาะวันทำงานปกติ (จันทร์ - ศุกร์) เท่านั้น'
    };
  }

  // Must be in the exact same calendar week
  if (!isSameCalendarWeek(requestedWfhDate, compensateOfficeDate)) {
    return {
      isValid: false,
      errorMessage: 'เงื่อนไขสำคัญ: วันที่ขอ WFH และวันที่เข้าชดเชยต้องอยู่ภายในสัปดาห์เดียวกัน (จันทร์ - ศุกร์) เท่านั้น'
    };
  }

  // Requested date MUST normally be an Office day
  if (isNormallyWfhDay(employee, requestedWfhDate)) {
    return {
      isValid: false,
      errorMessage: `วันที่ ${requestedWfhDate} เป็นวัน WFH ประจำของคุณอยู่แล้ว จึงไม่จำเป็นต้องขอ WFH ซ้ำ`
    };
  }

  // Compensate date MUST normally be a WFH day
  if (!isNormallyWfhDay(employee, compensateOfficeDate)) {
    return {
      isValid: false,
      errorMessage: `วันที่ ${compensateOfficeDate} เป็นวันเข้าออฟฟิศปกติของคุณอยู่แล้ว ไม่สามารถใช้เป็นวันชดเชยได้ (ต้องเลือกวันที่ปกติเป็น WFH)`
    };
  }

  // Check conflicts with existing pending or approved swaps
  const hasConflict = existingSwaps.some(sw => 
    sw.empId === employee.id &&
    sw.status !== 'REJECTED' &&
    (sw.requestedWfhDate === requestedWfhDate || 
     sw.requestedWfhDate === compensateOfficeDate ||
     sw.compensateOfficeDate === requestedWfhDate ||
     sw.compensateOfficeDate === compensateOfficeDate)
  );

  if (hasConflict) {
    return {
      isValid: false,
      errorMessage: 'วันที่ระบุมีรายการขอสลับวัน WFH ที่รออนุมัติหรืออนุมัติแล้วอยู่แล้ว'
    };
  }

  // Check conflicts with approved leave
  const hasLeaveConflict = existingLeaves.some(lr =>
    lr.empId === employee.id &&
    lr.status === 'APPROVED' &&
    ((requestedWfhDate >= lr.startDate && requestedWfhDate <= lr.endDate) ||
     (compensateOfficeDate >= lr.startDate && compensateOfficeDate <= lr.endDate))
  );

  if (hasLeaveConflict) {
    return {
      isValid: false,
      errorMessage: 'หนึ่งในวันที่เลือกตรงกับวันที่มีการอนุมัติการลางานแล้ว'
    };
  }

  return { isValid: true };
}
