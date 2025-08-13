"use client";


import React, { useState } from "react";

export default function FloatingFeedback() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open ? (
        <div className="bg-white shadow-lg rounded-lg p-4 w-72 mb-2 border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-black">Feedback Anda</span>
            <button onClick={() => setOpen(false)} className="text-black hover:text-gray-700">✕</button>
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
      <button
        onClick={() => setOpen(o => !o)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center text-xl focus:outline-none focus:ring-2 focus:ring-green-300"
        aria-label="Beri Feedback"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
      >
        💬
      </button>
    </div>
  );
}
