"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, DollarSign, Download, ExternalLink } from "lucide-react"

const ReportsTab = ({
  loadingReports,
  allSavingsHistory,
  allTransferHistory,
  overallProgramProgress,
  formatRupiah,
  ListSkeleton,
}) => {
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter data berdasarkan periode dan pencarian
  const filteredSavings = allSavingsHistory.filter((item) => {
    const matchesSearch =
      item.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Email?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterPeriod === "all") return matchesSearch

    const itemDate = new Date(item.Timestamp)
    const now = new Date()

    switch (filterPeriod) {
      case "week":
        return matchesSearch && now - itemDate <= 7 * 24 * 60 * 60 * 1000
      case "month":
        return matchesSearch && now - itemDate <= 30 * 24 * 60 * 60 * 1000
      case "year":
        return matchesSearch && itemDate.getFullYear() === now.getFullYear()
      default:
        return matchesSearch
    }
  })

  const filteredTransfers = allTransferHistory.filter((item) => {
    const matchesSearch =
      item.Nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Email?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterPeriod === "all") return matchesSearch

    const itemDate = new Date(item.Timestamp)
    const now = new Date()

    switch (filterPeriod) {
      case "week":
        return matchesSearch && now - itemDate <= 7 * 24 * 60 * 60 * 1000
      case "month":
        return matchesSearch && now - itemDate <= 30 * 24 * 60 * 60 * 1000
      case "year":
        return matchesSearch && itemDate.getFullYear() === now.getFullYear()
      default:
        return matchesSearch
    }
  })

  // Hitung statistik
  const totalSavings = filteredSavings.reduce((sum, item) => sum + (item.Amount || 0), 0)
  const totalTransfers = filteredTransfers.reduce((sum, item) => sum + (item.Amount || 0), 0)
  const uniqueUsers = new Set([
    ...filteredSavings.map((item) => item.UserId),
    ...filteredTransfers.map((item) => item.UserId),
  ]).size

  const exportData = (type) => {
    const data = type === "savings" ? filteredSavings : filteredTransfers
    const csv = [
      ["Tanggal", "Nama", "Email", "Jumlah", "Keterangan", "Status"].join(","),
      ...data.map((item) =>
        [
          new Date(item.Timestamp).toLocaleDateString("id-ID"),
          item.Nama || "",
          item.Email || "",
          item.Amount || 0,
          item.Description || "",
          item.Status || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Rekap & Laporan</h2>
        <div className="flex gap-2">
          <Button onClick={() => exportData("savings")} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export Tabungan
          </Button>
          <Button onClick={() => exportData("transfers")} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export Transfer
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
                <SelectItem value="year">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tabungan</p>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalSavings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transfer</p>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalTransfers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">User Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSavings.length + filteredTransfers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loadingReports ? (
        <ListSkeleton />
      ) : (
        <Tabs defaultValue="savings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="savings">Riwayat Tabungan ({filteredSavings.length})</TabsTrigger>
            <TabsTrigger value="transfers">Riwayat Transfer ({filteredTransfers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="savings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Rekap Tabungan Keseluruhan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSavings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bukti
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSavings.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.Timestamp).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.Nama}</div>
                                <div className="text-sm text-gray-500">{item.Email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatRupiah(item.Amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.Description || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.ProofLink && item.ProofLink.trim() !== "" ? (
                                <a
                                  href={item.ProofLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Lihat
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Tidak ada data tabungan untuk periode yang dipilih.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Rekap Transfer Keseluruhan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTransfers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bukti
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransfers.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(item.Timestamp).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.Nama}</div>
                                <div className="text-sm text-gray-500">{item.Email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                              {formatRupiah(item.Amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  item.Status === "Approved"
                                    ? "bg-green-100 text-green-800"
                                    : item.Status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {item.Status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.ProofLink && item.ProofLink.trim() !== "" ? (
                                <a
                                  href={item.ProofLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Lihat
                                </a>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Tidak ada data transfer untuk periode yang dipilih.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default ReportsTab
