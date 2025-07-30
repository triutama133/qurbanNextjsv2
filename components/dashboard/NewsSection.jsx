"use client"

import { ListSkeleton } from "./LoadingSkeletons"
import Image from "next/image"

export default function NewsSection({ news, loadingNews, newsPage, setNewsPage, totalNewsPages }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Berita & Informasi Terbaru</h2>
      {loadingNews ? (
        <ListSkeleton />
      ) : (
        <div className="space-y-4">
          {news.length > 0 ? (
            <>
              {news.map((item) => (
                <article key={item.NewsletterId} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
                  {item.FotoLinks && item.FotoLinks.length > 0 && (
                    <Image
                      src={item.FotoLinks[0] || "/placeholder.svg?height=160&width=400"}
                      alt={item.Title}
                      width={400}
                      height={160}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{item.Title}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    Oleh {item.AuthorName} -{" "}
                    {new Date(item.DatePublished).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="text-sm text-gray-600">
                    {item.Content.substring(0, 150)}
                    {item.Content.length > 150 ? "..." : ""}
                  </div>
                </article>
              ))}
              {totalNewsPages > 1 && (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => setNewsPage((prev) => Math.max(1, prev - 1))}
                    disabled={newsPage === 1}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-gray-700">
                    Halaman {newsPage} dari {totalNewsPages}
                  </span>
                  <button
                    onClick={() => setNewsPage((prev) => Math.min(totalNewsPages, prev + 1))}
                    disabled={newsPage === totalNewsPages}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">Belum ada berita terbaru.</p>
          )}
        </div>
      )}
    </div>
  )
}
