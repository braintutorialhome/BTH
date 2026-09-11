import { format as dateFnsFormat } from 'date-fns';

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Converts any Date, ISO string, timestamp or YYYY-MM-DD date into
 * a Date instance matching wall-clock time in Asia/Kolkata (IST).
 */
export function toISTDate(date: string | Date | number | undefined | null): Date | null {
  if (!date) return null;
  let d: Date;
  if (typeof date === 'string') {
    const trimmed = date.trim();
    if (!trimmed) return null;
    // Date-only format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, day] = trimmed.split('-').map(Number);
      return new Date(y, m - 1, day, 12, 0, 0);
    }
    d = new Date(trimmed);
  } else if (typeof date === 'number') {
    d = new Date(date);
  } else {
    d = date;
  }
  if (isNaN(d.getTime())) return null;

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const get = (type: string) => parts.find(p => p.type === type)?.value;
    const yearStr = get('year');
    const monthStr = get('month');
    const dayStr = get('day');
    const hourStr = get('hour');
    const minStr = get('minute');
    const secStr = get('second');

    if (!yearStr || !monthStr || !dayStr) return d;

    return new Date(
      parseInt(yearStr, 10),
      parseInt(monthStr, 10) - 1,
      parseInt(dayStr, 10),
      parseInt(hourStr || '0', 10),
      parseInt(minStr || '0', 10),
      parseInt(secStr || '0', 10)
    );
  } catch {
    return d;
  }
}

/**
 * Formats a date using date-fns format tokens strictly in Asia/Kolkata (IST) time zone.
 */
export function safeFormat(date: string | Date | number | undefined | null, formatStr: string): string {
  if (!date) return 'N/A';
  try {
    const istDate = toISTDate(date);
    if (!istDate || isNaN(istDate.getTime())) return 'N/A';
    return dateFnsFormat(istDate, formatStr);
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Formats a date explicitly using Intl.DateTimeFormat in Asia/Kolkata (IST).
 */
export function formatDateIST(
  date: string | Date | number | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'N/A';
  try {
    let d: Date;
    if (typeof date === 'string') {
      const trimmed = date.trim();
      if (!trimmed) return 'N/A';
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, day] = trimmed.split('-').map(Number);
        d = new Date(Date.UTC(y, m - 1, day, 6, 0, 0)); // Midday IST in UTC
      } else {
        d = new Date(trimmed);
      }
    } else if (typeof date === 'number') {
      d = new Date(date);
    } else {
      d = date;
    }
    if (isNaN(d.getTime())) return 'N/A';

    return new Intl.DateTimeFormat('en-IN', {
      timeZone: IST_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options
    }).format(d);
  } catch {
    return 'N/A';
  }
}

/**
 * Formats date and time in Asia/Kolkata (IST).
 */
export function formatDateTimeIST(
  date: string | Date | number | undefined | null,
  includeSeconds: boolean = false
): string {
  return formatDateIST(date, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true
  });
}

/**
 * Formats time only in Asia/Kolkata (IST).
 */
export function formatTimeIST(
  date: string | Date | number | undefined | null,
  includeSeconds: boolean = false
): string {
  return formatDateIST(date, {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: true
  });
}

/**
 * Returns current date in Asia/Kolkata time zone as 'YYYY-MM-DD'.
 */
export function getISTToday(date: Date | string | number = new Date()): string {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(d);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return `${y}-${m}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Returns 'YYYY-MM' in Asia/Kolkata time zone.
 */
export function getISTMonthKey(date: Date | string | number = new Date()): string {
  try {
    let d: Date;
    if (typeof date === 'string') {
      const trimmed = date.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [y, m, day] = trimmed.split('-').map(Number);
        d = new Date(Date.UTC(y, m - 1, day, 6, 0, 0));
      } else {
        d = new Date(trimmed);
      }
    } else if (typeof date === 'number') {
      d = new Date(date);
    } else {
      d = date;
    }
    if (isNaN(d.getTime())) return '';
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit'
    });
    const parts = formatter.formatToParts(d);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    return `${y}-${m}`;
  } catch {
    return '';
  }
}

/**
 * Returns month name and year in Asia/Kolkata time zone (e.g. 'September 2026').
 */
export function getISTMonthName(date: Date | string | number = new Date()): string {
  return formatDateIST(date, { month: 'long', year: 'numeric' });
}

/**
 * Returns full current year in Asia/Kolkata time zone.
 */
export function getISTYear(date: Date | string | number = new Date()): number {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const yearStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: IST_TIMEZONE,
      year: 'numeric'
    }).format(d);
    return parseInt(yearStr, 10);
  } catch {
    return new Date().getFullYear();
  }
}

/**
 * Returns time remaining or elapsed calculated against Asia/Kolkata (IST).
 */
export function getISTTimeDifference(targetDate: string | Date | number): {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  relativeTime: string;
} {
  const now = new Date();
  let target: Date;
  if (typeof targetDate === 'string') {
    const trimmed = targetDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, day] = trimmed.split('-').map(Number);
      // End of that day in IST: 23:59:59 IST is 18:29:59 UTC
      target = new Date(Date.UTC(y, m - 1, day, 18, 29, 59));
    } else {
      target = new Date(trimmed);
    }
  } else {
    target = new Date(targetDate);
  }

  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiff = Math.abs(diffMs);

  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

  let formattedCountdown = '';
  if (days > 0) formattedCountdown = `${days}d ${hours}h left`;
  else if (hours > 0) formattedCountdown = `${hours}h ${minutes}m left`;
  else if (minutes > 0) formattedCountdown = `${minutes}m ${seconds}s left`;
  else formattedCountdown = `${seconds}s left`;

  let relativeTime = '';
  if (days === 0) {
    if (hours === 0) {
      relativeTime = minutes <= 1 ? 'just now' : `${minutes} mins ${isPast ? 'ago' : 'from now'}`;
    } else {
      relativeTime = `${hours} hr${hours > 1 ? 's' : ''} ${isPast ? 'ago' : 'from now'}`;
    }
  } else if (days === 1) {
    relativeTime = isPast ? 'yesterday' : 'tomorrow';
  } else if (days < 30) {
    relativeTime = `${days} days ${isPast ? 'ago' : 'from now'}`;
  } else {
    relativeTime = formatDateIST(target);
  }

  return { isPast, days, hours, minutes, seconds, formattedCountdown, relativeTime };
}

export function formatClassName(cls?: string | null): string {
  if (!cls) return 'N/A';
  const trimmed = cls.trim();
  if (!trimmed) return 'N/A';
  // If it already starts with "Class" (e.g. "Class-X", "Class 10", "Class-V", "Class XII")
  if (/^class[\s-]?/i.test(trimmed)) {
    return trimmed;
  }
  return `Class ${trimmed}`;
}
