import { ListSkeleton } from "./LoadingSkeletons"

export default function TransferHistory({ profile, personalTransferConfirmations, loadingPersonal, formatRupiah }) {
  if (!profile || profile.MetodeTabungan !== "Menabung Sendiri") {
    return null
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-2 text-gray-900">Riwayat Konfirmasi Transfer ke Panitia Qurban</h3>
      {loadingPersonal ? (
        <ListSkeleton />
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2">
          {personalTransferConfirmations.length > 0 ? (
            personalTransferConfirmations.map((item) => (
              <div
                key={item.ConfirmationId}
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-sm">{formatRupiah(item.Amount)}</p>
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
      )}
    </div>
  )
}
