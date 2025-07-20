// File: app/components/dashboard/TransactionForms.js
"use client";
import React from 'react';
import { SmallSpinner } from '@/components/common/Spinners';

export default function TransactionForms({ profile, globalConfig, personalTotalRecorded, personalUsed, personalTransferred, formatRupiah, handlers, loaders }) {
  const { handleInitialDeposit, handleAddSaving, handleUseSaving, handleConfirmTransfer } = handlers;
  const { initialDepositLoading, addSavingLoading, useSavingLoading, confirmTransferLoading } = loaders;

  const isInitialDepositMade = profile?.IsInitialDepositMade;
  const initialDepositStatus = profile?.InitialDepositStatus;
  const canPerformTransactions = initialDepositStatus === 'Approved';
  const isTargetForTransferReached = (personalTotalRecorded - personalUsed) >= (globalConfig?.TargetForTransfer || Infinity);

  const handleKeyUp = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = value ? parseInt(value, 10).toLocaleString('id-ID') : '';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Pencatatan Transaksi</h3>
      
      {/* Form Setoran Awal */}
      {!isInitialDepositMade && globalConfig && (
        <div className="border-b pb-4 mb-4">
          <h4 className="font-semibold text-md text-gray-800 mb-2">Setoran Awal Wajib</h4>
          <p className="text-sm text-gray-600 mb-2">Silakan lakukan setoran awal sebesar {formatRupiah(globalConfig.InitialDepositAmount)}.</p>
          <form id="initialDepositForm" className="space-y-4" onSubmit={handleInitialDeposit}>
            <div>
              <label htmlFor="initialProofFile" className="block text-sm font-medium text-gray-700">Bukti Transfer (Wajib)</label>
              <input type="file" id="initialProofFile" name="initialProofFile" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            </div>
            <button type="submit" disabled={initialDepositLoading} className="w-full flex justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium">
              {initialDepositLoading && <SmallSpinner />}
              {initialDepositLoading ? 'Mengirim...' : 'Kirim Setoran Awal'}
            </button>
          </form>
          <p id="initialMessage" className="text-sm mt-3"></p>
        </div>
      )}

      {/* Status Verifikasi Setoran Awal */}
      {isInitialDepositMade && !canPerformTransactions && (
        <div className="p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50" role="alert">
          <span className="font-medium">Menunggu Verifikasi!</span> Setoran awal Anda sedang diperiksa oleh admin.
        </div>
      )}

      {/* Form Transaksi Rutin (jika sudah disetujui) */}
      {canPerformTransactions && (
        <div className="space-y-6">
          {/* Form Catat Setoran */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Setoran Tabungan</h4>
            <form id="addSavingForm" className="space-y-4" onSubmit={handleAddSaving}>
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                <input type="text" id="amount" name="amount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" onKeyUp={handleKeyUp} />
              </div>
              <button type="submit" disabled={addSavingLoading} className="w-full flex justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium">
                {addSavingLoading && <SmallSpinner />}
                {addSavingLoading ? 'Menyimpan...' : 'Catat Setoran'}
              </button>
            </form>
            <p id="savingMessage" className="text-sm mt-3"></p>
          </div>

          {/* Form Catat Penggunaan */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-md text-gray-800 mb-2">Catat Penggunaan Tabungan</h4>
            <form className="space-y-4" onSubmit={handleUseSaving}>
              <div>
                <label htmlFor="usedAmount" className="block text-sm font-medium text-gray-700">Jumlah Terpakai (Rp)</label>
                <input type="text" id="usedAmount" name="usedAmount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" onKeyUp={handleKeyUp} />
              </div>
              <button type="submit" disabled={useSavingLoading} className="w-full flex justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium">
                {useSavingLoading && <SmallSpinner />}
                {useSavingLoading ? 'Mencatat...' : 'Catat Penggunaan'}
              </button>
            </form>
            <p id="usedMessage" className="text-sm mt-3"></p>
          </div>

          {/* Form Konfirmasi Transfer */}
          {isTargetForTransferReached && (
            <div>
              <h4 className="font-semibold text-md text-gray-800 mb-2">Konfirmasi Transfer Dana</h4>
              <p className="text-sm text-gray-600 mb-2">Unggah bukti transfer dana yang sudah Anda kirim ke rekening panitia.</p>
              <form className="space-y-4" onSubmit={handleConfirmTransfer}>
                <div>
                  <label htmlFor="transferAmount" className="block text-sm font-medium text-gray-700">Jumlah Transfer (Rp)</label>
                  <input type="text" id="transferAmount" name="transferAmount" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" onKeyUp={handleKeyUp} />
                </div>
                <div>
                  <label htmlFor="transferProofFile" className="text-sm font-medium text-gray-700">Bukti Transfer (Wajib)</label>
                  <input type="file" id="transferProofFile" name="transferProofFile" required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                </div>
                <button type="submit" disabled={confirmTransferLoading} className="w-full flex justify-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium">
                  {confirmTransferLoading && <SmallSpinner />}
                  {confirmTransferLoading ? 'Mengunggah...' : 'Kirim Konfirmasi'}
                </button>
              </form>
              <p id="confirmMessage" className="text-sm mt-3"></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}