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
