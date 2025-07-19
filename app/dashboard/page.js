"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

// Komponen Spinner kecil untuk tombol
const SmallSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [globalConfig, setGlobalConfig] = useState(null);
  const [personalTotalRecorded, setPersonalTotalRecorded] = useState(0); // Total tabungan pribadi tercatat (Setoran)
  const [personalUsed, setPersonalUsed] = useState(0); // Total tabungan terpakai untuk keperluan lain
  const [personalTransferred, setPersonalTransferred] = useState(0); // Total tabungan sudah ditransfer ke tim (approved)
  const [personalSavingHistory, setPersonalSavingHistory] = useState([]); // Riwayat setoran/penggunaan pribadi
  const [personalTransferConfirmations, setPersonalTransferConfirmations] = useState([]); // Riwayat konfirmasi transfer
  const [news, setNews] = useState([]);
  const [milestones, setMilestones] = useState(null); // Milestone bisa null jika belum ada
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Loading state spesifik untuk setiap form
  const [addSavingLoading, setAddSavingLoading] = useState(false);
  const [useSavingLoading, setUseSavingLoading] = useState(false);
  const [confirmTransferLoading, setConfirmTransferLoading] = useState(false);
  const [helpDeskLoading, setHelpDeskLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'main'; // Default tab adalah 'main' dashboard

  // --- Utility Functions ---
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const getMonthDifference = (d1, d2) => {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // --- Data Fetching Logic ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: configData, error: configError } = await supabase
          .from('app_config')
          .select('*')
          .eq('id', 'global_settings')
          .single();

      if (configError || !configData) {
          throw new Error(configError?.message || 'Data konfigurasi global tidak ditemukan.');
      }
      setGlobalConfig(configData);

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*, "NamaPequrban", "StatusPequrban", "Benefits"')
        .eq('UserId', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error(profileError?.message || 'Data profil tidak ditemukan.');
      }
      setProfile(profileData);

      const { data: savingHistoryData, error: savingHistoryError } = await supabase
        .from('tabungan')
        .select('*')
        .eq('UserId', user.id)
        .order('Tanggal', { ascending: false });

      if (savingHistoryError) {
        throw savingHistoryError;
      }
      setPersonalSavingHistory(savingHistoryData);
      
      let totalRecorded = 0; // Total Setoran
      let totalUsed = 0; // Total Penggunaan
      savingHistoryData.forEach(item => {
          if (item.Tipe === 'Setoran') {
              totalRecorded += (item.Jumlah || 0);
          } else if (item.Tipe === 'Penggunaan') {
              totalUsed += (item.Jumlah || 0);
          }
      });
      setPersonalTotalRecorded(totalRecorded);
      setPersonalUsed(totalUsed);

      const { data: transferData, error: transferError } = await supabase
          .from('transfer_confirmations')
          .select('*')
          .eq('UserId', user.id)
          .eq('Status', 'Approved') // Hanya yang sudah diverifikasi admin
          .order('Timestamp', { ascending: false });

      if (transferError) {
          throw transferError;
      }
      setPersonalTransferConfirmations(transferData);
      setPersonalTransferred(transferData.reduce((sum, item) => sum + (item.Amount || 0), 0));

      const { data: newsData, error: newsError } = await supabase
        .from('newsletters')
        .select('*')
        .order('DatePublished', { ascending: false })
        .limit(3);

      if (newsError) {
        throw newsError;
      }
      setNews(newsData);

      const { data: milestonesData, error: milestonesError } = await supabase
          .from('program_milestones')
          .select('*')
          .order('Year', { ascending: true })
          .order('Order', { ascending: true });

      if (milestonesError) {
        if (milestonesError.code === 'PGRST116') { // Specific code for no rows found
            setMilestones([]);
        } else {
            throw milestonesError;
        }
      } else {
          setMilestones(milestonesData);
      }

    } catch (err) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
      console.error("Dashboard fetch error - full object:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            router.push('/login');
        } else {
            setUser(session.user);
            fetchData();
        }
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, [router, searchParams]);


  // --- Event Handlers ---
  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      setError('Gagal logout: ' + error.message);
    } else {
      router.push('/login');
    }
    setLoading(false);
  };

  const handleAddSaving = async (e) => {
    e.preventDefault();
    setAddSavingLoading(true);
    const amountInput = e.target.elements.amount;
    const amount = parseFloat(amountInput.value.replace(/[^0-9]/g, ''));
    const savingMessageEl = document.getElementById('savingMessage');

    if (isNaN(amount) || amount <= 0) {
      savingMessageEl.textContent = 'Jumlah tabungan tidak valid.';
      savingMessageEl.className = 'text-sm mt-3 text-red-600';
      setAddSavingLoading(false);
      return;
    }

    if (profile?.MetodeTabungan === 'Setor ke Tim' && !e.target.elements.proofFile?.files[0]) {
      savingMessageEl.textContent = 'Bukti setor wajib diunggah untuk metode ini.';
      savingMessageEl.className = 'text-sm mt-3 text-red-600';
      setAddSavingLoading(false);
      return;
    }

    try {
      savingMessageEl.textContent = 'Menyimpan...';
      savingMessageEl.className = 'text-sm mt-3 text-gray-600';

      let proofUrl = null;
      if (profile?.MetodeTabungan === 'Setor ke Tim' && e.target.elements.proofFile?.files[0]) {
        console.warn("Upload file proof: Implementasi API Route '/api/upload-file' masih diperlukan.");
        proofUrl = `dummy_setor_tim_url_${Date.now()}`;
      }

      const newTransactionId = `TRX-${Date.now()}`;
      const newTanggal = new Date().toISOString();

      const { data, error } = await supabase
        .from('tabungan')
        .insert({
          "TransaksiId": newTransactionId,
          "UserId": user.id,
          "Jumlah": amount,
          "Metode": profile.MetodeTabungan,
          "Tanggal": newTanggal,
          "Tipe": "Setoran",
          "Status": "Confirmed",
          "ProofLink": proofUrl,
          "VerificationStatus": profile.MetodeTabungan === 'Setor ke Tim' ? 'Pending' : null,
        });

      if (error) {
        throw error;
      }

      setPersonalSavingHistory(prev => [{
        "TransaksiId": newTransactionId,
        "UserId": user.id,
        "Jumlah": amount,
        "Metode": profile.MetodeTabungan,
        "Tanggal": newTanggal,
        "Tipe": "Setoran",
        "Status": "Confirmed",
        "ProofLink": proofUrl,
        "VerificationStatus": profile.MetodeTabungan === 'Setor ke Tim' ? 'Pending' : null,
      }, ...prev].sort((a,b) => new Date(b.Tanggal) - new Date(a.Tanggal)));
      setPersonalTotalRecorded(prev => prev + amount);


      savingMessageEl.textContent = 'Tabungan berhasil dicatat!';
      savingMessageEl.className = 'text-sm mt-3 text-green-600';
      e.target.reset();

    } catch (err) {
      console.error('Error adding saving:', err.message);
      savingMessageEl.textContent = 'Gagal mencatat tabungan: ' + err.message;
      savingMessageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
        setAddSavingLoading(false);
    }
  };

  const handleUseSaving = async (e) => {
    e.preventDefault();
    setUseSavingLoading(true);
    const usedAmountInput = e.target.elements.usedAmount;
    const usedAmount = parseFloat(usedAmountInput.value.replace(/[^0-9]/g, ''));
    const usedMessageEl = document.getElementById('usedMessage');

    const currentNetSaving = personalTotalRecorded - personalUsed;

    if (isNaN(usedAmount) || usedAmount <= 0) {
        usedMessageEl.textContent = 'Jumlah penggunaan tidak valid.';
        usedMessageEl.className = 'text-sm mt-3 text-red-600';
        setUseSavingLoading(false);
        return;
    }
    if (usedAmount > currentNetSaving) {
        usedMessageEl.textContent = `Jumlah penggunaan melebihi tabungan tersedia (${formatRupiah(currentNetSaving)}).`;
        usedMessageEl.className = 'text-sm mt-3 text-red-600';
        setUseSavingLoading(false);
        return;
    }

    try {
        usedMessageEl.textContent = 'Mencatat penggunaan...';
        usedMessageEl.className = 'text-sm mt-3 text-gray-600';

        const newTransactionId = `USE-${Date.now()}`;
        const newTanggal = new Date().toISOString();

        const { data, error } = await supabase
            .from('tabungan')
            .insert({
                "TransaksiId": newTransactionId,
                "UserId": user.id,
                "Jumlah": usedAmount,
                "Tanggal": newTanggal,
                "Tipe": "Penggunaan",
                "Status": "Confirmed",
                "Metode": null,
                "ProofLink": null,
                "VerificationStatus": null,
            });

        if (error) {
            throw error;
        }

        setPersonalSavingHistory(prev => [{
            "TransaksiId": newTransactionId,
            "UserId": user.id,
            "Jumlah": usedAmount,
            "Tanggal": newTanggal,
            "Tipe": "Penggunaan",
            "Status": "Confirmed",
            "Metode": null,
            "ProofLink": null,
            "VerificationStatus": null,
        }, ...prev].sort((a,b) => new Date(b.Tanggal) - new Date(a.Tanggal)));
        setPersonalUsed(prev => prev + usedAmount);

        usedMessageEl.textContent = 'Penggunaan tabungan berhasil dicatat!';
        usedMessageEl.className = 'text-sm mt-3 text-green-600';
        e.target.reset();
    } catch (err) {
        console.error('Error using saving:', err.message);
        usedMessageEl.textContent = 'Gagal mencatat penggunaan tabungan: ' + err.message;
        usedMessageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
        setUseSavingLoading(false);
    }
  };

  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    setConfirmTransferLoading(true);
    const transferAmountInput = e.target.elements.transferAmount;
    const transferAmount = parseFloat(transferAmountInput.value.replace(/[^0-9]/g, ''));
    const transferProofFile = e.target.elements.transferProofFile?.files[0];
    const confirmMessageEl = document.getElementById('confirmMessage');

    const currentAvailableSavingForTransfer = personalTotalRecorded - personalUsed - personalTransferred;

    if (isNaN(transferAmount) || transferAmount <= 0) {
        confirmMessageEl.textContent = 'Jumlah transfer tidak valid.';
        confirmMessageEl.className = 'text-sm mt-3 text-red-600';
        setConfirmTransferLoading(false);
        return;
    }
    if (transferAmount > currentAvailableSavingForTransfer) {
        confirmMessageEl.textContent = `Jumlah transfer melebihi dana bersih tersedia (${formatRupiah(currentAvailableSavingForTransfer)}).`;
        confirmMessageEl.className = 'text-sm mt-3 text-red-600';
        setConfirmTransferLoading(false);
        return;
    }
    if (!transferProofFile) {
        confirmMessageEl.textContent = 'Bukti transfer wajib diunggah.';
        confirmMessageEl.className = 'text-sm mt-3 text-red-600';
        setConfirmTransferLoading(false);
        return;
    }

    try {
        confirmMessageEl.textContent = 'Mengunggah bukti transfer...';
        confirmMessageEl.className = 'text-sm mt-3 text-gray-600';

        console.warn("Upload file proof (transfer): Implementasi API Route '/api/upload-file' masih diperlukan.");
        const proofUrl = `dummy_transfer_url_${Date.now()}`;

        const newConfirmationId = `CONF-${Date.now()}`;
        const newTimestamp = new Date().toISOString();

        const { data, error } = await supabase
            .from('transfer_confirmations')
            .insert({
                "ConfirmationId": newConfirmationId,
                "UserId": user.id,
                "Amount": transferAmount,
                "ProofLink": proofUrl,
                "Timestamp": newTimestamp,
                "Status": "Pending",
                "Notes": "Konfirmasi transfer cicilan pribadi"
            });

        if (error) {
            throw error;
        }

        setPersonalTransferConfirmations(prev => [{
            "ConfirmationId": newConfirmationId,
            "UserId": user.id,
            "Amount": transferAmount,
            "ProofLink": proofUrl,
            "Timestamp": newTimestamp,
            "Status": "Pending",
            "Notes": "Konfirmasi transfer cicilan pribadi",
        }, ...prev].sort((a,b) => new Date(b.Timestamp) - new Date(a.Timestamp)));
        // personalTransferred tidak diupdate karena statusnya masih Pending (menunggu verifikasi admin)

        confirmMessageEl.textContent = 'Konfirmasi transfer berhasil dikirim. Menunggu verifikasi admin.';
        confirmMessageEl.className = 'text-sm mt-3 text-green-600';
        e.target.reset();

    } catch (err) {
        console.error('Error confirming transfer:', err.message);
        confirmMessageEl.textContent = 'Gagal mengirim konfirmasi transfer: ' + err.message;
        confirmMessageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
        setConfirmTransferLoading(false);
    }
  };


  const handleHelpDeskSubmit = async (e) => {
    e.preventDefault();
    setHelpDeskLoading(true);
    const questionInput = e.target.elements.question;
    const question = questionInput.value.trim();
    const helpDeskMessageEl = document.getElementById('helpDeskMessage');

    if (!question) {
      helpDeskMessageEl.textContent = 'Pertanyaan tidak boleh kosong.';
      helpDeskMessageEl.className = 'text-sm mt-3 text-red-600';
      setHelpDeskLoading(false);
      return;
    }

    try {
      helpDeskMessageEl.textContent = 'Mengirim pertanyaan...';
      helpDeskMessageEl.className = 'text-sm mt-3 text-gray-600';

      const { data, error } = await supabase
        .from('help_desk_tickets')
        .insert({
          "TicketId": `TICKET-${Date.now()}`,
          "UserId": user.id,
          "Question": question,
          "Timestamp": new Date().toISOString(),
          "Status": "Open",
        });

      if (error) {
        throw error;
      }

      helpDeskMessageEl.textContent = 'Pertanyaan berhasil dikirim. Admin akan segera merespons.';
      helpDeskMessageEl.className = 'text-sm mt-3 text-green-600';
      e.target.reset();
    }
    catch (err) {
      console.error('Error submitting help desk ticket:', err.message);
      helpDeskMessageEl.textContent = 'Gagal mengirim pertanyaan: ' + err.message;
      helpDeskMessageEl.className = 'text-sm mt-3 text-red-600';
    } finally {
        setHelpDeskLoading(false);
    }
  };


  const showConfirmModal = (transactionId) => {
    if (confirm('Anda yakin ingin menghapus catatan tabungan ini?')) {
      handleDeleteSaving(transactionId);
    }
  };

  const handleDeleteSaving = async (transactionId) => {
    try {
      const { error } = await supabase
        .from('tabungan')
        .delete()
        .eq('TransaksiId', transactionId)
        .eq('UserId', user.id);

      if (error) {
        throw error;
      }
      console.log('Catatan berhasil dihapus:', transactionId);
      // Pembaruan UI granular
      setPersonalSavingHistory(prev => {
          const updatedHistory = prev.filter(item => item.TransaksiId !== transactionId);
          // Re-calculate totals based on the filtered history
          let newTotalRecorded = 0;
          let newTotalUsed = 0;
          updatedHistory.forEach(item => {
              if (item.Tipe === 'Setoran') {
                  newTotalRecorded += (item.Jumlah || 0);
              } else if (item.Tipe === 'Penggunaan') {
                  newTotalUsed += (item.Jumlah || 0);
              }
          });
          setPersonalTotalRecorded(newTotalRecorded);
          setPersonalUsed(newTotalUsed);
          return updatedHistory;
      });

    } catch (err) {
      console.error('Error deleting saving:', err.message);
      alert('Gagal menghapus catatan: ' + err.message);
    }
  };

  // --- Render Logic ---
  if (loading) return <div className="text-center mt-10">Memuat dashboard...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">Error: {error}</div>;

  // Rekomendasi Tabung Per Bulan
  const targetDateGlobal = globalConfig?.TanggalTargetQurban ? new Date(globalConfig.TanggalTargetQurban) : null;
  const today = new Date();
  let rekomendasiTabungPerBulan = 0;
  const currentNetSaving = personalTotalRecorded - personalUsed; // Dana tercatat yang bersih dari penggunaan
  const remainingToTarget = (profile?.TargetPribadi || globalConfig?.TargetPribadiDefault || 0) - currentNetSaving;

  if (targetDateGlobal && targetDateGlobal > today && remainingToTarget > 0) {
    const remainingMonths = getMonthDifference(today, targetDateGlobal);
    if (remainingMonths > 0) {
        rekomendasiTabungPerBulan = remainingToTarget / remainingMonths;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Dashboard Tabungan Qurban</h1>
            {profile && <p className="text-gray-600">Selamat datang, {profile.Nama}!</p>}
          </div>
          <div className="flex items-center space-x-4">
            {/* Link Pengaturan Akun */}
            <a href="/settings" className="text-sm font-medium text-gray-600 hover:text-green-700">Pengaturan Akun</a>
            
            {/* Tombol Refresh Data */}
            <button
                onClick={fetchData}
                className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center space-x-1"
                title="Refresh Data"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Refresh</span>
            </button>

            {/* Link Help Desk (sebagai "Tab" di Header) */}
            <a
                href="?tab=helpdesk"
                className={`text-sm font-medium px-4 py-2 rounded-md ${currentTab === 'helpdesk' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'}`}
                onClick={(e) => {
                    e.preventDefault();
                    router.push('/dashboard?tab=helpdesk');
                }}
            >
                Help Desk
            </a>

            <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentTab === 'helpdesk' ? (
            // Tampilan Help Desk jika tab aktif
            <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-3"> {/* Mengisi seluruh lebar */}
                <h3 className="text-xl font-bold mb-4 text-gray-900">Help Desk</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-md text-gray-800 mb-2">Kontak Kami:</h4>
                        <p className="text-sm text-gray-600">Untuk pertanyaan lebih lanjut, silakan hubungi:</p>
                        <ul className="text-sm text-gray-700 mt-2 list-disc list-inside">
                            <li>Email: support@example.com</li>
                            <li>Telepon: +62 812 3456 7890</li>
                        </ul>
                    </div>
                    <form className="space-y-4" onSubmit={handleHelpDeskSubmit}>
                        <div>
                            <label htmlFor="question" className="block text-sm font-medium text-gray-700">Tanyakan Sesuatu:</label>
                            <textarea id="question" rows="4" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Tulis pertanyaan Anda di sini..."></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center justify-center"
                            disabled={helpDeskLoading}
                        >
                            {helpDeskLoading ? <SmallSpinner /> : null}
                            {helpDeskLoading ? 'Mengirim...' : 'Kirim Pertanyaan'}
                        </button>
                    </form>
                    <p id="helpDeskMessage" className="text-sm mt-3"></p>
                </div>
                <div className="mt-6 text-center">
                    <a href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        &larr; Kembali ke Dashboard Utama
                    </a>
                </div>
            </div>
          ) : (
            // Tampilan Dashboard Utama jika tab bukan Help Desk
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri: Profil Pequrban, Capaian Pribadi, Milestone, Berita */}
              <div className="lg:col-span-2 space-y-6"> 
                {/* Profil Pequrban Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Profil Pequrban</h2>
                  {profile && (
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Nama Pequrban:</strong> {profile.NamaPequrban || profile.Nama}</p>
                      <p><strong>Status Pequrban:</strong> <span className="font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{profile.StatusPequrban || 'Normal'}</span></p>
                      {profile.Benefits && profile.Benefits.length > 0 ? (
                        <div>
                          <strong>Benefit Anda:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {profile.Benefits.map((benefit, index) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                          <p className="text-gray-500">Belum ada benefit yang ditetapkan.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Personal Progress Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h2 className="text-xl font-bold mb-4 text-green-800">Capaian Pribadi Anda</h2>
                  <div id="personal-progress-container">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span id="personal-target-text" className="text-xs font-semibold inline-block text-gray-600">
                            Progress menuju target {profile ? formatRupiah(profile.TargetPribadi || globalConfig?.TargetPribadiDefault || 0) : 'Rp 0'}
                            {globalConfig?.TanggalTargetQurban && (
                                ` (Target: ${new Date(globalConfig.TanggalTargetQurban).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})})`
                            )}
                          </span>
                        </div>
                      </div>
                      {/* Progress Bar berdasarkan total tercatat (setoran - penggunaan) */}
                      <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                        <div
                          id="personal-progress-bar"
                          style={{ width: `${profile && (profile.TargetPribadi || globalConfig?.TargetPribadiDefault) > 0 ? Math.min(((personalTotalRecorded - personalUsed) / (profile.TargetPribadi || globalConfig.TargetPribadiDefault)) * 100, 100) : 0}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                        ></div>
                      </div>
                    </div>
                    {/* Visualisasi Angka Capaian Pribadi yang Lebih Menarik */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Tabungan Tercatat</p>
                            <p className="text-2xl font-bold text-green-700">{formatRupiah(personalTotalRecorded)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Dana Terpakai</p>
                            <p className="text-2xl font-bold text-red-600">{formatRupiah(personalUsed)}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">Ditransfer ke Panitia Qurban</p>
                            <p className="text-2xl font-bold text-blue-600">{formatRupiah(personalTransferred)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-gray-500">
                                Dana Sisa Tabungan <span className="text-gray-400 text-xs">*</span>
                            </p>
                            <p className="text-2xl font-bold text-gray-700">
                                {formatRupiah(personalTotalRecorded - personalUsed - personalTransferred)}
                            </p>
                        </div>
                    </div>
                    
                    {profile && (
                        <div className="mt-4 text-sm" id="personal-info">
                            <p>Metode Anda: <span className="font-semibold">{profile.MetodeTabungan}</span></p>
                            {rekomendasiTabungPerBulan > 0 && (
                                <p className="mt-2 text-base text-gray-700">
                                Rekomendasi tabung per bulan: <span className="font-bold text-green-700">{formatRupiah(rekomendasiTabungPerBulan)}</span>
                                </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                <span className="font-bold">* Dana Sisa Tabungan</span>: Dana Tercatat dikurangi Dana Terpakai.
                            </p>
                        </div>
                    )}
                  </div>
                </div>

                {/* Milestone Program Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Milestone Program</h2>
                    <div className="overflow-x-auto">
                        <div className="flex space-x-4 pb-2 min-w-max">
                            {milestones && milestones.length > 0 ? (
                                Object.values(
                                    milestones.reduce((acc, milestone) => {
                                        const yearMonth = `${milestone.Month}-${milestone.Year}`;
                                        if (!acc[yearMonth]) {
                                            acc[yearMonth] = { month: milestone.Month, year: milestone.Year, activities: [] };
                                        }
                                        acc[yearMonth].activities.push(milestone);
                                        return acc;
                                    }, {})
                                ).sort((a, b) => {
                                    const monthOrder = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                                    if (a.year !== b.year) return a.year - b.year;
                                    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
                                }).map((monthEntry, monthIndex) => (
                                    <div key={`milestone-view-${monthEntry.month}-${monthEntry.year}`} className="flex-shrink-0 w-48 border border-gray-200 rounded-lg p-3 bg-gray-50">
                                        <h3 className="font-semibold text-sm mb-2 text-center text-gray-800">
                                            {monthEntry.month} {monthEntry.Year}
                                        </h3>
                                        <ul className="space-y-1 text-xs text-gray-600">
                                            {/* Sort activities by order */}
                                            {monthEntry.activities.sort((a,b) => a.Order - b.Order).map((activity) => (
                                                <li key={activity.MilestoneId} className="p-1 bg-white rounded shadow-sm text-center">
                                                    {activity.Activity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada milestone program.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* News Card */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Berita & Informasi Terbaru</h2>
                    <div id="newsContainer" className="space-y-4">
                        {news.length > 0 ? (
                            news.map((item) => (
                                <article key={item.NewsletterId} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                                    {item.FotoLinks && item.FotoLinks.length > 0 && (
                                        <img src={item.FotoLinks[0]} alt={item.Title} className="w-full h-40 object-cover rounded-md mb-2" />
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900">{item.Title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">Oleh {item.AuthorName} - {new Date(item.DatePublished).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <div className="text-sm text-gray-600">
                                        {item.Content.substring(0, 150)}{item.Content.length > 150 ? '...' : ''}
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Belum ada berita terbaru.</p>
                        )}
                    </div>
                </div>
              </div>

              {/* Kolom Kanan: Pencatatan Transaksi, Riwayat */}
              <div className="lg:col-span-1 space-y-6">
                {/* Pencatatan Transaksi */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Pencatatan Transaksi</h3>
                      <div className="border-b pb-4 mb-4">
                          <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Setoran Tabungan</h4>
                          <form id="addSavingForm" className="space-y-4" onSubmit={handleAddSaving}>
                              <div>
                                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                                  <input type="text" id="amount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                      onKeyUp={(e) => {
                                          let value = e.target.value.replace(/[^0-9]/g, '');
                                          e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
                                      }}
                                  />
                              </div>
                              {profile && profile.MetodeTabungan === 'Setor ke Tim' && (
                                  <div id="proofUploadContainer">
                                      <label htmlFor="proofFile" className="block text-sm font-medium text-gray-700">Bukti Setor (Wajib)</label>
                                      <input type="file" id="proofFile" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                                  </div>
                              )}
                              <div>
                                  <button
                                    type="submit"
                                    id="saveBtn"
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                                    disabled={addSavingLoading}
                                  >
                                    {addSavingLoading ? <SmallSpinner /> : null}
                                    {addSavingLoading ? 'Menyimpan...' : 'Catat Setoran'}
                                  </button>
                              </div>
                          </form>
                          <p id="savingMessage" className="text-sm mt-3"></p>
                      </div>

                      {profile && profile.MetodeTabungan === 'Menabung Sendiri' && (
                          <div className="mb-4 border-b pb-4">
                              <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Penggunaan Tabungan</h4>
                              <p className="text-sm text-gray-600 mb-2">Jika sebagian tabungan Anda terpakai untuk keperluan lain.</p>
                              <form className="space-y-4" onSubmit={handleUseSaving}>
                                  <div>
                                      <label htmlFor="usedAmount" className="block text-sm font-medium text-gray-700">Jumlah Terpakai (Rp)</label>
                                      <input type="text" id="usedAmount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                          onKeyUp={(e) => {
                                              let value = e.target.value.replace(/[^0-9]/g, '');
                                              e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
                                          }}
                                      />
                                  </div>
                                  <div>
                                      <button
                                        type="submit"
                                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium flex items-center justify-center"
                                        disabled={useSavingLoading}
                                      >
                                        {useSavingLoading ? <SmallSpinner /> : null}
                                        {useSavingLoading ? 'Mencatat...' : 'Catat Penggunaan'}
                                      </button>
                                  </div>
                              </form>
                              <p id="usedMessage" className="text-sm mt-3"></p>
                          </div>
                      )}

                      {profile && profile.MetodeTabungan === 'Menabung Sendiri' && (
                          <div>
                              <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana ke Tim</h4>
                              <p className="text-sm text-gray-600 mb-2">Unggah bukti transfer dana yang sudah Anda kirim ke rekening tim. Ini bisa dicicil.</p>
                              <form className="space-y-4" onSubmit={handleConfirmTransfer}>
                                  <div>
                                      <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700">Jumlah Transfer (Rp)</label>
                                      <input type="text" id="transferAmount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                          onKeyUp={(e) => {
                                              let value = e.target.value.replace(/[^0-9]/g, '');
                                              e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
                                          }}
                                      />
                                  </div>
                                  <div>
                                      <label htmlFor="transferProofFile" className="text-sm font-medium text-gray-700">Bukti Transfer (Wajib)</label>
                                      <input type="file" id="transferProofFile" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                                  </div>
                                  <div>
                                      <button
                                        type="submit"
                                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center"
                                        disabled={confirmTransferLoading}
                                      >
                                        {confirmTransferLoading ? <SmallSpinner /> : null}
                                        {confirmTransferLoading ? 'Mengunggah...' : 'Kirim Konfirmasi'}
                                      </button>
                                  </div>
                              </form>
                              <p id="confirmMessage" className="text-sm mt-3"></p>
                          </div>
                      )}
                  </div>
                </div>

                {/* Riwayat Tabungan Tercatat (Setoran & Penggunaan) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Riwayat Tabungan Tercatat</h3>
                    <div id="personalHistoryContainer" className="max-h-96 overflow-y-auto pr-2">
                        {personalSavingHistory.length > 0 ? (
                            personalSavingHistory.map((item) => (
                                <div key={item.TransaksiId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-sm">
                                            {item.Tipe === 'Penggunaan' ? '-' : ''}{formatRupiah(item.Jumlah)}
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${item.Tipe === 'Setoran' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.Tipe}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(item.Tanggal).toLocaleDateString('id-ID')} - {item.Metode || 'Tidak Ada Metode'}</p>
                                        {item.ProofLink && ( // Bukti hanya untuk Setoran ke Tim
                                            <a href={item.ProofLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Lihat Bukti</a>
                                        )}
                                    </div>
                                    <button onClick={() => showConfirmModal(item.TransaksiId)} className="delete-saving-btn text-red-500 hover:text-red-700 text-xs">Hapus</button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Belum ada riwayat tabungan tercatat.</p>
                        )}
                    </div>
                </div>

                {/* Riwayat Konfirmasi Transfer ke Tim (hanya untuk Menabung Sendiri) */}
                {profile && profile.MetodeTabungan === 'Menabung Sendiri' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-lg font-bold mb-2 text-gray-900">Riwayat Konfirmasi Transfer ke Tim</h3>
                        <div className="max-h-96 overflow-y-auto pr-2">
                            {personalTransferConfirmations.length > 0 ? (
                                personalTransferConfirmations.map((item) => (
                                    <div key={item.ConfirmationId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-sm">{formatRupiah(item.Amount)}</p>
                                            <p className="text-xs text-gray-500">{new Date(item.Timestamp).toLocaleDateString('id-ID')} - Status: {item.Status}</p>
                                            {item.ProofLink && (
                                                <a href={item.ProofLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Lihat Bukti</a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">Belum ada riwayat konfirmasi transfer.</p>
                            )}
                        </div>
                    </div>
                )}
              </div> {/* Akhir Kolom Kanan */}

 
            </div>
          )}
        </div>
      </main>
    </div>
  );
}