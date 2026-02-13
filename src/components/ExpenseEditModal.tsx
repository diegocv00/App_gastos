import { useState, useEffect } from 'react';
import { X, Save, Coffee, Car, Music, Receipt, ShoppingBag, CircleDollarSign } from 'lucide-react';
import type { Expense } from '../hooks/useExpenses';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { CustomDatePicker } from './CustomDatePicker';

interface ExpenseEditModalProps {
    expense: Expense;
    onSave: (id: string, updates: Partial<Omit<Expense, 'id'>>) => void;
    onClose: () => void;
}

const CATEGORIES = [
    { id: 'food', label: 'Comida', icon: Coffee },
    { id: 'transport', label: 'Transporte', icon: Car },
    { id: 'entertainment', label: 'Diversión', icon: Music },
    { id: 'bills', label: 'Servicios', icon: Receipt },
    { id: 'shopping', label: 'Compras', icon: ShoppingBag },
    { id: 'other', label: 'Otro', icon: CircleDollarSign },
];

export function ExpenseEditModal({ expense, onSave, onClose }: ExpenseEditModalProps) {
    const { currency, convertToBase } = useSettings();
    const [date, setDate] = useState(expense.date);
    const localeMapping: Record<string, string> = {
        'COP': 'es-CO',
        'AUD': 'en-AU',
        'USD': 'en-US',
        'EUR': 'es-ES',
        'CAD': 'en-CA'
    };
    const locale = localeMapping[currency] || 'es-CO';
    const [amount, setAmount] = useState(new Intl.NumberFormat(locale).format(expense.amount));
    const [category, setCategory] = useState(expense.category);
    const [description, setDescription] = useState(expense.description);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');

        if (rawValue === '') {
            setAmount('');
            return;
        }

        const numberValue = parseInt(rawValue, 10);
        setAmount(new Intl.NumberFormat(locale).format(numberValue));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse formatted string back to number
        const numericAmount = parseInt(amount.replace(/\D/g, ''), 10);

        if (!numericAmount || numericAmount <= 0) return;

        const updates: any = {
            amount: convertToBase(numericAmount),
            description
        };

        // For income, date maps to created_at in my merge logic
        if (expense.type === 'income') {
            updates.created_at = date;
        } else {
            updates.date = date;
            updates.category = category;
        }

        onSave(expense.id, updates);
        onClose();
    };

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
                    <h2 className="text-xl font-bold text-slate-900">
                        {expense.type === 'income' ? 'Editar ingreso' : 'Editar gasto'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 px-6 pt-6 pb-8">
                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-400 group-focus-within:text-slate-900 transition-colors">$</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-sans shadow-sm"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Date Input */}
                    <CustomDatePicker
                        label="Fecha"
                        value={date}
                        onChange={setDate}
                    />

                    {/* Category Grid - Hidden for income */}
                    {expense.type !== 'income' && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</label>
                            <div className="grid grid-cols-3 gap-3">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 shadow-sm",
                                            category === cat.id
                                                ? "bg-primary-50 border-primary-500 text-primary-600 shadow-md"
                                                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300"
                                        )}
                                    >
                                        <cat.icon className={cn("w-6 h-6 mb-2", category === cat.id ? "text-primary-600" : "text-slate-400")} />
                                        <span className="text-[10px] font-medium">{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Note Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nota (Opcional)</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder={expense.type === 'income' ? '¿De dónde es el dinero?' : '¿En qué gastaste?'}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all shadow-sm"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-2xl transition-all active:scale-[0.98]"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-900/20"
                        >
                            <Save className="w-5 h-5" />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
