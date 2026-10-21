import { Employee, LeaveRequest, WfhSwapRequest, RemoteCheckInRequest, CompanyOfficeDay } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'นายสมศักดิ์ สุขใจ',
    nameEn: 'Somsak Sukjai',
    department: 'Software Engineering',
    position: 'Senior Frontend Developer',
    role: 'EMPLOYEE',
    managerId: 'emp-mgr-001',
    startDate: '2026-03-01',
    isPassedProbation: true,
    passProbationDate: '2026-06-01', // Pass month 6 -> (12 - 6) * 0.5 = 3.0 days (Year 0)
    isAppointedJan1: false,
    locationType: 'HYBRID',
    wfhGroup: 'CUSTOM', // Custom WFH: Thu-Fri | Office Mon-Wed
    customWfhDays: [4, 5],
    usedLeave: {
      sick: 1,
      personal: 0,
      vacation: 0
    }
  },
  {
    id: 'emp-002',
    name: 'นางสาวกานดา วิริยะ',
    nameEn: 'Kanda Wiriya',
    department: 'Software Engineering',
    position: 'Backend Engineer (Remote - เชียงใหม่)',
    role: 'EMPLOYEE',
    managerId: 'emp-mgr-001',
    startDate: '2023-05-15',
    isPassedProbation: true,
    passProbationDate: '2023-08-15', // YearDiff 3 -> 10.0 days (Year 2-3 tier)
    isAppointedJan1: false,
    locationType: 'REMOTE_100', // Upcountry Remote 100%
    wfhGroup: 'REMOTE_100',
    customWfhDays: [1, 2, 3, 4, 5],
    usedLeave: {
      sick: 2,
      personal: 1,
      vacation: 3
    }
  },
  {
    id: 'emp-003',
    name: 'นางสาวพิชญา มณีวงศ์',
    nameEn: 'Pitchaya Maneewong',
    department: 'Product Design',
    position: 'UI/UX Designer',
    role: 'EMPLOYEE',
    managerId: 'emp-mgr-001',
    startDate: '2025-01-10',
    isPassedProbation: true,
    passProbationDate: '2025-04-10', // YearDiff 1 -> 6.0 days (Year 1 tier)
    isAppointedJan1: false,
    locationType: 'HYBRID',
    wfhGroup: 'GROUP_A', // Mon-Tue WFH | Wed-Fri Office
    customWfhDays: [1, 2],
    usedLeave: {
      sick: 0,
      personal: 0,
      vacation: 1
    }
  },
  {
    id: 'emp-004',
    name: 'นายณัฐพล เจริญผล',
    nameEn: 'Natthaphon Charoenphol',
    department: 'Software Engineering',
    position: 'QA Automation Engineer',
    role: 'EMPLOYEE',
    managerId: 'emp-mgr-001',
    startDate: '2025-09-01',
    isPassedProbation: true,
    passProbationDate: '2026-01-01',
    isAppointedJan1: true, // Special rule: 6.0 days Year 0
    locationType: 'HYBRID',
    wfhGroup: 'GROUP_B', // Tue-Wed WFH | Mon, Thu-Fri Office
    customWfhDays: [2, 3],
    usedLeave: {
      sick: 1,
      personal: 0.5,
      vacation: 2
    }
  },
  {
    id: 'emp-005',
    name: 'นายวิชาญ เด่นดี',
    nameEn: 'Wichan Daendee',
    department: 'DevOps & Infrastructure',
    position: 'Junior DevOps Engineer (Probation)',
    role: 'EMPLOYEE',
    managerId: 'emp-mgr-001',
    startDate: '2026-08-15',
    isPassedProbation: false, // Under probation -> 0 vacation days
    passProbationDate: '2026-11-15',
    isAppointedJan1: false,
    locationType: 'HYBRID',
    wfhGroup: 'GROUP_B', // Tue-Wed WFH | Mon, Thu-Fri Office
    customWfhDays: [2, 3],
    usedLeave: {
      sick: 0,
      personal: 0,
      vacation: 0
    }
  },
  {
    id: 'emp-mgr-001',
    name: 'นายธนากร พัฒนเกียรติ',
    nameEn: 'Thanakorn Phatthanakiat',
    department: 'Engineering Leadership',
    position: 'Engineering Lead & Project Manager',
    role: 'MANAGER',
    managerId: 'emp-hr-001',
    startDate: '2021-02-01',
    isPassedProbation: true,
    passProbationDate: '2021-05-01', // YearDiff 5 -> 15.0 days (Year 4-5 tier)
    isAppointedJan1: false,
    locationType: 'HYBRID',
    wfhGroup: 'GROUP_A', // Mon-Tue WFH | Wed-Fri Office
    customWfhDays: [1, 2],
    usedLeave: {
      sick: 1,
      personal: 1,
      vacation: 4
    }
  },
  {
    id: 'emp-hr-001',
    name: 'นางสาวมณีรัตน์ ศรีสวัสดิ์',
    nameEn: 'Maneerat Srisawat',
    department: 'People & Culture',
    position: 'HR Director & Super Admin',
    role: 'HR',
    managerId: '',
    startDate: '2019-06-01',
    isPassedProbation: true,
    passProbationDate: '2019-09-01', // YearDiff 7 -> 20.0 days (Year 6+ tier)
    isAppointedJan1: false,
    locationType: 'HYBRID',
    wfhGroup: 'GROUP_B',
    customWfhDays: [2, 3],
    usedLeave: {
      sick: 0,
      personal: 0,
      vacation: 5
    }
  }
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-001',
    empId: 'emp-003', // Pitchaya
    leaveType: 'VACATION',
    durationType: 'FULL',
    totalDays: 1.0,
    startDate: '2026-10-21', // Wednesday
    endDate: '2026-10-21',
    reason: 'ต่อใบขับขี่และจัดการธุระครอบครัวที่ภูมิลำเนา',
    attachmentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    status: 'PENDING',
    createdAt: '2026-10-18 09:30:00'
  },
  {
    id: 'leave-002',
    empId: 'emp-004', // Natthaphon
    leaveType: 'PERSONAL',
    durationType: 'HALF_MORNING',
    totalDays: 0.5,
    startDate: '2026-10-22', // Thursday
    endDate: '2026-10-22',
    reason: 'นัดหมายโอนกรรมสิทธิ์ที่กรมที่ดินช่วงเช้า (บ่ายเข้าออฟฟิศปกติ)',
    status: 'APPROVED',
    createdAt: '2026-10-15 14:00:00',
    actionReason: 'อนุมัติเรียบร้อยครับ วางแผนงานรอบคอบดีมาก',
    actionAt: '2026-10-16 10:15:00',
    actionBy: 'นายธนากร พัฒนเกียรติ'
  },
  {
    id: 'leave-003',
    empId: 'emp-001', // Somsak
    leaveType: 'SICK',
    durationType: 'FULL',
    totalDays: 1.0,
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    reason: 'มีไข้สูง 38.5 องศาและไอหนัก พบแพทย์เรียบร้อย มีใบรับรองแพทย์แนบ',
    attachmentUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    createdAt: '2026-09-15 07:45:00',
    actionReason: 'อนุมัติ ขอให้หายป่วยไวๆ ครับ',
    actionAt: '2026-09-15 08:30:00',
    actionBy: 'นายธนากร พัฒนเกียรติ'
  }
];

