"use client";


import React, { useState, useRef } from "react";

export default function FloatingFeedback() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const dragging = useRef(false);

  const getUserId = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("qurban_user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          return u?.UserId || "";
        } catch {
          return "";
        }
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const user_id = getUserId();
    if (!user_id) {
      setError("User tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: feedback, user_id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal mengirim feedback.");
        setLoading(false);
        return;
      }
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFeedback("");
        setOpen(false);
      }, 2000);
    } catch (e) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Drag & drop logic (pisahkan drag dan click)
  const dragTimeout = useRef(null);
  const dragMoved = useRef(false);
  const handleDragStart = (e) => {
    dragging.current = true;
    dragMoved.current = false;
    dragRef.current = {
      startX: e.type === "touchstart" ? e.touches[0].clientX : e.clientX,
      startY: e.type === "touchstart" ? e.touches[0].clientY : e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove);
    document.addEventListener("touchend", handleDragEnd);
  };
  const handleDragMove = (e) => {
    if (!dragging.current) return;
    dragMoved.current = true;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };
  const handleDragEnd = () => {
    dragging.current = false;
    setTimeout(() => { dragMoved.current = false; }, 100); // reset flag
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);
  };
  // Click handler untuk floating button, hanya trigger jika tidak drag
  const handleFloatingClick = (e) => {
    if (dragMoved.current) return;
    setOpen(o => !o);
  };

  // Minimize logic
  const handleMinimize = () => {
    setMinimized(true);
    setOpen(false);
  };
  const handleRestore = () => {
    setMinimized(false);
    setOpen(false);
  };

  return (
    <div
      className="fixed z-50 flex flex-col items-end"
      style={{
        bottom: 24,
        right: 24,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        cursor: "pointer",
        transition: "transform 0.1s",
      }}
    >
      {open && !minimized ? (
        <div className="bg-white shadow-lg rounded-lg p-4 w-72 mb-2 border border-gray-200 animate-fade-in">
          <div
            className="flex justify-between items-center mb-2 cursor-move select-none"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <span className="font-semibold text-black">Feedback Anda</span>
            <div className="flex gap-1">
              {/* Hanya tombol close, tidak ada minimize */}
              <button onClick={() => setOpen(false)} className="text-black hover:text-gray-700">✕</button>
            </div>
          </div>
          {sent ? (
            <div className="text-black text-sm text-center py-4">Terima kasih atas feedback Anda!</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring focus:ring-green-200 text-black placeholder:text-black"
                rows={3}
                placeholder="Tulis saran, kritik, atau pertanyaan..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
                disabled={loading}
              />
              {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
              <button
                type="submit"
                className="mt-2 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 text-sm font-semibold disabled:opacity-60"
                disabled={!feedback.trim() || loading}
              >
                {loading ? "Mengirim..." : "Kirim"}
              </button>
            </form>
          )}
        </div>
      ) : null}
      {/* Floating button, always draggable and can minimize/maximize */}
      <div
        className="mb-2 flex items-center gap-2"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ cursor: "grab" }}
      >
        {!minimized ? (
          <button
            onClick={handleFloatingClick}
            className="px-4 py-2 text-sm rounded-full focus:outline-none font-semibold"
            style={{
              background: "rgba(255,255,255,0.32)",
              color: "#16a34a",
              letterSpacing: 1,
              border: "1.5px solid rgba(22,163,74,0.45)",
              boxShadow: "0 0 8px 2px rgba(22,163,74,0.18)",
              backdropFilter: "blur(2px)",
              transition: "background 0.2s, box-shadow 0.2s, border 0.2s, color 0.2s",
            }}
            aria-label="Beri Feedback"
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(22,163,74,0.12)";
              e.currentTarget.style.border = "1.5px solid #16a34a";
              e.currentTarget.style.boxShadow = "0 0 12px 3px rgba(22,163,74,0.28)";
              e.currentTarget.style.color = "#15803d";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.32)";
              e.currentTarget.style.border = "1.5px solid rgba(22,163,74,0.45)";
              e.currentTarget.style.boxShadow = "0 0 8px 2px rgba(22,163,74,0.18)";
              e.currentTarget.style.color = "#16a34a";
            }}
          >
            feedback
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Badge transparan kecil bertuliskan feedback */}
            <span
              className="px-3 py-1 text-xs rounded-full font-semibold"
              style={{
                background: "rgba(255,255,255,0.32)",
                color: "#16a34a",
                letterSpacing: 1,
                border: "1.5px solid rgba(22,163,74,0.45)",
                boxShadow: "0 0 8px 2px rgba(22,163,74,0.18)",
                backdropFilter: "blur(2px)",
              }}
            >feedback</span>
            {/* Tombol maximize: ikon + kecil dan modern */}
            <button
              onClick={handleRestore}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow flex items-center justify-center p-1 focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label="Restore Feedback"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)", width: 24, height: 24 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="2" width="2" height="10" rx="1" fill="white" />
                <rect x="2" y="6" width="10" height="2" rx="1" fill="white" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
