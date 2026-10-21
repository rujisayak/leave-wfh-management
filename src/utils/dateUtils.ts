export const DAY_NAMES_TH_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
export const DAY_NAMES_TH_FULL = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];

// Monday-to-Sunday Thai labels for the 7-column calendar
export const CALENDAR_WEEKDAY_NAMES_TH = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
export const CALENDAR_WEEKDAY_FULL_TH = ['วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์', 'วันอาทิตย์'];

export const MONTH_NAMES_TH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const MONTH_NAMES_TH_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Format YYYY-MM-DD to readable Thai string
 * e.g. 2026-10-19 -> "จ. 19 ต.ค. 2026"
 */
export function formatThaiDate(dateString: string, includeDayOfWeek: boolean = true): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(d.getTime())) return dateString;

  const dayOfWeek = DAY_NAMES_TH_SHORT[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES_TH_SHORT[d.getMonth()];
  const year = d.getFullYear();

  if (includeDayOfWeek) {
    return `${dayOfWeek} ${day} ${month} ${year}`;
  }
  return `${day} ${month} ${year}`;
}

export function formatThaiDateFull(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  if (isNaN(d.getTime())) return dateString;

  const dayOfWeek = DAY_NAMES_TH_FULL[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES_TH_FULL[d.getMonth()];
  const year = d.getFullYear();

  return `${dayOfWeek}ที่ ${day} ${month} ${year}`;
}

/**
 * Format month and year: e.g. "ตุลาคม 2026"
 */
export function formatThaiMonthYear(year: number, month: number): string {
  return `${MONTH_NAMES_TH_FULL[month - 1]} ${year}`;
}

/**
 * Returns YYYY-MM-DD string from Date
 */
export function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get Monday of the week containing the given date
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // day: 0 is Sun, 1 is Mon, ..., 6 is Sat
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get Mon-Fri dates (5 working days) of the week for a given date
 */
export function getWeekDays(d: Date): Date[] {
  const monday = getMondayOfWeek(d);
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

/**
 * Checks if two dates are in the exact same Monday-to-Sunday calendar week
 */
export function isSameCalendarWeek(dateStr1: string, dateStr2: string): boolean {
  if (!dateStr1 || !dateStr2) return false;
  const p1 = dateStr1.split('-').map(Number);
  const p2 = dateStr2.split('-').map(Number);
  const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
  const d2 = new Date(p2[0], p2[1] - 1, p2[2]);

  const mon1 = getMondayOfWeek(d1).getTime();
  const mon2 = getMondayOfWeek(d2).getTime();
  return mon1 === mon2;
}

/**
 * Get Day of Week number (1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 0=Sun)
 */
export function getDayOfWeekNumber(dateStr: string): number {
  const p = dateStr.split('-').map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  return d.getDay();
}

/**
 * Count working days (Mon-Fri) between two dates inclusive
 */
export function countWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const p1 = startDateStr.split('-').map(Number);
  const p2 = endDateStr.split('-').map(Number);
  const start = new Date(p1[0], p1[1] - 1, p1[2]);
  const end = new Date(p2[0], p2[1] - 1, p2[2]);

  if (start > end) return 0;

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) { // Mon-Fri
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export interface CalendarDayCell {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean; // Sat or Sun
  dayOfWeek: number; // 0=Sun, 1=Mon, ... 6=Sat
}

/**
 * Generates 7-column calendar matrix (Monday to Sunday) for the given year and month (1-12)
 */
export function getMonthCalendarGrid(year: number, month: number): CalendarDayCell[] {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week for 1st of month: 0=Sun, 1=Mon, ..., 6=Sat
  const firstDayOfWeek = firstDayOfMonth.getDay();
  // Offset where Monday is 0 and Sunday is 6
  const leadingOffset = (firstDayOfWeek + 6) % 7;

  const cells: CalendarDayCell[] = [];

  // 1. Previous month leading days
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
  for (let i = leadingOffset - 1; i >= 0; i--) {
    const d = new Date(year, month - 2, prevMonthLastDate - i);
    const dayOfWeek = d.getDay();
    cells.push({
      date: d,
      dateStr: toIsoDate(d),
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayOfWeek
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    cells.push({
      date: d,
      dateStr: toIsoDate(d),
      dayNumber: day,
      isCurrentMonth: true,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayOfWeek
    });
  }

  // 3. Next month trailing days to complete full 7-day rows
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const d = new Date(year, month, day);
    const dayOfWeek = d.getDay();
    cells.push({
      date: d,
      dateStr: toIsoDate(d),
      dayNumber: day,
      isCurrentMonth: false,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dayOfWeek
    });
  }

  return cells;
}
