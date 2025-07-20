// components/dashboard/TransactionForms.js
"use client";

import React from 'react';
import { SmallSpinner } from '@/components/common/Spinners'; // Pastikan alias ini benar
import { formatRupiah } from '@/lib/utils'; // Pastikan alias ini benar

export default function TransactionForms({
  profile,
  globalConfig,
  personalTotalRecorded,
  personalUsed,
  personalTransferred,
  addSavingLoading,
  useSavingLoading,
  confirmTransferLoading,
  handleAddSaving,
  handleUseSaving,
  handleInitialDeposit,
}) {
  const isInitialDepositMade = profile?.IsInitialDepositMade;
  const initialDepositStatus = profile?.InitialDepositStatus;
  const canPerformTransactions = initialDepositStatus === 'Approved'; // Hanya bisa transaksi jika setoran awal Approved

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Pencatatan Transaksi</h3>

        {/* Setoran Awal Card */}
        {profile && !isInitialDepositMade && globalConfig && (
          <div className="border-b pb-4 mb-4">
            <h4 className="font-semibold text-md text-gray-800 mb-2">Setoran Awal Wajib</h4>
            <p className="text-sm text-gray-600 mb-2">Silakan lakukan setoran awal sebesar {formatRupiah(globalConfig.InitialDepositAmount)}.</p>
            <form id="initialDepositForm" className="space-y-4" onSubmit={handleInitialDeposit}>
              <div>
                <label htmlFor="initialProofFile" className="block text-sm font-medium text-gray-700">Bukti Transfer (Wajib)</label>
                <input type="file" id="initialProofFile" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              </div>
              <div>
                <button type="submit" className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium flex items-center justify-center" disabled={initialDepositLoading}>
                  {initialDepositLoading ? <SmallSpinner /> : null}
                  {initialDepositLoading ? 'Mengirim...' : 'Kirim Setoran Awal'}
                </button>
              </div>
            </form>
            <p id="initialMessage" className="text-sm mt-3"></p>
          </div>
        )}

        {/* Pesan Status Setoran Awal */}
        {profile && isInitialDepositMade && initialDepositStatus !== 'Approved' && (
          <div className="border-b pb-4 mb-4 p-4 rounded-md text-sm font-medium">
            {initialDepositStatus === 'Pending' && (
              <div className="bg-yellow-50 text-yellow-800">
                Setoran awal Anda sedang dalam proses verifikasi oleh admin. Anda belum bisa mencatat tabungan lain.
              </div>
            )}
            {initialDepositStatus === 'Rejected' && (
              <div className="bg-red-50 text-red-800">
                Setoran awal Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut. Anda belum bisa mencatat tabungan.
              </div>
            )}
          </div>
        )}

        {/* Form Pencatatan Tabungan Rutin (hanya jika Setoran Awal Approved) */}
        {canPerformTransactions && (
          <>
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

            {/* Konfirmasi Transfer Dana ke Panitia (hanya ketika total tercatat + setoran awal >= target transfer) */}
            {personalTotalRecorded >= (globalConfig?.TargetForTransfer || 0) && (
              <div>
                <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana ke Panitia Qurban</h4>
                <p className="text-sm text-gray-600 mb-2">Unggah bukti transfer dana yang sudah Anda kirim ke rekening panitia. Ini bisa dicicil.</p>
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
          </>
        )}
      </div>
    </div>
  );
}