"use client"

import { ListSkeleton } from "./LoadingSkeletons"

export default function SavingHistory({ personalSavingHistory, loadingPersonal, formatRupiah, showConfirmModal }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Riwayat Tabungan Tercatat</h3>
      {loadingPersonal ? (
        <ListSkeleton />
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2">
          {personalSavingHistory.length > 0 ? (
            personalSavingHistory.map((item) => (
              <div
                key={item.TransaksiId}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-sm">
                    {item.Tipe === "Penggunaan" ? "-" : ""}
                    {formatRupiah(item.Jumlah)}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.Tipe === "Setoran" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.Tipe}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.Tanggal).toLocaleDateString("id-ID")} - {item.Metode || "Tidak Ada Metode"}
                  </p>
                  {item.ProofLink && (
                    <a
                      href={item.ProofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Lihat Bukti
                    </a>
                  )}
                </div>
                <button
                  onClick={() => showConfirmModal(item.TransaksiId)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Hapus
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Belum ada riwayat tabungan tercatat.</p>
          )}
        </div>
      )}
    </div>
  )
}
