"use client"
import React from "react"
import { Copy } from "lucide-react"
import { SmallSpinner, ListSkeleton } from "./LoadingSkeletons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function TransactionForms({
  profile,
  appConfig,
  user,
  personalTotalRecorded,
  personalUsed,
  personalSavingHistory = [],
  allPersonalTransferConfirmations = [], // GANTI: gunakan allPersonalTransferConfirmations
  addSavingLoading,
  useSavingLoading,
  confirmTransferLoading,
  handleAddSaving,
  handleUseSaving,
  handleInitialDeposit,
  handleConfirmTransfer,
  formatRupiah,
  onPelunasanSuccess, // Tambahan: callback ke parent setelah pelunasan sukses
}) {
  // Spinner loading state: show spinner in card if profile or appConfig not loaded
  const isLoading = !profile || !appConfig;
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center min-h-[200px]">
        <SmallSpinner />
      </div>
    );
  }

  // State for success notifications
  const [showSavingSuccess, setShowSavingSuccess] = React.useState(false);
  const [showUsedSuccess, setShowUsedSuccess] = React.useState(false);
  // --- LOGIKA DAN STATE ---
  const isInitialDepositMade = profile?.IsInitialDepositMade
  const jumlahPequrban = Number(profile?.JumlahPequrban) || 1
  const initialDepositPerPequrban = appConfig?.InitialDepositAmount || 300000
  const initialDeposit = initialDepositPerPequrban * jumlahPequrban
  const minimumPelunasan = Math.max(0, (profile?.TargetPribadi || 2650000) - initialDeposit)

  // Pelunasan: hanya data transfer_confirmation dengan Type bukan 'Setoran Awal', urutkan DESC by Timestamp
  const pelunasanList = (allPersonalTransferConfirmations || [])
    .filter(item => (item.Type || '').toLowerCase() !== 'setoran awal')
    .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  const lastPelunasan = pelunasanList[0];
  const pelunasanPending = lastPelunasan?.Status === "Pending";
  const pelunasanApproved = lastPelunasan?.Status === "Approved";
  const pelunasanRejected = lastPelunasan?.Status === "Rejected";
  const isQurbanSendiri = profile?.MetodeTabungan === 'Qurban Sendiri';
  const targetPribadi = profile?.TargetPribadi || 2650000;
  const currentNetSaving = personalTotalRecorded - personalUsed;
  const sudahLunas = (() => {
    const totalPelunasanApproved = pelunasanList.filter(item => item.Status === "Approved").reduce((sum, item) => sum + (item.Amount || 0), 0);
    const totalSetoranAwal = profile?.IsInitialDepositMade && profile?.InitialDepositStatus === "Approved" ? (appConfig?.InitialDepositAmount || 300000) : 0;
    const targetPelunasan = targetPribadi;
    return (totalPelunasanApproved + totalSetoranAwal) >= targetPelunasan;
  })();

  // State untuk transfer
  const [transferAmount, setTransferAmount] = React.useState("");
  const [transferProofFile, setTransferProofFile] = React.useState(null);
  const [transferError, setTransferError] = React.useState("");
  const [isTransferValid, setIsTransferValid] = React.useState(false);

  // Format angka dengan titik ribuan
  function formatNumberWithDots(value) {
    if (!value) return "";
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // State untuk input setoran tabungan & penggunaan tabungan
  const [savingAmount, setSavingAmount] = React.useState("");
  const [usedAmount, setUsedAmount] = React.useState("");

  // Validasi otomatis
  React.useEffect(() => {
    const raw = (transferAmount || "").replace(/[^0-9]/g, "");
    const amount = parseInt(raw || "0", 10);
    if (!raw || amount < minimumPelunasan || !transferProofFile) {
      setIsTransferValid(false);
    } else {
      setIsTransferValid(true);
    }
    // Error message for minimum transfer
    if (raw && amount < minimumPelunasan) {
      setTransferError(`Jumlah transfer minimal ${formatRupiah(minimumPelunasan)}`);
    } else {
      setTransferError("");
    }
  }, [transferAmount, transferProofFile, minimumPelunasan, formatRupiah]);

  // Copy rekening
  const handleCopy = (number) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(number.replace(/\s+/g, ""));
    }
  };

  // Helper: render form transfer pelunasan
  function renderTransferForm() {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
        <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana ke Panitia Qurban</h4>
        <p className="text-sm text-gray-600 mb-2">
          Unggah bukti transfer dana yang sudah Anda kirim ke rekening panitia.
        </p>
        <span className="block text-[11px] text-gray-500 font-semibold mt-2 mb-1">Nomor Rekening Panitia (klik untuk copy):</span>
        <div className="flex flex-col gap-1 mb-6">
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 flex flex-col items-start">
            <span className="font-semibold text-xs mb-0.5">CIMB Niaga Syariah</span>
            <span className="inline-flex items-center gap-1 text-sm font-mono mb-0.5">
              7639 7360 6700
              <button
                type="button"
                className="ml-1 px-1 py-0.5 text-[10px] bg-gray-200 rounded hover:bg-green-200 flex items-center border border-gray-300"
                onClick={() => handleCopy("7639 7360 6700")}
                title="Copy rekening tanpa spasi"
              >
                <Copy size={11} className="mr-0.5" />Copy
              </button>
            </span>
            <span className="italic text-[10px] text-gray-500">Muhammad Andika Widiansyah Putra</span>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 flex flex-col items-start">
            <span className="font-semibold text-xs mb-0.5">Bank Jago Syariah</span>
            <span className="inline-flex items-center gap-1 text-sm font-mono mb-0.5">
              5048 8773 2512
              <button
                type="button"
                className="ml-1 px-1 py-0.5 text-[10px] bg-gray-200 rounded hover:bg-green-200 flex items-center border border-gray-300"
                onClick={() => handleCopy("5048 8773 2512")}
                title="Copy rekening tanpa spasi"
              >
                <Copy size={11} className="mr-0.5" />Copy
              </button>
            </span>
            <span className="italic text-[10px] text-gray-500">Muhammad Andika Widiansyah Putra</span>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 flex flex-col items-start">
            <span className="font-semibold text-xs mb-0.5">Bank Syariah Indonesia</span>
            <span className="inline-flex items-center gap-1 text-sm font-mono mb-0.5">
              665 6664 180
              <button
                type="button"
                className="ml-1 px-1 py-0.5 text-[10px] bg-gray-200 rounded hover:bg-green-200 flex items-center border border-gray-300"
                onClick={() => handleCopy("665 6664 180")}
                title="Copy rekening tanpa spasi"
              >
                <Copy size={11} className="mr-0.5" />Copy
              </button>
            </span>
            <span className="italic text-[10px] text-gray-500">Muhammad Andika Widiansyah Putra</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 block">
          Jumlah pequrban: <span className="font-bold">{jumlahPequrban}</span><br />
          Target per pequrban: <span className="font-bold">{formatRupiah((profile?.TargetPribadi || 2650000) / jumlahPequrban)}</span><br />
          Minimal transfer pelunasan: <span className="font-bold text-green-700">{formatRupiah(minimumPelunasan)}</span>
          <br />
          (Target pelunasan: {formatRupiah(profile?.TargetPribadi || 2650000)} - Setoran awal: {formatRupiah(initialDeposit)})
        </span>
       
        <form
          className="space-y-4"
          onSubmit={async e => {
            e.preventDefault();
            const amount = parseInt((transferAmount || "0").replace(/[^0-9]/g, ""), 10);
            if (amount < minimumPelunasan) {
              setTransferError(`Jumlah transfer minimal ${formatRupiah(minimumPelunasan)}`);
              setIsTransferValid(false);
              return;
            }
            if (!transferProofFile) {
              setTransferError("Bukti transfer wajib diunggah.");
              setIsTransferValid(false);
              return;
            }
            setTransferError("");
            setIsTransferValid(false);
            try {
              await handleConfirmTransfer(e, {
                onError: (msg) => setTransferError(msg),
                onSuccess: () => {
                  setTransferError("");
                  setTransferAmount("");
                  setTransferProofFile(null);
                  setIsTransferValid(false);
                  // Trigger tombol refresh dashboard jika ada
                  const refreshBtn = document.getElementById('refresh-dashboard-btn');
                  if (refreshBtn) refreshBtn.click();
                  if (typeof onPelunasanSuccess === 'function') onPelunasanSuccess();
                }
              });
            } catch (err) {
              setTransferError(err?.message || "Gagal mengirim konfirmasi transfer.");
            }
          }}
        >
          <div>
            <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700">
              Jumlah Transfer (Rp)
            </label>
            <input
              type="text"
              id="transferAmount"
              required
              inputMode="numeric"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={formatNumberWithDots(transferAmount)}
              onChange={e => {
                // Remove non-numeric, then format
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setTransferAmount(raw);
              }}
            />
          </div>
          <div>
            <label htmlFor="transferProofFile" className="block text-sm font-medium text-gray-700">
              Bukti Transfer (Wajib)
              <span className="block text-xs text-red-600 mt-1">Hanya file gambar (jpg, jpeg, png, webp) dan PDF yang diperbolehkan.</span>
            </label>
            <input
              type="file"
              id="transferProofFile"
              required
              accept="image/*,application/pdf"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              onChange={e => setTransferProofFile(e.target.files[0])}
            />
          </div>
          {transferError && <p className="text-sm text-red-600">{transferError}</p>}
          <button
            type="submit"
            className={`w-full px-4 py-2 rounded-md text-sm font-medium ${!isTransferValid || confirmTransferLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            disabled={!isTransferValid || confirmTransferLoading}
          >
            {confirmTransferLoading ? <SmallSpinner /> : null}
            {confirmTransferLoading ? "Mengirim..." : "Kirim Konfirmasi"}
          </button>
        </form>
      </div>
    );
  }

  // --- RENDER ---

  // Hide all tabungan forms if ada pelunasan pending/approved
  // Hide pelunasan/konfirmasi transfer form if belum capai target
  const hideTabunganForms = !!(lastPelunasan && (lastPelunasan.Status === "Pending" || lastPelunasan.Status === "Approved"));
  const hidePelunasanFormBecauseNotReached = currentNetSaving < targetPribadi;


  return (
    <>
      {/* Card Capaian Pribadi (dari parent, biasanya di page.js) */}
      <div className="mb-4">
        {/* ...komponen capaian pribadi (PersonalProgress) biasanya diinject dari parent... */}
      </div>

      {/* 1. Jika sudah pernah transfer pelunasan, tampilkan warning/pesan sesuai status terakhir */}
      {profile && isInitialDepositMade && profile?.InitialDepositStatus === "Approved" && !isQurbanSendiri && lastPelunasan ? (
        lastPelunasan.Status === "Pending" ? (
          <div className="mb-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-semibold text-md text-yellow-800 mb-1">Menunggu Verifikasi Admin</h4>
                <p className="text-yellow-700">Bukti pelunasan Anda sudah diupload dan sedang diverifikasi admin. Seluruh fitur konfirmasi transfer dinonaktifkan sementara.</p>
              </div>
            </div>
          </div>
        ) : lastPelunasan.Status === "Approved" ? (
          <div className="mb-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-semibold text-md text-green-800 mb-1">Pelunasan Selesai</h4>
                <p className="text-green-700">Selamat! Transfer pelunasan Anda sudah diverifikasi admin. Semua fitur konfirmasi transfer dinonaktifkan.</p>
              </div>
            </div>
          </div>
        ) : lastPelunasan.Status === "Rejected" ? (
          <div className="mb-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-2">
              <h4 className="font-semibold text-md text-red-800 mb-1">Transfer Pelunasan Ditolak</h4>
              <p className="text-red-700">Transfer pelunasan Anda ditolak oleh admin.</p>
              {lastPelunasan?.admin_notes && (
                <p className="mt-1 text-red-700">Alasan: {lastPelunasan.admin_notes}</p>
              )}
              <p className="mt-1">Silakan upload ulang bukti transfer yang sesuai.</p>
            </div>
            {/* Form tetap muncul agar user bisa upload ulang */}
            {renderTransferForm()}
          </div>
        ) : null
      ) : null}

      {/* 2. Jika belum pernah transfer pelunasan, cek syarat saldo cukup untuk tampilkan form upload pelunasan */}
      {/* Hanya tampilkan form pelunasan jika sudah capai target */}
      {profile && isInitialDepositMade && profile?.InitialDepositStatus === "Approved" && !isQurbanSendiri && !lastPelunasan && !hidePelunasanFormBecauseNotReached && (
        <div className="mb-4">
          {renderTransferForm()}
        </div>
      )}
      {/* Jika belum capai target, tampilkan info */}
      {profile && isInitialDepositMade && profile?.InitialDepositStatus === "Approved" && !isQurbanSendiri && !lastPelunasan && hidePelunasanFormBecauseNotReached && (
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-md text-blue-800 mb-1">Belum Mencapai Target</h4>
              <p className="text-blue-700">Anda hanya dapat melakukan konfirmasi transfer pelunasan ke panitia jika tabungan Anda sudah mencapai target pribadi.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Jika belum setoran awal, tampilkan form setoran awal */}
      {profile && !isInitialDepositMade && appConfig && (
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="font-semibold text-md text-gray-800 mb-2">Setoran Awal Wajib</h4>
            <div className="text-sm text-gray-600 mb-2">
              <span>Jumlah pequrban: <span className="font-semibold">{jumlahPequrban}</span></span><br />
              <span>Nominal setoran awal per pequrban: <span className="font-semibold">{formatRupiah(initialDepositPerPequrban)}</span></span><br />
              <span className="block mt-1">Total setoran awal wajib: <span className="font-bold text-green-700">{formatRupiah(initialDeposit)}</span></span>
              <span className="block text-xs text-gray-700 font-semibold mt-2 mb-1">Nomor Rekening Panitia:</span>
              <div className="flex flex-col gap-2 mb-2">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-start">
                  <span className="font-bold text-sm mb-1">CIMB Niaga Syariah</span>
                  <span className="inline-flex items-center gap-1 text-base font-mono mb-1">
                    7639 7360 6700
                    <button
                      type="button"
                      className="ml-1 px-1 py-0.5 text-xs bg-gray-100 rounded hover:bg-green-200 flex items-center border border-gray-300"
                      onClick={() => handleCopy("7639 7360 6700")}
                      title="Copy rekening tanpa spasi"
                    >
                      <Copy size={13} className="mr-0.5" />Copy
                    </button>
                  </span>
                  <span className="italic text-xs text-gray-700">Muhammad Andika Widiansyah Putra</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-start">
                  <span className="font-bold text-sm mb-1">Bank Jago Syariah</span>
                  <span className="inline-flex items-center gap-1 text-base font-mono mb-1">
                    5048 8773 2512
                    <button
                      type="button"
                      className="ml-1 px-1 py-0.5 text-xs bg-gray-100 rounded hover:bg-green-200 flex items-center border border-gray-300"
                      onClick={() => handleCopy("5048 8773 2512")}
                      title="Copy rekening tanpa spasi"
                    >
                      <Copy size={13} className="mr-0.5" />Copy
                    </button>
                  </span>
                  <span className="italic text-xs text-gray-700">Muhammad Andika Widiansyah Putra</span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-start">
                  <span className="font-bold text-sm mb-1">Bank Syariah Indonesia</span>
                  <span className="inline-flex items-center gap-1 text-base font-mono mb-1">
                    665 6664 180
                    <button
                      type="button"
                      className="ml-1 px-1 py-0.5 text-xs bg-gray-100 rounded hover:bg-green-200 flex items-center border border-gray-300"
                      onClick={() => handleCopy("665 6664 180")}
                      title="Copy rekening tanpa spasi"
                    >
                      <Copy size={13} className="mr-0.5" />Copy
                    </button>
                  </span>
                  <span className="italic text-xs text-gray-700">Muhammad Andika Widiansyah Putra</span>
                </div>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleInitialDeposit}>
              <div>
                <label htmlFor="initialProofFile" className="block text-sm font-medium text-gray-700">
                  Bukti Transfer (Wajib)
                  <span className="block text-xs text-red-600 mt-1">Hanya file gambar (jpg, jpeg, png, webp) dan PDF yang diperbolehkan.</span>
                </label>
                <input
                  type="file"
                  id="initialProofFile"
                  required
                  accept="image/*,application/pdf"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                Kirim Setoran Awal
              </button>
            </form>
            <p id="initialMessage" className="text-sm mt-3"></p>
          </div>
        </div>
      )}

      {/* 5. Jika setoran awal sudah diupload tapi belum approved, tampilkan status verifikasi */}
      {profile && isInitialDepositMade && profile?.InitialDepositStatus !== "Approved" && (
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">{profile?.InitialDepositStatus === "Rejected" ? "Setoran Awal Ditolak" : "Menunggu Verifikasi"}</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {profile?.InitialDepositStatus === "Rejected" ? (
                      <>
                        <p className="text-red-700 font-semibold">Setoran awal Anda ditolak oleh admin.</p>
                        {profile?.InitialDepositAdminNotes && (
                          <p className="mt-1 text-red-700">Alasan: {profile.InitialDepositAdminNotes}</p>
                        )}
                        <p className="mt-1">Silakan upload ulang bukti transfer yang sesuai.</p>
                      </>
                    ) : (
                      <>
                        <p>
                          Setoran awal Anda sedang dalam proses verifikasi admin. Anda belum dapat mencatat tabungan rutin
                          hingga setoran awal diverifikasi.
                        </p>
                        <p className="mt-1">
                          Status: <span className="font-semibold">{profile?.InitialDepositStatus || "Pending"}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Jika sudah setoran awal approved, tampilkan form catat setoran tabungan & penggunaan tabungan */}
      {profile && isInitialDepositMade && profile?.InitialDepositStatus === "Approved" && !hideTabunganForms && (
        <>
          <div className="mb-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Setoran Tabungan</h4>
              <form className="space-y-4" onSubmit={e => {
                e.preventDefault();
                if (addSavingLoading) return;
                if (handleAddSaving) {
                  handleAddSaving(e);
                  setSavingAmount("");
                  setShowSavingSuccess(true);
                  setTimeout(() => setShowSavingSuccess(false), 5000);
                }
              }}>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="text"
                    id="amount"
                    required
                    inputMode="numeric"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formatNumberWithDots(savingAmount)}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setSavingAmount(raw);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center"
                  disabled={addSavingLoading}
                >
                  {addSavingLoading ? <SmallSpinner /> : null}
                  {addSavingLoading ? "Menyimpan..." : "Catat Setoran"}
                </button>
              </form>
              {showSavingSuccess && (
                <div className="mt-3 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-2 text-center animate-fade-in-out">
                  Catatan tabungan berhasil disimpan.
                </div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Penggunaan Tabungan</h4>
              <p className="text-sm text-gray-600 mb-2">Jika sebagian tabungan Anda terpakai untuk keperluan lain.</p>
              <form className="space-y-4" onSubmit={e => {
                e.preventDefault();
                if (useSavingLoading) return;
                if (handleUseSaving) {
                  handleUseSaving(e);
                  setUsedAmount("");
                  setShowUsedSuccess(true);
                  setTimeout(() => setShowUsedSuccess(false), 5000);
                }
              }}>
                <div>
                  <label htmlFor="usedAmount" className="block text-sm font-medium text-gray-700">
                    Jumlah Terpakai (Rp)
                  </label>
                  <input
                    type="text"
                    id="usedAmount"
                    required
                    inputMode="numeric"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formatNumberWithDots(usedAmount)}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setUsedAmount(raw);
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium flex items-center justify-center"
                  disabled={useSavingLoading}
                >
                  {useSavingLoading ? <SmallSpinner /> : null}
                  {useSavingLoading ? "Mencatat..." : "Catat Penggunaan"}
                </button>
              </form>
              {showUsedSuccess && (
                <div className="mt-3 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-2 text-center animate-fade-in-out">
                  Catatan tabungan terpakai berhasil disimpan.
                </div>
              )}
            </div>
          </div>
        </>
      )}

    {/* Default: null (should not happen) */}
    {null}
  </>
  );
}