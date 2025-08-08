import { Bell } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function NotificationBell({ notifications = [] }) {
  const [open, setOpen] = useState(false)
  const bellRef = useRef(null)

  // Close popover on click outside
  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
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
          {/* Tombol close hanya di mobile (fullscreen) */}
          {typeof window !== 'undefined' && window.innerWidth < 640 && (
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold z-50"
              aria-label="Tutup Notifikasi"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          )}
          <div
            className="p-4 border-b font-bold text-gray-800 flex items-center justify-between"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: 'white',
            }}
          >
            <span>Notifikasi</span>
            {typeof window !== 'undefined' && window.innerWidth < 640 && (
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-red-600 text-2xl font-bold z-50 ml-2"
                aria-label="Tutup Notifikasi"
                style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">Tidak ada notifikasi baru.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notif, idx) => (
                <li key={idx} className={`p-4 text-sm ${!notif.read ? "bg-gray-50" : ""}`}>
                  <div className="font-semibold text-gray-800 mb-1">{notif.title}</div>
                  <div className="text-gray-600 mb-1">{notif.message}</div>
                  {notif.time && <div className="text-xs text-gray-400">{notif.time}</div>}
                  {notif.action && (
                    <button
                      className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                      onClick={notif.action}
                    >
                      {notif.actionLabel || "Lihat Detail"}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
