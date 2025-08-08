// Dummy news API for NewsSection
export async function GET(req) {
  // Parse page from query string
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const NEWS_PER_PAGE = 5

  // Dummy news data
  const allNews = Array.from({ length: 12 }).map((_, i) => ({
    NewsletterId: i + 1,
    Title: `Judul Berita ${i + 1}`,
    AuthorName: `Penulis ${i + 1}`,
    DatePublished: new Date(Date.now() - i * 86400000).toISOString(),
    Content: `Ini adalah konten lengkap berita ke-${i + 1}. `.repeat(10),
    Summary: `Ringkasan berita ke-${i + 1}.`,
    FotoLinks: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
    ],
  }))

  // Paging
  const start = (page - 1) * NEWS_PER_PAGE
  const end = start + NEWS_PER_PAGE
  const news = allNews.slice(start, end)

  return Response.json({ news, total: allNews.length })
}
