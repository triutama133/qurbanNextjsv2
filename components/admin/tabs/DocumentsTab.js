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
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, ExternalLink, FileText, Globe, User } from "lucide-react"

const DocumentsTab = ({
  loadingContent,
  allResources,
  handleAddResource,
  handleUpdateResource,
  handleDeleteResource,
  CardSkeleton,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [formData, setFormData] = useState({
    Title: "",
    Type: "Document",
    Link: "",
    IsGlobal: true,
    Description: "",
  })

  const resetForm = () => {
    setFormData({
      Title: "",
      Type: "Document",
      Link: "",
      IsGlobal: true,
      Description: "",
    })
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (resource) => {
    setFormData({
      Title: resource.Title || "",
      Type: resource.Type || "Document",
      Link: resource.Link || "",
      IsGlobal: resource.IsGlobal || true,
      Description: resource.Description || "",
    })
    setEditingResource(resource)
  }

  const handleSubmit = async () => {
    try {
      if (editingResource) {
        await handleUpdateResource(editingResource.ResourceId, formData)
        setEditingResource(null)
      } else {
        await handleAddResource(formData)
        setIsAddModalOpen(false)
      }
      resetForm()
    } catch (error) {
      console.error("Error saving resource:", error)
    }
  }

  const handleDelete = async (resourceId) => {
    try {
      await handleDeleteResource(resourceId)
    } catch (error) {
      console.error("Error deleting resource:", error)
    }
  }

  const getTypeBadge = (type) => {
    const variants = {
      Document: "bg-blue-100 text-blue-800 border-blue-200",
      Video: "bg-purple-100 text-purple-800 border-purple-200",
      Image: "bg-green-100 text-green-800 border-green-200",
      Link: "bg-orange-100 text-orange-800 border-orange-200",
    }
    return variants[type] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dokumen & Sumber Daya</h2>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Dokumen
        </Button>
      </div>

      {loadingContent ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allResources.map((resource) => (
            <Card key={resource.ResourceId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <Badge className={getTypeBadge(resource.Type)}>{resource.Type}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {resource.IsGlobal ? (
                      <Globe className="w-4 h-4 text-green-600" title="Global" />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" title="User Specific" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{resource.Title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.Description && <p className="text-sm text-gray-600 line-clamp-2">{resource.Description}</p>}

                <div className="flex items-center gap-2">
                  <a
                    href={resource.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Lihat
                  </a>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(resource)} className="flex-1">
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
                          Apakah Anda yakin ingin menghapus dokumen <strong>{resource.Title}</strong>? Tindakan ini
                          tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(resource.ResourceId)}
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

          {allResources.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Dokumen</h3>
              <p className="text-gray-500 mb-4">Mulai dengan menambahkan dokumen atau sumber daya pertama.</p>
              <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Dokumen
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || !!editingResource}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false)
            setEditingResource(null)
            resetForm()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Dokumen" : "Tambah Dokumen Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={formData.Title}
                onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                placeholder="Masukkan judul dokumen"
              />
            </div>

            <div>
              <Label htmlFor="type">Tipe</Label>
              <Select value={formData.Type} onValueChange={(value) => setFormData({ ...formData, Type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Image">Image</SelectItem>
                  <SelectItem value="Link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                type="url"
                value={formData.Link}
                onChange={(e) => setFormData({ ...formData, Link: e.target.value })}
                placeholder="https://example.com/document.pdf"
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Input
                id="description"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                placeholder="Deskripsi singkat tentang dokumen"
              />
            </div>

            <div>
              <Label htmlFor="scope">Scope</Label>
              <Select
                value={formData.IsGlobal ? "global" : "user"}
                onValueChange={(value) => setFormData({ ...formData, IsGlobal: value === "global" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (Semua User)</SelectItem>
                  <SelectItem value="user">User Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={!formData.Title || !formData.Link} className="flex-1">
                {editingResource ? "Update" : "Tambah"} Dokumen
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingResource(null)
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

export default DocumentsTab
