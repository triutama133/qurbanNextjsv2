"use client"


import { useState } from "react"
import { SmallSpinner } from "./LoadingSkeletons"

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

  // State untuk modal konfirmasi hapus setoran
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleteTargetLabel, setDeleteTargetLabel] = useState("")

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Pencatatan Transaksi</h3>

        {/* Initial Deposit Section */}
        {profile && !isInitialDepositMade && appConfig && (
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
        {profile && isInitialDepositMade && profile?.InitialDepositStatus !== "Approved" && (
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
        {profile && isInitialDepositMade && profile?.InitialDepositStatus === "Approved" && (
          <>
            {/* Saving History (Semua Transaksi Tabungan) */}
            {personalSavingHistory.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-md text-gray-800 mb-2">Riwayat Tabungan Tercatat</h4>
                <ul className="divide-y divide-gray-200">
                  {personalSavingHistory.map((item) => (
                    <li key={item.TransaksiId} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formatRupiah(item.Jumlah)}</span>
                        <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                          {item.Tipe === "Setoran"
                            ? (item.Metode === "Setoran Awal" ? "Setoran Awal" : "Setoran")
                            : "Penggunaan"}
                        </span>
                        {item.ProofLink && (
                          <a href={item.ProofLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline text-xs">Lihat Bukti</a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Klik hapus pada tabungan:', item)
                          setDeleteTargetId(item.TransaksiId)
                          setDeleteTargetLabel(
                            item.Tipe === "Setoran"
                              ? (item.Metode === "Setoran Awal"
                                  ? "setoran awal"
                                  : `setoran (${formatRupiah(item.Jumlah)})`)
                              : `penggunaan (${formatRupiah(item.Jumlah)})`
                          )
                          setShowDeleteModal(true)
                          console.log('showDeleteModal after set:', true)
                        }}
                        className="ml-4 text-xs text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Transfer Confirmation History */}
            {personalTransferConfirmations.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-md text-gray-800 mb-2">Riwayat Konfirmasi Transfer ke Panitia</h4>
                <ul className="divide-y divide-gray-200">
                  {personalTransferConfirmations.map((item) => (
                    <li key={item.ConfirmationId} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{formatRupiah(item.Amount)}</span>
                        {item.Status && (
                          <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{item.Status}</span>
                        )}
                        {item.ProofLink && (
                          <a href={item.ProofLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline text-xs">Lihat Bukti</a>
                        )}
                      </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetId(item.ConfirmationId)
                            setDeleteTargetLabel(`konfirmasi transfer (${formatRupiah(item.Amount)})`)
                            setShowDeleteModal(true)
                          }}
                          className="ml-4 text-xs text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
            {personalTotalRecorded - personalUsed >= 2650000 && (
              <div>
                <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana ke Panitia Qurban</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Unggah bukti transfer dana yang sudah Anda kirim ke rekening panitia.
                </p>
                <form className="space-y-4" onSubmit={handleConfirmTransfer}>
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
      {/* Modal Konfirmasi Hapus Setoran/Transfer */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs animate-fadeIn">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Konfirmasi Hapus</h4>
            <p className="text-sm text-gray-700 mb-4">
              Apakah Anda yakin ingin menghapus {deleteTargetLabel} beserta file buktinya?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                onClick={() => {
                  setShowDeleteModal(false)
                  if (deleteTargetId) {
                    // Cek apakah id ada di saving atau transfer
                    const isSaving = personalSavingHistory.some((item) => item.TransaksiId === deleteTargetId)
                    if (isSaving) {
                      handleDeleteSaving(deleteTargetId)
                    } else {
                      handleDeleteTransferConfirmation(deleteTargetId)
                    }
                  }
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