export const INITIAL_WFH_SWAPS: WfhSwapRequest[] = [
  {
    id: 'swap-001',
    empId: 'emp-001', // Somsak (Group C: normally Thu-Fri WFH, Mon-Wed Office)
    requestedWfhDate: '2026-10-20', // Tuesday (Normally Office) -> wants to WFH
    compensateOfficeDate: '2026-10-22', // Thursday (Normally WFH) -> will come to Office instead
    reason: 'ช่างนัดมาตรวจซ่อมระบบอินเทอร์เน็ตและมิเตอร์ไฟฟ้าที่คอนโดช่วงบ่าย ขอย้ายวัน WFH มาวันอังคาร และเข้าออฟฟิศวันพฤหัสบดีทดแทนครับ',
    status: 'PENDING',
    createdAt: '2026-10-18 11:20:00'
  },
  {
    id: 'swap-002',
    empId: 'emp-004', // Natthaphon (Group B: normally Tue-Wed WFH, Mon, Thu-Fri Office)
    requestedWfhDate: '2026-10-19', // Monday (Normally Office) -> WFH
    compensateOfficeDate: '2026-10-21', // Wednesday (Normally WFH) -> Office
    reason: 'จำเป็นต้องรับพัสดุอุปกรณ์คอมพิวเตอร์ขนาดใหญ่ที่บ้าน ขอย้ายวัน WFH มาวันจันทร์',
    status: 'APPROVED',
    createdAt: '2026-10-17 16:00:00',
    actionReason: 'รับทราบและอนุมัติ มีทีมงาน stand-by ในออฟฟิศเพียงพอ',
    actionAt: '2026-10-17 17:30:00',
    actionBy: 'นายธนากร พัฒนเกียรติ'
  }
];

export const INITIAL_REMOTE_CHECKINS: RemoteCheckInRequest[] = [
  {
    id: 'chk-001',
    empId: 'emp-002', // Kanda (Remote 100%)
    startDate: '2026-10-14',
    endDate: '2026-10-15',
    totalDays: 2.0,
    purposeType: 'TRAINING',
    purposeLabel: 'เข้าอบรม (Training)',
    reason: 'เดินทางเข้าสำนักงานใหญ่เพื่อร่วมอบรมหลักสูตร Advanced Cloud Security & DevOps',
    isAllowanceEligible: true,
    status: 'APPROVED',
    createdAt: '2026-10-10 09:15:00',
    actionReason: 'อนุมัติการเดินทางและเบิกจ่ายเบี้ยเลี้ยงตามระเบียบพนักงานต่างจังหวัด',
    actionAt: '2026-10-11 11:00:00',
    actionBy: 'นายธนากร พัฒนเกียรติ'
  },
  {
    id: 'chk-002',
    empId: 'emp-002', // Kanda (Remote 100%)
    startDate: '2026-10-29',
    endDate: '2026-10-30',
    totalDays: 2.0,
    purposeType: 'TOWNHALL',
    purposeLabel: 'ประชุมบริษัท (Townhall/Meeting)',
    reason: 'เข้าร่วมสัมมนาวางแผนยุทธศาสตร์ทางเทคนิคประจำปี 2027 (Annual Tech Strategy Workshop)',
    isAllowanceEligible: true,
    status: 'PENDING',
    createdAt: '2026-10-18 16:20:00'
  }
];

export const INITIAL_COMPANY_OFFICE_DAYS: CompanyOfficeDay[] = [
  {
    id: 'comp-day-001',
    date: '2026-10-23', // Friday
    title: 'วันอบรมใหญ่ประจำปี 2026 (All Hands Training)',
    targetType: 'ALL', // ทุกคนรวม ตจว. 100%
    notes: 'จัดอบรมภาพรวมองค์กรและสังสรรค์พนักงาน (มีเบี้ยเลี้ยงเดินทางสำหรับพนักงานต่างจังหวัด)',
    createdAt: '2026-10-01 10:00:00',
    createdBy: 'นางสาวมณีรัตน์ ศรีสวัสดิ์'
  }
];
