import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout: ensure loading is false after 3s max
        const timer = setTimeout(() => {
            setLoading(false);
            console.log('useAuth: safety timeout reached');
        }, 3000);

        // Check active sessions and sets the user
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                setLoading(false);
                clearTimeout(timer);

                // Sync profile in background if user exists
                if (currentUser) {
                    supabase.from('profiles').upsert({
                        id: currentUser.id,
                        email: currentUser.email
                    });
                }
            })
            .catch(() => {
                setLoading(false);
                clearTimeout(timer);
            });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);
            clearTimeout(timer);

            if (currentUser) {
                // Sync profile in background
                supabase.from('profiles').upsert({
                    id: currentUser.id,
                    email: currentUser.email
                });
            }
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    return {
        user,
        loading,
        signOut: () => supabase.auth.signOut(),
    };
}
