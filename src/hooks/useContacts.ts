import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAdMob } from './useAdMob';
import { useSettings } from '../contexts/SettingsContext';

export interface Contact {
    id: string;
    name: string;
    user_id: string;
    friend_id?: string;
    status?: 'pending' | 'accepted' | 'rejected';
    is_sender?: boolean;
}

export function useContacts(userId: string | undefined) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useSettings();

    const fetchContacts = async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', userId)
            .order('name');

        if (!error) {
            setContacts(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContacts();
        const subscription = supabase
            .channel('contacts_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts', filter: `user_id=eq.${userId}` }, fetchContacts)
            .subscribe();
        return () => { subscription.unsubscribe(); };
    }, [userId]);

    // Buscar Usuario (Paso 1)
    const searchContactByCode = async (friendCode: string) => {
        if (!userId) throw new Error(t('errors.notAuthenticated'));
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('friend_code', friendCode.toUpperCase())
            .single();

        if (error || !profile) throw new Error(t('errors.codeNotFound'));
        if (profile.id === userId) throw new Error(t('errors.cannotAddSelf'));

        // Verificar existencia
        const { data: existing } = await supabase
            .from('contacts')
            .select('id')
            .eq('user_id', userId)
            .eq('friend_id', profile.id)
            .single();
        if (existing) throw new Error(t('errors.alreadyInContacts'));

        return profile;
    };

    const { showInterstitial } = useAdMob();

    // Enviar Solicitud (Paso 2)
    const requestContact = async (friendId: string, defaultName: string) => {
        if (!userId) return false;
        try {
            const { error } = await supabase.from('contacts').insert({
                user_id: userId,
                friend_id: friendId,
                name: defaultName, // Usamos el nombre original al enviar
                status: 'pending',
                is_sender: true
            });
            if (error) throw error;
            await fetchContacts();
            showInterstitial();
            return true;
        } catch (error: any) {
            alert(`${t('errors.genericError')}: ${error.message}`);
            return false;
        }
    };

    // --- NUEVO: Actualizar Nombre del Contacto ---
    const updateContactName = async (contactId: string, newName: string) => {
        if (!userId) return false;
        try {
            // Optimistic update
            setContacts(prev => prev.map(c => c.id === contactId ? { ...c, name: newName } : c));

            const { error } = await supabase
                .from('contacts')
                .update({ name: newName })
                .eq('id', contactId);

            if (error) throw error;
            return true;
        } catch (error: any) {
            alert(`${t('errors.updateFailed')}: ${error.message}`);
            fetchContacts(); // Revertir si falla
            return false;
        }
    };

    const deleteContact = async (id: string) => {
        setContacts(prev => prev.filter(c => c.id !== id));
        const { error } = await supabase.from('contacts').delete().eq('id', id);
        if (error) fetchContacts();
    };

    // Función legacy
    const addContact = async (name: string) => {
        if (!userId) return;
        const { error } = await supabase.from('contacts').insert([{ name, user_id: userId, status: 'accepted' }]);
        if (!error) fetchContacts();
    };

    return {
        contacts,
        loading,
        addContact,
        searchContactByCode,
        requestContact,
        updateContactName, // Exportamos la nueva función
        deleteContact
    };
}
