import { Employee, VacationCalculationResult } from '../types';

export const STANDARD_SICK_LEAVE_DAYS = 30;
export const STANDARD_PERSONAL_LEAVE_DAYS = 3;

export const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Calculates vacation quota according to the company tenure & pro-rate rules.
 * @param employee The employee object
 * @param currentYear Target calculation year (defaults to current year, e.g. 2026)
 */
export function calculateVacationQuota(
  employee: Employee,
  currentYear: number = new Date().getFullYear()
): VacationCalculationResult {
  // 1. Check manual override first if set
  const hasOverride = employee.vacationQuotaOverride !== undefined && 
                        employee.vacationQuotaOverride !== null;

  // 2. Not passed probation yet
  if (!employee.isPassedProbation || !employee.passProbationDate) {
    const calc = 0;
    return {
      tierLabel: 'อยู่ระหว่างทดลองงาน',
      yearDiff: 0,
      calculatedDays: calc,
      finalDays: hasOverride ? employee.vacationQuotaOverride! : calc,
      isOverrideApplied: hasOverride,
      explanation: 'พนักงานยังไม่ผ่านการทดลองงาน ยังไม่ได้รับสิทธิ์วันลาพักร้อนประจำปี',
      breakdown: '0 วัน (ยังไม่ผ่านโปร)'
    };
  }

  const passDate = new Date(employee.passProbationDate);
  const passYear = passDate.getFullYear();
  const passMonth = passDate.getMonth() + 1; // 1-12
  const monthName = MONTH_NAMES_TH[passMonth - 1] || `เดือนที่ ${passMonth}`;

  // If calculation year is before the year they pass probation
  if (currentYear < passYear) {
    const calc = 0;
    return {
      tierLabel: 'ยังไม่ถึงปีที่ผ่านทดลองงาน',
      yearDiff: currentYear - passYear,
      calculatedDays: calc,
      finalDays: hasOverride ? employee.vacationQuotaOverride! : calc,
      isOverrideApplied: hasOverride,
      explanation: `ผ่านทดลองงานในปี ค.ศ. ${passYear}`,
      breakdown: '0 วัน'
    };
  }

  // 3. Year 0 (The calendar year the employee passes probation)
  if (currentYear === passYear) {
    // Special Rule: If officially appointed as a permanent employee on January 1st
    if (employee.isAppointedJan1) {
      const calc = 6.0;
      return {
        tierLabel: 'Year 0 (บรรจุ 1 ม.ค. ได้สิทธิ์พิเศษ)',
        yearDiff: 0,
        calculatedDays: calc,
        finalDays: hasOverride ? employee.vacationQuotaOverride! : calc,
        isOverrideApplied: hasOverride,
        explanation: 'ได้รับแต่งตั้งเป็นพนักงานประจำในวันที่ 1 มกราคม ได้รับสิทธิ์ Year 0 เต็ม 6.0 วัน',
        breakdown: 'เงื่อนไขพิเศษบรรจุ 1 ม.ค. = 6.0 วัน'
      };
    }

    // Standard Pro-Rate formula: (12 - passMonth) * 0.5
    const prorated = Math.max(0, (12 - passMonth) * 0.5);
    return {
      tierLabel: `Year 0 (เฉลี่ยตามสัดส่วนผ่านโปร ${monthName})`,
      yearDiff: 0,
      calculatedDays: prorated,
      finalDays: hasOverride ? employee.vacationQuotaOverride! : prorated,
      isOverrideApplied: hasOverride,
      explanation: `ผ่านการทดลองงานเดือน ${monthName} (เดือน ${passMonth}) คำนวณตามสูตร (12 - ${passMonth}) × 0.5 วัน = ${prorated} วัน`,
      breakdown: `(12 - ${passMonth}) × 0.5 = ${prorated} วัน`
    };
  }

  // 4. Year 1+ (Counted starting Jan 1st of the year AFTER passing probation)
  const yearDiff = currentYear - passYear;

  let calculatedDays = 0;
  let tierLabel = '';

  if (yearDiff === 1) {
    calculatedDays = 6.0;
    tierLabel = 'Year 1 (ปีแรกหลังผ่านโปร)';
  } else if (yearDiff === 2 || yearDiff === 3) {
    calculatedDays = 10.0;
    tierLabel = `Year ${yearDiff} (อายุงาน 2 - 3 ปี)`;
  } else if (yearDiff === 4 || yearDiff === 5) {
    calculatedDays = 15.0;
    tierLabel = `Year ${yearDiff} (อายุงาน 4 - 5 ปี)`;
  } else {
    calculatedDays = 20.0;
    tierLabel = `Year ${yearDiff} (อายุงาน 6 ปีขึ้นไป)`;
  }

  return {
    tierLabel,
    yearDiff,
    calculatedDays,
    finalDays: hasOverride ? employee.vacationQuotaOverride! : calculatedDays,
    isOverrideApplied: hasOverride,
    explanation: `ผ่านโปรปี ${passYear} (อายุงานปีที่ ${yearDiff}) ได้รับสิทธิ์ลาพักร้อน ${calculatedDays} วัน`,
    breakdown: `เกณฑ์อายุงานปีที่ ${yearDiff} = ${calculatedDays} วัน`
  };
}

/**
 * Returns remaining quota summary for an employee
 */
export function getEmployeeLeaveSummary(
  employee: Employee,
  currentYear: number = new Date().getFullYear()
) {
  const vacationQuota = calculateVacationQuota(employee, currentYear);
  const totalVacation = vacationQuota.finalDays;
  const usedVacation = employee.usedLeave?.vacation || 0;
  const remainingVacation = Math.max(0, totalVacation - usedVacation);

  const totalSick = STANDARD_SICK_LEAVE_DAYS;
  const usedSick = employee.usedLeave?.sick || 0;
  const remainingSick = Math.max(0, totalSick - usedSick);

  const totalPersonal = STANDARD_PERSONAL_LEAVE_DAYS;
  const usedPersonal = employee.usedLeave?.personal || 0;
  const remainingPersonal = Math.max(0, totalPersonal - usedPersonal);

  return {
    vacation: {
      total: totalVacation,
      used: usedVacation,
      remaining: remainingVacation,
      tierLabel: vacationQuota.tierLabel,
      explanation: vacationQuota.explanation,
      isOverrideApplied: vacationQuota.isOverrideApplied,
      calculatedDays: vacationQuota.calculatedDays,
    },
    sick: {
      total: totalSick,
      used: usedSick,
      remaining: remainingSick,
    },
    personal: {
      total: totalPersonal,
      used: usedPersonal,
      remaining: remainingPersonal,
    }
  };
}
