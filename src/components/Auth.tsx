import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Eye, EyeOff, PlusCircle } from 'lucide-react';

export function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [view, setView] = useState<'login' | 'register' | 'recovery' | 'updatePassword'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Detección de sesión de recuperación
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                setView('updatePassword');
            }
        });
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (view === 'register') {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage({ type: 'success', text: '¡Registro exitoso! Revisa tu email para confirmar.' });
            } else if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else if (view === 'recovery') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Enlace enviado. Revisa tu correo.' });
            } else if (view === 'updatePassword') {
                const { error } = await supabase.auth.updateUser({ password });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' });
                setTimeout(() => setView('login'), 2000);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.error_description || error.message });
        } finally {
            setLoading(false);
        }
    };

    const isRegister = view === 'register';
    const isRecovery = view === 'recovery';
    const isUpdate = view === 'updatePassword';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-50">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-950">
                        {isRegister ? 'Crear cuenta' : isRecovery ? 'Recuperar acceso' : isUpdate ? 'Nueva contraseña' : '¡Bienvenido!'}
                    </h1>
                    <p className="text-slate-500">
                        {isRegister ? 'Únete para gestionar gastos compartidos' : isRecovery ? 'Te enviaremos un enlace de reinicio' : isUpdate ? 'Ingresa tu nueva contraseña' : 'Inicia sesión para continuar'}
                    </p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    {!isUpdate && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {!isRecovery && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                {isUpdate ? 'Nueva contraseña' : 'Contraseña'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'login' && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setView('recovery')}
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                {isRegister ? <PlusCircle className="w-5 h-5" /> : isRecovery ? <Mail className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                {isRegister ? 'Registrarse' : isRecovery ? 'Enviar enlace' : isUpdate ? 'Actualizar contraseña' : 'Entrar'}
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => {
                            if (isRecovery || isUpdate) setView('login');
                            else setView(isRegister ? 'login' : 'register');
                            setMessage(null);
                        }}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : isRecovery || isUpdate ? 'Ir al inicio de sesión' : '¿No tienes cuenta? Registrate gratis'}
                    </button>
                </div>
            </div>
        </div>
    );
}
