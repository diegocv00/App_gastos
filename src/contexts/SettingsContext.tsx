import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'COP' | 'AUD' | 'USD' | 'EUR' | 'CAD';

export const EXCHANGE_RATE_AUD = 2550; // 1 AUD = 2550 COP
export const EXCHANGE_RATE_USD = 3800; // 1 USD = 3800 COP
export const EXCHANGE_RATE_EUR = 4300; // 1 EUR = 4300 COP
export const EXCHANGE_RATE_CAD = 2700; // 1 CAD = 2700 COP

interface SettingsContextType {
    currency: CurrencyCode;
    setCurrency: (currency: CurrencyCode) => void;
    convertToBase: (amount: number) => number;
    convertFromBase: (amount: number) => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        const saved = localStorage.getItem('app_currency');
        return (saved as CurrencyCode) || 'COP';
    });

    const setCurrency = (newCurrency: CurrencyCode) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('app_currency', newCurrency);
    };

    const convertToBase = (amount: number) => {
        if (currency === 'AUD') return amount * EXCHANGE_RATE_AUD;
        if (currency === 'USD') return amount * EXCHANGE_RATE_USD;
        if (currency === 'EUR') return amount * EXCHANGE_RATE_EUR;
        if (currency === 'CAD') return amount * EXCHANGE_RATE_CAD;
        return amount;
    };

    const convertFromBase = (amount: number) => {
        if (currency === 'AUD') return amount / EXCHANGE_RATE_AUD;
        if (currency === 'USD') return amount / EXCHANGE_RATE_USD;
        if (currency === 'EUR') return amount / EXCHANGE_RATE_EUR;
        if (currency === 'CAD') return amount / EXCHANGE_RATE_CAD;
        return amount;
    };

    return (
        <SettingsContext.Provider value={{ currency, setCurrency, convertToBase, convertFromBase }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
