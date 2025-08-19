"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, XCircle } from "lucide-react"

const PendingVerificationsTab = ({
  loadingOverview,
  pendingInitialDeposits,
  pendingTransferConfirmations,
  formatRupiah,
  handleVerifyInitialDeposit,
  handleVerifyTransferConfirmation,
  ListSkeleton,
}) => {
  const [selectedItem, setSelectedItem] = useState(null)

  // Filter admin dari pendingInitialDeposits dan pendingTransferConfirmations
  const filteredInitialDeposits = pendingInitialDeposits.filter((item) => (item.Role || "").toLowerCase() !== "admin")
  const filteredTransferConfirmations = pendingTransferConfirmations.filter(
    (item) => (item.Role || "").toLowerCase() !== "admin",
  )

  const handleApproval = async (type, id, status) => {
    try {
      if (type === "initial") {
        await handleVerifyInitialDeposit(id, status)
      } else {
        await handleVerifyTransferConfirmation(id, status)
      }
    } catch (error) {
      console.error("Error processing approval:", error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: '#1a202c' }}>Daftar Verifikasi</h2>
        <div className="flex gap-2">
          <Badge variant="outline" style={{ backgroundColor: '#fffbe6', color: '#b7791f', borderColor: '#f6e05e' }}>
            {filteredInitialDeposits.length} Setoran Awal
          </Badge>
          <Badge variant="outline" style={{ backgroundColor: '#ebf8ff', color: '#2b6cb0', borderColor: '#90cdf4' }}>
            {filteredTransferConfirmations.length} Transfer
          </Badge>
        </div>
      </div>

      {loadingOverview ? (
        <ListSkeleton />
      ) : filteredInitialDeposits.length > 0 || filteredTransferConfirmations.length > 0 ? (
        <div className="space-y-8">
          {/* Verifikasi Setoran Awal */}
          {filteredInitialDeposits.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ backgroundColor: '#fff' }}>
              <div className="px-6 py-4 border-b border-gray-200" style={{ background: 'linear-gradient(90deg, #e6fffa 0%, #f0fff4 100%)' }}>
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#22543d' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#38a169', borderRadius: '50%' }}></div>
                  Setoran Awal Pending
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bukti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInitialDeposits.map((item) => (
                      <tr key={item.UserId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.Nama}</div>
                            <div className="text-sm text-gray-500">{item.Email}</div>
                            <div className="text-xs text-gray-400">ID: {item.UserId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatRupiah(item.Amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.ProofLink && item.ProofLink.trim() !== "" ? (
                            <a
                              href={item.ProofLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Lihat Bukti
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Tidak ada bukti</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-row flex-wrap gap-2 justify-end items-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Approval</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menyetujui setoran awal dari <strong>{item.Nama}</strong>{" "}
                                    sebesar <strong>{formatRupiah(item.Amount)}</strong>?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproval("initial", item.UserId, "Approved")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Ya, Setujui
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menolak setoran awal dari <strong>{item.Nama}</strong>?
                                    Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproval("initial", item.UserId, "Rejected")}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ya, Tolak
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Verifikasi Konfirmasi Transfer Cicilan */}
          {filteredTransferConfirmations.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden" style={{ backgroundColor: '#fff' }}>
              <div className="px-6 py-4 border-b border-gray-200" style={{ background: 'linear-gradient(90deg, #ebf8ff 0%, #e3e8f0 100%)' }}>
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#2b6cb0' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#3182ce', borderRadius: '50%' }}></div>
                  Transfer ke Panitia Pending
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaksi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bukti
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransferConfirmations.map((item) => (
                      <tr key={item.ConfirmationId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{item.ConfirmationId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.Nama}</div>
                            <div className="text-sm text-gray-500">{item.Email}</div>
                            <div className="text-xs text-gray-400">ID: {item.UserId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatRupiah(item.Amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(item.Timestamp).toLocaleDateString("id-ID")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.ProofLink && item.ProofLink.trim() !== "" ? (
                            <a
                              href={item.ProofLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Lihat Bukti
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">Tidak ada bukti</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-row flex-wrap gap-2 justify-end items-center">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Approval</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menyetujui transfer dari <strong>{item.Nama}</strong>{" "}
                                    sebesar <strong>{formatRupiah(item.Amount)}</strong>?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproval("transfer", item.ConfirmationId, "Approved")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Ya, Setujui
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menolak transfer dari <strong>{item.Nama}</strong>? Tindakan
                                    ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleApproval("transfer", item.ConfirmationId, "Rejected")}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Ya, Tolak
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Semua Verifikasi Selesai</h3>
          <p className="text-gray-500">Tidak ada verifikasi pending saat ini.</p>
        </div>
      )}
    </div>
  )
}

export default PendingVerificationsTab
