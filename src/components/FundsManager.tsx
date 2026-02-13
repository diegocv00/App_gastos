import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';

interface FundsManagerProps {
    totalFunds: number;
    currentBalance: number;
    totalExpenses: number;
    onAddFunds: (amount: number, description: string) => void;
}

export function FundsManager({
    totalFunds,
    currentBalance,
    totalExpenses,
    onAddFunds
}: FundsManagerProps) {
    const { currency, convertToBase } = useSettings();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        if (rawValue === '') {
            setAmount('');
            return;
        }
        const numberValue = parseInt(rawValue, 10);
        const localeMapping: Record<string, string> = {
            'COP': 'es-CO',
            'AUD': 'en-AU',
            'USD': 'en-US',
            'EUR': 'es-ES',
            'CAD': 'en-CA'
        };
        const locale = localeMapping[currency] || 'es-CO';
        setAmount(new Intl.NumberFormat(locale).format(numberValue));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);
        if (numericAmount > 0) {
            onAddFunds(convertToBase(numericAmount), description);
            setAmount('');
            setDescription('');
            setIsAdding(false);
        }
    };

    const isLowBalance = currentBalance < totalExpenses * 0.2 && currentBalance > 0;
    const isNegative = currentBalance <= 0;

    return (
        <div className="space-y-6 px-6 pt-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Balance Card */}
            <div className={cn(
                "relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl transition-all duration-500",
                isNegative
                    ? "bg-gradient-to-br from-red-600 to-rose-700 shadow-red-900/20"
                    : isLowBalance
                        ? "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-900/20"
                        : "bg-gradient-to-br from-primary-600 to-emerald-600 shadow-primary-900/20"
            )}>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">Saldo disponible</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-6 tracking-tight">
                        {formatCurrency(currentBalance, currency)}
                    </h2>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Total Ingresado</p>
                            <p className="text-lg font-semibold">{formatCurrency(totalFunds, currency)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Total Gastado</p>
                            <p className="text-lg font-semibold">{formatCurrency(totalExpenses, currency)}</p>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Warnings */}
            {isNegative && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-pulse">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Saldo insuficiente</p>
                        <p className="text-xs text-red-600">Has gastado más de lo que tienes ingresado.</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 gap-4">
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-700 font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowUpCircle className="w-5 h-5 text-primary-500" />
                        Añadir dinero a fondos
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Ingresar Monto</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                >
                                    Cancelar
                                </button>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-light text-slate-400">
                                    $
                                </span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-10 pr-4 text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-sans"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider pl-1">
                                    Nota / Descripción
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="¿De dónde es el dinero?"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Confirmar ingreso
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Info Section */}
            <div className="bg-slate-100/50 border border-slate-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">¿Cómo funcionan los fondos?</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Añade el dinero que tienes disponible (sueldo, ahorros, etc.). Cada vez que registres un gasto, se restará automáticamente de este saldo para que sepas exactamente cuánto te queda.
                </p>
            </div>
        </div>
    );
}
