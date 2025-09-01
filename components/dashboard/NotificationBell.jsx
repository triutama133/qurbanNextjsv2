'use client'

import { Bell } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import supabase from "@/lib/supabase" // default client dari lib/supabase.ts

// --- Toast minimal ---
function Toasts({ toasts }) {
  return (
    <div className="fixed z-[1000] bottom-4 right-4 space-y-2">
      {toasts.map(t => (
        <div key={t.id} className="rounded-md border border-red-200 bg-white shadow px-3 py-2 text-sm text-red-700">
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// Ambil userId sesuai pola repo-mu (qurban_user.id atau user_id)
function readUserIdFromLocalStorage() {
  try {
    const s = localStorage.getItem("qurban_user")
    if (s) {
      const u = JSON.parse(s)
      if (u?.id) return u.id
      if (u?.UserId) return u.UserId
    }
  } catch (e) {
    console.warn("[Bell] Gagal parse localStorage.qurban_user:", e)
  }
  return (
    localStorage.getItem("user_id") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("userid") ||
    null
  )
}

export default function NotificationBell({ initialNotifications = [] }) {
  const [userId, setUserId] = useState(null)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialNotifications)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const bellRef = useRef(null)
  const fetchedOnceRef = useRef(false)
  const pending = useRef(new Set()) // cegah double PATCH

  // --- init userId dari localStorage (sesuai dashboard/page.js) ---
  useEffect(() => {
    const id = readUserIdFromLocalStorage()
    if (id) {
      console.log("[Bell] userId ditemukan di localStorage:", id)
      setUserId(id)
    } else {
      console.warn("[Bell] userId TIDAK ditemukan di localStorage")
    }
  }, [])

  // --- Toast helper ---
  const toast = (msg) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, msg }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500)
  }

  // --- Tutup popover saat klik di luar ---
  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        console.log("[Bell] klik di luar → tutup popover")
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  // --- ESC untuk tutup ---
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        console.log("[Bell] tekan ESC → tutup popover")
        setOpen(false)
      }
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // --- Fetch saat popover pertama dibuka ---
  useEffect(() => {
    if (!userId) return
    if (open && !fetchedOnceRef.current) {
      fetchedOnceRef.current = true
      console.log("[Bell] Popover dibuka pertama kali → mulai fetch list notifikasi")
      ;(async () => {
        try {
          setLoading(true)
          console.log("[Bell] Supabase select → userid =", userId)
          const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("userid", userId)
            .order("createdat", { ascending: false })
            .limit(50)
          if (error) {
            console.error("[Bell] Supabase SELECT error:", error)
            throw error
          }
          console.log("[Bell] Supabase SELECT OK. rows =", data?.length ?? 0)
          const mapped = (data ?? []).map(r => ({
            id: r.notificationid,
            title: r.type ?? "Notifikasi",
            message: r.message ?? "",
            type: r.type ?? null,
            time: r.createdat,
            read: !!r.isread,
          }))
          setItems(mapped)
          console.log("[Bell] items state diperbarui. unreadCount =", mapped.filter(n => !n.read).length)
        } catch (e) {
          console.error("[Bell] Gagal memuat notifikasi:", e)
          toast(e?.message || "Gagal memuat notifikasi")
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [open, userId])

  // --- Refetch helper (sinkronisasi ringan) ---
  const refetch = async () => {
    if (!userId) return
    console.log("[Bell] Refetch notifikasi (focus/visible) untuk userid =", userId)
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("userid", userId)
        .order("createdat", { ascending: false })
        .limit(50)
      if (error) {
        console.error("[Bell] Supabase SELECT (refetch) error:", error)
        return
      }
      console.log("[Bell] Refetch OK. rows =", data?.length ?? 0)
      const mapped = (data ?? []).map(r => ({
        id: r.notificationid,
        title: r.type ?? "Notifikasi",
        message: r.message ?? "",
        type: r.type ?? null,
        time: r.createdat,
        read: !!r.isread,
      }))
      setItems(mapped)
    } catch (e) {
      console.warn("[Bell] Refetch catch error:", e)
    }
  }

  // --- Refetch saat window fokus / tab visible ---
  useEffect(() => {
    const onFocus = () => refetch()
    const onVis = () => { if (document.visibilityState === 'visible') refetch() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [userId])

  const unreadCount = useMemo(() => {
    const c = items.filter(n => !n.read).length
    // log secukupnya agar tidak spam setiap render
    return c
  }, [items])

  // --- Actions ---
  const markOneRead = async (id) => {
    if (!userId || !id) {
      console.warn("[Bell] markOneRead diabaikan. userId atau id kosong:", { userId, id })
      return
    }
    if (pending.current.has(id)) {
      console.log("[Bell] markOneRead diabaikan (sudah pending) untuk id =", id)
      return
    }
    pending.current.add(id)
    console.log("[Bell] markOneRead start → id =", id)

    const snapshot = items
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)) // optimistic
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ isread: true })
        .eq("notificationid", id)
        .eq("userid", userId)
        .eq("isread", false)
      if (error) {
        console.error("[Bell] Supabase UPDATE (mark one) error:", error)
        throw error
      }
      console.log("[Bell] markOneRead OK → id =", id)
      // opsional: await refetch()
    } catch (e) {
      console.error("[Bell] markOneRead GAGAL → rollback. id =", id, "error =", e)
      setItems(snapshot) // rollback
      toast("Gagal menandai terbaca")
    } finally {
      pending.current.delete(id)
    }
  }

  const markAllRead = async () => {
    if (!userId) {
      console.warn("[Bell] markAllRead diabaikan. userId kosong")
      return
    }
    console.log("[Bell] markAllRead start untuk userid =", userId)
    const snapshot = items
    setItems(prev => prev.map(n => n.read ? n : ({ ...n, read: true }))) // optimistic
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ isread: true })
        .eq("userid", userId)
        .eq("isread", false)
      if (error) {
        console.error("[Bell] Supabase UPDATE (mark all) error:", error)
        throw error
      }
      console.log("[Bell] markAllRead OK")
      // opsional: await refetch()
    } catch (e) {
      console.error("[Bell] markAllRead GAGAL → rollback. error =", e)
      setItems(snapshot) // rollback
      toast("Gagal menandai semua terbaca")
    }
  }

  // --- Prioritas & sort waktu (seperti punyamu) ---
  const isPrioritas = n => n.type === 'setoran' || n.type === 'pelunasan'
  const sortByTimeDesc = arr => {
    return arr.slice().sort((a, b) => {
      const ta = a.timestamp || a.time || ''
      const tb = b.timestamp || b.time || ''
      if (!ta && !tb) return 0
      if (!ta) return 1
      if (!tb) return -1
      const da = new Date(ta), db = new Date(tb)
      if (!isNaN(da) && !isNaN(db)) return db - da
      return String(tb).localeCompare(String(ta))
    })
  }
  const ordered = (() => {
    const prioritas = sortByTimeDesc(items.filter(isPrioritas))
    const lainnya   = sortByTimeDesc(items.filter(n => !isPrioritas(n)))
    const out = [...prioritas, ...lainnya]
    // log sekali saat daftar berubah
    console.log("[Bell] render list. total =", out.length, "unread =", unreadCount)
    return out
  })()

  const fmtTime = (t) => { try { return new Date(t).toLocaleString() } catch { return t } }

  return (
    <>
      <div className="relative" ref={bellRef}>
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          onClick={() => {
            console.log("[Bell] klik tombol bell. open →", !open)
            setOpen(v => !v)
          }}
          aria-label="Notifikasi"
          aria-haspopup="menu"
          aria-expanded={open ? "true" : "false"}
          disabled={!userId}
          title={!userId ? "userId belum tersedia (disimpan di localStorage saat login)" : undefined}
        >
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            role="menu"
            aria-label="Daftar Notifikasi"
            className="animate-fadeIn z-50"
            style={{
              position: typeof window !== 'undefined' && window.innerWidth < 640 ? 'fixed' : 'absolute',
              left: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 'auto',
              right: 0,
              top: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : '100%',
              width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100vw' : '20rem',
              maxHeight: '24rem',
              background: 'white',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 25px 0 rgba(0,0,0,0.08)',
              border: '1px solid #e5e7eb',
              overflowY: 'auto',
              padding: 0,
            }}
          >
            {/* Header */}
            <div className="p-4 border-b font-bold text-gray-800 flex items-center justify-between" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
              <span>Notifikasi</span>
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className={`text-xs font-semibold ${unreadCount ? "text-indigo-600 hover:underline" : "text-gray-300 cursor-not-allowed"}`}
              >
                Tandai semua terbaca
              </button>
            </div>

            {loading ? (
              <div className="p-4 text-gray-500 text-sm">Memuat…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">Tidak ada notifikasi.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {ordered.map((notif, idx) => (
                  <li
                    key={notif.id || notif.notificationid || idx} // FIX key
                    role="menuitem"
                    className="relative p-4 text-sm flex items-start gap-3 group transition-colors duration-150"
                  >
                    {!notif.read && <span className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" title="Belum dibaca"></span>}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => {
                          const theId = notif.id || notif.notificationid
                          console.log("[Bell] klik item → markOneRead. id =", theId)
                          if (!notif.read && theId) markOneRead(theId)
                        }}
                        className="text-left w-full"
                      >
                        <div className={`mb-1 flex items-center gap-2 ${!notif.read ? "font-bold text-gray-800" : "font-normal text-gray-400"}`}>
                          {notif.title ?? notif.type ?? "Notifikasi"}
                        </div>
                        <div className={`${!notif.read ? "text-gray-800" : "text-gray-400"} mb-1`}>{notif.message}</div>
                        {notif.time && <div className="text-xs text-gray-300">{fmtTime(notif.time)}</div>}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Toasts toasts={toasts} />
    </>
  )
}
