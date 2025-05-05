import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs) {
    return twMerge(clsx(inputs));
  }
  
  export function formatCurrency(amount, currency = 'ZAR') {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
  
  export function truncate(str, length = 25) {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  }
  
  export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }