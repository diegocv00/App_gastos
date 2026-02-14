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

export function parseSafeISO(dateStr: string | null | undefined): Date {
    if (!dateStr) return new Date();

    // Si la fecha viene en formato corto "YYYY-MM-DD" (10 caracteres)
    if (dateStr.length === 10 && dateStr.includes('-')) {
        const [year, month, day] = dateStr.split('-');
        // Al usar Date(año, mes, día) con números separados, 
        // forzamos a JavaScript a usar la zona horaria LOCAL, no UTC.
        return new Date(Number(year), Number(month) - 1, Number(day));
    }

    // Si es un formato ISO completo con hora (ej. de Supabase: "2026-02-13T14:30:00Z")
    const date = new Date(dateStr);

    // Fallback de seguridad si la fecha es inválida
    return isNaN(date.getTime()) ? new Date() : date;
}