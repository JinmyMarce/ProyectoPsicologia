declare module 'date-fns' {
  export function format(date: Date, formatStr: string, options?: any): string;
  export function parse(dateStr: string, formatStr: string, referenceDate?: Date, options?: any): Date;
  export function startOfWeek(date: Date, options?: { weekStartsOn?: number }): Date;
  export function getDay(date: Date): number;
  export function addDays(date: Date, amount: number): Date;
  export function isAfter(date: Date, dateToCompare: Date): boolean;
  export function isBefore(date: Date, dateToCompare: Date): boolean;
  export function startOfDay(date: Date): Date;
}






























