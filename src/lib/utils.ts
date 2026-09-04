import { format as dateFnsFormat } from 'date-fns';

export function safeFormat(date: string | Date | undefined | null, formatStr: string): string {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return dateFnsFormat(d, formatStr);
  } catch (e) {
    return 'N/A';
  }
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
