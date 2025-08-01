import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// GET /api/get-app-config
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("app_config")
    .select("*")
    .eq("id", "global_settings")
    .single()
  if (error || !data) {
    return NextResponse.json({ error: "Config tidak ditemukan" }, { status: 404 })
  }
  return NextResponse.json(data)
}
