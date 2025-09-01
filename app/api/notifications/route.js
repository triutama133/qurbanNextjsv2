// app/api/notifications/route.js
import { NextResponse } from "next/server"
import supabase from "@/lib/supabase"          // <-- pakai client kamu


export async function GET() {
  const userId = await getUserIdFromSession()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  // list notifikasi milik user
  const { data: rows, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("userid", userId)
    .order("createdat", { ascending: false })
    .limit(50)

  if (error) return new NextResponse(error.message, { status: 500 })

  // hitung unread milik user
  const { count: unreadCount, error: cntErr } = await supabase
    .from("notifications")
    .select("*", { head: true, count: "exact" })
    .eq("userid", userId)
    .eq("isread", false)

  if (cntErr) return new NextResponse(cntErr.message, { status: 500 })

  // map ke shape komponenmu
  const items = (rows ?? []).map((r) => ({
    id: r.notificationid,
    title: r.type ?? "Notifikasi",
    message: r.message ?? "",
    type: r.type ?? null,
    time: r.createdat,
    read: !!r.isread,
  }))

  return NextResponse.json({ items, unreadCount })
}
