import { useState } from 'react';
import { Plus, Coffee, Car, Music, Receipt, ShoppingBag, CircleDollarSign, Users } from 'lucide-react';
import type { Contact } from '../hooks/useContacts';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { CustomDatePicker } from './CustomDatePicker';
import { useSettings } from '../contexts/SettingsContext';

interface ExpenseFormProps {
    onAdd: (expense: any) => void; // Cambiado a any para permitir el campo extra sharedWith
    contacts: Contact[];
}

const CATEGORY_OPTIONS = [
    { id: 'food', icon: Coffee },
    { id: 'transport', icon: Car },
    { id: 'entertainment', icon: Music },
    { id: 'bills', icon: Receipt },
    { id: 'shopping', icon: ShoppingBag },
    { id: 'other', icon: CircleDollarSign },
];

export function ExpenseForm({ onAdd, contacts }: ExpenseFormProps) {
    const { currency, convertToBase, t } = useSettings();
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(CATEGORY_OPTIONS[0].id);
    const [description, setDescription] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [selectedContactId, setSelectedContactId] = useState<string>('');
    const [splitPercentage, setSplitPercentage] = useState(50);

    const categoryLabels: Record<string, string> = {
        food: t('category.food'),
        transport: t('category.transport'),
        entertainment: t('category.entertainment'),
        bills: t('category.bills'),
        shopping: t('category.shopping'),
        other: t('category.other'),
    };

    const categories = CATEGORY_OPTIONS.map((cat) => ({
        ...cat,
        label: categoryLabels[cat.id] || cat.id
    }));



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

        const cleanedAmount = amount.replace(/\D/g, '');
        const numericAmount = parseInt(cleanedAmount, 10);

        if (!numericAmount || numericAmount <= 0) {
            return;
        }

        let finalDescription = description;
        let finalAmount = numericAmount;
        let friendUserId = null; // Variable para guardar el ID real del amigo

        if (isGroup && selectedContactId) {
            // 1. LÓGICA DE CÁLCULO (Tu lógica original)
            const mySharePercent = splitPercentage;
            const theirSharePercent = 100 - splitPercentage;

            // Calculamos solo TU parte para guardarla como monto principal
            finalAmount = Math.round(numericAmount * (mySharePercent / 100));

            const splitNote = `(${t('expenseForm.splitTotal')}: ${amount} | ${t('expenseForm.splitDivision')}: ${mySharePercent}%/${theirSharePercent}%)`;
            finalDescription = description ? `${description} ${splitNote}` : splitNote;

            // 2. LÓGICA DE NOTIFICACIÓN (LA CORRECCIÓN)
            // Buscamos al contacto completo en la lista
            const contact = contacts.find(c => c.id === selectedContactId);

            // Si el contacto tiene friend_id (es usuario real), lo guardamos
            if (contact?.friend_id) {
                friendUserId = contact.friend_id;
            } else {
                // Opcional: Avisar si intentan compartir con un contacto manual
                // alert("Nota: Este gasto se guardará, pero no se notificará al contacto porque no tiene App.");
            }
        }

        const expenseData = {
            date,
            amount: convertToBase(finalAmount),
            category,
            description: finalDescription,
            isGroup: isGroup,
            contactId: selectedContactId || null, // ID local para tu historial
            sharedWith: friendUserId,             // ID real para la notificación (CRUCIAL)
        };

        // Ejecutar la adición del gasto
        onAdd(expenseData);



        // Limpiar formulario
        setAmount('');
        setDescription('');
        setIsGroup(false);
        setSelectedContactId('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-7 px-6 pt-5 pb-20">

            <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('common.amount')}</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-light text-slate-400 group-focus-within:text-slate-900 transition-colors">
                        $
                    </span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-sans shadow-sm"
                        autoFocus
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
                <CustomDatePicker
                    label={t('common.date')}
                    value={date}
                    onChange={setDate}
                />
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">{t('common.note')}</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder={t('expenseForm.notePlaceholder')}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm h-[42px]"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{t('common.category')}</label>
                <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 shadow-sm",
                                category === cat.id
                                    ? "bg-primary-50 border-primary-500 text-primary-600 shadow-sm"
                                    : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:border-slate-300"
                            )}
                        >
                            <cat.icon className={cn("w-5 h-5 mb-1", category === cat.id ? "text-primary-600" : "text-slate-400")} />
                            <span className="text-[9px] font-medium">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsGroup(!isGroup);
                        if (isGroup) setSelectedContactId('');
                    }}
                    className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all shadow-sm",
                        isGroup
                            ? "bg-purple-50 border-purple-500 text-purple-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Users className={cn("w-4 h-4", isGroup ? "text-purple-600" : "text-slate-400")} />
                        <div className="text-left">
                            <p className="font-medium text-xs">{t('expenseForm.groupExpense')}</p>
                        </div>
                    </div>
                    <div className={cn(
                        "w-9 h-5 rounded-full transition-all relative",
                        isGroup ? "bg-purple-600" : "bg-slate-300"
                    )}>
                        <div className={cn(
                            "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                            isGroup ? "right-0.5" : "left-0.5"
                        )} />
                    </div>
                </button>

                {isGroup && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                        <div className="space-y-1">
                            <label className="text-[9px] font-semibold text-purple-700 uppercase tracking-wider block">
                                {t('expenseForm.withWhom')}
                            </label>
                            {contacts.length === 0 ? (
                                <p className="text-[10px] text-purple-600 text-center">{t('expenseForm.noContacts')}</p>
                            ) : (
                                <select
                                    value={selectedContactId}
                                    onChange={e => setSelectedContactId(e.target.value)}
                                    className="w-full bg-white border border-purple-200 rounded-lg py-2 px-3 text-xs text-slate-900 transition-all shadow-sm appearance-none font-medium text-center"
                                    required={isGroup}
                                >
                                    <option value="">{t('common.select')}</option>
                                    {contacts.map(contact => (
                                        <option key={contact.id} value={contact.id}>
                                            {contact.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {selectedContactId && (
                            <div className="space-y-3 pt-1 border-t border-purple-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-purple-700">{t('common.you')}: {splitPercentage}%</span>
                                    <span className="text-[10px] font-bold text-slate-500">{t('common.them')}: {100 - splitPercentage}%</span>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={splitPercentage}
                                    onChange={(e) => setSplitPercentage(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                />

                                <div className="bg-white/60 rounded-lg p-2 flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-purple-700">
                                        {amount ? `$${new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-AU').format(Math.round(parseInt(amount.replace(/\D/g, '')) * (splitPercentage / 100)))}` : '$0'}
                                    </span>
                                    <div className="w-px h-4 bg-purple-200" />
                                    <span className="text-slate-700">
                                        {amount ? `$${new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-AU').format(Math.round(parseInt(amount.replace(/\D/g, '')) * ((100 - splitPercentage) / 100)))}` : '$0'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isGroup && !selectedContactId}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-900/10 disabled:shadow-none mt-2"
            >
                <Plus className="w-4 h-4" />
                {t('expenseForm.addExpense')}
            </button>
        </form>
    );
}
