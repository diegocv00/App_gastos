import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAdMob } from './useAdMob';
import { useSettings } from '../contexts/SettingsContext';

export interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    contactId?: string;
    user_id: string;
    type?: 'expense' | 'income';
    shared_with_user_id?: string;
    status?: 'approved' | 'pending' | 'rejected';
    isGroup?: boolean;
}

export function useExpenses(userId: string | undefined) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const { showInterstitial } = useAdMob();
    const { t } = useSettings();

    const fetchExpenses = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .or(`user_id.eq.${userId},shared_with_user_id.eq.${userId}`)
            .order('date', { ascending: false });

        if (!error) {
            setExpenses(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
        const channel = supabase.channel('expenses_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, fetchExpenses)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    const addExpense = async (expense: any) => {
        if (!userId) return;

        // VERIFICACIÓN CRÍTICA
        const isShared = expense.isGroup && expense.sharedWith;
        const initialStatus = isShared ? 'pending' : 'approved';

        const payload = {
            amount: expense.amount,
            category: expense.category,
            description: expense.description,
            date: expense.date,
            type: expense.type || 'expense',
            contactId: expense.contactId,
            user_id: userId,
            // AQUÍ ASIGNAMOS EL ID DEL AMIGO AL CAMPO CORRECTO
            shared_with_user_id: expense.sharedWith || null,
            status: initialStatus
        };

        const { error } = await supabase.from('expenses').insert([payload]);

        if (error) {
            console.error('Error adding expense:', error);
            // Si el error es Foreign Key, es porque el ID del amigo no existe en perfiles
            alert(`${t('errors.saveFailed')}: ${error.message}`);
        } else {
            if (isShared) {
                alert(t('alerts.expenseRequestSent'));
            } else {
                alert(t('alerts.expenseSaved'));
            }
            showInterstitial();
            await fetchExpenses();
        }
    };

    const updateExpense = async (id: string, updates: Partial<Expense>) => {
        const { error } = await supabase.from('expenses').update(updates).eq('id', id);
        if (!error) {
            showInterstitial();
            fetchExpenses();
        }
    };

    const deleteExpense = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (!error) {
            showInterstitial();
            fetchExpenses();
        } else {
            fetchExpenses();
        }
    };

    return { expenses, loading, addExpense, updateExpense, deleteExpense };
}
