"use client"
import { SmallSpinner } from "./LoadingSkeletons"
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
  personalTransferConfirmations = [],
  addSavingLoading,
  useSavingLoading,
  confirmTransferLoading,
  handleAddSaving,
  handleUseSaving,
  handleInitialDeposit,
  handleConfirmTransfer,
  handleDeleteSaving,
  handleDeleteTransferConfirmation,
  formatRupiah,
}) {
  const isInitialDepositMade = profile?.IsInitialDepositMade


  // Cek status pelunasan (bukan setoran awal)
  const pelunasanList = personalTransferConfirmations?.filter(
    (item) => item.Type !== "Setoran Awal"
  ) || [];
  const pelunasanPending = pelunasanList.some(item => item.Status === "Pending");
  const pelunasanApproved = pelunasanList.some(item => item.Status === "Approved");
  const pelunasanRejected = pelunasanList.some(item => item.Status === "Rejected");
  const pelunasanSudahUpload = pelunasanList.length > 0;

  // Hitung total pelunasan yang sudah diapprove
  const totalPelunasanApproved = pelunasanList
    .filter(item => item.Status === "Approved")
    .reduce((sum, item) => sum + (item.Amount || 0), 0);
  const totalSetoranAwal = profile?.IsInitialDepositMade && profile?.InitialDepositStatus === "Approved" ? (appConfig?.InitialDepositAmount || 300000) : 0;
  const targetPelunasan = (profile?.TargetPribadi || 2650000);
  const sudahLunas = (totalPelunasanApproved + totalSetoranAwal) >= targetPelunasan;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Pencatatan Transaksi</h3>

        {/* Pesan jika pelunasan pending */}
        {pelunasanPending && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <h4 className="font-semibold text-md text-yellow-800 mb-2">Menunggu Verifikasi Admin</h4>
            <p className="text-sm text-yellow-700">Bukti pelunasan Anda sudah diupload dan sedang diverifikasi admin. Seluruh fitur pencatatan transaksi dan konfirmasi transfer dinonaktifkan sementara.</p>
          </div>
        )}

        {/* Pesan jika pelunasan sudah lunas dan approved */}
        {sudahLunas && pelunasanApproved && !pelunasanPending && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h4 className="font-semibold text-md text-green-800 mb-2">Pelunasan Selesai</h4>
            <p className="text-sm text-green-700">Anda telah melakukan pelunasan penuh dan sudah diverifikasi admin. Semua fitur pencatatan transaksi dinonaktifkan.</p>
          </div>
        )}

        {/* Initial Deposit Section */}
        {!pelunasanPending && !sudahLunas && profile && !isInitialDepositMade && appConfig && (
          <div className="border-b pb-4 mb-4">
            <h4 className="font-semibold text-md text-gray-800 mb-2">Setoran Awal Wajib</h4>
            <p className="text-sm text-gray-600 mb-2">
              Silakan lakukan setoran awal sebesar {formatRupiah(appConfig.InitialDepositAmount)}.
            </p>
            <form className="space-y-4" onSubmit={handleInitialDeposit}>
              <div>
                <label htmlFor="initialProofFile" className="block text-sm font-medium text-gray-700">
                  Bukti Transfer (Wajib)
                </label>
                <input
                  type="file"
                  id="initialProofFile"
                  required
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
        )}

        {/* Verification Status */}
        {!pelunasanPending && !sudahLunas && profile && isInitialDepositMade && profile?.InitialDepositStatus !== "Approved" && (
          <div className="border-b pb-4 mb-4">
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
                  <h3 className="text-sm font-medium text-yellow-800">Menunggu Verifikasi</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Setoran awal Anda sedang dalam proses verifikasi admin. Anda belum dapat mencatat tabungan rutin
                      hingga setoran awal diverifikasi.
                    </p>
                    <p className="mt-1">
                      Status: <span className="font-semibold">{profile?.InitialDepositStatus || "Pending"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Regular Transaction Forms */}
        {!pelunasanPending && !sudahLunas && profile && isInitialDepositMade && profile?.InitialDepositStatus === "Approved" && (
          <>
            {/* Riwayat Tabungan Tercatat dihapus dari sini, hanya tampil di bawah (SavingHistory) */}

            {/* Riwayat Konfirmasi Transfer ke Panitia dihapus dari sini, hanya tampil di bawah (TransferHistory) */}

            {/* Add Saving Form */}
            <div className="border-b pb-4 mb-4">
              <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Setoran Tabungan</h4>
              <form className="space-y-4" onSubmit={handleAddSaving}>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Jumlah (Rp)
                  </label>
                  <input
                    type="text"
                    id="amount"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyUp={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      e.target.value = value ? Number.parseInt(value, 10).toLocaleString("id-ID") : ""
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
              <p id="savingMessage" className="text-sm mt-3"></p>
            </div>

            {/* Use Saving Form */}
            <div className="mb-4 border-b pb-4">
              <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Penggunaan Tabungan</h4>
              <p className="text-sm text-gray-600 mb-2">Jika sebagian tabungan Anda terpakai untuk keperluan lain.</p>
              <form className="space-y-4" onSubmit={handleUseSaving}>
                <div>
                  <label htmlFor="usedAmount" className="block text-sm font-medium text-gray-700">
                    Jumlah Terpakai (Rp)
                  </label>
                  <input
                    type="text"
                    id="usedAmount"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    onKeyUp={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "")
                      e.target.value = value ? Number.parseInt(value, 10).toLocaleString("id-ID") : ""
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
              <p id="usedMessage" className="text-sm mt-3"></p>
            </div>

            {/* Transfer Confirmation Form */}
            {/* Form Konfirmasi Transfer Dana ke Panitia Qurban */}
            {personalTotalRecorded - personalUsed >= (profile?.TargetPribadi || 2650000) && !pelunasanSudahUpload && (
              <div>
                <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana ke Panitia Qurban</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Unggah bukti transfer dana yang sudah Anda kirim ke rekening panitia.<br />
                  <span className="text-xs text-gray-500">Minimal transfer Rp 2.350.000 (setelah setoran awal Rp 300.000).</span>
                </p>
                <form className="space-y-4" onSubmit={e => {
                  e.preventDefault();
                  const amountInput = e.target.transferAmount;
                  const amount = parseInt((amountInput.value || "0").replace(/[^0-9]/g, ""), 10);
                  if (amount < 2350000) {
                    document.getElementById("confirmMessage").textContent = "Jumlah transfer minimal Rp 2.350.000";
                    document.getElementById("confirmMessage").className = "text-sm mt-3 text-red-600";
                    return;
                  }
                  handleConfirmTransfer(e);
                }}>
                  <div>
                    <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700">
                      Jumlah Transfer (Rp)
                    </label>
                    <input
                      type="text"
                      id="transferAmount"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      onKeyUp={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        e.target.value = value ? Number.parseInt(value, 10).toLocaleString("id-ID") : ""
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="transferProofFile" className="text-sm font-medium text-gray-700">
                      Bukti Transfer (Wajib)
                    </label>
                    <input
                      type="file"
                      id="transferProofFile"
                      required
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center"
                    disabled={confirmTransferLoading}
                  >
                    {confirmTransferLoading ? <SmallSpinner /> : null}
                    {confirmTransferLoading ? "Mengunggah..." : "Kirim Konfirmasi"}
                  </button>
                </form>
                <p id="confirmMessage" className="text-sm mt-3"></p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
