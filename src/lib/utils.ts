import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type CurrencyCode } from '../contexts/SettingsContext'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'COP'): string {
    const localeMapping: Record<CurrencyCode, string> = {
        'COP': 'es-CO',
        'AUD': 'en-AU',
        'USD': 'en-US',
        'EUR': 'es-ES',
        'CAD': 'en-CA'
    };
    const locale = localeMapping[currency] || 'es-CO';
    const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

    return formatted.replace('A$', '$');
}

export function generateId(): string {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
    } catch (e) {
        console.warn('crypto.randomUUID failed, using fallback ID', e);
    }
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

/**
 * Parses a YYYY-MM-DD or YYYY-MM string into a Date object at 00:00:00 local time.
 * This avoids the timezone shift issue where parseISO('2024-02-02') is treated as UTC.
 */
export function parseSafeISO(dateStr: string): Date {
    if (!dateStr) return new Date();

    // Normalize string to YYYY-MM-DD
    let normalized = dateStr.split('T')[0];
    const parts = normalized.split('-');

    if (parts.length === 2) {
        normalized = `${normalized}-01`;
    }

    const [year, month, day] = normalized.split('-').map(Number);
    return new Date(year, month - 1, day || 1);
}
