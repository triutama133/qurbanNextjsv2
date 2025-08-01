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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Newspaper, Calendar, User, Eye } from "lucide-react"

const NewsTab = ({
  loadingContent,
  allNewsletters,
  handleAddNews,
  handleUpdateNews,
  handleDeleteNews,
  CardSkeleton,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [viewingNews, setViewingNews] = useState(null)
  const [formData, setFormData] = useState({
    Title: "",
    Content: "",
    AuthorName: "",
    Summary: "",
  })

  const resetForm = () => {
    setFormData({
      Title: "",
      Content: "",
      AuthorName: "",
      Summary: "",
    })
  }

  const openAddModal = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const openEditModal = (news) => {
    setFormData({
      Title: news.Title || "",
      Content: news.Content || "",
      AuthorName: news.AuthorName || "",
      Summary: news.Summary || "",
    })
    setEditingNews(news)
  }

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        DatePublished: new Date().toISOString(),
      }

      if (editingNews) {
        await handleUpdateNews(editingNews.NewsletterId, submitData)
        setEditingNews(null)
      } else {
        await handleAddNews(submitData)
        setIsAddModalOpen(false)
      }
      resetForm()
    } catch (error) {
      console.error("Error saving news:", error)
    }
  }

  const handleDelete = async (newsId) => {
    try {
      await handleDeleteNews(newsId)
    } catch (error) {
      console.error("Error deleting news:", error)
    }
  }

  // Sort news by date (newest first)
  const sortedNews = [...allNewsletters].sort((a, b) => new Date(b.DatePublished) - new Date(a.DatePublished))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Berita & Informasi</h2>
        <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Berita
        </Button>
      </div>

      {loadingContent ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNews.map((news) => (
            <Card key={news.NewsletterId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-indigo-600" />
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                      Berita
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{news.Title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {news.Summary && <p className="text-sm text-gray-600 line-clamp-3">{news.Summary}</p>}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{news.AuthorName}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(news.DatePublished).toLocaleDateString("id-ID")}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => setViewingNews(news)} className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(news)} className="flex-1">
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
                          Apakah Anda yakin ingin menghapus berita <strong>{news.Title}</strong>? Tindakan ini tidak
                          dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(news.NewsletterId)}
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

          {allNewsletters.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Newspaper className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Berita</h3>
              <p className="text-gray-500 mb-4">Mulai dengan menambahkan berita atau informasi pertama.</p>
              <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Berita
              </Button>
            </div>
          )}
        </div>
      )}

      {/* View News Modal */}
      <Dialog open={!!viewingNews} onOpenChange={(open) => !open && setViewingNews(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Berita</DialogTitle>
          </DialogHeader>
          {viewingNews && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{viewingNews.Title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{viewingNews.AuthorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(viewingNews.DatePublished).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>

              {viewingNews.Summary && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Ringkasan</h4>
                  <p className="text-sm text-gray-700">{viewingNews.Summary}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Konten</h4>
                <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-wrap">{viewingNews.Content}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog
        open={isAddModalOpen || !!editingNews}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false)
            setEditingNews(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNews ? "Edit Berita" : "Tambah Berita Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Judul Berita</Label>
              <Input
                id="title"
                value={formData.Title}
                onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                placeholder="Masukkan judul berita"
              />
            </div>

            <div>
              <Label htmlFor="author">Nama Penulis</Label>
              <Input
                id="author"
                value={formData.AuthorName}
                onChange={(e) => setFormData({ ...formData, AuthorName: e.target.value })}
                placeholder="Masukkan nama penulis"
              />
            </div>

            <div>
              <Label htmlFor="summary">Ringkasan (Opsional)</Label>
              <Textarea
                id="summary"
                value={formData.Summary}
                onChange={(e) => setFormData({ ...formData, Summary: e.target.value })}
                placeholder="Ringkasan singkat berita"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="content">Konten Berita</Label>
              <Textarea
                id="content"
                value={formData.Content}
                onChange={(e) => setFormData({ ...formData, Content: e.target.value })}
                placeholder="Tulis konten berita lengkap di sini..."
                rows={8}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!formData.Title || !formData.Content || !formData.AuthorName}
                className="flex-1"
              >
                {editingNews ? "Update" : "Publish"} Berita
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingNews(null)
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

export default NewsTab
