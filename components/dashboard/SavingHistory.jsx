"use client"

import { useState } from "react"
import { ListSkeleton } from "./LoadingSkeletons"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2 } from "lucide-react"

export default function SavingHistory({
  personalSavingHistory,
  loadingPersonal,
  formatRupiah,
  showConfirmModal,
  handleEditTransaction,
  handleDeleteTransaction,
}) {
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [editAmount, setEditAmount] = useState("")
  const [editDate, setEditDate] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction)
    setEditAmount(transaction.Jumlah.toString())
    setEditDate(new Date(transaction.Tanggal).toISOString().split("T")[0])
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (editingTransaction && editAmount && editDate) {
      const updatedTransaction = {
        ...editingTransaction,
        Jumlah: Number.parseInt(editAmount),
        Tanggal: new Date(editDate).toISOString(),
      }
      handleEditTransaction(updatedTransaction)
      setIsEditDialogOpen(false)
      setEditingTransaction(null)
    }
  }

  const formatAmountInput = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    return numericValue ? Number.parseInt(numericValue, 10).toLocaleString("id-ID") : ""
  }

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
                className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-1">
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

                <div className="flex items-center gap-2 ml-4">
                  {/* Edit Button */}
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Transaksi</DialogTitle>
                        <DialogDescription>Ubah nominal dan tanggal transaksi Anda.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-amount" className="text-right">
                            Nominal
                          </Label>
                          <Input
                            id="edit-amount"
                            value={editAmount}
                            onChange={(e) => {
                              const formatted = formatAmountInput(e.target.value)
                              setEditAmount(formatted)
                            }}
                            className="col-span-3"
                            placeholder="Masukkan nominal"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-date" className="text-right">
                            Tanggal
                          </Label>
                          <Input
                            id="edit-date"
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button onClick={handleSaveEdit}>Simpan Perubahan</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus transaksi {item.Tipe.toLowerCase()} sebesar{" "}
                          {formatRupiah(item.Jumlah)}? Tindakan ini tidak dapat dibatalkan dan akan menghapus file bukti
                          jika ada.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTransaction(item.TransaksiId)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Ya, Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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
