
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabase';

export default function useAdminDashboardData() {

  // --- State declarations (pindahkan ke paling atas) ---
  const [addNewsLoading, setAddNewsLoading] = useState(false);
  const [addMilestoneLoading, setAddMilestoneLoading] = useState(false);
  const [addResourceLoading, setAddResourceLoading] = useState(false);
  const [respondTicketLoading, setRespondTicketLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingHelpDesk, setLoadingHelpDesk] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [loadingAppConfig, setLoadingAppConfig] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);
  const [verifyDepositLoading, setVerifyDepositLoading] = useState(false);
  const [verifyTransferLoading, setVerifyTransferLoading] = useState(false);
  const [addCostLoading, setAddCostLoading] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [appConfig, setAppConfig] = useState(null);
  const [overallProgramProgress, setOverallProgramProgress] = useState(null);
  const [pendingInitialDeposits, setPendingInitialDeposits] = useState([]);
  const [pendingTransferConfirmations, setPendingTransferConfirmations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allNewsletters, setAllNewsletters] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [allOperationalCosts, setAllOperationalCosts] = useState([]);
  const [allHelpDeskTickets, setAllHelpDeskTickets] = useState([]);
  // --- End state declarations ---

  // Fetch app config section
  const fetchAppConfigSection = useCallback(async () => {
    try {
      setLoadingAppConfig(true);
      setError(null);
      const { data, error } = await supabase
        .from('app_config')
        .select('*')
        .eq('id', 'global_settings')
        .single();
      if (error) throw error;
      setAppConfig(data);
    } catch (err) {
      setError(err.message || 'Gagal mengambil app config');
    } finally {
      setLoadingAppConfig(false);
    }
  }, []);

  // Fetch overall program progress (custom calculation, bukan dari tabel program_progress)
  const fetchOverallProgramProgress = useCallback(async () => {
    setLoadingOverview(true);
    setError(null);
    try {
      // Pastikan appConfig sudah ada
      if (!appConfig) {
        setOverallProgramProgress(null);
        setLoadingOverview(false);
        return;
      }
      // Ambil tabungan
      const { data: allSavings, error: allSavingsError } = await supabase
        .from('tabungan')
        .select('Jumlah, Tipe');
      if (allSavingsError) throw allSavingsError;
      // Ambil transfer konfirmasi
      const { data: allTransferConfirmations, error: allTransferConfirmationsError } = await supabase
        .from('transfer_confirmations')
        .select('Amount, UserId, Status, ConfirmationId, Timestamp, ProofLink');
      if (allTransferConfirmationsError) throw allTransferConfirmationsError;
      // Ambil users
      const { data: allUsersDataRaw, error: allUsersDataError } = await supabase
        .from('users')
        .select('UserId, Email, Nama, Role, InitialDepositStatus');
      if (allUsersDataError) throw allUsersDataError;
      // Robust filter: exclude admin (case-insensitive, handle missing Role)
      const allUsersData = (allUsersDataRaw || []).filter(u => (u.Role || '').toLowerCase() !== 'admin');
      // Ambil biaya operasional
      const { data: allCosts, error: allCostsError } = await supabase
        .from('biayaoperasional')
        .select('Jumlah');
      if (allCostsError) throw allCostsError;

      // Kalkulasi capaian program
      const HARGA_SAPI = appConfig.HargaSapi || 13000000;
      const TARGET_FULL_SAPI = appConfig.TargetFullSapi || 11;
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
        .length * (appConfig.InitialDepositAmount || 0);
      totalTransferredApprovedOverall += initialDepositApprovedAmount;
      const totalCostsOverall = allCosts.reduce((sum, item) => sum + (item.Jumlah || 0), 0);
      const greenCows = Math.floor(totalTransferredApprovedOverall / HARGA_SAPI);
      const yellowCows = Math.floor((totalRecordedOverall - totalTransferredApprovedOverall) / HARGA_SAPI);
      const totalUsersCount = allUsersData.length;
      const pendingUsersInitialDepositCount = allUsersData.filter(u => u.InitialDepositStatus === 'Pending').length;

      // Pending Initial Deposits (untuk tabel verifikasi)
      const usersMap = new Map(allUsersData.map(u => [u.UserId, { Email: u.Email, Nama: u.Nama || '', Role: u.Role || '' }]));
      // Ambil bukti setoran awal terbaru dari tabel tabungan (ProofLink)
      const { data: allInitialDeposits, error: initialDepositsError } = await supabase
        .from('tabungan')
        .select('UserId, ProofLink, Tipe, Tanggal, TransaksiId')
        .eq('Tipe', 'Setoran Awal');
      if (initialDepositsError) throw initialDepositsError;
      console.log('allInitialDeposits', allInitialDeposits);
      const filteredDeposits = (allInitialDeposits || []).filter(t => t.ProofLink && t.ProofLink.trim() !== '');
      console.log('filteredDeposits', filteredDeposits);
      const latestProofMap = new Map();
      filteredDeposits.forEach(t => {
        const prev = latestProofMap.get(t.UserId);
        if (!prev) {
          latestProofMap.set(t.UserId, t);
        } else {
          if (t.Tanggal && prev.Tanggal) {
            if (new Date(t.Tanggal) > new Date(prev.Tanggal)) {
              latestProofMap.set(t.UserId, t);
            } else if (new Date(t.Tanggal).getTime() === new Date(prev.Tanggal).getTime()) {
              if (t.TransaksiId && prev.TransaksiId && t.TransaksiId > prev.TransaksiId) {
                latestProofMap.set(t.UserId, t);
              }
            }
          } else if (t.TransaksiId && prev.TransaksiId && t.TransaksiId > prev.TransaksiId) {
            latestProofMap.set(t.UserId, t);
          }
        }
      });
      console.log('latestProofMap', Array.from(latestProofMap.entries()));
      const pendingInitialDepositsData = allUsersData
        .filter(u => u.InitialDepositStatus === 'Pending')
        .map(u => {
          const proofObj = latestProofMap.get(u.UserId);
          return {
            UserId: u.UserId,
            Email: usersMap.get(u.UserId)?.Email || 'N/A',
            Nama: usersMap.get(u.UserId)?.Nama || 'N/A',
            Role: usersMap.get(u.UserId)?.Role || '',
            Amount: appConfig.InitialDepositAmount || 0,
            Status: 'Pending',
            Type: 'Setoran Awal',
            ProofLink: (proofObj && u.IsInitialDepositMade) ? proofObj.ProofLink : null
          };
        });
      console.log('pendingInitialDepositsData', pendingInitialDepositsData);
      setPendingInitialDeposits(pendingInitialDepositsData);

      // Pending Transfer Confirmations (untuk tabel verifikasi)
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

      setOverallProgramProgress({
        totalCollectedAmount: totalRecordedOverall,
        totalUsedAmount: totalUsedOverall,
        confirmedAmount: totalTransferredApprovedOverall,
        cowStatus: { green: greenCows, yellow: yellowCows, fullTarget: TARGET_FULL_SAPI },
        totalCosts: totalCostsOverall,
        netProgramBalance: totalTransferredApprovedOverall - totalCostsOverall,
        totalUsers: totalUsersCount,
        pendingInitialDeposits: pendingUsersInitialDepositCount,
        users: allUsersData,
        pendingInitialDepositsList: allUsersData.filter(u => u.InitialDepositStatus === 'Pending'),
      });
    } catch (err) {
      setError(err.message || 'Gagal mengambil progress program');
      setOverallProgramProgress(null);
      setPendingInitialDeposits([]);
      setPendingTransferConfirmations([]);
    } finally {
      setLoadingOverview(false);
    }
  }, [appConfig]);

  // Fetch all users (hanya user non-admin, Role case-sensitive)
  const fetchAllUsersData = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('UserId, Nama, Email, Role, NamaPequrban, StatusPequrban, Benefits, IsInitialDepositMade, InitialDepositStatus');
      if (error) throw error;
      // Robust filter: exclude admin (case-insensitive, handle missing Role)
      const filtered = (data || []).filter(u => (u.Role || '').toLowerCase() !== 'admin');
      setAllUsers(filtered);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data pengguna');
      setAllUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch content data (newsletters, milestones, resources)
  const fetchContentData = useCallback(async () => {
    setLoadingContent(true);
    setError(null);
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
      if (milestonesError) throw milestonesError;
      setAllMilestones(milestonesData);
      // Resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('app_resources')
        .select('*')
        .order('CreatedAt', { ascending: false });
      if (resourcesError) throw resourcesError;
      setAllResources(resourcesData);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data konten');
      setAllNewsletters([]);
      setAllMilestones([]);
      setAllResources([]);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  // Fetch help desk data
  const fetchHelpDeskData = useCallback(async () => {
    setLoadingHelpDesk(true);
    setError(null);
    try {
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('help_desk_tickets')
        .select('*')
        .order('Timestamp', { ascending: false });
      if (ticketsError) throw ticketsError;
      setAllHelpDeskTickets(ticketsData);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data help desk');
      setAllHelpDeskTickets([]);
    } finally {
      setLoadingHelpDesk(false);
    }
  }, []);

  // Fetch operational costs
  const fetchOperationalCostsData = useCallback(async () => {
    setLoadingCosts(true);
    setError(null);
    try {
      const { data: costsData, error: costsError } = await supabase
        .from('biayaoperasional')
        .select('*')
        .order('Timestamp', { ascending: false });
      if (costsError) throw costsError;
      setAllOperationalCosts(costsData);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data biaya operasional');
      setAllOperationalCosts([]);
    } finally {
      setLoadingCosts(false);
    }
  }, []);
  // Fetch admin profile and config
  const fetchAdminProfileAndConfig = useCallback(async (userId) => {
    setLoadingProfile(true);
    setError(null);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('UserId, Nama, Email, Role')
        .eq('UserId', userId)
        .single();
      if (profileError || !profileData || profileData.Role !== 'Admin') {
        throw new Error('Akses Ditolak: Anda bukan admin.');
      }
      setUser({ id: userId });
      setProfile(profileData);
    } catch (err) {
      setError(err.message || 'Gagal mengambil profil admin');
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);
  const router = useRouter();
  // ...existing code...


  // --- Event Handlers (Admin Actions) ---
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      // Redirect ke /admin-login (bukan /admin/login)
      router.push('/admin-login');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRefreshAdminDashboard = () => {
    setLoadingInitial(true);
    // Jangan reset overallProgramProgress agar skeleton/loader tetap muncul
    setAppConfig(null);
    setProfile(null);
    setAllUsers([]);
    setAllNewsletters([]);
    setAllMilestones([]);
    setAllResources([]);
    setAllHelpDeskTickets([]);
    setAllOperationalCosts([]);
    // fetchGlobalConfigSection();
    fetchAppConfigSection();
    fetchAdminProfileAndConfig(user?.id);
    fetchOverallProgramProgress();
    fetchAllUsersData();
    fetchContentData();
    fetchHelpDeskData();
    fetchOperationalCostsData();
    setLoadingInitial(false);
  };

  useEffect(() => {
    if (user && profile && appConfig) {
      fetchOverallProgramProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, appConfig]);

  const handleVerifyInitialDeposit = async (userId, status) => {
    setVerifyDepositLoading(true);
    try {
      const { error } = await supabase
        .from('initial_deposits')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

      // Refetch data
      fetchAllUsersData();
    } catch (error) {
      setError(error.message);
    } finally {
      setVerifyDepositLoading(false);
    }
  };

  const handleVerifyTransferConfirmation = async (confirmationId, status) => {
    setVerifyTransferLoading(true);
    try {
      const { error } = await supabase
        .from('transfer_confirmations')
        .update({ status })
        .eq('id', confirmationId);

      if (error) throw error;

      // Refetch data
      fetchHelpDeskData();
    } catch (error) {
      setError(error.message);
    } finally {
      setVerifyTransferLoading(false);
    }
  };

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
      const { error } = await supabase
        .from('biayaoperasional')
        .insert([{ CostId: costId, Deskripsi: description, Jumlah: amount, Tanggal: new Date().toISOString() }]);
      if (error) throw error;
      fetchOperationalCostsData();
      e.target.reset();
    } catch (error) {
      setError(error.message);
    } finally {
      setAddCostLoading(false);
    }
  };

  // --- Utility Functions ---
  const formatRupiah = useCallback((angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka || 0);
  }, []);

  return {
    user, setUser, profile, setProfile, appConfig, setAppConfig,
    overallProgramProgress, setOverallProgramProgress,
    setLoadingOverview,
    pendingInitialDeposits, setPendingInitialDeposits,
    pendingTransferConfirmations, setPendingTransferConfirmations,
    allUsers, setAllUsers, allNewsletters, setAllNewsletters,
    allMilestones, setAllMilestones, allResources, setAllResources,
    allHelpDeskTickets, setAllHelpDeskTickets, allOperationalCosts, setAllOperationalCosts,
    loadingInitial, setLoadingInitial, loadingOverview, setLoadingOverview,
    loadingUsers, setLoadingUsers, loadingContent, setLoadingContent,
    loadingHelpDesk, setLoadingHelpDesk, loadingCosts, setLoadingCosts,
    loadingAppConfig, setLoadingAppConfig, loadingProfile, setLoadingProfile,
    error, setError, verifyDepositLoading, setVerifyDepositLoading,
    verifyTransferLoading, setVerifyTransferLoading, addCostLoading, setAddCostLoading,
    addNewsLoading, setAddNewsLoading, addMilestoneLoading, setAddMilestoneLoading,
    addResourceLoading, setAddResourceLoading, respondTicketLoading, setRespondTicketLoading,
    activeAdminTab, setActiveAdminTab,
    router,
    // expose all handler and fetch functions
    fetchAdminProfileAndConfig,
    fetchAppConfigSection,
    fetchOverallProgramProgress,
    fetchAllUsersData,
    fetchContentData,
    fetchHelpDeskData,
    fetchOperationalCostsData,
    handleSignOut,
    handleRefreshAdminDashboard,
    handleVerifyInitialDeposit,
    handleVerifyTransferConfirmation,
    handleAddOperationalCost,
    formatRupiah
  };
}
