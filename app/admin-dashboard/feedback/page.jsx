"use client";

import React, { useEffect, useState } from "react";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/feedback");
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Gagal mengambil data feedback.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setFeedbacks(data);
      } catch (e) {
        setError("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar Feedback Pengguna</h1>
      {loading && <div>Memuat...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="space-y-4">
        {feedbacks.length === 0 && !loading && <div>Tidak ada feedback.</div>}
        {feedbacks.map(fb => (
          <div key={fb.id} className="border rounded p-3 bg-white shadow-sm">
            <div className="text-sm text-gray-600 mb-1">UserId: <span className="font-mono text-black">{fb.user_id}</span></div>
            <div className="text-black mb-1">{fb.message}</div>
            <div className="text-xs text-gray-400">{new Date(fb.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
