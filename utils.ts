import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(5, '0')}`;
}

export function calculateLineTotal(quantity: number, unitPrice: number, discountPercent = 0): number {
  const discountMultiplier = 1 - (discountPercent / 100);
  return quantity * unitPrice * discountMultiplier;
}

export function calculateInvoiceTotal(lineItems: Array<{ lineTotal: number }>): number {
  return lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
