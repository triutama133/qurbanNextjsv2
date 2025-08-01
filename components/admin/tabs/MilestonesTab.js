"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Calendar, Target, CheckCircle } from "lucide-react"

const MilestonesTab = ({
  loadingContent,
  allMilestones,
  handleAddMilestone,
  handleUpdateMilestone,
  handleDeleteMilestone,
  CardSkeleton,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [formData, setFormData] = useState({
    Month: "",
    Year: new Date().getFullYear(),
    Activity: "",
    Description: "",
    Status: "Planned",
  })

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const resetForm = () => {
    setFormData({
      Month: "",
      Year: new Date().getFullYear(),
      Activity: "",
      Description: "",
      Status: "Planned",
    })
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (milestone) => {
    setFormData({
      Month: milestone.Month || "",
      Year: milestone.Year || new Date().getFullYear(),
      Activity: milestone.Activity || "",
      Description: milestone.Description || "",
      Status: milestone.Status || "Planned",
    })
    setEditingMilestone(milestone)
  }

  const handleSubmit = async () => {
    try {
      if (editingMilestone) {
        await handleUpdateMilestone(editingMilestone.MilestoneId, formData)
        setEditingMilestone(null)
      } else {
        await handleAddMilestone(formData)
        setIsAddModalOpen(false)
      }
      resetForm()
    } catch (error) {
      console.error("Error saving milestone:", error)
    }
  }

  const handleDelete = async (milestoneId) => {
    try {
      await handleDeleteMilestone(milestoneId)
    } catch (error) {
      console.error("Error deleting milestone:", error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      Planned: "bg-blue-100 text-blue-800 border-blue-200",
      "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    }
    return variants[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "In Progress":
        return <Target className="w-4 h-4 text-yellow-600" />
      default:
        return <Calendar className="w-4 h-4 text-blue-600" />
    }
  }

  // Sort milestones by year and month
  const sortedMilestones = [...allMilestones].sort((a, b) => {
    if (a.Year !== b.Year) return b.Year - a.Year
    return months.indexOf(b.Month) - months.indexOf(a.Month)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Milestone Program</h2>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Milestone
        </Button>
      </div>

      {loadingContent ? (
        <CardSkeleton />
      ) : (
        <div className="space-y-4">
          {sortedMilestones.map((milestone) => (
            <Card key={milestone.MilestoneId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(milestone.Status)}
                    <div>
                      <CardTitle className="text-lg">{milestone.Activity}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {milestone.Month} {milestone.Year}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(milestone.Status)}>{milestone.Status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestone.Description && <p className="text-sm text-gray-600">{milestone.Description}</p>}

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(milestone)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="flex-1">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus milestone <strong>{milestone.Activity}</strong>? Tindakan
                          ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(milestone.MilestoneId)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Ya, Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}

          {allMilestones.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Milestone</h3>
              <p className="text-gray-500 mb-4">Mulai dengan menambahkan milestone program pertama.</p>
              <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Milestone
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || !!editingMilestone}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false)
            setEditingMilestone(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Edit Milestone" : "Tambah Milestone Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Bulan</Label>
                <Select value={formData.Month} onValueChange={(value) => setFormData({ ...formData, Month: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="year">Tahun</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.Year}
                  onChange={(e) => setFormData({ ...formData, Year: Number.parseInt(e.target.value) })}
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="activity">Aktivitas</Label>
              <Input
                id="activity"
                value={formData.Activity}
                onChange={(e) => setFormData({ ...formData, Activity: e.target.value })}
                placeholder="Masukkan nama aktivitas"
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Textarea
                id="description"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                placeholder="Deskripsi detail tentang milestone"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.Status} onValueChange={(value) => setFormData({ ...formData, Status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={!formData.Month || !formData.Activity} className="flex-1">
                {editingMilestone ? "Update" : "Tambah"} Milestone
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingMilestone(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MilestonesTab
