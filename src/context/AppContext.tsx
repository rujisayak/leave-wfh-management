import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Employee, 
  LeaveRequest, 
  WfhSwapRequest, 
  RemoteCheckInRequest,
  CompanyOfficeDay,
  Role 
} from '../types';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_WFH_SWAPS,
  INITIAL_REMOTE_CHECKINS,
  INITIAL_COMPANY_OFFICE_DAYS
} from '../data/initialData';
import { validateWfhSwap } from '../utils/wfhSchedule';
import { initDemoNetworkGuard } from '../utils/demoGuard';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  employees: Employee[];
  currentEmployee: Employee;
  setCurrentEmployeeId: (id: string) => void;
  leaveRequests: LeaveRequest[];
  wfhSwaps: WfhSwapRequest[];
  remoteCheckIns: RemoteCheckInRequest[];
  companyOfficeDays: CompanyOfficeDay[];
  activeTab: 'employee' | 'team_manager' | 'hr_admin';
  setActiveTab: (tab: 'employee' | 'team_manager' | 'hr_admin') => void;
  currentDateStr: string;
  setCurrentDateStr: (date: string) => void;

  // Demo Sandbox Mode
  isDemoMode: boolean;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
  resetDemoData: () => void;
  
  // Actions
  addLeaveRequest: (req: {
    leaveType: LeaveRequest['leaveType'];
    durationType: LeaveRequest['durationType'];
    totalDays: number;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => { success: boolean; message: string };

  addWfhSwapRequest: (req: {
    requestedWfhDate: string;
    compensateOfficeDate: string;
    reason: string;
  }) => { success: boolean; message: string };

  addRemoteCheckInRequest: (req: {
    startDate: string;
    endDate: string;
    totalDays: number;
    purposeType: RemoteCheckInRequest['purposeType'];
    purposeLabel: string;
    reason: string;
  }) => { success: boolean; message: string };

  reviewLeaveRequest: (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => void;
  reviewWfhSwapRequest: (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => void;
  reviewRemoteCheckInRequest: (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => void;
  
  // HR Company Days
  addCompanyOfficeDay: (day: Omit<CompanyOfficeDay, 'id' | 'createdAt' | 'createdBy'>) => void;
  deleteCompanyOfficeDay: (id: string) => void;

  // HR Master Data
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // System Reset
  resetToDefaultData: () => void;

  // Toasts
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROD_STORAGE_KEYS = {
  EMPLOYEES: 'leave_wfh_employees_v2',
  LEAVES: 'leave_wfh_leaves_v2',
  SWAPS: 'leave_wfh_swaps_v2',
  REMOTE_CHECKINS: 'leave_wfh_remote_checkins_v2',
  COMPANY_DAYS: 'leave_wfh_company_days_v2',
  CURRENT_EMP_ID: 'leave_wfh_current_emp_v2',
};

const DEMO_STORAGE_KEYS = {
  EMPLOYEES: 'demo_leave_wfh_employees_v2',
  LEAVES: 'demo_leave_wfh_leaves_v2',
  SWAPS: 'demo_leave_wfh_swaps_v2',
  REMOTE_CHECKINS: 'demo_leave_wfh_remote_checkins_v2',
  COMPANY_DAYS: 'demo_leave_wfh_company_days_v2',
  CURRENT_EMP_ID: 'demo_leave_wfh_current_emp_v2',
};

// Check if demo mode is requested either from URL query param or from active sessionStorage
const checkIsDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true' || params.get('demo') === '1') {
      sessionStorage.setItem('is_demo_mode', 'true');
      return true;
    }
    return sessionStorage.getItem('is_demo_mode') === 'true';
  } catch {
    return false;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(checkIsDemoMode);

  // Load state from sessionStorage in demo mode, or localStorage in prod mode, fallback to seed
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const isDemo = checkIsDemoMode();
      const storage = isDemo ? window.sessionStorage : window.localStorage;
      const key = isDemo ? DEMO_STORAGE_KEYS.EMPLOYEES : PROD_STORAGE_KEYS.EMPLOYEES;
      const saved = storage.getItem(key);
      if (saved) {
        const parsed: Employee[] = JSON.parse(saved);
        // Migrate legacy GROUP_C to CUSTOM
        return parsed.map(emp => {
          if ((emp.wfhGroup as string) === 'GROUP_C') {
            return {
              ...emp,
              wfhGroup: 'CUSTOM',
              customWfhDays: emp.customWfhDays && emp.customWfhDays.length > 0 ? emp.customWfhDays : [4, 5]
            };
          }
          return emp;
        });
      }
      return INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const isDemo = checkIsDemoMode();
      const storage = isDemo ? window.sessionStorage : window.localStorage;
      const key = isDemo ? DEMO_STORAGE_KEYS.LEAVES : PROD_STORAGE_KEYS.LEAVES;
      const saved = storage.getItem(key);
      return saved ? JSON.parse(saved) : INITIAL_LEAVE_REQUESTS;
    } catch {
      return INITIAL_LEAVE_REQUESTS;
    }
  });

  const [wfhSwaps, setWfhSwaps] = useState<WfhSwapRequest[]>(() => {
    try {
      const isDemo = checkIsDemoMode();
      const storage = isDemo ? window.sessionStorage : window.localStorage;
      const key = isDemo ? DEMO_STORAGE_KEYS.SWAPS : PROD_STORAGE_KEYS.SWAPS;
      const saved = storage.getItem(key);
      return saved ? JSON.parse(saved) : INITIAL_WFH_SWAPS;
    } catch {
      return INITIAL_WFH_SWAPS;
    }
  });

  const [remoteCheckIns, setRemoteCheckIns] = useState<RemoteCheckInRequest[]>(() => {
    try {
      const isDemo = checkIsDemoMode();
      const storage = isDemo ? window.sessionStorage : window.localStorage;
      const key = isDemo ? DEMO_STORAGE_KEYS.REMOTE_CHECKINS : PROD_STORAGE_KEYS.REMOTE_CHECKINS;
      const saved = storage.getItem(key);
      return saved ? JSON.parse(saved) : INITIAL_REMOTE_CHECKINS;
    } catch {
      return INITIAL_REMOTE_CHECKINS;
    }
  });

  const [companyOfficeDays, setCompanyOfficeDays] = useState<CompanyOfficeDay[]>(() => {
    try {
      const isDemo = checkIsDemoMode();
      const storage = isDemo ? window.sessionStorage : window.localStorage;
      const key = isDemo ? DEMO_STORAGE_KEYS.COMPANY_DAYS : PROD_STORAGE_KEYS.COMPANY_DAYS;
      const saved = storage.getItem(key);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_OFFICE_DAYS;
    } catch {
      return INITIAL_COMPANY_OFFICE_DAYS;
    }
  });

  const [currentEmployeeId, setCurrentEmployeeIdState] = useState<string>(() => {
    try {
      const isDemo = checkIsDemoMode();
      const storage = isDemo ? window.sessionStorage : window.localStorage;
      const key = isDemo ? DEMO_STORAGE_KEYS.CURRENT_EMP_ID : PROD_STORAGE_KEYS.CURRENT_EMP_ID;
      const saved = storage.getItem(key);
      return saved || 'emp-001';
    } catch {
      return 'emp-001';
    }
  });

  const [activeTab, setActiveTab] = useState<'employee' | 'team_manager' | 'hr_admin'>('employee');
  const [currentDateStr, setCurrentDateStr] = useState<string>('2026-10-19'); // Monday of target week
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Install the network mutation guard and greet demo visitors
  useEffect(() => {
    initDemoNetworkGuard();
    if (checkIsDemoMode()) {
      showToast(
        'info',
        '✨ เข้าสู่ Interactive Demo Mode',
        'ยินดีต้อนรับสู่โหมดทดลองเล่น Sandbox! คุณสามารถทดลองยื่นคำขอ อนุมัติ และจัดการข้อมูลได้อิสระ โดยข้อมูลจะจำลองในหน่วยความจำชั่วคราว ไม่กระทบฐานข้อมูลจริง'
      );
    }
  }, []);

  // Auto-sync state: in Demo Mode strictly to sessionStorage; in normal mode to localStorage
  useEffect(() => {
    try {
      const storage = isDemoMode ? window.sessionStorage : window.localStorage;
      const key = isDemoMode ? DEMO_STORAGE_KEYS.EMPLOYEES : PROD_STORAGE_KEYS.EMPLOYEES;
      storage.setItem(key, JSON.stringify(employees));
    } catch (e) {
      console.error(e);
    }
  }, [employees, isDemoMode]);

  useEffect(() => {
    try {
      const storage = isDemoMode ? window.sessionStorage : window.localStorage;
      const key = isDemoMode ? DEMO_STORAGE_KEYS.LEAVES : PROD_STORAGE_KEYS.LEAVES;
      storage.setItem(key, JSON.stringify(leaveRequests));
    } catch (e) {
      console.error(e);
    }
  }, [leaveRequests, isDemoMode]);

  useEffect(() => {
    try {
      const storage = isDemoMode ? window.sessionStorage : window.localStorage;
      const key = isDemoMode ? DEMO_STORAGE_KEYS.SWAPS : PROD_STORAGE_KEYS.SWAPS;
      storage.setItem(key, JSON.stringify(wfhSwaps));
    } catch (e) {
      console.error(e);
    }
  }, [wfhSwaps, isDemoMode]);

  useEffect(() => {
    try {
      const storage = isDemoMode ? window.sessionStorage : window.localStorage;
      const key = isDemoMode ? DEMO_STORAGE_KEYS.REMOTE_CHECKINS : PROD_STORAGE_KEYS.REMOTE_CHECKINS;
      storage.setItem(key, JSON.stringify(remoteCheckIns));
    } catch (e) {
      console.error(e);
    }
  }, [remoteCheckIns, isDemoMode]);

  useEffect(() => {
    try {
      const storage = isDemoMode ? window.sessionStorage : window.localStorage;
      const key = isDemoMode ? DEMO_STORAGE_KEYS.COMPANY_DAYS : PROD_STORAGE_KEYS.COMPANY_DAYS;
      storage.setItem(key, JSON.stringify(companyOfficeDays));
    } catch (e) {
      console.error(e);
    }
  }, [companyOfficeDays, isDemoMode]);

  useEffect(() => {
    try {
      const storage = isDemoMode ? window.sessionStorage : window.localStorage;
      const key = isDemoMode ? DEMO_STORAGE_KEYS.CURRENT_EMP_ID : PROD_STORAGE_KEYS.CURRENT_EMP_ID;
      storage.setItem(key, currentEmployeeId);
    } catch (e) {
      console.error(e);
    }
  }, [currentEmployeeId, isDemoMode]);

  const currentEmployee = employees.find(e => e.id === currentEmployeeId) || employees[0];

  // Helper toast
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setCurrentEmployeeId = (id: string) => {
    setCurrentEmployeeIdState(id);
    const target = employees.find(e => e.id === id);
    if (target) {
      // Auto-switch tabs to a suitable view based on role
      if (target.role === 'HR') {
        setActiveTab('hr_admin');
      } else if (target.role === 'MANAGER') {
        setActiveTab('team_manager');
      } else {
        setActiveTab('employee');
      }
      showToast('info', 'สลับบทบาทเรียบร้อย', `เข้าใช้งานในฐานะ: ${target.name} (${target.position})`);
    }
  };

  const addLeaveRequest = (req: {
    leaveType: LeaveRequest['leaveType'];
    durationType: LeaveRequest['durationType'];
    totalDays: number;
    startDate: string;
    endDate: string;
    reason: string;
    attachmentUrl?: string;
  }) => {
    // Check if probation allows vacation
    if (req.leaveType === 'VACATION' && !currentEmployee.isPassedProbation) {
      showToast('error', 'ไม่สามารถส่งคำขอได้', 'พนักงานอยู่ระหว่างทดลองงาน ยังไม่มีสิทธิ์ลาพักร้อน');
      return { success: false, message: 'พนักงานอยู่ระหว่างทดลองงาน ยังไม่มีสิทธิ์ลาพักร้อน' };
    }

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      empId: currentEmployee.id,
      leaveType: req.leaveType,
      durationType: req.durationType,
      totalDays: req.totalDays,
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason,
      attachmentUrl: req.attachmentUrl,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setLeaveRequests(prev => [newReq, ...prev]);
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.8 } });
    showToast('success', 'ส่งคำขอลางานสำเร็จ', 'คำขอของคุณถูกส่งไปยังหัวหน้างานเพื่อพิจารณาเรียบร้อยแล้ว');
    return { success: true, message: 'บันทึกคำขอเรียบร้อยแล้ว' };
  };

  const addWfhSwapRequest = (req: {
    requestedWfhDate: string;
    compensateOfficeDate: string;
    reason: string;
  }) => {
    // Validate
    const validation = validateWfhSwap(
      currentEmployee,
      req.requestedWfhDate,
      req.compensateOfficeDate,
      wfhSwaps,
      leaveRequests
    );

    if (!validation.isValid) {
      showToast('error', 'เงื่อนไขไม่ถูกต้อง', validation.errorMessage || 'ข้อมูลไม่ถูกต้อง');
      return { success: false, message: validation.errorMessage || 'ข้อมูลไม่ถูกต้อง' };
    }

    const newSwap: WfhSwapRequest = {
      id: `swap-${Date.now()}`,
      empId: currentEmployee.id,
      requestedWfhDate: req.requestedWfhDate,
      compensateOfficeDate: req.compensateOfficeDate,
      reason: req.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setWfhSwaps(prev => [newSwap, ...prev]);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 } });
    showToast('success', 'ส่งคำขอสลับวัน WFH สำเร็จ', 'ส่งคำขอไปยังหัวหน้างานเรียบร้อยแล้ว เมื่อได้รับอนุมัติ ตารางงานจะอัปเดตอัตโนมัติ');
    return { success: true, message: 'บันทึกคำขอสลับวันเรียบร้อยแล้ว' };
  };

  const addRemoteCheckInRequest = (req: {
    startDate: string;
    endDate: string;
    totalDays: number;
    purposeType: RemoteCheckInRequest['purposeType'];
    purposeLabel: string;
    reason: string;
  }) => {
    const newReq: RemoteCheckInRequest = {
      id: `chk-${Date.now()}`,
      empId: currentEmployee.id,
      startDate: req.startDate,
      endDate: req.endDate,
      totalDays: req.totalDays,
      purposeType: req.purposeType,
      purposeLabel: req.purposeLabel,
      reason: req.reason,
      isAllowanceEligible: true,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setRemoteCheckIns(prev => [newReq, ...prev]);
    confetti({ particleCount: 75, spread: 65, origin: { y: 0.8 } });
    showToast('success', 'แจ้งเข้าออฟฟิศสำเร็จ', 'ส่งคำขอแจ้งเข้าออฟฟิศและขอรับเบี้ยเลี้ยงไปยังหัวหน้างานเรียบร้อยแล้ว');
    return { success: true, message: 'บันทึกคำขอแจ้งเข้าออฟฟิศเรียบร้อย' };
  };

  const reviewLeaveRequest = (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
    const target = leaveRequests.find(r => r.id === requestId);
    if (!target) return;

    setLeaveRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: action,
          actionReason: reason || (action === 'APPROVED' ? 'อนุมัติคำขอเรียบร้อย' : 'ปฏิเสธคำขอ'),
          actionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actionBy: currentEmployee.name,
        };
      }
      return r;
    }));

    // If approved, update employee's usedLeave
    if (action === 'APPROVED') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setEmployees(prev => prev.map(emp => {
        if (emp.id === target.empId) {
          const typeKey = target.leaveType.toLowerCase() as 'sick' | 'personal' | 'vacation';
          return {
            ...emp,
            usedLeave: {
              ...emp.usedLeave,
              [typeKey]: Number(((emp.usedLeave[typeKey] || 0) + target.totalDays).toFixed(1))
            }
          };
        }
        return emp;
      }));
      showToast('success', 'อนุมัติการลางานแล้ว', `ตัดโควตาการลาสำเร็จ และระบบได้อัปเดตตารางเข้างานของทีมเรียบร้อยแล้ว`);
    } else {
      showToast('info', 'ปฏิเสธคำขอลางาน', `ส่งข้อความแจ้งผลการพิจารณาเรียบร้อยแล้ว`);
    }
  };

  const reviewWfhSwapRequest = (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
    setWfhSwaps(prev => prev.map(s => {
      if (s.id === requestId) {
        return {
          ...s,
          status: action,
          actionReason: reason || (action === 'APPROVED' ? 'อนุมัติการสลับวัน WFH เรียบร้อย' : 'ปฏิเสธการสลับวัน WFH'),
          actionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actionBy: currentEmployee.name,
        };
      }
      return s;
    }));

    if (action === 'APPROVED') {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      showToast('success', 'อนุมัติสลับวัน WFH แล้ว', 'ตารางประจำสัปดาห์ของทีมได้รับการอัปเดตสถานะสลับวันและเข้าชดเชยอัตโนมัติ (ไม่ตัดโควตาวันลา)');
    } else {
      showToast('info', 'ปฏิเสธการสลับวัน WFH', 'บันทึกผลการพิจารณาเรียบร้อย');
    }
  };

  const reviewRemoteCheckInRequest = (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
    setRemoteCheckIns(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: action,
          actionReason: reason || (action === 'APPROVED' ? 'อนุมัติการเข้าออฟฟิศและเบิกเบี้ยเลี้ยงเรียบร้อย' : 'ปฏิเสธคำขอ'),
          actionAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actionBy: currentEmployee.name,
        };
      }
      return r;
    }));

    if (action === 'APPROVED') {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      showToast('success', 'อนุมัติเข้าออฟฟิศ (เบี้ยเลี้ยง)', 'อัปเดตตารางเป็นเข้าออฟฟิศพร้อมติดป้าย 💰 เบี้ยเลี้ยง และนับยอดเข้า Headcount เรียบร้อยแล้ว');
    } else {
      showToast('info', 'ปฏิเสธคำขอเข้าออฟฟิศ', 'บันทึกผลการพิจารณาเรียบร้อย');
    }
  };

  const addCompanyOfficeDay = (day: Omit<CompanyOfficeDay, 'id' | 'createdAt' | 'createdBy'>) => {
    const newDay: CompanyOfficeDay = {
      ...day,
      id: `comp-day-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      createdBy: currentEmployee.name,
    };
    setCompanyOfficeDays(prev => [...prev, newDay]);
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    showToast('success', 'กำหนดวันเข้าออฟฟิศพิเศษสำเร็จ', `ประกาศวัน "${day.title}" (${day.date}) ให้พนักงานในกลุ่มเป้าหมายเรียบร้อยแล้ว`);
  };

  const deleteCompanyOfficeDay = (id: string) => {
    setCompanyOfficeDays(prev => prev.filter(d => d.id !== id));
    showToast('info', 'ลบวันเข้าออฟฟิศพิเศษแล้ว', 'ยกเลิกรายการวันที่กำหนดเรียบร้อย');
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, newEmp]);
    showToast('success', 'เพิ่มพนักงานสำเร็จ', `เพิ่มข้อมูลคุณ ${newEmp.name} เรียบร้อยแล้ว`);
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...empData } : e));
    showToast('success', 'อัปเดตข้อมูลสำเร็จ', 'บันทึกการเปลี่ยนแปลงข้อมูลพนักงานเรียบร้อย');
  };

  const deleteEmployee = (id: string) => {
    if (employees.length <= 1) {
      showToast('error', 'ไม่สามารถลบได้', 'ต้องมีพนักงานในระบบอย่างน้อย 1 คน');
      return;
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast('info', 'ลบพนักงานสำเร็จ', 'ลบข้อมูลออกจากระบบแล้ว');
  };

  const resetDemoData = () => {
    try {
      Object.values(DEMO_STORAGE_KEYS).forEach(k => sessionStorage.removeItem(k));
    } catch {}
    setEmployees(INITIAL_EMPLOYEES);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setWfhSwaps(INITIAL_WFH_SWAPS);
    setRemoteCheckIns(INITIAL_REMOTE_CHECKINS);
    setCompanyOfficeDays(INITIAL_COMPANY_OFFICE_DAYS);
    setCurrentEmployeeIdState('emp-001');
    setActiveTab('employee');
    showToast('success', 'รีเซ็ตข้อมูลเดโมเรียบร้อย', 'กู้คืนข้อมูลจำลองเริ่มต้นสำหรับทดสอบเรียบร้อยแล้ว');
  };

  const enterDemoMode = () => {
    try {
      sessionStorage.setItem('is_demo_mode', 'true');
    } catch {}
    setIsDemoMode(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('demo', 'true');
      window.history.replaceState({}, '', url.toString());
    } catch {}
    resetDemoData();
    showToast(
      'info',
      '✨ เปิดใช้งาน Interactive Demo Mode',
      'เข้าสู่เซสชัน Demo Guest เรียบร้อยแล้ว การกระทำทั้งหมดจะจำลองในหน่วยความจำเท่านั้น'
    );
  };

  const exitDemoMode = () => {
    try {
      sessionStorage.removeItem('is_demo_mode');
      Object.values(DEMO_STORAGE_KEYS).forEach(k => sessionStorage.removeItem(k));
    } catch {}
    setIsDemoMode(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('demo');
      window.history.replaceState({}, '', url.toString());
    } catch {}

    // Reload from prod localStorage
    try {
      const savedEmp = localStorage.getItem(PROD_STORAGE_KEYS.EMPLOYEES);
      setEmployees(savedEmp ? JSON.parse(savedEmp) : INITIAL_EMPLOYEES);

      const savedLeaves = localStorage.getItem(PROD_STORAGE_KEYS.LEAVES);
      setLeaveRequests(savedLeaves ? JSON.parse(savedLeaves) : INITIAL_LEAVE_REQUESTS);

      const savedSwaps = localStorage.getItem(PROD_STORAGE_KEYS.SWAPS);
      setWfhSwaps(savedSwaps ? JSON.parse(savedSwaps) : INITIAL_WFH_SWAPS);

      const savedRemote = localStorage.getItem(PROD_STORAGE_KEYS.REMOTE_CHECKINS);
      setRemoteCheckIns(savedRemote ? JSON.parse(savedRemote) : INITIAL_REMOTE_CHECKINS);

      const savedCompany = localStorage.getItem(PROD_STORAGE_KEYS.COMPANY_DAYS);
      setCompanyOfficeDays(savedCompany ? JSON.parse(savedCompany) : INITIAL_COMPANY_OFFICE_DAYS);

      const savedId = localStorage.getItem(PROD_STORAGE_KEYS.CURRENT_EMP_ID);
      setCurrentEmployeeIdState(savedId || 'emp-001');
    } catch {
      setEmployees(INITIAL_EMPLOYEES);
      setLeaveRequests(INITIAL_LEAVE_REQUESTS);
      setWfhSwaps(INITIAL_WFH_SWAPS);
      setRemoteCheckIns(INITIAL_REMOTE_CHECKINS);
      setCompanyOfficeDays(INITIAL_COMPANY_OFFICE_DAYS);
      setCurrentEmployeeIdState('emp-001');
    }

    setActiveTab('employee');
    showToast('info', 'ออกจาก Demo Mode', 'กลับสู่โหมดข้อมูลปกติเรียบร้อย');
  };

  const resetToDefaultData = () => {
    if (isDemoMode) {
      resetDemoData();
      return;
    }
    try {
      Object.values(PROD_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    } catch {}
    setEmployees(INITIAL_EMPLOYEES);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setWfhSwaps(INITIAL_WFH_SWAPS);
    setRemoteCheckIns(INITIAL_REMOTE_CHECKINS);
    setCompanyOfficeDays(INITIAL_COMPANY_OFFICE_DAYS);
    setCurrentEmployeeIdState('emp-001');
    setActiveTab('employee');
    showToast('success', 'รีเซ็ตข้อมูลเริ่มต้นแล้ว', 'กู้คืนข้อมูลจำลองสำหรับการทดสอบเรียบร้อย');
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        currentEmployee,
        setCurrentEmployeeId,
        leaveRequests,
        wfhSwaps,
        remoteCheckIns,
        companyOfficeDays,
        activeTab,
        setActiveTab,
        currentDateStr,
        setCurrentDateStr,
        isDemoMode,
        enterDemoMode,
        exitDemoMode,
        resetDemoData,
        addLeaveRequest,
        addWfhSwapRequest,
        addRemoteCheckInRequest,
        reviewLeaveRequest,
        reviewWfhSwapRequest,
        reviewRemoteCheckInRequest,
        addCompanyOfficeDay,
        deleteCompanyOfficeDay,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        resetToDefaultData,
        toasts,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
