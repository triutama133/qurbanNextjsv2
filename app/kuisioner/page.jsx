"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import { pertanyaanKuisioner } from "@/lib/pertanyaanKuisioner"

export default function KuisionerPage() {
  const [jawaban, setJawaban] = useState({})
  const [lainnya, setLainnya] = useState({})
  const [lainnyaActive, setLainnyaActive] = useState({}) // flag status “Lainnya” per pertanyaan
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [page, setPage] = useState(0)
  const cardContainerRef = useRef(null)
  const router = useRouter()

  // Scroll ke atas card container saat pindah halaman
  useEffect(() => {
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [page])

  // Logout
  const handleSignOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("qurban_user")
      localStorage.removeItem("user_id")
      sessionStorage.clear()
    }
    router.push("/login")
  }, [router])

  // Handler RADIO:
  // - Kalau pilih "Lainnya" → aktifkan flag & siapkan input teks (jawaban jadi string bebas).
  // - Kalau pilih opsi biasa → nonaktifkan flag & set jawaban ke nilai opsi.
const handleChange = (idx, value) => {
  if (pertanyaanKuisioner[idx].type === "radio" && value === "Lainnya") {
    setLainnyaActive((p) => ({ ...p, [idx]: true }))
    setLainnya((p) => ({ ...p, [idx]: p[idx] ?? "" }))
    setJawaban((p) => ({ ...p, [idx]: typeof p[idx] === "string" ? p[idx] : "" }))
  } else {
    setLainnyaActive((p) => ({ ...p, [idx]: false }))
    setJawaban((p) => ({ ...p, [idx]: value }))
    if (pertanyaanKuisioner[idx].options?.includes("Lainnya")) {
      setLainnya((p) => ({ ...p, [idx]: "" }))
    }
  }
}

