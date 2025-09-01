// app/api/notifications/[id]/read/route.js
import { NextResponse } from "next/server"
import supabase from "@/lib/supabase"


export async function PATCH(_req, { params }) {
  const userId = await getUserIdFromSession()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  // update hanya baris milik user & yang belum read
  const { error: updErr } = await supabase
    .from("notifications")
    .update({ isread: true })
    .eq("notificationid", params.id)
    .eq("userid", userId)
    .eq("isread", false)

  if (updErr) return new NextResponse(updErr.message, { status: 500 })

  // hitung ulang unread milik user
  const { count: unreadCount, error: cntErr } = await supabase
    .from("notifications")
    .select("*", { head: true, count: "exact" })
    .eq("userid", userId)
    .eq("isread", false)

  if (cntErr) return new NextResponse(cntErr.message, { status: 500 })

  return NextResponse.json({ ok: true, unreadCount })
}
