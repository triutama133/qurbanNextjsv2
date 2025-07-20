// File: app/components/dashboard/SavingHistoryCard.js
"use client"
import { ListSkeleton } from "@/components/common/Skeletons"

// ✅ PERBAIKAN: Menambahkan nilai default `[]` dan pengecekan internal `|| []`
export default function SavingHistoryCard({
  loading,
  savingHistory = [],
  transferConfirmations = [],
  isMenabungSendiri,
  onDelete,
  formatRupiah,
}) {
  if (loading) {
    return <ListSkeleton />
  }

  // Lapisan keamanan tambahan untuk memastikan variabel adalah array
  const historyToRender = Array.isArray(savingHistory) ? savingHistory : []
  const confirmationsToRender = Array.isArray(transferConfirmations) ? transferConfirmations : []

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Riwayat Tabungan Tercatat</h3>
        <div className="max-h-96 overflow-y-auto pr-2">
          {historyToRender.length > 0 ? (
            historyToRender.map((item) => (
              <div
                key={item.TransaksiId}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-sm">
                    {item.Tipe === "Penggunaan" ? "-" : ""}
                    {formatRupiah ? formatRupiah(item.Jumlah) : `Rp ${item.Jumlah?.toLocaleString("id-ID") || 0}`}
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${item.Tipe === "Setoran" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {item.Tipe}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.Tanggal).toLocaleDateString("id-ID")} - {item.Metode || "Tidak Ada Metode"}
                  </p>
                </div>
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.TransaksiId)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Belum ada riwayat tabungan tercatat.</p>
          )}
        </div>
      </div>

      {isMenabungSendiri && (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
          <h3 className="text-lg font-bold mb-2 text-gray-900">Riwayat Konfirmasi Transfer</h3>
          <div className="max-h-96 overflow-y-auto pr-2">
            {confirmationsToRender.length > 0 ? (
              confirmationsToRender.map((item) => (
                <div
                  key={item.ConfirmationId}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {formatRupiah ? formatRupiah(item.Amount) : `Rp ${item.Amount?.toLocaleString("id-ID") || 0}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.Timestamp).toLocaleDateString("id-ID")} - Status: {item.Status}
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
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Belum ada riwayat konfirmasi transfer.</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
