import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inisialisasi Supabase manual
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Hanya POST yang dipakai (frontend selalu POST)
export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, newsId, action } = body
    console.log("[API LOG] Input body:", body)
    if (!userId) {
      console.error("[API LOG] userId kosong atau tidak valid")
      return NextResponse.json({ error: "userId wajib diisi." }, { status: 400 })
    }

    if (action === "get") {
      // Ambil daftar berita yang sudah dibaca user
      console.log(`[API LOG] Ambil daftar berita dibaca untuk userId: ${userId}`)
      const { data, error } = await supabase
        .from("user_read_news")
        .select("news_id")
        .eq("user_id", userId)
      if (error) {
        console.error("[API LOG] Supabase error (get):", error)
        return NextResponse.json({ error: "Gagal mengambil data: " + error.message }, { status: 500 })
      }
      const readNewsIds = data.map((row) => row.news_id)
      console.log(`[API LOG] Berita yang sudah dibaca:`, readNewsIds)
      return NextResponse.json({ readNewsIds })
    } else if (action === "mark") {
      if (!newsId) {
        console.error("[API LOG] newsId kosong saat mark")
        return NextResponse.json({ error: "newsId wajib diisi untuk menandai sudah dibaca." }, { status: 400 })
      }
      console.log(`[API LOG] Tandai berita sudah dibaca: userId=${userId}, newsId=${newsId}`)
      // Upsert agar tidak dobel
      const { error } = await supabase
        .from("user_read_news")
        .upsert({ user_id: userId, news_id: newsId }, { onConflict: ["user_id", "news_id"] })
      if (error) {
        console.error("[API LOG] Supabase error (mark):", error)
        return NextResponse.json({ error: "Gagal menyimpan status baca: " + error.message }, { status: 500 })
      }
      console.log(`[API LOG] Sukses menandai berita sudah dibaca.`)
      return NextResponse.json({ success: true, message: "Berhasil menandai berita sudah dibaca." })
    } else {
      console.error(`[API LOG] Aksi tidak dikenali:`, action)
      return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 })
    }
  } catch (err) {
    console.error("[API LOG] API error:", err)
    return NextResponse.json({ error: "Terjadi kesalahan server: " + (err?.message || err) }, { status: 500 })
  }
}
