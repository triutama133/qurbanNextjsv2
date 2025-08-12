"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ListSkeleton } from "./LoadingSkeletons"
import Image from "next/image"

// Fetch news from API (assume /api/news?page=1)
async function fetchNewsPage(page) {
  try {
    const res = await fetch(`/api/get-news?all=1`)
    if (!res.ok) return { news: [], total: 0 }
    const data = await res.json()
    return {
      news: data.newsData || data.news || [],
      total: (data.newsData || data.news || []).length
    }
  } catch {
    return { news: [], total: 0 }
  }
}

export default function NewsSection({ userId, readNewsIds, setReadNewsIds }) {
  // Listen to custom event for opening news modal from NotificationBell
  useEffect(() => {
    function handleOpenNewsModal(e) {
      if (e.detail) openNewsModal(e.detail)
    }
    window.addEventListener("openNewsModal", handleOpenNewsModal)
    return () => window.removeEventListener("openNewsModal", handleOpenNewsModal)
  }, [])
  // Ensure readNewsIds is always an array
  readNewsIds = Array.isArray(readNewsIds) ? readNewsIds : [];
  // Fallback: setReadNewsIds default to noop if not provided
  if (typeof setReadNewsIds !== 'function') setReadNewsIds = () => {};
  const [allNews, setAllNews] = useState([])
  const [newsPage, setNewsPage] = useState(1)
  const [loadingNews, setLoadingNews] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)

  const NEWS_PER_PAGE = 3
  const totalNewsPages = Math.max(1, Math.ceil(allNews.length / NEWS_PER_PAGE))
  const pagedNews = allNews.slice((newsPage - 1) * NEWS_PER_PAGE, newsPage * NEWS_PER_PAGE)

  useEffect(() => {
    setLoadingNews(true)
    fetchNewsPage().then(({ news }) => {
      setAllNews(news)
      setLoadingNews(false)
    })
  }, [])

  async function openNewsModal(item) {
    setSelectedNews(item)
    setModalOpen(true)
    if (!readNewsIds.includes(item.NewsletterId)) {
      // Optimistically update UI
      const updated = [...readNewsIds, item.NewsletterId]
      setReadNewsIds(updated)
      // Update backend with userId
      if (!userId) return
      try {
        await fetch("/api/read-news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, newsId: item.NewsletterId, action: "mark" })
        })
      } catch {}
    }
  }
  function closeNewsModal() {
    setModalOpen(false)
    setSelectedNews(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg text-black">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4 text-black">Berita & Informasi Terbaru</h2>
        {loadingNews ? (
          <ListSkeleton />
        ) : (
          <div className="space-y-4">
            {allNews.length > 0 ? (
              <>
                {pagedNews.map((item) => (
                  <article key={item.NewsletterId} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0 text-black">
                    {item.FotoLinks && item.FotoLinks.length > 0 && (
                      <Image
                        src={item.FotoLinks[0] || "/placeholder.svg?height=160&width=400"}
                        alt={item.Title}
                        width={400}
                        height={160}
                        className="w-full h-40 object-cover rounded-md mb-2"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-black">{item.Title}</h3>
                    <p className="text-xs text-black mb-2">
                      Oleh {item.AuthorName} -{" "}
                      {new Date(item.DatePublished).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="text-sm text-black">
                      {item.Content.substring(0, 150)}
                      {item.Content.length > 150 ? "..." : ""}
                    </div>
                    <button
                      className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                      onClick={() => openNewsModal(item)}
                    >
                      Read More
                    </button>
                  </article>
                ))}
                {totalNewsPages > 1 && (
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => setNewsPage(newsPage - 1)}
                      disabled={newsPage === 1}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-gray-700">
                      Halaman {newsPage} dari {totalNewsPages}
                    </span>
                    <button
                      onClick={() => setNewsPage(newsPage + 1)}
                      disabled={newsPage === totalNewsPages}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Berikutnya
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-black text-sm">Belum ada berita terbaru.</p>
            )}
          </div>
        )}
      </div>
      {/* News Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeNewsModal()}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white text-black [&_[data-slot=dialog-close]]:text-black">
          <DialogHeader>
        <DialogTitle className="text-black">Detail Berita</DialogTitle>
          </DialogHeader>
          {selectedNews && (
            <div className="space-y-4 text-black">
              <div>
                <h3 className="text-xl font-bold text-black mb-2">{selectedNews.Title}</h3>
                <div className="flex items-center gap-4 text-sm text-black mb-4">
                  <div className="flex items-center gap-1">
                    <span>{selectedNews.AuthorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{new Date(selectedNews.DatePublished).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              </div>
              {selectedNews.Summary && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-black mb-2">Ringkasan</h4>
                  <p className="text-sm text-black">{selectedNews.Summary}</p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-black mb-2">Konten</h4>
                <div className="prose max-w-none text-sm text-black whitespace-pre-wrap">{selectedNews.Content}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}