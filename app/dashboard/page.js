// app/dashboard/page.js
"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// Import komponen-komponen yang sudah dipecah
import ProfileCard from '@/components/dashboard/ProfileCard';
import PersonalProgressCard from '@/components/dashboard/PersonalProgressCard';
import TransactionForms from '@/components/dashboard/TransactionForms';
import SavingHistoryCard from '@/components/dashboard/SavingHistoryCard';
import MilestoneCard from '@/components/dashboard/MilestoneCard';
import NewsCard from '@/components/dashboard/NewsCard';
import HelpDeskSection from '@/components/dashboard/HelpDeskSection';
import DocumentsResourcesCard from '@/components/dashboard/DocumentsResourcesCard';

export default function DashboardPage() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [personalTotalRecorded, setPersonalTotalRecorded] = useState(0);
  const [personalUsed, setPersonalUsed] = useState(0);
  const [personalTransferred, setPersonalTransferred] = useState(0);
  const [personalSavingHistory, setPersonalSavingHistory] = useState([]);
  const [personalTransferConfirmations, setPersonalTransferConfirmations] = useState([]);
  const [userHelpDeskTickets, setUserHelpDeskTickets] = useState([]);
  const [news, setNews] = useState([]);
  const [milestones, setMilestones] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [newsPage, setNewsPage] = useState(1);
  const [totalNewsPages, setTotalNewsPages] = useState(1);
  const [error, setError] = useState(null);
  
  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingGlobalConfig, setLoadingGlobalConfig] = useState(true);
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingMilestones, setLoadingMilestones] = useState(true);
  const [loadingHelpDeskTickets, setLoadingHelpDeskTickets] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [addSavingLoading, setAddSavingLoading] = useState(false);
  const [useSavingLoading, setUseSavingLoading] = useState(false);
  const [confirmTransferLoading, setConfirmTransferLoading] = useState(false);
  const [helpDeskFormLoading, setHelpDeskFormLoading] = useState(false);
  const [initialDepositLoading, setInitialDepositLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'main';
  const newsPerPage = 3;

  // --- UTILITY FUNCTIONS ---
  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  const getMonthDifference = (d1, d2) => {
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  };
  const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async (userId) => {
    setLoadingProfile(true); setLoadingGlobalConfig(true); setLoadingPersonal(true);
    setLoadingNews(true); setLoadingMilestones(true); setLoadingHelpDeskTickets(true); setLoadingDocuments(true);

    try {
      const [profileRes, configRes, personalRes, newsRes, milestonesRes, ticketsRes, documentsRes] = await Promise.all([
        supabase.from('users').select('*, "NamaPequrban", "StatusPequrban", "Benefits", "IsInitialDepositMade", "InitialDepositStatus"').eq('UserId', userId).single(),
        supabase.from('app_config').select('*').eq('id', 'global_settings').single(),
        supabase.from('tabungan').select('*').eq('UserId', userId).order('Tanggal', { ascending: false }),
        supabase.from('newsletters').select('*', { count: 'exact' }).order('DatePublished', { ascending: false }).range((newsPage - 1) * newsPerPage, newsPage * newsPerPage - 1),
        supabase.from('program_milestones').select('*').order('Year', { ascending: true }).order('Order', { ascending: true }),
        supabase.from('help_desk_tickets').select('*').eq('UserId', userId).order('Timestamp', { ascending: false }),
        supabase.from('app_resources').select('*').or(`IsGlobal.eq.true,UserId.eq.${userId}`).order('CreatedAt', { ascending: false })
      ]);

      if (profileRes.error) throw profileRes.error; setProfile(profileRes.data);
      if (configRes.error) throw configRes.error; setGlobalConfig(configRes.data);
      
      if (personalRes.error) throw personalRes.error;
      const savingHistory = personalRes.data || [];
      setPersonalSavingHistory(savingHistory);
      let totalRecorded = 0, totalUsed = 0;
      savingHistory.forEach(item => {
        if (item.Tipe === 'Setoran') totalRecorded += item.Jumlah || 0;
        else if (item.Tipe === 'Penggunaan') totalUsed += item.Jumlah || 0;
      });
      setPersonalTotalRecorded(totalRecorded);
      setPersonalUsed(totalUsed);

      const { data: transferData, error: transferError } = await supabase.from('transfer_confirmations').select('*').eq('UserId', userId).eq('Status', 'Approved');
      if (transferError) throw transferError;
      setPersonalTransferConfirmations(transferData || []);
      setPersonalTransferred((transferData || []).reduce((sum, item) => sum + (item.Amount || 0), 0));

      if (newsRes.error) throw newsRes.error; setNews(newsRes.data); setTotalNewsPages(Math.ceil(newsRes.count / newsPerPage));
      if (milestonesRes.error) throw milestonesRes.error; setMilestones(milestonesRes.data);
      if (ticketsRes.error) throw ticketsRes.error; setUserHelpDeskTickets(ticketsRes.data);
      if (documentsRes.error) throw documentsRes.error; setDocuments(documentsRes.data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProfile(false); setLoadingGlobalConfig(false); setLoadingPersonal(false);
      setLoadingNews(false); setLoadingMilestones(false); setLoadingHelpDeskTickets(false); setLoadingDocuments(false);
    }
  }, [newsPage, newsPerPage]);

  // --- EFFECTS ---
  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await fetchAllData(user.id);
      setLoadingInitial(false);
    };
    checkUserAndLoadData();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
    });
    return () => authListener.subscription.unsubscribe();
  }, [router, fetchAllData]);
  
  useEffect(() => {
    if(user) {
        setLoadingNews(true);
        supabase.from('newsletters').select('*', { count: 'exact' }).order('DatePublished', { ascending: false }).range((newsPage - 1) * newsPerPage, newsPage * newsPerPage - 1)
            .then(res => {
                if (res.error) throw res.error;
                setNews(res.data);
                setTotalNewsPages(Math.ceil(res.count / newsPerPage));
            })
            .catch(err => setError(err.message))
            .finally(() => setLoadingNews(false));
    }
  }, [newsPage, user]);

  // --- EVENT HANDLERS (Salin semua fungsi handler Anda dari file lama ke sini) ---
  const handleSignOut = async () => { /* ... */ };
  const handleRefreshDashboard = () => user && fetchAllData(user.id);
  const handleAddSaving = async (e) => { /* ... */ };
  const handleUseSaving = async (e) => { /* ... */ };
  const handleInitialDeposit = async (e) => { /* ... */ };
  const handleConfirmTransfer = async (e) => { /* ... */ };
  const handleHelpDeskSubmit = async (e) => { /* ... */ };
  const showConfirmModal = (transactionId) => { /* ... */ };

  // --- RENDER LOGIC ---
  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  const rekomendasiTabungPerBulan = (() => {
    const targetDateGlobal = globalConfig?.TanggalTargetQurban ? new Date(globalConfig.TanggalTargetQurban) : null;
    if (!targetDateGlobal || targetDateGlobal <= new Date()) return 0;
    const remainingToTarget = (profile?.TargetPribadi || globalConfig?.TargetPribadiDefault || 0) - (personalTotalRecorded - personalUsed);
    if (remainingToTarget <= 0) return 0;
    const remainingMonths = getMonthDifference(new Date(), targetDateGlobal);
    return remainingMonths > 0 ? remainingToTarget / remainingMonths : 0;
  })();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Dashboard Tabungan Qurban</h1>
            {profile && <p className="text-gray-600">Selamat datang, {profile.Nama}!</p>}
          </div>
          <div className="flex items-center space-x-4">
            <a href="/settings" className="text-sm font-medium text-gray-600 hover:text-green-700">Pengaturan Akun</a>
            <button onClick={handleRefreshDashboard} className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center space-x-1" title="Refresh Data">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Refresh</span>
            </button>
            <a href="?tab=helpdesk" onClick={(e) => { e.preventDefault(); router.push('/dashboard?tab=helpdesk'); }} className={`text-sm font-medium px-4 py-2 rounded-md ${currentTab === 'helpdesk' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'}`}>Help Desk</a>
            <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentTab === 'helpdesk' ? (
            <HelpDeskSection
              userHelpDeskTickets={userHelpDeskTickets}
              loadingHelpDeskTickets={loadingHelpDeskTickets}
              handleHelpDeskSubmit={handleHelpDeskSubmit}
              helpDeskFormLoading={helpDeskFormLoading}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileCard loading={loadingProfile} profile={profile} />
                <PersonalProgressCard
                  loading={loadingPersonal || loadingGlobalConfig}
                  profile={profile}
                  globalConfig={globalConfig}
                  personalTotalRecorded={personalTotalRecorded}
                  personalUsed={personalUsed}
                  personalTransferred={personalTransferred}
                  rekomendasiTabungPerBulan={rekomendasiTabungPerBulan}
                  formatRupiah={formatRupiah}
                />
                <DocumentsResourcesCard loading={loadingDocuments} documents={documents} />
                <MilestoneCard loading={loadingMilestones} milestones={milestones} />
                <NewsCard
                  loading={loadingNews}
                  news={news}
                  newsPage={newsPage}
                  totalNewsPages={totalNewsPages}
                  setNewsPage={setNewsPage}
                />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <TransactionForms
                  profile={profile}
                  globalConfig={globalConfig}
                  personalTotalRecorded={personalTotalRecorded}
                  personalUsed={personalUsed}
                  personalTransferred={personalTransferred}
                  formatRupiah={formatRupiah}
                  handlers={{ handleInitialDeposit, handleAddSaving, handleUseSaving, handleConfirmTransfer }}
                  loaders={{ initialDepositLoading, addSavingLoading, useSavingLoading, confirmTransferLoading }}
                />
                <SavingHistoryCard
                  loading={loadingPersonal}
                  savingHistory={personalSavingHistory}
                  transferConfirmations={personalTransferConfirmations}
                  isMenabungSendiri={profile?.MetodeTabungan === 'Menabung Sendiri'}
                  onDelete={showConfirmModal}
                  formatRupiah={formatRupiah}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
