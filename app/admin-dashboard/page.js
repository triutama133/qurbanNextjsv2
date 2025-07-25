"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Profil admin dari public.users
  const [globalConfig, setGlobalConfig] = useState(null);
  
  // Data Overview Program
  const [overallProgramProgress, setOverallProgramProgress] = useState(null);
  const [pendingInitialDeposits, setPendingInitialDeposits] = useState([]);
  const [pendingTransferConfirmations, setPendingTransferConfirmations] = useState([]);

  // Data Manajemen
  const [allUsers, setAllUsers] = useState([]);
  const [allNewsletters, setAllNewsletters] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [allHelpDeskTickets, setAllHelpDeskTickets] = useState([]);
  const [allOperationalCosts, setAllOperationalCosts] = useState([]);

  // Loading States
  const [loadingInitial, setLoadingInitial] = useState(true); // Loading saat verifikasi admin & fetch data dasar
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true); // Untuk News, Milestones, Resources
  const [loadingHelpDesk, setLoadingHelpDesk] = useState(true);
  const [loadingCosts, setLoadingCosts] = useState(true);
  // Perbaikan: Tambahkan state loading untuk globalConfig dan profile
  const [loadingGlobalConfig, setLoadingGlobalConfig] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Error States
  const [error, setError] = useState(null);

  // Admin Actions Loading States
  const [verifyDepositLoading, setVerifyDepositLoading] = useState(false);
  const [verifyTransferLoading, setVerifyTransferLoading] = useState(false);
  const [addCostLoading, setAddCostLoading] = useState(false);
  const [addNewsLoading, setAddNewsLoading] = useState(false); // Belum digunakan di kode ini, tapi ada di state
  const [addMilestoneLoading, setAddMilestoneLoading] = useState(false); // Belum digunakan
  const [addResourceLoading, setAddResourceLoading] = useState(false); // Belum digunakan
  const [respondTicketLoading, setRespondTicketLoading] = useState(false); // Belum digunakan

  // Admin Tab State
  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // Default tab: overview

  const router = useRouter();

  // --- Utility Functions ---
  const formatRupiah = useCallback((angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka || 0);
  }, []);

  // --- Data Fetching Logic (Individual Sections) ---
  const fetchGlobalConfigSection = useCallback(async () => {
    setLoadingGlobalConfig(true);
    try {
      const { data: configData, error: configError } = await supabase
          .from('app_config')
          .select('*')
          .eq('id', 'global_settings')
          .single();
      if (configError || !configData) {
          throw new Error(configError?.message || 'Data konfigurasi global tidak ditemukan.');
      }
      setGlobalConfig(configData);
    } catch (err) {
      setError(err.message || "Gagal memuat konfigurasi global.");
      console.error("fetchGlobalConfigSection error:", err);
      setGlobalConfig(null);
    } finally {
      setLoadingGlobalConfig(false);
    }
  }, []);

  const fetchAdminProfileAndConfig = useCallback(async (userId) => {
    setLoadingProfile(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*, Role')
        .eq('UserId', userId)
        .single();

      if (profileError || !profileData || profileData.Role !== 'Admin') {
        throw new Error('Akses Ditolak: Anda bukan admin.');
      }
      // Perbaikan: Gunakan authUser.id (userId) untuk set user, bukan state 'user' yang belum tentu ada
      setUser({ id: userId }); 
      setProfile(profileData);
    } catch (err) {
      setError(err.message || "Gagal memuat profil admin atau konfigurasi.");
      console.error("Admin initial fetch error:", err);
      await supabase.auth.signOut();
      router.push('/admin-login');
    } finally {
        setLoadingProfile(false);
    }
  }, [router]); // `user` dihapus dari dependency array karena tidak digunakan di sini, dan malah menyebabkan masalah

  const fetchOverallProgramProgress = useCallback(async () => {
    setLoadingOverview(true);
    if (!globalConfig) { 
        console.warn("Global config not available for overall progress calculation.");
        setLoadingOverview(false);
        return;
    }
    try {
        const { data: allSavings, error: allSavingsError } = await supabase
            .from('tabungan')
            .select('Jumlah, Tipe');
        if (allSavingsError) throw allSavingsError;

        const { data: allTransferConfirmations, error: allTransferConfirmationsError } = await supabase
            .from('transfer_confirmations')
            .select('Amount, UserId, Status, ConfirmationId, Timestamp, ProofLink'); // Ambil kolom yang diperlukan
        if (allTransferConfirmationsError) throw allTransferConfirmationsError;

        const { data: allUsersData, error: allUsersDataError } = await supabase
            .from('users')
            .select('UserId, Email, Nama, InitialDepositStatus'); // Ambil Email dan Nama juga
        if (allUsersDataError) throw allUsersDataError;

        const { data: allCosts, error: allCostsError } = await supabase
            .from('biayaoperasional')
            .select('Jumlah');
        if (allCostsError) throw allCostsError;

        const HARGA_SAPI = globalConfig.HargaSapi || 13000000;
        const TARGET_FULL_SAPI = globalConfig.TargetFullSapi || 11;

        let totalRecordedOverall = 0;
        let totalUsedOverall = 0;
        allSavings.forEach(s => {
            if (s.Tipe === 'Setoran') totalRecordedOverall += (s.Jumlah || 0);
            else if (s.Tipe === 'Penggunaan') totalUsedOverall += (s.Jumlah || 0);
        });

        let totalTransferredApprovedOverall = allTransferConfirmations
            .filter(t => t.Status === 'Approved')
            .reduce((sum, item) => sum + (item.Amount || 0), 0);

        const initialDepositApprovedAmount = allUsersData
            .filter(u => u.InitialDepositStatus === 'Approved')
            .length * (globalConfig.InitialDepositAmount || 0);
        totalTransferredApprovedOverall += initialDepositApprovedAmount;


        const totalCostsOverall = allCosts.reduce((sum, item) => sum + (item.Jumlah || 0), 0);

        const greenCows = Math.floor(totalTransferredApprovedOverall / HARGA_SAPI);
        const yellowCows = Math.floor((totalRecordedOverall - totalTransferredApprovedOverall) / HARGA_SAPI);
        const totalUsersCount = allUsersData.length;
        const pendingUsersInitialDepositCount = allUsersData.filter(u => u.InitialDepositStatus === 'Pending').length;

        setOverallProgramProgress({
            totalCollectedAmount: totalRecordedOverall,
            totalUsedAmount: totalUsedOverall,
            confirmedAmount: totalTransferredApprovedOverall,
            cowStatus: { green: greenCows, yellow: yellowCows, fullTarget: TARGET_FULL_SAPI },
            totalCosts: totalCostsOverall,
            netProgramBalance: totalTransferredApprovedOverall - totalCostsOverall,
            totalUsers: totalUsersCount,
            pendingInitialDeposits: pendingUsersInitialDepositCount,
        });

        // Ambil pending initial deposits untuk tabel verifikasi
        const usersMap = new Map(allUsersData.map(u => [u.UserId, { Email: u.Email, Nama: u.Nama || '' }]));

        const pendingInitialDepositsData = allUsersData
            .filter(u => u.InitialDepositStatus === 'Pending')
            .map(u => ({
                UserId: u.UserId,
                Email: usersMap.get(u.UserId)?.Email || 'N/A',
                Nama: usersMap.get(u.UserId)?.Nama || 'N/A',
                Amount: globalConfig.InitialDepositAmount || 0,
                Status: 'Pending',
                Type: 'Setoran Awal'
            }));
        
        setPendingInitialDeposits(pendingInitialDepositsData);

        // Pending Transfer Confirmations
        const pendingTransfers = allTransferConfirmations.filter(t => t.Status === 'Pending');
        const pendingTransferConfirmationsData = pendingTransfers.map(t => ({
            ConfirmationId: t.ConfirmationId,
            UserId: t.UserId,
            Email: usersMap.get(t.UserId)?.Email || 'N/A',
            Nama: usersMap.get(t.UserId)?.Nama || 'N/A',
            Amount: t.Amount,
            Timestamp: t.Timestamp,
            ProofLink: t.ProofLink,
            Status: t.Status,
            Type: 'Transfer Cicilan'
        }));
        setPendingTransferConfirmations(pendingTransferConfirmationsData);

    } catch (err) {
      setError(err.message || "Gagal memuat overview program.");
      console.error("fetchOverallProgramProgress error:", err);
      setOverallProgramProgress(null);
      setPendingInitialDeposits([]);
      setPendingTransferConfirmations([]);
    } finally {
      setLoadingOverview(false);
    }
  }, [globalConfig]); 

  const fetchAllUsersData = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*, NamaPequrban, StatusPequrban, Benefits, IsInitialDepositMade, InitialDepositStatus'); 
      if (usersError) throw usersError;
      setAllUsers(usersData);
    } catch (err) {
      setError(err.message || "Gagal memuat data pengguna.");
      console.error("fetchAllUsersData error:", err);
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchContentData = useCallback(async () => {
    setLoadingContent(true);
    try {
      // Newsletters
      const { data: newslettersData, error: newslettersError } = await supabase
        .from('newsletters')
        .select('*')
        .order('DatePublished', { ascending: false });
      if (newslettersError) throw newslettersError;
      setAllNewsletters(newslettersData);

      // Milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('program_milestones')
        .select('*')
        .order('Year', { ascending: true })
        .order('Order', { ascending: true });
      if (milestonesError) {
        if (milestonesError.code === 'PGRST116') setAllMilestones([]);
        else throw milestonesError;
      } else {
        setAllMilestones(milestonesData);
      }

      // Resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('app_resources')
        .select('*')
        .order('CreatedAt', { ascending: false });
      if (resourcesError) throw resourcesError;
      setAllResources(resourcesData);

    } catch (err) {
      setError(err.message || "Gagal memuat data konten.");
      console.error("fetchContentData error:", err);
      setAllNewsletters([]);
      setAllMilestones([]);
      setAllResources([]);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const fetchHelpDeskData = useCallback(async () => {
    setLoadingHelpDesk(true);
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('help_desk_tickets')
        .select('*')
        .order('Timestamp', { ascending: false });
      if (ticketsError) throw ticketsError;
      setAllHelpDeskTickets(ticketsData);
    } catch (err) {
      setError(err.message || "Gagal memuat data Help Desk.");
      console.error("fetchHelpDeskData error:", err);
      setAllHelpDeskTickets([]);
    } finally {
      setLoadingHelpDesk(false);
    }
  }, []);

  const fetchOperationalCostsData = useCallback(async () => {
    setLoadingCosts(true);
    try {
      const { data: costsData, error: costsError } = await supabase
        .from('biayaoperasional')
        .select('*')
        .order('Timestamp', { ascending: false });
      if (costsError) throw costsError;
      setAllOperationalCosts(costsData);
    } catch (err) {
      setError(err.message || "Gagal memuat data biaya operasional.");
      console.error("fetchOperationalCostsData error:", err);
      setAllOperationalCosts([]);
    } finally {
      setLoadingCosts(false);
    }
  }, []);

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
        // Perbaikan: Panggil fetchAdminProfileAndConfig dengan authUser.id
        await fetchAdminProfileAndConfig(authUser.id); 
        
        // Fetch Global Config (dibutuhkan untuk perhitungan overview)
        await fetchGlobalConfigSection(); 

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
                        fetchAdminProfileAndConfig(session.user.id); // Panggil lagi jika auth state berubah dan masih admin
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
  }, [router, fetchAdminProfileAndConfig, fetchGlobalConfigSection]);

  // Effect kedua: memuat bagian-bagian dashboard setelah user, profile, globalConfig tersedia
  useEffect(() => {
    if (user && profile && globalConfig) {
        // Set semua loading state untuk feedback visual sebelum fetch
        setLoadingOverview(true);
        setLoadingUsers(true);
        setLoadingContent(true);
        setLoadingHelpDesk(true);
        setLoadingCosts(true);

        // Panggil semua fetch fungsi secara paralel
        Promise.allSettled([
            fetchOverallProgramProgress(), // Ini tergantung pada globalConfig
            fetchAllUsersData(),
            fetchContentData(), // News, Milestones, Resources
            fetchHelpDeskData(),
            fetchOperationalCostsData(),
        ]).then(results => {
            console.log("Admin sections fetch results:", results);
        });
    }
  }, [user, profile, globalConfig, fetchOverallProgramProgress, fetchAllUsersData, fetchContentData, fetchHelpDeskData, fetchOperationalCostsData]);

  // --- Event Handlers (Admin Actions) ---
  const handleSignOut = async () => {
    setLoadingInitial(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      setError('Gagal logout: ' + error.message);
    } else {
      router.push('/admin-login');
    }
  };

  const handleRefreshAdminDashboard = () => {
    if (user && profile && globalConfig) {
        // Set all loading states to true for visual feedback before re-fetching
        setLoadingOverview(true);
        setLoadingUsers(true);
        setLoadingContent(true);
        setLoadingHelpDesk(true);
        setLoadingCosts(true);

        // Panggil kembali fungsi fetch untuk setiap section
        Promise.allSettled([
            fetchOverallProgramProgress(),
            fetchAllUsersData(),
            fetchContentData(),
            fetchHelpDeskData(),
            fetchOperationalCostsData(),
        ]).then(results => {
            console.log("Admin dashboard refresh results:", results);
        });
    }
  };

  // Admin action: Verifikasi Setoran Awal
  const handleVerifyInitialDeposit = async (userId, status) => { // status: 'Approved' atau 'Rejected'
    setVerifyDepositLoading(true);
    if (!user) { alert('Anda harus login.'); setVerifyDepositLoading(false); return; }
    if (!confirm(`Yakin ${status === 'Approved' ? 'menyetujui' : 'menolak'} setoran awal user ${userId}?`)) {
        setVerifyDepositLoading(false);
        return;
    }

    try {
        const response = await fetch('/api/admin/verify-initial-deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, status, adminId: user.id }),
        });
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Gagal verifikasi setoran awal.');
        }
        alert(result.message);
        handleRefreshAdminDashboard(); // Refresh data setelah aksi
    } catch (err) {
        console.error('Error verifying initial deposit:', err);
        alert('Error: ' + err.message);
    } finally {
        setVerifyDepositLoading(false);
    }
  };

  // Admin action: Verifikasi Konfirmasi Transfer Cicilan
  const handleVerifyTransferConfirmation = async (confirmationId, status) => { // status: 'Approved' atau 'Rejected'
    setVerifyTransferLoading(true);
    if (!user) { alert('Anda harus login.'); setVerifyTransferLoading(false); return; }
    if (!confirm(`Yakin ${status === 'Approved' ? 'menyetujui' : 'menolak'} konfirmasi transfer ${confirmationId}?`)) {
        setVerifyTransferLoading(false);
        return;
    }

    try {
        const response = await fetch('/api/admin/verify-transfer-confirmation', { // Perlu API Route baru
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ confirmationId, status, adminId: user.id }),
        });
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Gagal verifikasi konfirmasi transfer.');
        }
        alert(result.message);
        handleRefreshAdminDashboard(); // Refresh data setelah aksi
    } catch (err) {
        console.error('Error verifying transfer confirmation:', err);
        alert('Error: ' + err.message);
    } finally {
        setVerifyTransferLoading(false);
    }
  };

  // Admin action: Tambah Biaya Operasional
  const handleAddOperationalCost = async (e) => {
    e.preventDefault();
    setAddCostLoading(true);
    const descriptionInput = e.target.elements.costDescription;
    const amountInput = e.target.elements.costAmount;
    const description = descriptionInput.value.trim();
    const amount = Number.parseFloat(amountInput.value.replace(/[^0-9]/g, ''));

    if (!description || isNaN(amount) || amount <= 0) {
        alert('Deskripsi dan jumlah biaya tidak valid.');
        setAddCostLoading(false);
        return;
    }

    // Generate costId pendek: COST + 6 digit waktu + 3 digit random
    const costId = 'COST' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    try {
        const response = await fetch('/api/admin/add-operational-cost', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ costId, description, amount }),
        });
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error || 'Gagal menambahkan biaya operasional.');
        }
        alert(result.message);
        e.target.reset(); // Reset form
        handleRefreshAdminDashboard(); // Refresh data setelah aksi
    } catch (err) {
        console.error('Error adding operational cost:', err);
        alert('Error: ' + err.message);
    } finally {
        setAddCostLoading(false);
    }
  };


  // --- Render Logic ---
  if (loadingInitial || loadingProfile || loadingGlobalConfig) { // Memperhitungkan loading profile dan global config
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
                {loadingOverview ? <CardSkeleton /> : (
                    overallProgramProgress && globalConfig ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Dana Tercatat</p>
                                <p className="text-2xl font-bold text-indigo-700">{formatRupiah(overallProgramProgress.totalCollectedAmount)}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Dana Terkonfirmasi (Siap Beli)</p>
                                <p className="text-2xl font-bold text-green-700">{formatRupiah(overallProgramProgress.confirmedAmount)}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Dana Terpakai</p>
                                <p className="text-2xl font-bold text-red-600">{formatRupiah(overallProgramProgress.totalUsedAmount)}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total Biaya Operasional</p>
                                <p className="text-2xl font-bold text-gray-700">{formatRupiah(overallProgramProgress.totalCosts)}</p>
                            </div>
                            <div className="lg:col-span-4 mt-4">
                                <h3 className="font-semibold text-lg mb-2">Progress Sapi</h3>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {[...Array(overallProgramProgress.cowStatus.fullTarget)].map((_, i) => {
                                        let cowColorClass = 'text-gray-300';
                                        if (i < overallProgramProgress.cowStatus.green) {
                                            cowColorClass = 'text-green-600';
                                        } else if (i < overallProgramProgress.cowStatus.green + overallProgramProgress.cowStatus.yellow) {
                                            cowColorClass = 'text-yellow-500';
                                        }
                                        return (
                                            <span key={i} className={cowColorClass}>
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5,18A0.5,0.5 0 0,1 11,18.5A0.5,0.5 0 0,1 10.5,19A0.5,0.5 0 0,1 10,18.5A0.5,0.5 0 0,1 10.5,18M13.5,18A0.5,0.5 0 0,1 14,18.5A0.5,0.5 0 0,1 13.5,19A0.5,0.5 0 0,1 13,18.5A0.5,0.5 0 0,1 13.5,18M10,11A1,1 0 0,1 11,12A1,1 0 0,1 10,13A1,1 0 0,1 9,12A1,1 0 0,1 10,11M14,11A1,1 0 0,1 15,12A1,1 0 0,1 14,13A1,1 0 0,1 13,12A1,1 0 0,1 14,11M18,18C18,20.21 15.31,22 12,22C8.69,22 6,20.21 6,18C6,17.1 6.45,16.27 7.2,15.6C6.45,14.6 6,13.35 6,12L6.12,10.78C5.58,10.93 4.93,10.93 4.4,10.78C3.38,10.5 1.84,9.35 2.07,8.55C2.3,7.75 4.21,7.6 5.23,7.9C5.82,8.07 6.45,8.5 6.82,8.96L7.39,8.15C6.79,7.05 7,4 10,3L9.91,3.14V3.14C9.63,3.58 8.91,4.97 9.67,6.47C10.39,6.17 11.17,6 12,6C12.83,6 13.61,6.17 14.33,6.47C15.09,4.97 14.37,3.58 14.09,3.14L14,3C17,4 17.21,7.05 16.61,8.15L17.18,8.96C17.55,8.5 18.18,8.07 18.77,7.9C19.79,7.6 21.7,7.75 21.93,8.55C22.16,9.35 20.62,10.5 19.6,10.78C19.07,10.93 18.42,10.93 17.88,10.78L18,12C18,13.35 17.55,14.6 16.8,15.6C17.55,16.27 18,17.1 18,18M12,16C9.79,16 8,16.9 8,18C8,19.1 9.79,20 12,20C14.21,20 16,19.1 16,18C16,16.9 14.21,16 12,16M12,14C13.12,14 14.17,14.21 15.07,14.56C15.65,13.87 16,13 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13 8.35,13.87 8.93,14.56C9.83,14.21 10.88,14 12,14M14.09,3.14V3.14Z" /></svg>
                                            </span>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Total User Terdaftar: {overallProgramProgress.totalUsers}
                                    <br />
                                    User Setoran Awal Pending: {overallProgramProgress.pendingInitialDeposits}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">Data overview belum tersedia.</p>
                    )
                )}
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
                        <> {/* Perbaikan: Menghapus tag </> yang tidak perlu di sini */}
                            <h2 className="text-xl font-bold mb-4 text-indigo-800">Verifikasi Pending</h2>
                            {loadingOverview ? <ListSkeleton /> : (
                                pendingInitialDeposits.length > 0 || pendingTransferConfirmations.length > 0 ? (
                                    <>
                                        {/* Verifikasi Setoran Awal */}
                                        <h3 className="font-semibold text-lg mb-2">Setoran Awal</h3>
                                        <div className="overflow-x-auto mb-6">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama (Email)</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {pendingInitialDeposits.map((item) => (
                                                        <tr key={item.UserId}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.UserId}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama} ({item.Email})</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.Amount)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button onClick={() => handleVerifyInitialDeposit(item.UserId, 'Approved')} className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                                                                <button onClick={() => handleVerifyInitialDeposit(item.UserId, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Verifikasi Konfirmasi Transfer Cicilan */}
                                        <h3 className="font-semibold text-lg mb-2">Transfer Cicilan</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaksi ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User (Email)</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {pendingTransferConfirmations.map((item) => (
                                                        <tr key={item.ConfirmationId}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.ConfirmationId}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama} ({item.Email})</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.Amount)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.Timestamp).toLocaleDateString('id-ID')}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {item.ProofLink && <a href={item.ProofLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat</a>}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <button onClick={() => handleVerifyTransferConfirmation(item.ConfirmationId, 'Approved')} className="text-green-600 hover:text-green-900 mr-2">Approve</button>
                                                                <button onClick={() => handleVerifyTransferConfirmation(item.ConfirmationId, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500 text-sm">Tidak ada verifikasi pending saat ini.</p>
                                )
                            )}
                        </> 
                    )}
                    {/* Tab: Manajemen Pengguna */}
                    {activeAdminTab === 'user_management' && (
                        <>
                            <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Pengguna</h2>
                            {loadingUsers ? <ListSkeleton /> : (
                                allUsers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pequrban</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Setoran Awal</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {allUsers.map((userItem) => (
                                                    <tr key={userItem.UserId}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.UserId}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.NamaPequrban || userItem.Nama}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.Email}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userItem.Role}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                userItem.InitialDepositStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                                                                userItem.InitialDepositStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {userItem.InitialDepositStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => alert('Edit user: ' + userItem.UserId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                            <button onClick={() => alert('View details: ' + userItem.UserId)} className="text-gray-600 hover:text-gray-900">Detail</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Belum ada pengguna terdaftar.</p>
                                )
                            )}
                        </>
                    )}
                    {/* Tab: Manajemen Konten */}
                    {activeAdminTab === 'content_management' && (
                        <>
                            <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Konten</h2>
                            {loadingContent ? <CardSkeleton /> : (
                                <div className="space-y-6">
                                    {/* Dokumen & Sumber Daya */}
                                    <h3 className="font-semibold text-lg mb-2">Dokumen & Sumber Daya</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Global/User</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {allResources.map((resource) => (
                                                    <tr key={resource.ResourceId}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.Title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.Type}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.IsGlobal ? 'Global' : 'User'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <a href={resource.Link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">Lihat</a>
                                                            <button onClick={() => alert('Edit resource: ' + resource.ResourceId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                            <button onClick={() => alert('Delete resource: ' + resource.ResourceId)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Milestone Program */}
                                    <h3 className="font-semibold text-lg mb-2 mt-8">Milestone Program</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bulan & Tahun</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitas</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {allMilestones.map((milestone) => (
                                                    <tr key={milestone.MilestoneId}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{milestone.Month} {milestone.Year}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{milestone.Activity}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => alert('Edit milestone: ' + milestone.MilestoneId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                            <button onClick={() => alert('Delete milestone: ' + milestone.MilestoneId)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Berita & Informasi */}
                                    <h3 className="font-semibold text-lg mb-2 mt-8">Berita & Informasi</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {allNewsletters.map((newsItem) => (
                                                    <tr key={newsItem.NewsletterId}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{newsItem.Title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{newsItem.AuthorName}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(newsItem.DatePublished).toLocaleDateString('id-ID')}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button onClick={() => alert('Edit news: ' + newsItem.NewsletterId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                            <button onClick={() => alert('Delete news: ' + newsItem.NewsletterId)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {/* Tab: Manajemen Help Desk */}
                    {activeAdminTab === 'help_desk' && (
                        <>
                            <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Help Desk</h2>
                            {loadingHelpDesk ? <ListSkeleton /> : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiket ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User (Email)</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pertanyaan</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {allHelpDeskTickets.map((ticket) => (
                                                <tr key={ticket.TicketId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.TicketId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.UserId} (Perlu Email)</td> {/* Akan difetch emailnya */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.Question.substring(0, 50)}...</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.Status}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => alert('Respond to ticket: ' + ticket.TicketId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Respond</button>
                                                        <button onClick={() => alert('Close ticket: ' + ticket.TicketId)} className="text-red-600 hover:text-red-900">Close</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                    {/* Tab: Biaya Operasional */}
                    {activeAdminTab === 'operational_costs' && (
                        <>
                            <h2 className="text-xl font-bold mb-4 text-indigo-800">Manajemen Biaya Operasional</h2>
                            {/* Form Tambah Biaya Operasional */}
                            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <h3 className="font-semibold text-lg mb-2">Tambah Biaya Baru</h3>
                                <form className="space-y-4" onSubmit={handleAddOperationalCost}>
                                    <div>
                                        <label htmlFor="costDescription" className="block text-sm font-medium text-gray-700">Deskripsi Biaya</label>
                                        <input type="text" id="costDescription" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="costAmount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                                        <input type="text" id="costAmount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                            onKeyUp={(e) => {
                                                let value = e.target.value.replace(/[^0-9]/g, '');
                                                e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center justify-center"
                                            disabled={addCostLoading}
                                        >
                                            {addCostLoading ? <SmallSpinner /> : null}
                                            {addCostLoading ? 'Menyimpan...' : 'Tambah Biaya'}
                                        </button>
                                    </div>
                                </form>
                                <p id="addCostMessage" className="text-sm mt-3"></p>
                            </div>

                            {/* Daftar Biaya Operasional */}
                            {loadingCosts ? <ListSkeleton /> : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Biaya</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {allOperationalCosts.map((cost) => (
                                                <tr key={cost.CostId}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.CostId}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.Deskripsi}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(cost.Jumlah)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(cost.Tanggal).toLocaleDateString('id-ID')}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => alert('Edit cost: ' + cost.CostId)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                        <button onClick={() => alert('Delete cost: ' + cost.CostId)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}