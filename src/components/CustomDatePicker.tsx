import { useState, useMemo } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn, parseSafeISO } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { dateFormats, dateLocales, monthsShort, weekDaysShort } from '../lib/options';

interface CustomDatePickerProps {
    value: string; // yyyy-MM-dd
    onChange: (date: string) => void;
    label?: string;
}

export function CustomDatePicker({ value, onChange, label }: CustomDatePickerProps) {
    const { language, t } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');
    const [currentMonth, setCurrentMonth] = useState(value ? parseSafeISO(value) : new Date());
    const locale = dateLocales[language];
    const formats = dateFormats[language];

    const selectedDate = useMemo(() => value ? parseSafeISO(value) : new Date(), [value]);

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const weekDays = weekDaysShort[language];
    const months = monthsShort[language];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 12 }, (_, i) => currentYear - 10 + i);
    }, []);

    const handleDateClick = (day: Date) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
        setView('days');
    };

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
        setCurrentMonth(newDate);
        setView('days');
    };

    const handleYearSelect = (year: number) => {
        const newDate = new Date(year, currentMonth.getMonth(), 1);
        setCurrentMonth(newDate);
        setView('months');
    };

    const openPicker = () => {
        setIsOpen(true);
        setView('days');
    };

    return (
        <div className="space-y-1.5">
            {label && <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">{label}</label>}
            <div className="relative group">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-600 z-10" />
                <button
                    type="button"
                    onClick={openPicker}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm flex items-center gap-2"
                >
                    {format(selectedDate, formats.fullDate, { locale })}
                </button>
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 animate-in fade-in duration-200"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[340px] bg-white rounded-3xl shadow-2xl z-50 p-6 animate-in zoom-in-95 fade-in duration-200 border border-slate-100">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-1 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setView(view === 'months' ? 'days' : 'months')}
                                    className="text-lg font-bold text-slate-900 capitalize hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                                >
                                    {format(currentMonth, 'MMMM', { locale })}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setView(view === 'years' ? 'days' : 'years')}
                                    className="text-lg font-bold text-slate-400 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
                                >
                                    {format(currentMonth, 'yyyy')}
                                </button>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Days View */}
                        {view === 'days' && (
                            <>
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day, i) => (
                                        <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-2 uppercase tracking-tighter">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((day, i) => {
                                        const isSelected = isSameDay(day, selectedDate);
                                        const isCurrentMonth = isSameMonth(day, currentMonth);
                                        const isTodayDate = isSameDay(day, new Date());

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => handleDateClick(day)}
                                                className={cn(
                                                    "aspect-square flex items-center justify-center text-sm rounded-xl transition-all relative font-medium",
                                                    !isCurrentMonth && "text-slate-300",
                                                    isCurrentMonth && !isSelected && "text-slate-700 hover:bg-slate-50",
                                                    isSelected && "bg-primary-600 text-white shadow-lg shadow-primary-200 scale-110 z-10",
                                                    isTodayDate && !isSelected && "after:content-[''] after:absolute after:bottom-1.5 after:w-1 after:h-1 after:bg-primary-500 after:rounded-full"
                                                )}
                                            >
                                                {format(day, 'd')}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Months View */}
                        {view === 'months' && (
                            <div className="grid grid-cols-3 gap-2 py-2">
                                {months.map((month, i) => (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => handleMonthSelect(i)}
                                        className={cn(
                                            "py-4 rounded-xl text-sm font-bold transition-all",
                                            currentMonth.getMonth() === i
                                                ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                                                : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Years View */}
                        {view === 'years' && (
                            <div className="grid grid-cols-3 gap-2 py-2">
                                {years.map((year) => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => handleYearSelect(year)}
                                        className={cn(
                                            "py-4 rounded-xl text-sm font-bold transition-all",
                                            currentMonth.getFullYear() === year
                                                ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                                                : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="mt-6 w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-colors uppercase text-[10px] tracking-wider"
                        >
                            {t('datePicker.close')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
