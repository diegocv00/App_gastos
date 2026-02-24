import { useState } from 'react';
import { Plus, Trash2, Copy, Search, User, ChevronDown, Eye, ChevronUp, ArrowRight, Edit2, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Contact } from '../hooks/useContacts';
import { useSettings } from '../contexts/SettingsContext';

interface Props {
    contacts: Contact[];
    expenses: any[];
    onAddContact: (name: string) => void;
    onDeleteContact: (id: string) => void;
    onSearchCode?: (code: string) => Promise<any>;
    onRequestContact?: (id: string, name: string) => Promise<boolean>;
    onUpdateContactName?: (id: string, name: string) => Promise<boolean>; // Nuevo Prop
    myFriendCode?: string;
}

export function ContactsList({ contacts, expenses, onDeleteContact, onSearchCode, onRequestContact, onUpdateContactName, myFriendCode }: Props) {
    const { t } = useSettings();
    // Estados para añadir contacto
    const [showAddModal, setShowAddModal] = useState(false);
    const [friendCodeInput, setFriendCodeInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalStep, setModalStep] = useState<'search' | 'confirm'>('search');
    const [foundUser, setFoundUser] = useState<any>(null);

    // Estados para editar nombre
    const [editingContactId, setEditingContactId] = useState<string | null>(null);
    const [editNameValue, setEditNameValue] = useState('');

    // Estados visuales Header
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
    const [showCodeCharacters, setShowCodeCharacters] = useState(false);

    const activeContacts = contacts.filter(c => c.status === 'accepted' || !c.status);

    // --- LÓGICA DE AÑADIR ---
    const handleSearch = async () => {
        if (!friendCodeInput.trim() || !onSearchCode) return;
        setLoading(true);
        try {
            const user = await onSearchCode(friendCodeInput);
            setFoundUser(user);
            setModalStep('confirm');
        } catch (e: any) {
            alert(e.message || t('contacts.userNotFound'));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmAdd = async () => {
        if (!onRequestContact || !foundUser) return;
        setLoading(true);
        try {
            // Enviamos la solicitud con el nombre original del perfil
            const success = await onRequestContact(foundUser.id, foundUser.full_name || t('contacts.newFriend'));
            if (success) {
                resetModal();
                alert(t('contacts.requestSent'));
            }
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setShowAddModal(false);
        setModalStep('search');
        setFriendCodeInput('');
        setFoundUser(null);
    };

    // --- LÓGICA DE EDITAR NOMBRE ---
    const startEditing = (contact: Contact) => {
        setEditingContactId(contact.id);
        setEditNameValue(contact.name);
    };

    const saveEditName = async () => {
        if (!editingContactId || !onUpdateContactName || !editNameValue.trim()) return;
        await onUpdateContactName(editingContactId, editNameValue);
        setEditingContactId(null);
    };

    return (
        <div className="pb-24">
            {/* HEADER CÓDIGO */}
            <div className={cn("bg-primary-600 rounded-b-[2rem] shadow-lg mb-6 transition-all overflow-hidden", isHeaderExpanded ? "pt-4 pb-6 px-6" : "py-3 px-6")}>
                <div onClick={() => setIsHeaderExpanded(!isHeaderExpanded)} className="flex justify-between items-center cursor-pointer text-white/90">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium uppercase tracking-wider">{t('contacts.myCode')}</span>
                        {!isHeaderExpanded && <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/80">{showCodeCharacters ? (myFriendCode || '....') : '••••••'}</span>}
                    </div>
                    {isHeaderExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                {isHeaderExpanded && (
                    <div className="mt-4 flex flex-col items-center animate-in fade-in">
                        <div className="flex gap-2">
                            <div onClick={() => { if (myFriendCode) navigator.clipboard.writeText(myFriendCode) }} className="flex items-center gap-3 bg-white/10 px-5 py-2 rounded-xl border border-white/20 cursor-pointer active:scale-95">
                                <span className="text-2xl font-mono font-bold text-white tracking-widest">{showCodeCharacters ? (myFriendCode || '....') : '••••••'}</span>
                                <Copy className="w-4 h-4 text-primary-200" />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setShowCodeCharacters(!showCodeCharacters) }} className="p-2.5 bg-white/10 rounded-xl text-primary-100"><Eye className="w-5 h-5" /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* LISTA CONTACTOS */}
            <div className="px-6 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg flex gap-2"><User className="w-5 h-5 text-primary-600" /> {t('contacts.myContacts')} <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{activeContacts.length}</span></h3>
                <button onClick={() => { resetModal(); setShowAddModal(true) }} className="flex gap-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-bold active:scale-95"><Plus className="w-4 h-4" /> {t('contacts.addContact')}</button>
            </div>

            <div className="px-6 space-y-3">
                {activeContacts.map((contact) => (
                    <div key={contact.id} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                                {contact.name.charAt(0).toUpperCase()}
                            </div>

                            {/* MODO EDICIÓN vs MODO VER */}
                            {editingContactId === contact.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        autoFocus
                                        className="w-full bg-slate-50 border border-primary-200 rounded-lg px-2 py-1 text-sm focus:outline-none"
                                        value={editNameValue}
                                        onChange={(e) => setEditNameValue(e.target.value)}
                                    />
                                    <button onClick={saveEditName} className="p-1.5 bg-green-100 text-green-600 rounded-lg"><Check className="w-4 h-4" /></button>
                                    <button onClick={() => setEditingContactId(null)} className="p-1.5 bg-red-100 text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                                    <p className="text-xs text-slate-400">{expenses.filter((e) => e.contactId === contact.id || e.shared_with_user_id === contact.friend_id).length} {t('common.transactions')}</p>
                                </div>
                            )}
                        </div>

                        {/* BOTONES DE ACCIÓN (Editar y Borrar) */}
                        {editingContactId !== contact.id && (
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditing(contact)} className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDeleteContact(contact.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL AÑADIR (SIMPLIFICADO) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">{modalStep === 'search' ? t('contacts.addFriendTitle') : t('contacts.confirmTitle')}</h3>
                            <p className="text-sm text-slate-500">{modalStep === 'search' ? t('contacts.enterCode') : t('contacts.isThisPerson')}</p>
                        </div>

                        {modalStep === 'search' && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                    <input type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold text-lg text-center tracking-widest outline-none focus:ring-2 focus:ring-primary-500/20" placeholder={t('contacts.codePlaceholder')} maxLength={6} value={friendCodeInput} onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())} />
                                </div>
                                <button onClick={handleSearch} disabled={loading || friendCodeInput.length < 6} className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50">{loading ? t('common.loadingDots') : t('common.search')}</button>
                            </div>
                        )}

                        {modalStep === 'confirm' && foundUser && (
                            <div className="space-y-5">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">{foundUser.full_name?.charAt(0)}</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{foundUser.full_name}</p>
                                        <p className="text-xs text-slate-500">{foundUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={handleConfirmAdd} disabled={loading} className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold flex justify-center gap-2">{loading ? t('contacts.sending') : <>{t('contacts.sendRequest')} <ArrowRight className="w-4 h-4" /></>}</button>
                            </div>
                        )}
                        <button onClick={resetModal} className="w-full py-3 mt-2 text-slate-500 font-medium text-sm">{t('common.cancel')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
