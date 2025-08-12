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
  const isInitialDepositMade = profile?.IsInitialDepositMade;
  const initialDepositStatus = profile?.InitialDepositStatus;
  const jumlahPequrban = Number(profile?.JumlahPequrban) || 1;
  const initialDepositPerPequrban = appConfig?.InitialDepositAmount || 300000;
  // Total setoran awal = semua transfer_confirmation Type 'Setoran Awal' yang Approved
  const totalSetoranAwal = (allPersonalTransferConfirmations || [])
    .filter(item => (item.Type || '').toLowerCase() === 'setoran awal' && item.Status === 'Approved')
    .reduce((sum, item) => sum + (item.Amount || 0), 0);
  const initialDeposit = initialDepositPerPequrban * jumlahPequrban;
  const targetPribadi = profile?.TargetPribadi || 2650000;
  const targetTotal = targetPribadi * jumlahPequrban;
  const minimumPelunasan = Math.max(0, targetTotal - totalSetoranAwal);

  // Pelunasan: hanya data transfer_confirmation dengan Type bukan 'Setoran Awal', urutkan DESC by Timestamp
  const pelunasanList = (allPersonalTransferConfirmations || [])
    .filter(item => (item.Type || '').toLowerCase() !== 'setoran awal')
    .sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  const lastPelunasan = pelunasanList[0];
  const pelunasanPending = lastPelunasan?.Status === "Pending";
  const pelunasanApproved = lastPelunasan?.Status === "Approved";
  const pelunasanRejected = lastPelunasan?.Status === "Rejected";
  const isQurbanSendiri = profile?.MetodeTabungan === 'Qurban Sendiri';
  const currentNetSaving = personalTotalRecorded - personalUsed;
  const sudahLunas = (() => {
    const totalPelunasanApproved = pelunasanList.filter(item => item.Status === "Approved").reduce((sum, item) => sum + (item.Amount || 0), 0);
    return (totalPelunasanApproved + totalSetoranAwal) >= targetTotal;
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

  // Helper: form SETORAN AWAL (reusable: awal & reupload saat Rejected)
  function renderInitialDepositForm({ isResubmission = false } = {}) {
    return (
      <div className="mb-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-black">
          <h4 className="font-semibold text-md text-gray-800 mb-2">
            {isResubmission ? "Upload Ulang Setoran Awal" : "Setoran Awal Wajib"}
          </h4>
          <div className="text-sm text-gray-600 mb-2">
            <span>Jumlah pequrban: <span className="font-semibold">{jumlahPequrban}</span></span><br />
            <span>Nominal setoran awal per pequrban: <span className="font-semibold">{formatRupiah(initialDepositPerPequrban)}</span></span><br />
            <span className="block mt-1">Total setoran awal wajib: <span className="font-bold text-green-700">{formatRupiah(initialDeposit)}</span></span>
            <span className="block mt-1">Target total: <span className="font-bold text-blue-700">{formatRupiah(targetTotal)}</span></span>
            <span className="block text-xs text-black font-semibold mt-2 mb-1">Nomor Rekening Panitia:</span>

            <div className="flex flex-col gap-2 mb-2">
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-start">
                <span className="font-bold text-sm mb-1">CIMB Niaga Syariah</span>
                <span className="inline-flex items-center gap-1 text-base font-mono mb-1 text-black">
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
                <span className="italic text-xs text-black">Muhammad Andika Widiansyah Putra</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-start">
                <span className="font-bold text-sm mb-1">Bank Jago Syariah</span>
                <span className="inline-flex items-center gap-1 text-base font-mono mb-1 text-black">
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
                <span className="italic text-xs text-black">Muhammad Andika Widiansyah Putra</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col items-start">
                <span className="font-bold text-sm mb-1">Bank Syariah Indonesia</span>
                <span className="inline-flex items-center gap-1 text-base font-mono mb-1 text-black">
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
                <span className="italic text-xs text-black">Muhammad Andika Widiansyah Putra</span>
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
              {isResubmission ? "Kirim Ulang Setoran Awal" : "Kirim Setoran Awal"}
            </button>
          </form>
          <p id="initialMessage" className="text-sm mt-3"></p>
        </div>
      </div>
    );
  }

  // Helper: render form transfer pelunasan
  function renderTransferForm() {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-4 text-black">
        <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana ke Panitia Qurban</h4>
        <p className="text-sm text-gray-600 mb-2">
          Unggah bukti transfer dana yang sudah Anda kirim ke rekening panitia.
        </p>
  <span className="block text-[11px] text-black font-semibold mt-2 mb-1">Nomor Rekening Panitia (klik untuk copy):</span>
        <div className="flex flex-col gap-1 mb-6">
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 flex flex-col items-start">
            <span className="font-semibold text-xs mb-0.5">CIMB Niaga Syariah</span>
            <span className="inline-flex items-center gap-1 text-sm font-mono mb-0.5 text-black">
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
            <span className="italic text-[10px] text-black">Muhammad Andika Widiansyah Putra</span>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 flex flex-col items-start">
            <span className="font-semibold text-xs mb-0.5">Bank Jago Syariah</span>
            <span className="inline-flex items-center gap-1 text-sm font-mono mb-0.5 text-black">
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
            <span className="italic text-[10px] text-black">Muhammad Andika Widiansyah Putra</span>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-md px-3 py-2 flex flex-col items-start">
            <span className="font-semibold text-xs mb-0.5">Bank Syariah Indonesia</span>
            <span className="inline-flex items-center gap-1 text-sm font-mono mb-0.5 text-black">
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
            <span className="italic text-[10px] text-black">Muhammad Andika Widiansyah Putra</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 block">
          Jumlah pequrban: <span className="font-bold">{jumlahPequrban}</span><br />
          Target per pequrban: <span className="font-bold">{formatRupiah(targetPribadi)}</span><br />
          Target total: <span className="font-bold">{formatRupiah(targetTotal)}</span><br />
          Minimal transfer pelunasan: <span className="font-bold text-green-700">{formatRupiah(minimumPelunasan)}</span>
          <br />
          (Target pelunasan: {formatRupiah(targetTotal)} - Setoran awal: {formatRupiah(totalSetoranAwal)})
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

  // -------------------------------------------------
  // EARLY RETURNS untuk status Setoran Awal
  // -------------------------------------------------

  // 4) Jika BELUM PERNAH setoran awal → tampilkan form setoran awal (kondisi awal)
  if (profile && !isInitialDepositMade && appConfig) {
    return (
      <>
        {renderInitialDepositForm({ isResubmission: false })}
      </>
    );
  }

  // Jika totalSetoranAwal < targetSetoranAwal, wajib upload tambahan
  const targetSetoranAwal = initialDepositPerPequrban * jumlahPequrban;
  if (profile && isInitialDepositMade && initialDepositStatus === "Approved" && totalSetoranAwal < targetSetoranAwal) {
    return (
      <>
        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-semibold text-md text-yellow-800 mb-1">Setoran Awal Kurang</h4>
            <p className="text-yellow-700">Jumlah setoran awal yang sudah disetujui masih kurang dari target setoran awal. Silakan upload bukti setoran tambahan.</p>
            <p className="text-yellow-700 mt-2">Total setoran awal disetujui: <b>{formatRupiah(totalSetoranAwal)}</b> / Target: <b>{formatRupiah(targetSetoranAwal)}</b></p>
          </div>
        </div>
        {renderInitialDepositForm({ isResubmission: false })}
      </>
    );
  }

  // 5a) Jika SUDAH upload setoran awal tapi masih PENDING → satu kartu kuning & hentikan render lainnya
  if (profile && isInitialDepositMade && initialDepositStatus === "Pending") {
    return (
      <>
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-sm font-semibold text-yellow-800">Menunggu Verifikasi</h3>
              <p className="text-yellow-700 mt-1">
                <strong>Setoran Awal berhasil dikirim, menunggu verifikasi dari admin.</strong><br />
                Akses ke seluruh fitur akan aktif setelah setoran awal <strong>Approved</strong> oleh Admin.
              </p>
              <p className="text-yellow-700 mt-1">
                Status: <span className="font-semibold">{initialDepositStatus}</span>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 5b) Jika SUDAH upload setoran awal dan REJECTED → satu kartu merah + tampilkan kembali form setoran awal, hentikan render lainnya
  if (profile && isInitialDepositMade && initialDepositStatus === "Rejected") {
    return (
      <>

        {renderInitialDepositForm({ isResubmission: true })}
      </>
    );
  }

  // --- RENDER NORMAL (hanya ketika InitialDepositStatus === "Approved") ---

  // Hide all tabungan forms if ada pelunasan pending/approved
  // Hide pelunasan/konfirmasi transfer form if belum capai target
  const hideTabunganForms = !!(lastPelunasan && (lastPelunasan.Status === "Pending" || lastPelunasan.Status === "Approved"));
  const hidePelunasanFormBecauseNotReached = currentNetSaving < targetTotal;

  return (
    <>
      {/* Card Capaian Pribadi (dari parent, biasanya di page.js) */}
      <div className="mb-4">
        {/* ...komponen capaian pribadi (PersonalProgress) biasanya diinject dari parent... */}
      </div>

      {/* 1. Jika sudah pernah transfer pelunasan, tampilkan warning/pesan sesuai status terakhir */}
      {profile && isInitialDepositMade && initialDepositStatus === "Approved" && !isQurbanSendiri && lastPelunasan ? (
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
      {profile && isInitialDepositMade && initialDepositStatus === "Approved" && !isQurbanSendiri && !lastPelunasan && !hidePelunasanFormBecauseNotReached && (
        <div className="mb-4">
          {renderTransferForm()}
        </div>
      )}
      {/* Jika belum capai target, tampilkan info */}
      {profile && isInitialDepositMade && initialDepositStatus === "Approved" && !isQurbanSendiri && !lastPelunasan && hidePelunasanFormBecauseNotReached && (
        <div className="mb-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-semibold text-md text-blue-800 mb-1">Belum Mencapai Target</h4>
              <p className="text-blue-700">Anda hanya dapat melakukan konfirmasi transfer pelunasan ke panitia jika tabungan Anda sudah mencapai <b>target total</b> ({formatRupiah(targetTotal)}).</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Jika sudah setoran awal approved, tampilkan form catat setoran tabungan & penggunaan tabungan */}
      {profile && isInitialDepositMade && initialDepositStatus === "Approved" && !hideTabunganForms && (
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
