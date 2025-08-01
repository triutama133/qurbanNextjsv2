import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// GET /api/get-news?page=1
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const NEWS_PER_PAGE = 3
  const from = (page - 1) * NEWS_PER_PAGE
  const to = from + NEWS_PER_PAGE - 1
  const { data, error, count } = await supabaseAdmin
    .from("newsletters")
    .select("*", { count: "exact" })
    .order("DatePublished", { ascending: false })
    .range(from, to)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ newsData: data, count })
}