// >>> PERBAIKI BAGIAN INI <<<
const handleLainnyaChange = (idx, value) => {
  const type = pertanyaanKuisioner[idx]?.type
  setLainnya((p) => ({ ...p, [idx]: value }))

  if (type === "radio") {
    // untuk RADIO: jawaban memang string teks bebas
    setLainnyaActive((p) => ({ ...p, [idx]: true }))
    setJawaban((p) => ({ ...p, [idx]: value }))
  } else if (type === "checkbox") {
    // untuk CHECKBOX: JANGAN ubah array jawaban jadi string!
    // cukup simpan teksnya di `lainnya[idx]`, biarkan "Lainnya" tetap ada di array jawaban
    // opsional: tandai aktif (tidak wajib, hanya untuk konsistensi indikator)
    setLainnyaActive((p) => ({ ...p, [idx]: true }))
  }
}

  // Handler CHECKBOX (termasuk “Lainnya”)
  const handleCheckbox = (idx, option) => {
    let arr = Array.isArray(jawaban[idx]) ? [...jawaban[idx]] : []
    if (arr.includes(option)) {
      arr = arr.filter((o) => o !== option)
      if (option === "Lainnya") {
        setLainnya((prev) => ({ ...prev, [idx]: "" }))
        setLainnyaActive((p) => ({ ...p, [idx]: false }))
      }
    } else {
      if (pertanyaanKuisioner[idx].max && arr.length >= pertanyaanKuisioner[idx].max) return
      arr.push(option)
      if (option === "Lainnya") {
        setLainnyaActive((p) => ({ ...p, [idx]: true }))
      }
    }
    setJawaban((prev) => ({ ...prev, [idx]: arr }))
  }

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Validasi semua wajib diisi + validasi “Lainnya”
    for (let i = 0; i < pertanyaanKuisioner.length; i++) {
      if (!jawaban[i] || (Array.isArray(jawaban[i]) && jawaban[i].length === 0)) {
        setMessage(`Pertanyaan ke-${i + 1} wajib diisi!`)
        setLoading(false)
        return
      }
      if (
        pertanyaanKuisioner[i].options?.includes("Lainnya") &&
        (
          (Array.isArray(jawaban[i]) && jawaban[i].includes("Lainnya") && !lainnya[i]) ||
          (lainnyaActive[i] && !lainnya[i]) // radio lainnya aktif tapi teks kosong
        )
      ) {
        setMessage(`Mohon isi kolom 'Lainnya' pada pertanyaan ke-${i + 1}`)
        setLoading(false)
        return
      }
    }

    // Ambil user_id
    let user_id = ""
    if (typeof window !== "undefined") {
      user_id = localStorage.getItem("user_id") || ""
    }
    if (!user_id) {
      setMessage("User tidak ditemukan. Silakan login ulang.")
      setLoading(false)
      return
    }

    // Submit ke API
    try {
      const res = await fetch("/api/kuisioner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, jawaban })
      })
      const result = await res.json()
      if (!res.ok) {
        setMessage(result.error || "Gagal menyimpan jawaban.")
      } else {
        setMessage("Terima kasih, jawaban Anda sudah direkam!")
        setTimeout(() => { router.replace("/dashboard") }, 1000)
      }
    } catch (err) {
      setMessage("Gagal menyimpan jawaban. Coba lagi nanti.")
    }
    setLoading(false)
  }

  // Pagination
  const QUESTIONS_PER_PAGE = 5
  const total = pertanyaanKuisioner.length
  const totalPages = Math.ceil(total / QUESTIONS_PER_PAGE)
  const startIdx = page * QUESTIONS_PER_PAGE
  const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, total)
  const currentQuestions = pertanyaanKuisioner.slice(startIdx, endIdx)

  // Progress
  let answered = 0
  for (let i = 0; i < total; i++) {
    if (jawaban[i] && (!Array.isArray(jawaban[i]) || jawaban[i].length > 0)) answered++
  }
  const progress = Math.round((answered / total) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200/80 to-emerald-100/80 flex flex-col">
      <DashboardHeader handleSignOut={handleSignOut} />
      <div className="flex-1 flex items-center justify-center py-8 px-2">
        <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-0 md:p-10 space-y-8 animate-fade-in border border-gray-200">
          {/* Progress bar */}
          <div className="w-full px-6 pt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-700">Progress</span>
              <span className="text-xs font-semibold text-indigo-700">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Heading */}
          <div className="flex flex-col items-center gap-2 mt-2">
            <div className="bg-indigo-100 rounded-full p-3 shadow-md mb-1">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-indigo-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <h1 className="text-4xl font-extrabold text-center text-indigo-800 mb-1 tracking-tight drop-shadow">Survey Pequrban</h1>
            <p className="text-center text-lg text-gray-800 mb-2 font-medium">Bantu kami mengenal kebutuhanmu lebih dalam</p>
          </div>

          <div ref={cardContainerRef} className="space-y-8 md:space-y-10 px-1 md:px-0">
            {currentQuestions.map((q, idx) => {
              const globalIdx = startIdx + idx
              return (
                <div key={globalIdx} className="bg-white/80 backdrop-blur rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center bg-indigo-500 text-white rounded-full w-8 h-8 font-bold text-lg shadow flex-shrink-0">{globalIdx + 1}</span>
                    <span className="text-xl font-bold text-indigo-900 leading-snug">{q.question}</span>
                  </div>

                  {/* RADIO */}
                  {q.type === "radio" && (
                    <div className="flex flex-col gap-3 mt-1">
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-gray-900 text-base font-medium transition-colors">
                          <input
                            type="radio"
                            name={`q${globalIdx}`}
                            value={opt}
                            checked={opt === "Lainnya" ? !!lainnyaActive[globalIdx] : jawaban[globalIdx] === opt}
                            onChange={() => handleChange(globalIdx, opt)}
                            className="accent-indigo-600 w-5 h-5 transition-all duration-150"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}

                      {q.options.includes("Lainnya") && !!lainnyaActive[globalIdx] && (
                        <input
                          type="text"
                          className="mt-2 border border-gray-300 text-gray-900 bg-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                          placeholder="Tulis jawaban lain..."
                          value={lainnya[globalIdx] ?? ""}
                          onChange={(e) => handleLainnyaChange(globalIdx, e.target.value)}
                        />
                      )}
                    </div>
                  )}

                  {/* CHECKBOX */}
                  {q.type === "checkbox" && (
                    <div className="flex flex-col gap-3 mt-1">
                      {q.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer text-gray-900 text-base font-medium transition-colors">
                          <input
                            type="checkbox"
                            name={`q${globalIdx}`}
                            value={opt}
                            checked={Array.isArray(jawaban[globalIdx]) && jawaban[globalIdx].includes(opt)}
                            onChange={() => handleCheckbox(globalIdx, opt)}
                            className="accent-emerald-500 w-5 h-5 transition-all duration-150"
                            disabled={q.max && Array.isArray(jawaban[globalIdx]) && jawaban[globalIdx].length >= q.max && !jawaban[globalIdx].includes(opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}

                      {q.options.includes("Lainnya") && Array.isArray(jawaban[globalIdx]) && jawaban[globalIdx].includes("Lainnya") && (
                        <input
                          type="text"
                          className="mt-2 border border-gray-300 text-gray-900 bg-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                          placeholder="Tulis jawaban lain..."
                          value={lainnya[globalIdx] ?? ""}
                          onChange={(e) => handleLainnyaChange(globalIdx, e.target.value)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center gap-4 px-2 md:px-0 mt-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-5 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700 shadow hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>

            <div className="text-sm text-gray-500">
              Halaman {page + 1} dari {totalPages}
            </div>

            {page < totalPages - 1 ? (
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-5 py-2 rounded-lg font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-extrabold text-lg shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed tracking-wide"
              >
                {loading ? "Menyimpan..." : "Kirim Jawaban"}
              </button>
            )}
          </div>

          {message && (
            <div
              className="text-center py-2 px-4 rounded-md text-base font-semibold mt-4 text-gray-900 shadow"
              style={{
                background: message.includes("Terima") ? "#d1fae5" : "#fee2e2",
                color: message.includes("Terima") ? "#065f46" : "#991b1b",
              }}
            >
              {message}
            </div>
          )}
        </form>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
