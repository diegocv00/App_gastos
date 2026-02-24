import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_LANGUAGE, type Language, type TranslationKey, translations } from '../lib/options';

type Currency = 'COP' | 'AUD' | 'USD' | 'EUR' | 'CAD';

interface SettingsContextType {
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    convertFromBase: (amount: number) => number;
    convertToBase: (amount: number) => number;
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Tasas de cambio (Base: COP)
const EXCHANGE_RATES: Record<Currency, number> = {
    COP: 1,
    USD: 4000, // Actualizar según mercado
    AUD: 2600,
    EUR: 4300,
    CAD: 2900,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<Currency>(() => {
        return (localStorage.getItem('currency') as Currency) || 'COP';
    });
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('language');
        if (stored === 'es' || stored === 'en') return stored;
        return DEFAULT_LANGUAGE;
    });

    const setCurrency = (newCurrency: Currency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('currency', newCurrency);
    };

    const setLanguage = (newLanguage: Language) => {
        setLanguageState(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    const t = useCallback((key: TranslationKey) => {
        return translations[language][key] || translations[DEFAULT_LANGUAGE][key] || key;
    }, [language]);

    const convertFromBase = (amount: number) => {
        if (currency === 'COP') return amount;
        return amount / EXCHANGE_RATES[currency];
    };

    const convertToBase = (amount: number) => {
        if (currency === 'COP') return amount;
        return amount * EXCHANGE_RATES[currency];
    };

    return (
        <SettingsContext.Provider value={{ currency, setCurrency, convertFromBase, convertToBase, language, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}
