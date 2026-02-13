import { useState, useEffect } from 'react';
import { MobileLayout } from './components/layout/MobileLayout';
import { ExpenseForm } from './components/ExpenseForm';
import { HistoryList } from './components/HistoryList';
import { ExpenseChart } from './components/ExpenseChart';
import { ContactsList } from './components/ContactsList';
import { Auth } from './components/Auth';
import { useExpenses } from './hooks/useExpenses';
import type { Expense } from './hooks/useExpenses';
import { useContacts } from './hooks/useContacts';
import { useAuth } from './hooks/useAuth';
import { useFunds } from './hooks/useFunds';
import { FundsManager } from './components/FundsManager';
import { ReceiptText, History, Users, LogOut, Wallet, Bell, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { useSettings } from './contexts/SettingsContext';
import { supabase } from './lib/supabase';
import { useNotifications } from './hooks/useNotifications';
import { NotificationsModal } from './components/NotificationsModal';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();

  // Hooks de datos
  const { contacts, searchContactByCode, requestContact, updateContactName, deleteContact, addContact } = useContacts(user?.id);
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(user?.id);
  const { funds, totalFunds, addFunds, deleteFund, updateFund } = useFunds(user?.id);
  const { unreadCount, refresh: refreshNotifications } = useNotifications(user?.id);



  // Estados UI
  const [activeTab, setActiveTab] = useState<'add' | 'history' | 'contacts' | 'funds'>('add');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [myProfile, setMyProfile] = useState<any>(null);
  const { currency, setCurrency, convertFromBase } = useSettings();

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { if (data) setMyProfile(data); });
    }
  }, [user]);

  // Cálculos
  const totalExpenses = convertFromBase(expenses.reduce((acc, curr) => acc + curr.amount, 0));
  const totalIncome = convertFromBase(totalFunds);
  const currentBalance = totalIncome - totalExpenses;

  // --- LISTA UNIFICADA ---
  const transactions = [
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
    ...(funds || []).map(f => ({
      id: f.id,
      amount: f.amount,
      category: 'Ingreso',
      date: f.created_at,
      description: f.description || 'Ingreso',
      type: 'income' as const,
      user_id: f.user_id
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const convertedTransactions = transactions.map(t => ({ ...t, amount: convertFromBase(t.amount) })) as Expense[];

  // --- LÓGICA DE ANUNCIOS (NUEVO ENFOQUE) ---

  // 1. AÑADIR GASTO -> SIEMPRE ANUNCIO
  const handleAddExpenseWithAd = async (expense: any) => {
    await addExpense(expense);
  };

  // 2. AÑADIR FONDO -> SIEMPRE ANUNCIO
  const handleAddFundsWithAd = async (amount: number, description?: string) => {
    await addFunds(amount, description);
  };

  // 3. BORRAR -> SIN ANUNCIO (Limpiado)
  const handleDeleteTransaction = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    if (transaction.type === 'income') {
      await deleteFund(id);
    } else {
      await deleteExpense(id);
    }
    // AQUÍ YA NO HAY showInterstitial()
  };

  // 4. CONTACTOS -> SIN ANUNCIO (Limpiado)
  const handleRequestContactNoAd = async (friendId: string, name: string) => {
    const success = await requestContact(friendId, name);
    return success;
  };

  // Editar -> Sin anuncio (Note: the hooks actually show ads now)
  const handleUpdateTransaction = async (id: string, updates: any) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    if (transaction.type === 'income') {
      await updateFund(id, updates);
    } else {
      await updateExpense(id, updates);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!user) return <Auth />;

  return (
    <MobileLayout className="flex flex-col">
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div><h1 className="text-2xl font-bold text-slate-950">Mis gastos</h1></div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setShowNotifications(true); refreshNotifications(); }} className="relative p-2 text-slate-400">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
            </button>

            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-400">
                <SettingsIcon className="w-6 h-6" />
              </button>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Moneda</p>
                  </div>
                  <button onClick={() => { setCurrency('COP'); setShowSettings(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-slate-50", currency === 'COP' && "text-primary-600 font-bold")}>Peso (COP)</button>
                  <button onClick={() => { setCurrency('AUD'); setShowSettings(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-slate-50", currency === 'AUD' && "text-primary-600 font-bold")}>Dólar (AUD)</button>
                  <button onClick={() => { setCurrency('USD'); setShowSettings(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-slate-50", currency === 'USD' && "text-primary-600 font-bold")}>Dólar (USD)</button>
                  <button onClick={() => { setCurrency('EUR'); setShowSettings(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-slate-50", currency === 'EUR' && "text-primary-600 font-bold")}>Euro (EUR)</button>
                  <button onClick={() => { setCurrency('CAD'); setShowSettings(false); }} className={cn("w-full px-4 py-3 text-left text-sm hover:bg-slate-50", currency === 'CAD' && "text-primary-600 font-bold")}>Dólar (CAD)</button>

                </div>
              )}
            </div>

            <button onClick={signOut} className="p-2 text-slate-400"><LogOut className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {activeTab === 'add' && <ExpenseForm onAdd={handleAddExpenseWithAd} contacts={contacts} />}

        {activeTab === 'funds' && (
          <FundsManager totalFunds={totalIncome} currentBalance={currentBalance} totalExpenses={totalExpenses} onAddFunds={handleAddFundsWithAd} />
        )}

        {activeTab === 'history' && (
          <>
            <div className="px-6">
              <ExpenseChart
                expenses={convertedTransactions.filter(t => selectedCategory === 'all' ? true : selectedCategory === 'income' ? t.type === 'income' : t.category === selectedCategory)}
                selectedDate={selectedDate}
                onSelectDate={(date) => setSelectedDate(selectedDate === date ? null : date)}
                viewMode={viewMode}
              />
            </div>
            <HistoryList
              expenses={convertedTransactions}
              contacts={contacts}
              userId={user.id}
              selectedDate={selectedDate}
              onDelete={handleDeleteTransaction} // SIN ANUNCIO
              onUpdate={handleUpdateTransaction}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </>
        )}

        {activeTab === 'contacts' && (
          <ContactsList
            contacts={contacts}
            expenses={expenses}
            onAddContact={addContact}
            onDeleteContact={deleteContact}
            onSearchCode={searchContactByCode}
            onRequestContact={handleRequestContactNoAd} // SIN ANUNCIO
            onUpdateContactName={updateContactName}
            myFriendCode={myProfile?.friend_code}
          />
        )}
      </main>

      {showNotifications && <NotificationsModal userId={user.id} onClose={() => setShowNotifications(false)} />}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 p-2 flex justify-around pb-safe z-30 max-w-md mx-auto">
        <button onClick={() => setActiveTab('add')} className={cn("flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all", activeTab === 'add' ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:bg-slate-50")}><ReceiptText className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">Gastos</span></button>
        <button onClick={() => setActiveTab('funds')} className={cn("flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all", activeTab === 'funds' ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:bg-slate-50")}><Wallet className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">Fondos</span></button>
        <button onClick={() => setActiveTab('history')} className={cn("flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all", activeTab === 'history' ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:bg-slate-50")}><History className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">Historial</span></button>
        <button onClick={() => setActiveTab('contacts')} className={cn("flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all", activeTab === 'contacts' ? "text-primary-600 bg-primary-50" : "text-slate-400 hover:bg-slate-50")}><Users className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">Contactos</span></button>
      </nav>
    </MobileLayout>
  );
}

export default App;