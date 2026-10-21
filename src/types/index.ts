export type Role = 'EMPLOYEE' | 'MANAGER' | 'HR';

export type LocationType = 'HYBRID' | 'REMOTE_100';

export type WfhGroup = 'GROUP_A' | 'GROUP_B' | 'GROUP_C' | 'REMOTE_100' | 'CUSTOM';

export type LeaveType = 'SICK' | 'PERSONAL' | 'VACATION';

export type LeaveDurationType = 'FULL' | 'HALF_MORNING' | 'HALF_AFTERNOON';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Employee {
  id: string;
  name: string;
  nameEn?: string;
  avatarUrl?: string;
  department: string;
  position: string;
  role: Role;
  managerId: string;
  startDate: string; // YYYY-MM-DD
  isPassedProbation: boolean;
  passProbationDate: string; // YYYY-MM-DD
  isAppointedJan1: boolean;
  locationType: LocationType;
  wfhGroup: WfhGroup;
  customWfhDays: number[]; // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  usedLeave: {
    sick: number;
    personal: number;
    vacation: number;
  };
  vacationQuotaOverride?: number | null;
}

export interface LeaveRequest {
  id: string;
  empId: string;
  leaveType: LeaveType;
  durationType: LeaveDurationType;
  totalDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  attachmentUrl?: string;
  status: RequestStatus;
  createdAt: string;
  actionReason?: string;
  actionAt?: string;
  actionBy?: string;
}

export interface WfhSwapRequest {
  id: string;
  empId: string;
  requestedWfhDate: string; // Normally an Office day
  compensateOfficeDate: string; // Normally a WFH day in the same week
  reason: string;
  status: RequestStatus;
  createdAt: string;
  actionReason?: string;
  actionAt?: string;
  actionBy?: string;
}

export type RemotePurposeType = 'TRAINING' | 'TOWNHALL' | 'CLIENT_MEETING' | 'OTHER';

export interface RemoteCheckInRequest {
  id: string;
  empId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  purposeType: RemotePurposeType;
  purposeLabel: string;
  reason: string;
  isAllowanceEligible: boolean; // default true for Remote 100%
  status: RequestStatus;
  createdAt: string;
  actionReason?: string;
  actionAt?: string;
  actionBy?: string;
}

export type CompanyOfficeTargetType = 'ALL' | 'HYBRID' | 'CUSTOM';

export interface CompanyOfficeDay {
  id: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "อบรมประจำปี 2026", "ประชุม Townhall Q4"
  targetType: CompanyOfficeTargetType;
  targetEmployeeIds?: string[];
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export type DayAttendanceType = 
  | 'OFFICE'                     // 🏢 ออฟฟิศ (ปกติ)
  | 'FIXED_WFH'                  // 🏠 WFH ประจำ
  | 'SWAPPED_WFH'                // 🔄 WFH (สลับเฉพาะกิจ)
  | 'COMPENSATED_OFFICE'         // 🏢 เข้าออฟฟิศ (ชดเชย)
  | 'REMOTE_100'                 // 🏠 ตจว. 100%
  | 'REMOTE_OFFICE_ALLOWANCE'    // 🏢 เข้าออฟฟิศ (💰 เบี้ยเลี้ยง)
  | 'COMPANY_MANDATORY_OFFICE'   // 🏢 เข้าออฟฟิศ (อบรม/กิจกรรม)
  | 'LEAVE_FULL'                 // 🏖️/🤒 ลางานเต็มวัน
  | 'LEAVE_HALF_MORNING'         // ⏳ ลาครึ่งเช้า
  | 'LEAVE_HALF_AFTERNOON'       // ⏳ ลาครึ่งบ่าย
  | 'HOLIDAY_WEEKEND';           // วันหยุดสุดสัปดาห์

export interface DayAttendanceStatus {
  type: DayAttendanceType;
  labelTh: string;
  badgeColor: string;
  isOfficeHeadcount: boolean; // Counts towards physical office presence
  note?: string;
  hasAllowance?: boolean;     // Indicates allowance eligible
}

export interface VacationCalculationResult {
  tierLabel: string;
  yearDiff: number;
  calculatedDays: number;
  finalDays: number;
  isOverrideApplied: boolean;
  explanation: string;
  breakdown: string;
}
