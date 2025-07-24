// app/admin-dashboard/page.js

"use client";

import { useEffect, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Komponen Spinner dan Skeleton tetap di sini

export default function AdminDashboardPage() {
  // --- MULAI DEKLARASI SEMUA STATE DI SINI ---
  // Tambahan state yang hilang agar error hilang

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
)

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
)


  const [allNewsletters, setAllNewsletters] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [allHelpDeskTickets, setAllHelpDeskTickets] = useState([]);
  const [allOperationalCosts, setAllOperationalCosts] = useState([]);
  // State untuk modal biaya operasional
  const [showCostModal, setShowCostModal] = useState(false);
  const [editingCost, setEditingCost] = useState(null); // null = tambah, object = edit
  const [costForm, setCostForm] = useState({ Deskripsi: '', Jumlah: '', Tanggal: '' });
  const [costFormLoading, setCostFormLoading] = useState(false);
  const [costFormError, setCostFormError] = useState('');
  // Handler untuk buka modal tambah/edit
  const openCostModal = (cost = null) => {
    setEditingCost(cost);
    if (cost) {
      setCostForm({
        Deskripsi: cost.Deskripsi || '',
        Jumlah: cost.Jumlah || '',
        Tanggal: cost.Tanggal ? cost.Tanggal.slice(0, 10) : '',
      });
    } else {
      setCostForm({ Deskripsi: '', Jumlah: '', Tanggal: '' });
    }
    setCostFormError('');
    setShowCostModal(true);
  };

  // Handler untuk close modal
  const closeCostModal = () => {
    setShowCostModal(false);
    setEditingCost(null);
    setCostForm({ Deskripsi: '', Jumlah: '', Tanggal: '' });
    setCostFormError('');
  };

  // Handler submit form biaya operasional
  const handleSubmitCostForm = async (e) => {
    e.preventDefault();
    setCostFormLoading(true);
    setCostFormError('');
    try {
      if (!costForm.Deskripsi || !costForm.Jumlah || !costForm.Tanggal) {
        setCostFormError('Semua field wajib diisi.');
        setCostFormLoading(false);
        return;
      }
      if (isNaN(Number(costForm.Jumlah))) {
        setCostFormError('Jumlah harus berupa angka.');
        setCostFormLoading(false);
        return;
      }
      if (editingCost) {
        // Update
        const { error } = await supabase
          .from('biayaoperasional')
          .update({
            Deskripsi: costForm.Deskripsi,
            Jumlah: Number(costForm.Jumlah),
            Tanggal: costForm.Tanggal,
          })
          .eq('CostId', editingCost.CostId);
        if (error) throw error;
        closeCostModal();
        fetchOperationalCostsData();
      } else {
        // Insert
        let newCost = {
          Deskripsi: costForm.Deskripsi,
          Jumlah: Number(costForm.Jumlah),
          Tanggal: costForm.Tanggal,
        };
        // Generate CostId pendek (nanoid)
        newCost.CostId = nanoid(6);
        const { error } = await supabase
          .from('biayaoperasional')
          .insert(newCost);
        if (error) throw error;
        closeCostModal();
        fetchOperationalCostsData();
      }
    } catch (err) {
      setCostFormError(err.message || 'Gagal menyimpan data.');
    } finally {
      setCostFormLoading(false);
    }
  };

  // Handler hapus biaya operasional
  const handleDeleteCost = async (costId) => {
    if (!confirm('Yakin ingin menghapus biaya ini?')) return;
    setLoadingCosts(true);
    try {
      const { error } = await supabase
        .from('biayaoperasional')
        .delete()
        .eq('CostId', costId);
      if (error) throw error;
      fetchOperationalCostsData();
    } catch (err) {
      alert('Gagal menghapus biaya: ' + (err.message || 'Unknown error'));
    } finally {
      setLoadingCosts(false);
    }
  };
  const [allUsers, setAllUsers] = useState([]);
  const [pendingInitialDeposits, setPendingInitialDeposits] = useState([]);
  const [pendingTransferConfirmations, setPendingTransferConfirmations] = useState([]);
  const [overallProgramProgress, setOverallProgramProgress] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingHelpDesk, setLoadingHelpDesk] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);

  // Data Keuangan Pribadi
  const [personalTotalRecorded, setPersonalTotalRecorded] = useState(0); 
  const [personalUsed, setPersonalUsed] = useState(0); 
  const [personalTransferred, setPersonalTransferred] = useState(0); 
  
  // Riwayat Transaksi
  const [personalSavingHistory, setPersonalSavingHistory] = useState([]); 
  const [personalTransferConfirmations, setPersonalTransferConfirmations] = useState([]); 
  const [userHelpDeskTickets, setUserHelpDeskTickets] = useState([]); 

  // Data Global
  const [news, setNews] = useState([]);
  const [milestones, setMilestones] = useState(null); 
  const [documents, setDocuments] = useState([]); 
  
  // Loading State
  const [loadingInitial, setLoadingInitial] = useState(true); 
  const [loadingProfile, setLoadingProfile] = useState(true); 
  const [loadingGlobalConfig, setLoadingGlobalConfig] = useState(true); // <-- PASTIKAN INI ADA DAN DI SINI
  const [loadingPersonal, setLoadingPersonal] = useState(true); 
  const [loadingNews, setLoadingNews] = useState(true); 
  const [loadingMilestones, setLoadingMilestones] = useState(true); 
  const [loadingHelpDeskTickets, setLoadingHelpDeskTickets] = useState(true); 
  const [loadingDocuments, setLoadingDocuments] = useState(true); 
  
  // Error State
  const [error, setError] = useState(null);

  // Loading state spesifik untuk setiap form
  const [addSavingLoading, setAddSavingLoading] = useState(false);
  const [useSavingLoading, setUseSavingLoading] = useState(false);
  const [confirmTransferLoading, setConfirmTransferLoading] = useState(false);
  const [helpDeskFormLoading, setHelpDeskFormLoading] = useState(false);
  const [initialDepositLoading, setInitialDepositLoading] = useState(false);

  // --- AKHIR DEKLARASI SEMUA STATE ---


  const router = useRouter();
  // const searchParams = useSearchParams(); // Tidak digunakan di admin-dashboard
  // const currentTab = searchParams.get('tab') || 'main'; // Tidak digunakan di admin-dashboard


  // --- MULAI DEFINISI FUNGSI-FUNGSI useCALLBACK DI SINI ---
  // Pastikan semua fungsi fetch yang menggunakan useCallback didefinisikan di sini
  // dan mereka mengakses state yang sudah dideklarasikan di atas.

  const formatRupiah = useCallback((angka) => { // Bungkus formatRupiah juga dalam useCallback
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka || 0);
  }, []);

  // PERBAIKAN: Fungsi fetchGlobalConfigSection harus berada di atas fungsi yang memanggilnya
  const fetchGlobalConfigSection = useCallback(async () => {
    setLoadingGlobalConfig(true); // Ini adalah setter state yang harus dideklarasikan di atas
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
      setLoadingGlobalConfig(false); // Ini juga setter state
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
      setUser(user); // user state harus sudah dideklarasikan
      setProfile(profileData); // profile state harus sudah dideklarasikan

    } catch (err) {
      setError(err.message || "Gagal memuat profil admin atau konfigurasi.");
      console.error("Admin initial fetch error:", err);
      await supabase.auth.signOut();
      router.push('/admin-login');
    } finally {
        setLoadingProfile(false);
    }
  }, [router, user]); // Tambahkan user sebagai dependensi karena digunakan di setUser

  // ... (fungsi fetchOverallProgramProgress dan semua fungsi fetch lainnya yang menggunakan useCallback) ...
  // Pastikan semuanya didefinisikan di sini, setelah semua useState dan sebelum useEffects

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
            .select('Amount, UserId, Status');
        if (allTransferConfirmationsError) throw allTransferConfirmationsError;

        const { data: allUsersData, error: allUsersDataError } = await supabase
            .from('users')
            .select('UserId, InitialDepositStatus, Email, Nama'); // Ambil Email dan Nama juga
        if (allUsersDataError) throw allUsersDataError;

        const { data: allCosts, error: allCostsError } = await supabase
            .from('biayaoperasional')
            .select('Jumlah');
        if (allCostsError) throw allCostsError;

        const HARGA_SAPI = globalConfig.HargaSapi || 13000000; // Gunakan globalConfig dari state
        const TARGET_FULL_SAPI = globalConfig.TargetFullSapi || 10;

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

        const usersMap = new Map(allUsersData.map(u => [u.UserId, { Email: u.Email, Nama: u.Nama || '' }]));

        const initialDepositsPendingData = allUsersData
            .filter(u => u.InitialDepositStatus === 'Pending')
            .map(u => ({
                UserId: u.UserId,
                Email: usersMap.get(u.UserId)?.Email || 'N/A',
                Nama: usersMap.get(u.UserId)?.Nama || 'N/A',
                Amount: globalConfig.InitialDepositAmount || 0,
                Status: 'Pending',
                Type: 'Setoran Awal'
            }));
        setPendingInitialDeposits(initialDepositsPendingData);

        const pendingTransferConfirmationsData = allTransferConfirmations.filter(t => t.Status === 'Pending')
            .map(t => ({
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
  }, [globalConfig]); // globalConfig harus ada di dependensi


  const fetchAllUsersData = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*, "NamaPequrban", "StatusPequrban", "Benefits", "IsInitialDepositMade", "InitialDepositStatus"');
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
    let unsub = null;
    let cancelled = false;
    const checkAdminAndLoadDashboard = async () => {
      setLoadingInitial(true);
      setError(null);
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          if (!cancelled) router.push('/admin-login');
          return;
        }
        // Fetch Admin Profile (untuk verifikasi role)
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*, Role')
          .eq('UserId', authUser.id)
          .single();
        if (profileError || !profileData || profileData.Role !== 'Admin') {
          if (!cancelled) {
            await supabase.auth.signOut();
            router.push('/admin-login');
          }
          return;
        }
        setUser(authUser);
        setProfile(profileData);
        await fetchGlobalConfigSection();
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat memuat dashboard admin.");
        console.error("Admin dashboard initial load error:", err);
        if (!cancelled) {
          await supabase.auth.signOut();
          router.push('/admin-login');
        }
      } finally {
        setLoadingInitial(false);
      }
    };
    checkAdminAndLoadDashboard();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/admin-login');
      } else {
        supabase
          .from('users')
          .select('Role')
          .eq('UserId', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (!error && data?.Role === 'Admin') {
              setUser(session.user);
            } else {
              supabase.auth.signOut();
              router.push('/admin-login');
            }
          });
      }
    });
    unsub = authListener?.subscription;
    return () => {
      cancelled = true;
      if (unsub) unsub.unsubscribe();
    };
  }, [router, fetchGlobalConfigSection]);

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
    if (!user) { alert('Anda harus login.'); return; }
    if (!confirm(`Yakin ${status === 'Approved' ? 'menyetujui' : 'menolak'} setoran awal user ${userId}?`)) return;

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
    }
  };

  // Admin action: Verifikasi Konfirmasi Transfer Cicilan
  const handleVerifyTransferConfirmation = async (confirmationId, status) => { // status: 'Approved' atau 'Rejected'
    if (!user) { alert('Anda harus login.'); return; }
    if (!confirm(`Yakin ${status === 'Approved' ? 'menyetujui' : 'menolak'} konfirmasi transfer ${confirmationId}?`)) return;

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
    }
  };


  // --- Render Logic ---
  if (loadingInitial) {
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
            <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl shadow-2xl border border-indigo-100">
              <h2 className="text-2xl font-extrabold mb-6 text-indigo-900 flex items-center gap-2">
                <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                Overview Program
              </h2>
              {loadingOverview ? <CardSkeleton /> : (
                overallProgramProgress && globalConfig ? (
                  <>
                  {/* Card grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Card: Total Tabungan Tercatat */}
                    <div className="group bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-l-4 border-indigo-400 hover:shadow-xl transition">
                      <div className="bg-indigo-100 p-3 rounded-full">
                        {/* Icon Tabungan Tercatat: Buku Catatan */}
                        <svg className="w-7 h-7 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 006.5 22h11a2.5 2.5 0 002.5-2.5V6A2.5 2.5 0 0017.5 3.5h-11A2.5 2.5 0 004 6v13.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 6v16" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">Total Tabungan Tercatat</div>
                        <div className="text-2xl font-bold text-indigo-700">{formatRupiah(overallProgramProgress.totalCollectedAmount)}</div>
                      </div>
                    </div>
                    {/* Card: Total Tabungan Terpakai oleh User */}
                    <div className="group bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-l-4 border-red-400 hover:shadow-xl transition">
                      <div className="bg-red-100 p-3 rounded-full">
                        {/* Icon Tabungan Terpakai: Credit Card Off */}
                        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2h-1V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v7H7a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">Total Tabungan Terpakai</div>
                        <div className="text-2xl font-bold text-red-600">{formatRupiah(overallProgramProgress.totalUsedAmount)}</div>
                      </div>
                    </div>
                    {/* Card: Total Tabungan Sudah Transfer */}
                    <div className="group bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-l-4 border-green-400 hover:shadow-xl transition">
                      <div className="bg-green-100 p-3 rounded-full">
                        {/* Icon Tabungan Sudah Transfer: Arrow Up Right */}
                        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-10 10M7 7h10v10" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">Total Tabungan Sudah Transfer</div>
                        <div className="text-2xl font-bold text-green-700">{formatRupiah(overallProgramProgress.confirmedAmount)}</div>
                      </div>
                    </div>
                    {/* Card: Total Sisa Tabungan User */}
                    <div className="group bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-l-4 border-yellow-400 hover:shadow-xl transition">
                      <div className="bg-yellow-100 p-3 rounded-full">
                        {/* Icon Sisa Tabungan: Safe/Shield */}
                        <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">Total Sisa Tabungan</div>
                        <div className="text-2xl font-bold text-yellow-700">{formatRupiah(overallProgramProgress.confirmedAmount - overallProgramProgress.totalUsedAmount - overallProgramProgress.totalCosts)}</div>
                      </div>
                    </div>
                    {/* Card: Total Biaya Operasional */}
                    <div className="group bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-l-4 border-gray-400 hover:shadow-xl transition">
                      <div className="bg-gray-100 p-3 rounded-full">
                        {/* Icon Biaya Operasional: Expense/Currency/Coins */}
                        <svg className="w-7 h-7 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">Total Biaya Operasional</div>
                        <div className="text-2xl font-bold text-gray-700">{formatRupiah(overallProgramProgress.totalCosts)}</div>
                      </div>
                    </div>
                    {/* Card: Net Profit */}
                    <div className="group bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border-l-4 border-emerald-400 hover:shadow-xl transition">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        {/* Icon Net Profit: Trending Up/Chart */}
                        <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">Net Profit</div>
                        <div className="text-2xl font-bold text-emerald-700">{formatRupiah(overallProgramProgress.confirmedAmount - overallProgramProgress.totalUsedAmount - overallProgramProgress.totalCosts)}</div>
                      </div>
                    </div>
                  </div>
                  {/* Progress Sapi & User Info */}
                  {/* Progress Sapi */}
                  <div className="bg-gradient-to-r from-yellow-100 via-green-100 to-indigo-100 rounded-xl p-6 shadow mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24"><path d="M10.5,18A0.5,0.5 0 0,1 11,18.5A0.5,0.5 0 0,1 10.5,19A0.5,0.5 0 0,1 10,18.5A0.5,0.5 0 0,1 10.5,18M13.5,18A0.5,0.5 0 0,1 14,18.5A0.5,0.5 0 0,1 13.5,19A0.5,0.5 0 0,1 13,18.5A0.5,0.5 0 0,1 13.5,18M10,11A1,1 0 0,1 11,12A1,1 0 0,1 10,13A1,1 0 0,1 9,12A1,1 0 0,1 10,11M14,11A1,1 0 0,1 15,12A1,1 0 0,1 14,13A1,1 0 0,1 13,12A1,1 0 0,1 14,11M18,18C18,20.21 15.31,22 12,22C8.69,22 6,20.21 6,18C6,17.1 6.45,16.27 7.2,15.6C6.45,14.6 6,13.35 6,12L6.12,10.78C5.58,10.93 4.93,10.93 4.4,10.78C3.38,10.5 1.84,9.35 2.07,8.55C2.3,7.75 4.21,7.6 5.23,7.9C5.82,8.07 6.45,8.5 6.82,8.96L7.39,8.15C6.79,7.05 7,4 10,3L9.91,3.14V3.14C9.63,3.58 8.91,4.97 9.67,6.47C10.39,6.17 11.17,6 12,6C12.83,6 13.61,6.17 14.33,6.47C15.09,4.97 14.37,3.58 14.09,3.14L14,3C17,4 17.21,7.05 16.61,8.15L17.18,8.96C17.55,8.5 18.18,8.07 18.77,7.9C19.79,7.6 21.7,7.75 21.93,8.55C22.16,9.35 20.62,10.5 19.6,10.78C19.07,10.93 18.42,10.93 17.88,10.78L18,12C18,13.35 17.55,14.6 16.8,15.6C17.55,16.27 18,17.1 18,18M12,16C9.79,16 8,16.9 8,18C8,19.1 9.79,20 12,20C14.21,20 16,19.1 16,18C16,16.9 14.21,16 12,16M12,14C13.12,14 14.17,14.21 15.07,14.56C15.65,13.87 16,13 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13 8.35,13.87 8.93,14.56C9.83,14.21 10.88,14 12,14M14.09,3.14V3.14Z" /></svg>
                      <span className="font-semibold text-yellow-800">Progress Sapi</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div className="bg-gradient-to-r from-green-400 to-yellow-400 h-4 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (overallProgramProgress.cowStatus.green + overallProgramProgress.cowStatus.yellow) / overallProgramProgress.cowStatus.fullTarget * 100)}%` }}></div>
                    </div>
                    <div className="flex gap-1 text-xs text-gray-700">
                      <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Sapi Terkumpul: {overallProgramProgress.cowStatus.green}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Menuju Target: {overallProgramProgress.cowStatus.yellow}</span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Target: {overallProgramProgress.cowStatus.fullTarget}</span>
                    </div>
                  </div>

                  {/* Statistik User, card terpisah */}
                  <div className="group bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 border-l-4 border-indigo-300 min-h-[140px] mt-6">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-7 h-7 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" /></svg>
                      <span className="font-semibold text-indigo-800">Statistik User</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold w-full text-center">{overallProgramProgress.totalUsers} Terdaftar</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold w-full text-center">{overallProgramProgress.verifiedUsers} Sudah Setor Awal</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold w-full text-center">{overallProgramProgress.pendingUsers} Pending Verifikasi</span>
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold w-full text-center">{overallProgramProgress.unpaidUsers} Belum Setor Awal</span>
                    </div>
                  </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Data overview belum tersedia.</p>
                )
              )}
            </div>

            {/* Bagian Verifikasi Pending */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-indigo-800">Verifikasi Pending</h2>
                {/* Menggunakan Loading Orverview */}
                {loadingOverview ? <ListSkeleton /> : 
                    pendingInitialDeposits.length > 0 || pendingTransferConfirmations.length > 0 ? (
                        <>
                            
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
                                        {pendingInitialDeposits.map(item => <tr key={item.UserId}><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.UserId}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama} ({item.Email})</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatRupiah(item.Amount)}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => handleVerifyInitialDeposit(item.UserId, 'Approved')} className="text-green-600 hover:text-green-900 mr-2">Approve</button><button onClick={() => handleVerifyInitialDeposit(item.UserId, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button></td></tr>)}
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Nama}({item.Email})</td>
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
                  }
            </div>

            {/* Bagian Manajemen Pengguna */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
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
            </div>

            {/* Bagian Manajemen Konten (Dokumen, Milestone, Berita) */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{milestone.Month}{milestone.Year}</td>
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
                )}</div>
            {/* Bagian Manajemen Help Desk & Biaya Operasional */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Help Desk Tickets */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.UserId} </td>
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
                </div>

                {/* Biaya Operasional */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-indigo-800 flex items-center justify-between">
                      <span>Manajemen Biaya Operasional</span>
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-medium"
                        onClick={() => openCostModal()}
                      >+ Tambah Biaya</button>
                    </h2>
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
                                                <button onClick={() => openCostModal(cost)} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                                                <button onClick={() => handleDeleteCost(cost.CostId)} className="text-red-600 hover:text-red-900">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Modal Form Tambah/Edit Biaya Operasional */}
                    {showCostModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={closeCostModal}>&times;</button>
                          <h3 className="text-lg font-bold mb-4">{editingCost ? 'Edit Biaya Operasional' : 'Tambah Biaya Operasional'}</h3>
                          <form onSubmit={handleSubmitCostForm} className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                              <input type="text" className="mt-1 block w-full border rounded px-3 py-2" value={costForm.Deskripsi} onChange={e => setCostForm(f => ({ ...f, Deskripsi: e.target.value }))} required />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                              <input type="number" className="mt-1 block w-full border rounded px-3 py-2" value={costForm.Jumlah} onChange={e => setCostForm(f => ({ ...f, Jumlah: e.target.value }))} required min="0" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                              <input type="date" className="mt-1 block w-full border rounded px-3 py-2" value={costForm.Tanggal} onChange={e => setCostForm(f => ({ ...f, Tanggal: e.target.value }))} required />
                            </div>
                            {costFormError && <div className="text-red-500 text-sm">{costFormError}</div>}
                            <div className="flex justify-end gap-2">
                              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700" onClick={closeCostModal}>Batal</button>
                              <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700" disabled={costFormLoading}>{costFormLoading ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}