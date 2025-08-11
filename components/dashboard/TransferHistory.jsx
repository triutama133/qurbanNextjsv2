
"use client";
import { ListSkeleton } from "./LoadingSkeletons"

export default function TransferHistory({ profile, allPersonalTransferConfirmations = [], loadingPersonal, formatRupiah }) {
  const isLoading = loadingPersonal || !profile;
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-gray-900">Riwayat Konfirmasi Transfer ke Panitia Qurban</h3>
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2">
          {allPersonalTransferConfirmations.length > 0 ? (
            allPersonalTransferConfirmations.map((item) => {
              const label = (item.Type === "Setoran Awal" || item.Tipe === "Setoran Awal") ? "Setoran Awal" : "Pelunasan";
              return (
                <div
                  key={item.ConfirmationId}
                  className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${label === "Setoran Awal" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{label}</span>
                      <span className="font-medium text-sm">{formatRupiah(item.Amount)}</span>
                    </div>
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
              );
            })
          ) : (
            <p className="text-gray-500 text-sm">Belum ada riwayat konfirmasi transfer.</p>
          )}
        </div>
      )}
    </div>
  )
}
