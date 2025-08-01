"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, DollarSign, TrendingUp, Calendar } from "lucide-react"

const OperationalCostsTab = ({ loadingOverview, overallProgramProgress, formatRupiah, CardSkeleton }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCost, setNewCost] = useState({
    description: "",
    amount: "",
    category: "Operasional",
    date: new Date().toISOString().split("T")[0],
  })

  const handleAddCost = async () => {
    try {
      const response = await fetch("/api/admin/add-operational-cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: newCost.description,
          amount: Number.parseFloat(newCost.amount),
          category: newCost.category,
          date: newCost.date,
        }),
      })

      if (response.ok) {
        setNewCost({
          description: "",
          amount: "",
          category: "Operasional",
          date: new Date().toISOString().split("T")[0],
        })
        setIsAddModalOpen(false)
        // Refresh data
        window.location.reload()
      }
    } catch (error) {
      console.error("Error adding operational cost:", error)
    }
  }

  const mockOperationalCosts = [
    {
      id: 1,
      description: "Biaya Transport Pembelian Sapi",
      amount: 500000,
      category: "Transport",
      date: "2024-01-15",
      createdBy: "Admin",
    },
    {
      id: 2,
      description: "Biaya Administrasi Bank",
      amount: 25000,
      category: "Administrasi",
      date: "2024-01-10",
      createdBy: "Admin",
    },
    {
      id: 3,
      description: "Biaya Pemotongan dan Distribusi",
      amount: 750000,
      category: "Operasional",
      date: "2024-01-20",
      createdBy: "Admin",
    },
  ]

  const getCategoryBadge = (category) => {
    const variants = {
      Operasional: "bg-blue-100 text-blue-800 border-blue-200",
      Transport: "bg-green-100 text-green-800 border-green-200",
      Administrasi: "bg-purple-100 text-purple-800 border-purple-200",
      Lainnya: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return variants[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const totalOperationalCosts = mockOperationalCosts.reduce((sum, cost) => sum + cost.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Biaya Operasional</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Biaya
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Biaya Operasional</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRupiah(overallProgramProgress?.totalCosts || totalOperationalCosts)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Biaya Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatRupiah(
                    mockOperationalCosts
                      .filter((cost) => new Date(cost.date).getMonth() === new Date().getMonth())
                      .reduce((sum, cost) => sum + cost.amount, 0),
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{mockOperationalCosts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loadingOverview ? (
        <CardSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Riwayat Biaya Operasional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat Oleh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockOperationalCosts.map((cost) => (
                    <tr key={cost.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(cost.date).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cost.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getCategoryBadge(cost.category)}>{cost.category}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatRupiah(cost.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cost.createdBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Hapus
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus biaya operasional{" "}
                                  <strong>{cost.description}</strong>? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700">Ya, Hapus</AlertDialogAction>
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
          </CardContent>
        </Card>
      )}

      {/* Add Cost Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Biaya Operasional</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={newCost.description}
                onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                placeholder="Masukkan deskripsi biaya"
              />
            </div>

            <div>
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={newCost.amount}
                onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                value={newCost.category}
                onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Operasional">Operasional</option>
                <option value="Transport">Transport</option>
                <option value="Administrasi">Administrasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={newCost.date}
                onChange={(e) => setNewCost({ ...newCost, date: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddCost} disabled={!newCost.description || !newCost.amount} className="flex-1">
                Tambah Biaya
              </Button>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OperationalCostsTab
