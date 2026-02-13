import { X, Check, UserPlus, Receipt, XCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface Props {
    userId: string;
    onClose: () => void;
}

export function NotificationsModal({ userId, onClose }: Props) {
    const { notifications, loading, handleContactRequest, handleExpenseRequest } = useNotifications(userId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Notificaciones</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Solicitudes pendientes</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Lista */}
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 flex flex-col items-center opacity-50">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">Estás al día</p>
                            <p className="text-xs text-slate-400">No tienes solicitudes pendientes</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.uniqueId} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                {/* Decoración lateral */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notif.type === 'contact_request' ? 'bg-blue-500' : 'bg-orange-500'}`} />

                                <div className="flex gap-4 pl-2">
                                    {/* Icono */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'contact_request' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                        }`}>
                                        {notif.type === 'contact_request' ? <UserPlus className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                                    </div>

                                    {/* Contenido */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-900">{notif.senderName}</h3>
                                            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                                {new Date(notif.date).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-600 mt-1 mb-3 leading-snug">
                                            {notif.details}
                                            {notif.amount && (
                                                <span className="block font-bold text-slate-900 mt-1">
                                                    ${notif.amount.toLocaleString()}
                                                </span>
                                            )}
                                        </p>

                                        {/* Botones de Acción */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => notif.type === 'contact_request'
                                                    ? handleContactRequest(notif.id, true)
                                                    : handleExpenseRequest(notif.id, true)
                                                }
                                                className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" /> Aceptar
                                            </button>
                                            <button
                                                onClick={() => notif.type === 'contact_request'
                                                    ? handleContactRequest(notif.id, false)
                                                    : handleExpenseRequest(notif.id, false)
                                                }
                                                className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" /> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}