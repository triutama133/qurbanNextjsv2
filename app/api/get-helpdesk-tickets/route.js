import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// GET /api/get-helpdesk-tickets?userId=xxx
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 })
  }
  const { data, error } = await supabaseAdmin
    .from("help_desk_tickets")
    .select("*")
    .eq("UserId", userId)
    .order("Timestamp", { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
