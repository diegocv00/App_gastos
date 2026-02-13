import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
    // Símbolos reales internacionales
    const symbols: Record<string, string> = {
        COP: '$',
        USD: '$',
        AUD: '$',
        EUR: '€',
        CAD: '$',
    };

    const localeMapping: Record<string, string> = {
        COP: 'es-CO',
        AUD: 'en-AU',
        USD: 'en-US',
        EUR: 'de-DE',
        CAD: 'en-CA',
    };

    const formattedNumber = new Intl.NumberFormat(localeMapping[currency] || 'es-CO', {
        minimumFractionDigits: currency === 'COP' ? 0 : 2,
        maximumFractionDigits: currency === 'COP' ? 0 : 2,
    }).format(amount);

    const symbol = symbols[currency] || '$';

    // Retorna formato: $ 1.250 COP o € 1.250 EUR
    return `${symbol} ${formattedNumber} ${currency}`;
}

export function parseSafeISO(dateStr: string): Date {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
}