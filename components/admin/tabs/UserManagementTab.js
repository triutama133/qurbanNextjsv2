"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Eye, Trash2, User, DollarSign } from "lucide-react"

const UserManagementTab = ({
  loadingUsers,
  allUsers,
  handleUpdateUser,
  handleDeleteUser,
  formatRupiah,
  ListSkeleton,
}) => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})

  const openEditModal = (user) => {
    setEditingUser(user)
    setEditForm({
      NamaPequrban: user.NamaPequrban || user.Nama || "",
      Email: user.Email || "",
      Role: user.Role || "user",
      InitialDepositStatus: user.InitialDepositStatus || "Pending",
    })
  }

  const handleSaveEdit = async () => {
    try {
      await handleUpdateUser(editingUser.UserId, editForm)
      setEditingUser(null)
      setEditForm({})
    } catch (error) {
      console.error("Error updating user:", error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      Approved: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return variants[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getRoleBadge = (role) => {
    const variants = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      user: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return variants[role] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {allUsers.length} Total Users
        </Badge>
      </div>

      {loadingUsers ? (
        <ListSkeleton />
      ) : allUsers.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Setoran
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.UserId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.NamaPequrban || user.Nama}</div>
                          <div className="text-sm text-gray-500">{user.Email}</div>
                          <div className="text-xs text-gray-400">ID: {user.UserId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRoleBadge(user.Role)}>{user.Role}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusBadge(user.InitialDepositStatus)}>{user.InitialDepositStatus}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detail Pengguna</DialogTitle>
                            </DialogHeader>
                            {selectedUser && <UserDetailModal user={selectedUser} formatRupiah={formatRupiah} />}
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Pengguna</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="nama">Nama Pequrban</Label>
                                <Input
                                  id="nama"
                                  value={editForm.NamaPequrban || ""}
                                  onChange={(e) => setEditForm({ ...editForm, NamaPequrban: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={editForm.Email || ""}
                                  onChange={(e) => setEditForm({ ...editForm, Email: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="role">Role</Label>
                                <Select
                                  value={editForm.Role}
                                  onValueChange={(value) => setEditForm({ ...editForm, Role: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="status">Status Setoran Awal</Label>
                                <Select
                                  value={editForm.InitialDepositStatus}
                                  onValueChange={(value) => setEditForm({ ...editForm, InitialDepositStatus: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Approved">Approved</SelectItem>
                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button onClick={handleSaveEdit} className="flex-1">
                                  Simpan Perubahan
                                </Button>
                                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                                  Batal
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

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
                                Apakah Anda yakin ingin menghapus pengguna{" "}
                                <strong>{user.NamaPequrban || user.Nama}</strong>? Tindakan ini tidak dapat dibatalkan
                                dan akan menghapus semua data terkait.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.UserId)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Ya, Hapus
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
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pengguna</h3>
          <p className="text-gray-500">Belum ada pengguna terdaftar dalam sistem.</p>
        </div>
      )}
    </div>
  )
}

// Component untuk detail user modal
const UserDetailModal = ({ user, formatRupiah }) => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="history">Riwayat Tabungan</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">User ID</Label>
                <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{user.UserId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Nama Pequrban</Label>
                <p className="text-sm">{user.NamaPequrban || user.Nama}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-sm">{user.Email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <Badge
                  className={user.Role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}
                >
                  {user.Role}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status Setoran Awal</Label>
                <Badge
                  className={
                    user.InitialDepositStatus === "Approved"
                      ? "bg-green-100 text-green-800"
                      : user.InitialDepositStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {user.InitialDepositStatus}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Tanggal Registrasi</Label>
                <p className="text-sm">
                  {user.CreatedAt ? new Date(user.CreatedAt).toLocaleDateString("id-ID") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Riwayat Tabungan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Fitur riwayat tabungan akan ditampilkan di sini. Data akan diambil dari tabel tabungan berdasarkan UserId.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default UserManagementTab
