// app/api/notifications/mark-all-read/route.js
import { NextResponse } from "next/server"
import supabase from "@/lib/supabase"


export async function PATCH() {
  const userId = await getUserIdFromSession()
  if (!userId) return new NextResponse("Unauthorized", { status: 401 })

  const { error } = await supabase
    .from("notifications")
    .update({ isread: true })
    .eq("userid", userId)
    .eq("isread", false)

  if (error) return new NextResponse(error.message, { status: 500 })

  return NextResponse.json({ ok: true, unreadCount: 0 })
}
