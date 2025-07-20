// components/dashboard/SavingHistoryCard.js
"use client";

import React from 'react';
import { ListSkeleton } from '@/components/common/Skeletons'; // Pastikan alias ini benar
import { formatRupiah } from '@/lib/utils'; // Pastikan alias ini benar

export default function SavingHistoryCard({ 
  profile, 
  personalSavingHistory, 
  personalTransferConfirmations, 
  loadingPersonal,
  showConfirmModal // Fungsi untuk konfirmasi hapus
}) {
  if (loadingPersonal) {
    return <ListSkeleton />;
  }

  return (
    <>
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
                  {item.ProofLink && ( // Bukti hanya untuk Setoran ke Panitia
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

      {/* Riwayat Konfirmasi Transfer ke Panitia (hanya untuk Menabung Sendiri) */}
      {profile && profile.MetodeTabungan === 'Menabung Sendiri' && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-2 text-gray-900">Riwayat Konfirmasi Transfer ke Panitia Qurban</h3>
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
    </>
  );
}