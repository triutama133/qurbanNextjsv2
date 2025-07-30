"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import useAdminDashboardData from "../../hooks/useAdminDashboardData";
import PendingVerificationsTab from "../../components/admin/tabs/PendingVerificationsTab";
import UserManagementTab from "../../components/admin/tabs/UserManagementTab";
import ContentManagementTab from "../../components/admin/tabs/ContentManagementTab";
import HelpDeskTab from "../../components/admin/tabs/HelpDeskTab";
import OperationalCostsTab from "../../components/admin/tabs/OperationalCostsTab";
import OverviewProgramTab from "../../components/admin/tabs/OverviewProgramTab";

// Komponen Spinner kecil untuk tombol
const SmallSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Skeleton Loader untuk Card
const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Skeleton Loader untuk Riwayat/List
const ListSkeleton = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
        </div>
    </div>
);

export default function AdminDashboardPage() {
  const {
    user, setUser, profile, setProfile, appConfig, overallProgramProgress, pendingInitialDeposits, pendingTransferConfirmations,
    allUsers, allNewsletters, allMilestones, allResources, allHelpDeskTickets, allOperationalCosts,
    loadingInitial, loadingOverview, loadingUsers, loadingContent, loadingHelpDesk, loadingCosts,
    loadingAppConfig, loadingProfile, error, verifyDepositLoading, verifyTransferLoading, addCostLoading,
    activeAdminTab, setActiveAdminTab,
    handleSignOut, handleRefreshAdminDashboard, handleVerifyInitialDeposit, handleVerifyTransferConfirmation, handleAddOperationalCost,
    fetchAdminProfileAndConfig, fetchAppConfigSection, fetchOverallProgramProgress, fetchAllUsersData, fetchContentData, fetchHelpDeskData, fetchOperationalCostsData,
    setLoadingInitial, setError,
    setLoadingOverview, setLoadingUsers, setLoadingContent, setLoadingHelpDesk, setLoadingCosts
  } = useAdminDashboardData();

  const router = useRouter();

  // --- Utility Functions ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  // --- Main Effect Hook ---
  useEffect(() => {
    const checkAdminAndLoadDashboard = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser(); 
        if (!authUser) {
          router.push('/admin-login');
          return;
        }

        // Fetch Admin Profile (untuk verifikasi role)
        await fetchAdminProfileAndConfig(authUser.id); 
        // Fetch App Config (dibutuhkan untuk perhitungan overview)
        await fetchAppConfigSection(); 

      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat memuat dashboard admin.");
        console.error("Admin dashboard initial load error:", err);
        await supabase.auth.signOut(); 
        router.push('/admin-login');
        return;
      } finally {
        setLoadingInitial(false); 
      }
    };

    checkAdminAndLoadDashboard();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            router.push('/admin-login');
        } else {
            supabase.from('users').select('Role').eq('UserId', session.user.id).single()
                .then(({data, error}) => {
                    if (!error && data?.Role === 'Admin') {
                        setUser(session.user);
                        fetchAdminProfileAndConfig(session.user.id);
                    } else {
                        supabase.auth.signOut();
                        router.push('/admin-login');
                    }
                });
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [router, fetchAdminProfileAndConfig, fetchAppConfigSection]);

  // Effect kedua: memuat bagian-bagian dashboard setelah user, profile, globalConfig tersedia
  useEffect(() => {
    if (user && profile && appConfig) {
        setLoadingOverview(true);
        setLoadingUsers(true);
        setLoadingContent(true);
        setLoadingHelpDesk(true);
        setLoadingCosts(true);

        Promise.allSettled([
            fetchOverallProgramProgress(),
            fetchAllUsersData(),
            fetchContentData(),
            fetchHelpDeskData(),
            fetchOperationalCostsData(),
        ]).then(results => {
            console.log("Admin sections fetch results:", results);
        });
    }
  }, [user, profile, appConfig, fetchOverallProgramProgress, fetchAllUsersData, fetchContentData, fetchHelpDeskData, fetchOperationalCostsData]);

  // --- Render Logic ---
  if (loadingInitial || loadingProfile || loadingAppConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <svg className="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-4 text-gray-700">Memuat dashboard admin...</p>
      </div>
    );
  }

  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Admin */}
      <header className="bg-indigo-700 shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            {profile && <p className="text-indigo-200">Selamat datang, {profile.Nama} (Admin)!</p>}
          </div>
          <div className="flex items-center space-x-4">
            <button
                onClick={handleRefreshAdminDashboard}
                className="text-white hover:text-indigo-200 text-sm font-medium flex items-center space-x-1"
                title="Refresh Data"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <span>Refresh</span>
            </button>
            <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content Admin */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bagian Overview Program */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-indigo-800">Overview Program</h2>
                <OverviewProgramTab
                  loadingOverview={loadingOverview}
                  overallProgramProgress={overallProgramProgress}
                  globalConfig={appConfig}
                  formatRupiah={formatRupiah}
                  CardSkeleton={CardSkeleton}
                />
            </div>

            {/* Bagian Manajemen Utama (Tabs) */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
                    <button
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${activeAdminTab === 'pending_verifications' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveAdminTab('pending_verifications')}
                    >
                        Verifikasi Pending
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${activeAdminTab === 'user_management' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveAdminTab('user_management')}
                    >
                        Manajemen Pengguna
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${activeAdminTab === 'content_management' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveAdminTab('content_management')}
                    >
                        Manajemen Konten
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${activeAdminTab === 'help_desk' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveAdminTab('help_desk')}
                    >
                        Manajemen Help Desk
                    </button>
                    <button
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium ${activeAdminTab === 'operational_costs' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveAdminTab('operational_costs')}
                    >
                        Biaya Operasional
                    </button>
                </div>

                {/* Konten Tab */}
                <div className="tab-content">
                    {/* Tab: Verifikasi Pending */}
                    {activeAdminTab === 'pending_verifications' && (
                      <PendingVerificationsTab
                        loadingOverview={loadingOverview}
                        pendingInitialDeposits={pendingInitialDeposits}
                        pendingTransferConfirmations={pendingTransferConfirmations}
                        formatRupiah={formatRupiah}
                        handleVerifyInitialDeposit={handleVerifyInitialDeposit}
                        handleVerifyTransferConfirmation={handleVerifyTransferConfirmation}
                        ListSkeleton={ListSkeleton}
                      />
                    )}
                    {/* Tab: Manajemen Pengguna */}
                    {activeAdminTab === 'user_management' && (
                      <UserManagementTab
                        loadingUsers={loadingUsers}
                        allUsers={allUsers}
                        ListSkeleton={ListSkeleton}
                      />
                    )}
                    {/* Tab: Manajemen Konten */}
                    {activeAdminTab === 'content_management' && (
                      <ContentManagementTab
                        loadingContent={loadingContent}
                        allResources={allResources}
                        allMilestones={allMilestones}
                        allNewsletters={allNewsletters}
                        CardSkeleton={CardSkeleton}
                      />
                    )}
                    {/* Tab: Manajemen Help Desk */}
                    {activeAdminTab === 'help_desk' && (
                      <HelpDeskTab
                        loadingHelpDesk={loadingHelpDesk}
                        allHelpDeskTickets={allHelpDeskTickets}
                        ListSkeleton={ListSkeleton}
                      />
                    )}
                    {/* Tab: Biaya Operasional */}
                    {activeAdminTab === 'operational_costs' && (
                      <OperationalCostsTab
                        loadingCosts={loadingCosts}
                        addCostLoading={addCostLoading}
                        handleAddOperationalCost={handleAddOperationalCost}
                        allOperationalCosts={allOperationalCosts}
                        formatRupiah={formatRupiah}
                        ListSkeleton={ListSkeleton}
                        SmallSpinner={SmallSpinner}
                      />
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
